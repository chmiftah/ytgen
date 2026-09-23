import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const SFX_DIR = path.resolve('./static/sfx');

function runFFmpeg(args) {
	return new Promise((resolve, reject) => {
		const proc = spawn('ffmpeg', args);
		let stderr = '';
		proc.stderr.on('data', d => stderr += d.toString());
		proc.on('close', code => {
			if (code === 0) resolve();
			else reject(new Error(`FFmpeg exited ${code}: ${stderr.slice(-300)}`));
		});
		proc.on('error', reject);
	});
}

async function main() {
	console.log('Generating Cinematic Sound Effects...');

	// 1. Cinematic Boom (Deep Sub Bass Impact)
	const boomPath = path.join(SFX_DIR, 'cinematic-boom.mp3');
	await runFFmpeg([
		'-f', 'lavfi', '-i', 'aevalsrc=exprs=sin(2*PI*(80-45*t)*t)*exp(-3*t):d=1.8',
		'-f', 'lavfi', '-i', 'anoisesrc=d=0.35:c=pink:r=44100:a=0.4',
		'-filter_complex', `
			[0:a]volume=2.8,bass=g=16:f=55:w=0.4,afade=t=out:st=0.1:d=1.6[sub];
			[1:a]lowpass=f=450,volume=1.2,afade=t=out:st=0.03:d=0.28[punch];
			[sub][punch]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,alimiter=limit=0.95[out]
		`,
		'-map', '[out]',
		'-c:a', 'libmp3lame', '-b:a', '192k',
		'-y', boomPath
	]);
	console.log('Created cinematic-boom.mp3');

	// 2. Cinematic Swoosh (Dynamic Whoosh Transition)
	const swooshPath = path.join(SFX_DIR, 'cinematic-swoosh.mp3');
	await runFFmpeg([
		'-f', 'lavfi', '-i', 'anoisesrc=d=0.55:c=white:r=44100:a=0.8',
		'-af', 'bandpass=f=1400:w=1.8,volume=2.4,afade=t=in:st=0:d=0.18,afade=t=out:st=0.20:d=0.35,alimiter=limit=0.92',
		'-c:a', 'libmp3lame', '-b:a', '192k',
		'-y', swooshPath
	]);
	console.log('Created cinematic-swoosh.mp3');

	// 3. Riser Tension Swell (1.4s Rising Tension)
	const riserPath = path.join(SFX_DIR, 'riser-tension.mp3');
	await runFFmpeg([
		'-f', 'lavfi', '-i', 'aevalsrc=exprs=sin(2*PI*(140+260*t)*t):d=1.4',
		'-f', 'lavfi', '-i', 'anoisesrc=d=1.4:c=pink:r=44100:a=0.35',
		'-filter_complex', `
			[0:a]volume=2.0,afade=t=in:st=0:d=1.2,afade=t=out:st=1.25:d=0.15[tone];
			[1:a]bandpass=f=2000:w=1.5,volume=1.1,afade=t=in:st=0.2:d=1.1,afade=t=out:st=1.25:d=0.15[hiss];
			[tone][hiss]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[out]
		`,
		'-map', '[out]',
		'-c:a', 'libmp3lame', '-b:a', '192k',
		'-y', riserPath
	]);
	console.log('Created riser-tension.mp3');

	// 4. Glitch Accent (Digital Distortion Hit)
	const glitchPath = path.join(SFX_DIR, 'glitch-accent.mp3');
	await runFFmpeg([
		'-f', 'lavfi', '-i', 'anoisesrc=d=0.30:c=white:r=44100:a=0.9',
		'-af', 'acrusher=bits=4:mode=log:aa=1,bandpass=f=2600:w=1.2,volume=1.8,afade=t=out:st=0.08:d=0.22,alimiter=limit=0.90',
		'-c:a', 'libmp3lame', '-b:a', '192k',
		'-y', glitchPath
	]);
	console.log('Created glitch-accent.mp3');

	// 5. Camera Shutter Click (Snapshot Snap)
	const cameraPath = path.join(SFX_DIR, 'camera-shutter.mp3');
	await runFFmpeg([
		'-f', 'lavfi', '-i', 'sine=frequency=2800:duration=0.22',
		'-f', 'lavfi', '-i', 'anoisesrc=d=0.22:c=white:r=44100:a=0.7',
		'-filter_complex', `
			[0:a]volume=1.8,afade=t=out:st=0.01:d=0.04[click1];
			[1:a]highpass=f=3500,volume=1.4,afade=t=out:st=0.02:d=0.06[snap1];
			[click1][snap1]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,adelay=0|0[c1];
			[0:a]volume=1.4,afade=t=out:st=0.01:d=0.05,adelay=65|65[click2];
			[c1][click2]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[out]
		`,
		'-map', '[out]',
		'-c:a', 'libmp3lame', '-b:a', '192k',
		'-y', cameraPath
	]);
	console.log('Created camera-shutter.mp3');

	// 6. Vinyl Record Scratch (Sudden Stop/Pause)
	const vinylPath = path.join(SFX_DIR, 'vinyl-scratch.mp3');
	await runFFmpeg([
		'-f', 'lavfi', '-i', 'aevalsrc=exprs=sin(2*PI*(2000-3200*t)*t):d=0.30',
		'-f', 'lavfi', '-i', 'anoisesrc=d=0.30:c=pink:r=44100:a=0.6',
		'-filter_complex', `
			[0:a]volume=1.6,afade=t=out:st=0.10:d=0.20[chirp];
			[1:a]bandpass=f=2000:w=1.0,volume=1.2,afade=t=out:st=0.08:d=0.22[scratch];
			[chirp][scratch]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,alimiter=limit=0.90[out]
		`,
		'-map', '[out]',
		'-c:a', 'libmp3lame', '-b:a', '192k',
		'-y', vinylPath
	]);
	console.log('Created vinyl-scratch.mp3');

	console.log('All cinematic SFX successfully generated!');
}

main().catch(console.error);
