import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const PRESETS = [
	{
		id: 'cinematic_deep',
		pitch: '-14Hz',
		rate: '-4%',
		filter: 'bass=g=7:f=110:w=0.6,equalizer=f=450:t=q:w=1.2:g=-2.5,equalizer=f=3400:t=q:w=1.2:g=3.8,highshelf=f=7500:g=2.5,acompressor=threshold=-18dB:ratio=3.5:attack=5:release=60:makeup=2.2dB,extrastereo=m=1.12'
	},
	{
		id: 'studio_podcast',
		pitch: '-8Hz',
		rate: '-2%',
		filter: 'bass=g=4:f=130:w=0.6,equalizer=f=400:t=q:w=1.2:g=-1.5,equalizer=f=3000:t=q:w=1.0:g=1.5,acompressor=threshold=-16dB:ratio=2.8:attack=5:release=50:makeup=1.5dB'
	},
	{
		id: 'energetic_creator',
		pitch: '-3Hz',
		rate: '+4%',
		filter: 'equalizer=f=200:t=q:w=1:g=1.5,equalizer=f=3000:t=q:w=1.0:g=2.0,acompressor=threshold=-16dB:ratio=3:attack=4:release=40:makeup=1.5dB'
	},
	{
		id: 'storyteller',
		pitch: '-18Hz',
		rate: '-6%',
		filter: 'bass=g=5:f=100:w=0.6,equalizer=f=450:t=q:w=1.0:g=-1.5,equalizer=f=2800:t=q:w=1.0:g=1.2,aecho=0.6:0.3:25:0.12,acompressor=threshold=-16dB:ratio=2.5:attack=8:release=70:makeup=1.5dB'
	},
	{
		id: 'movie_trailer',
		pitch: '-28Hz',
		rate: '-4%',
		filter: 'bass=g=5:f=95:w=0.6,equalizer=f=450:t=q:w=1.2:g=-2,equalizer=f=3000:t=q:w=1.0:g=1.5,acompressor=threshold=-16dB:ratio=3:attack=5:release=65:makeup=1.5dB'
	},
	{
		id: 'creepy_horror',
		pitch: '-70Hz',
		rate: '-12%',
		filter: 'bass=g=8:f=75:w=0.5,aecho=0.7:0.5:60|120:0.25|0.18,acompressor=threshold=-16dB:ratio=3:makeup=1dB'
	},
	{
		id: 'natural',
		pitch: '0Hz',
		rate: '0%',
		filter: 'equalizer=f=3000:t=q:w=1.0:g=1.0,acompressor=threshold=-15dB:ratio=2.2:attack=5:release=50:makeup=1dB'
	}
];

const SAMPLE_TEXT = "Ini adalah pengujian karakter vokal baru untuk narasi video YouTube Anda. Suara terdengar jernih, berbobot, dan unik.";

async function run() {
	const outDir = path.resolve('./static/voice-samples');
	await fs.promises.mkdir(outDir, { recursive: true });

	for (const p of PRESETS) {
		console.log(`Generating sample for ${p.id}...`);
		const tts = new MsEdgeTTS();
		await tts.setMetadata('id-ID-ArdiNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
		
		const { audioStream } = tts.toStream(SAMPLE_TEXT, {
			rate: p.rate,
			pitch: p.pitch
		});

		const chunks = [];
		audioStream.on('data', c => chunks.push(c));
		await new Promise((res, rej) => {
			audioStream.on('end', res);
			audioStream.on('error', rej);
		});
		tts.close();

		const rawBuf = Buffer.concat(chunks);
		const rawPath = path.join(outDir, `temp-${p.id}.mp3`);
		const targetPath = path.join(outDir, `effect-${p.id}.mp3`);
		await fs.promises.writeFile(rawPath, rawBuf);

		await new Promise((res, rej) => {
			const proc = spawn(ffmpegPath, [
				'-i', rawPath,
				'-af', p.filter,
				'-c:a', 'libmp3lame',
				'-b:a', '192k',
				'-ar', '44100',
				'-y', targetPath
			]);
			let err = '';
			proc.stderr.on('data', d => err += d.toString());
			proc.on('close', code => {
				if (code === 0) res();
				else rej(new Error(`FFmpeg failed (${code}): ${err}`));
			});
		});

		await fs.promises.unlink(rawPath).catch(() => {});
		console.log(`✓ Generated ${targetPath}`);
	}
	console.log('All preset samples generated successfully!');
}

run().catch(console.error);
