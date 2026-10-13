import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

/**
 * Prepares compact 16kHz mono audio for Groq Whisper
 */
function prepareWhisperAudio(inputPath, outputPath) {
	return new Promise((resolve, reject) => {
		const args = [
			'-y',
			'-i', inputPath,
			'-ar', '16000',
			'-ac', '1',
			'-c:a', 'libmp3lame',
			'-b:a', '64k',
			outputPath
		];
		const proc = spawn(ffmpegPath || 'ffmpeg', args);
		let stderr = '';
		proc.stderr.on('data', (d) => { stderr += d.toString(); });
		proc.on('close', (code) => {
			if (code === 0) resolve();
			else reject(new Error(`FFmpeg audio prep error: ${stderr.slice(-200)}`));
		});
		proc.on('error', reject);
	});
}

export async function POST({ request }) {
	const groqKey = (env.GROQ_API_KEY || '').trim();
	if (!groqKey) {
		return json({
			success: false,
			error: 'GROQ_API_KEY belum dikonfigurasi di file .env. Diperlukan untuk Groq Whisper AI.'
		}, { status: 400 });
	}

	const tempDir = path.resolve('./static/renders/audio-cache');
	await fs.promises.mkdir(tempDir, { recursive: true });

	const sessionId = `transcribe-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
	let sourceAudioPath = '';
	let cleanupNeeded = false;

	try {
		const contentType = request.headers.get('content-type') || '';
		if (contentType.includes('multipart/form-data')) {
			const formData = await request.formData();
			const file = formData.get('file') || formData.get('audio');
			if (!file || typeof file === 'string') {
				return json({ success: false, error: 'File audio tidak ditemukan dalam request.' }, { status: 400 });
			}
			const buffer = Buffer.from(await file.arrayBuffer());
			sourceAudioPath = path.join(tempDir, `${sessionId}-upload.mp3`);
			await fs.promises.writeFile(sourceAudioPath, buffer);
			cleanupNeeded = true;
		} else {
			const body = await request.json().catch(() => ({}));
			const { audioUrl, audioPath } = body;
			if (audioPath && fs.existsSync(audioPath)) {
				sourceAudioPath = audioPath;
			} else if (audioUrl) {
				const cleanUrl = audioUrl.startsWith('/') ? audioUrl.slice(1) : audioUrl;
				const localPath = path.resolve('./static', cleanUrl);
				if (fs.existsSync(localPath)) {
					sourceAudioPath = localPath;
				} else {
					return json({ success: false, error: `File audio lokal tidak ditemukan: ${audioUrl}` }, { status: 404 });
				}
			} else {
				return json({ success: false, error: 'audioUrl atau audioPath diperlukan.' }, { status: 400 });
			}
		}

		// Convert to 16kHz mono for whisper
		const whisperAudioPath = path.join(tempDir, `${sessionId}-whisper.mp3`);
		await prepareWhisperAudio(sourceAudioPath, whisperAudioPath);

		// Transcribe with Groq Whisper
		const fileBuffer = await fs.promises.readFile(whisperAudioPath);
		const fileBlob = new Blob([fileBuffer], { type: 'audio/mpeg' });

		const models = ['whisper-large-v3', 'whisper-large-v3-turbo'];
		let whisperData = null;
		let lastError = null;

		for (const modelId of models) {
			try {
				const form = new FormData();
				form.append('file', fileBlob, `audio_${sessionId}.mp3`);
				form.append('model', modelId);
				form.append('response_format', 'verbose_json');
				form.append('timestamp_granularities[]', 'segment');
				form.append('timestamp_granularities[]', 'word');

				const controller = new AbortController();
				const timeout = setTimeout(() => controller.abort(), 45000);

				const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
					method: 'POST',
					headers: { Authorization: `Bearer ${groqKey}` },
					body: form,
					signal: controller.signal
				});

				clearTimeout(timeout);

				if (res.ok) {
					whisperData = await res.json();
					break;
				} else {
					const errText = await res.text();
					lastError = new Error(`Groq Whisper ${modelId} failed: ${errText}`);
				}
			} catch (err) {
				lastError = err;
			}
		}

		// Clean up whisper prep file
		if (fs.existsSync(whisperAudioPath)) {
			try { fs.unlinkSync(whisperAudioPath); } catch {}
		}
		if (cleanupNeeded && fs.existsSync(sourceAudioPath)) {
			try { fs.unlinkSync(sourceAudioPath); } catch {}
		}

		if (!whisperData || (!whisperData.segments?.length && !whisperData.words?.length)) {
			throw new Error(lastError?.message || 'Tidak ada segmen suara yang terdeteksi oleh Whisper.');
		}

		// Convert to 1-line subtitle blocks with maximum 5 words, non-overlapping
		const MAX_WORDS = 5;
		const subtitles = [];

		if (Array.isArray(whisperData.words) && whisperData.words.length > 0) {
			const validWords = whisperData.words.filter((w) => (w.word || '').trim().length > 0);
			for (let i = 0; i < validWords.length; i += MAX_WORDS) {
				const slice = validWords.slice(i, i + MAX_WORDS);
				const start = Math.max(0, Number(slice[0].start.toFixed(2)));
				const end = Math.max(start + 0.3, Number(slice[slice.length - 1].end.toFixed(2)));
				const text = slice.map((w) => w.word.trim()).join(' ').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
				if (text) {
					subtitles.push({
						id: `sub-${subtitles.length + 1}-${Date.now().toString(36)}`,
						start,
						end,
						duration: Number((end - start).toFixed(2)),
						text
					});
				}
			}
		} else if (Array.isArray(whisperData.segments) && whisperData.segments.length > 0) {
			for (const seg of whisperData.segments) {
				const clean = (seg.text || '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
				if (!clean) continue;
				const words = clean.split(' ').filter(Boolean);
				const segStart = Math.max(0, Number(seg.start.toFixed(2)));
				const segEnd = Math.max(segStart + 0.3, Number(seg.end.toFixed(2)));
				const segDur = Math.max(0.3, segEnd - segStart);
				const totalWords = words.length;

				for (let i = 0; i < totalWords; i += MAX_WORDS) {
					const slice = words.slice(i, i + MAX_WORDS);
					const cStart = Number((segStart + (i / totalWords) * segDur).toFixed(2));
					const cEnd = Number((segStart + ((i + slice.length) / totalWords) * segDur).toFixed(2));
					const start = Math.max(0, cStart);
					const end = Math.max(start + 0.25, cEnd);
					subtitles.push({
						id: `sub-${subtitles.length + 1}-${Date.now().toString(36)}`,
						start,
						end,
						duration: Number((end - start).toFixed(2)),
						text: slice.join(' ')
					});
				}
			}
		}

		// Ensure strictly sequential and non-overlapping timestamps
		subtitles.sort((a, b) => a.start - b.start);
		for (let i = 0; i < subtitles.length - 1; i++) {
			if (subtitles[i].end > subtitles[i + 1].start) {
				subtitles[i].end = subtitles[i + 1].start;
				subtitles[i].duration = Number(Math.max(0.1, subtitles[i].end - subtitles[i].start).toFixed(2));
			}
		}

		return json({
			success: true,
			totalSubtitles: subtitles.length,
			subtitles,
			segments: subtitles
		});
	} catch (err) {
		console.error('[Transcribe Audio Error]:', err);
		return json({
			success: false,
			error: err.message || 'Gagal mentranskripsi audio ke subtitle.'
		}, { status: 500 });
	}
}
