import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

// Save audio base64 to a temp file on the server and return a file key
export async function POST({ request }) {
	try {
		const { audioBase64, sceneId } = await request.json();

		if (!audioBase64) {
			return json({ success: false, error: 'No audio data' }, { status: 400 });
		}

		const audioDir = path.resolve('./static/renders/audio-cache');
		await fs.promises.mkdir(audioDir, { recursive: true });

		const filename = `voice-${sceneId}-${Date.now()}.mp3`;
		const filePath = path.join(audioDir, filename);
		const base64Data = audioBase64.replace(/^data:audio\/[^;]+;base64,/, '');
		await fs.promises.writeFile(filePath, Buffer.from(base64Data, 'base64'));

		// Return a server-relative URL path
		return json({
			success: true,
			serverAudioPath: filePath,     // absolute path used by FFmpeg
			audioFileKey: filename
		});
	} catch (err) {
		console.error('audio-save error:', err);
		return json({ success: false, error: err.message }, { status: 500 });
	}
}
