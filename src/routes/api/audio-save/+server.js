import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';

function normalizeToMP3(inputPath, outputPath) {
	return new Promise((resolve, reject) => {
		const proc = spawn(ffmpegPath, [
			'-i',
			inputPath,
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
		]);
		proc.on('close', (code) => {
			if (code === 0) resolve();
			else reject(new Error(`FFmpeg audio normalization exit ${code}`));
		});
		proc.on('error', reject);
	});
}

// Save audio base64 to server cache and normalize to 44.1kHz stereo MP3
export async function POST({ request }) {
	try {
		const { audioBase64, sceneId } = await request.json();

		if (!audioBase64) {
			return json({ success: false, error: 'No audio data' }, { status: 400 });
		}

		const audioDir = path.resolve('./static/renders/audio-cache');
		await fs.promises.mkdir(audioDir, { recursive: true });

		const baseName = `voice-${sceneId}-${Date.now()}`;
		const finalMp3Path = path.join(audioDir, `${baseName}.mp3`);
		const tempRawPath = path.join(audioDir, `${baseName}.raw`);

		const base64Data = audioBase64.replace(/^data:audio\/[^;]+;base64,/, '');
		await fs.promises.writeFile(tempRawPath, Buffer.from(base64Data, 'base64'));

		// Convert and normalize to standard 44.1kHz stereo MP3
		let targetPath = finalMp3Path;
		try {
			await normalizeToMP3(tempRawPath, finalMp3Path);
			await fs.promises.unlink(tempRawPath).catch(() => {});
		} catch (convErr) {
			console.warn('Audio normalization via FFmpeg failed, using raw file:', convErr.message);
			// If conversion fails, rename temp raw file to mp3
			await fs.promises.rename(tempRawPath, finalMp3Path).catch(() => {
				targetPath = tempRawPath;
			});
		}

		return json({
			success: true,
			serverAudioPath: targetPath, // absolute path used by FFmpeg
			audioFileKey: path.basename(targetPath)
		});
	} catch (err) {
		console.error('audio-save error:', err);
		return json({ success: false, error: err.message }, { status: 500 });
	}
}

