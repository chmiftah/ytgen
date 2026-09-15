import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { getAudioEffectById } from '$lib/services/audioEffectService.js';

const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';

function normalizeToMP3(inputPath, outputPath, filter = '') {
	return new Promise((resolve, reject) => {
		const args = ['-i', inputPath];
		if (filter && filter.trim()) {
			args.push('-af', filter.trim());
		}
		args.push(
			'-c:a',
			'libmp3lame',
			'-ar',
			'44100',
			'-ac',
			'2',
			'-b:a',
			'192k',
			'-y',
			outputPath
		);

		const proc = spawn(ffmpegPath, args);
		proc.on('close', (code) => {
			if (code === 0) resolve();
			else reject(new Error(`FFmpeg audio normalization exit ${code}`));
		});
		proc.on('error', reject);
	});
}

// Save audio base64 to server cache, apply audio effect preset, and normalize to 44.1kHz stereo MP3
export async function POST({ request }) {
	try {
		const { audioBase64, sceneId, audioEffect = 'studio_podcast', applyFilter = false } = await request.json();

		if (!audioBase64) {
			return json({ success: false, error: 'No audio data' }, { status: 400 });
		}

		const audioDir = path.resolve('./static/renders/audio-cache');
		await fs.promises.mkdir(audioDir, { recursive: true });

		const effectPreset = getAudioEffectById(audioEffect);
		const effectSlug = effectPreset ? effectPreset.id : 'raw';

		const baseName = `voice-${sceneId}-${effectSlug}-${Date.now()}`;
		const finalMp3Path = path.join(audioDir, `${baseName}.mp3`);
		const tempRawPath = path.join(audioDir, `${baseName}.raw`);

		const base64Data = audioBase64.replace(/^data:audio\/[^;]+;base64,/, '');
		await fs.promises.writeFile(tempRawPath, Buffer.from(base64Data, 'base64'));

		// Normalize to standard 44.1kHz stereo MP3.
		// NOTE: Incoming audio from edge-tts is already mastered by edge-tts DSP pipeline!
		// We only apply the filter if applyFilter === true (e.g. for raw custom audio uploads).
		let targetPath = finalMp3Path;
		try {
			const filterToApply = applyFilter ? (effectPreset?.ffmpegFilter || '') : '';
			await normalizeToMP3(tempRawPath, finalMp3Path, filterToApply);
			await fs.promises.unlink(tempRawPath).catch(() => {});
		} catch (convErr) {
			console.warn('Audio normalization via FFmpeg failed, using raw file:', convErr.message);
			await fs.promises.rename(tempRawPath, finalMp3Path).catch(() => {
				targetPath = tempRawPath;
			});
		}

		const fileName = path.basename(targetPath);

		return json({
			success: true,
			serverAudioPath: targetPath, // absolute path used by FFmpeg
			audioFileKey: fileName,
			audioEffect: effectPreset?.id || 'natural',
			audioEffectName: effectPreset?.name || 'Natural',
			audioUrl: `/renders/audio-cache/${fileName}`
		});
	} catch (err) {
		console.error('audio-save error:', err);
		return json({ success: false, error: err.message }, { status: 500 });
	}
}


