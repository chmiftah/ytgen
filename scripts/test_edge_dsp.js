import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function testEdgeDSP() {
	console.log('1. Synthesizing raw Edge TTS with high quality 96kbps...');
	const tts = new MsEdgeTTS();
	await tts.setMetadata('id-ID-ArdiNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
	
	const text = "Selamat datang di kanal kami. Hari ini kita akan mengungkap fakta tersembunyi di balik peradaban kuno yang hilang ribuan tahun lalu.";
	const { audioStream } = tts.toStream(text, {
		rate: '-4%',
		pitch: '-12Hz'
	});

	const chunks = [];
	audioStream.on('data', c => chunks.push(c));
	await new Promise((res, rej) => {
		audioStream.on('end', res);
		audioStream.on('error', rej);
	});
	tts.close();

	const rawBuffer = Buffer.concat(chunks);
	const rawPath = './static/voice-samples/test-raw-ardi.mp3';
	await fs.promises.writeFile(rawPath, rawBuffer);
	console.log('✓ Raw Edge TTS saved:', rawPath, `(${rawBuffer.length} bytes)`);

	// Now apply Studio Broadcast DSP Filter
	console.log('2. Applying Studio Mastering DSP Filter via FFmpeg...');
	const filter = 'bass=g=7:f=110:w=0.6,equalizer=f=450:t=q:w=1.2:g=-2.5,equalizer=f=3400:t=q:w=1.2:g=3.8,highshelf=f=7500:g=2.5,acompressor=threshold=-18dB:ratio=3.5:attack=5:release=60:makeup=2dB,extrastereo=m=1.12';
	const masteredPath = './static/voice-samples/test-mastered-ardi.mp3';

	await new Promise((res, rej) => {
		const proc = spawn(ffmpegPath, [
			'-i', rawPath,
			'-af', filter,
			'-c:a', 'libmp3lame',
			'-b:a', '192k',
			'-ar', '44100',
			'-y', masteredPath
		]);
		let err = '';
		proc.stderr.on('data', d => err += d.toString());
		proc.on('close', code => {
			if (code === 0) res();
			else rej(new Error(`FFmpeg failed (${code}): ${err}`));
		});
	});

	console.log('✓ Mastered Studio Voice saved:', masteredPath);
}

testEdgeDSP().catch(console.error);
