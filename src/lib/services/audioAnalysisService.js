/**
 * Audio Analysis & Processing Service
 * Provides client-side exact duration measurement, speech onset & silence detection
 * via Web Audio API, and in-browser microphone recording.
 */

let sharedAudioContext = null;

function getAudioContext() {
	if (typeof window === 'undefined') return null;
	if (!sharedAudioContext) {
		const AudioCtx = window.AudioContext || window.webkitAudioContext;
		if (AudioCtx) {
			sharedAudioContext = new AudioCtx();
		}
	}
	if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
		sharedAudioContext.resume().catch(() => {});
	}
	return sharedAudioContext;
}

/**
 * Convert Blob or File to Base64 Data URL
 */
export function blobToDataURL(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result);
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}

/**
 * Convert Blob or File to ArrayBuffer
 */
function blobToArrayBuffer(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result);
		reader.onerror = reject;
		reader.readAsArrayBuffer(blob);
	});
}

/**
 * Analyze an audio file or blob:
 * - Decodes full audio buffer
 * - Computes exact duration
 * - Analyzes speech boundaries (speechStart and speechEnd) via RMS noise gating
 */
export async function analyzeAudioFile(fileOrBlob) {
	const ctx = getAudioContext();
	if (!ctx) {
		throw new Error('Web Audio API is not supported in this browser.');
	}

	const arrayBuffer = await blobToArrayBuffer(fileOrBlob);
	// decodeAudioData consumes the arrayBuffer, so we decode a copy
	const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));

	const duration = Number(audioBuffer.duration.toFixed(2));
	const sampleRate = audioBuffer.sampleRate;
	const channelData = audioBuffer.getChannelData(0);

	// Detect speech boundaries using 25ms RMS analysis windows
	const windowSize = Math.floor(sampleRate * 0.025);
	const numWindows = Math.floor(channelData.length / windowSize);
	const threshold = 0.012; // Noise gate threshold (~ -38 dB)

	let firstSpeechWindow = -1;
	let lastSpeechWindow = -1;

	for (let i = 0; i < numWindows; i++) {
		const offset = i * windowSize;
		let sumSq = 0;
		for (let j = 0; j < windowSize; j++) {
			const val = channelData[offset + j];
			sumSq += val * val;
		}
		const rms = Math.sqrt(sumSq / windowSize);

		if (rms >= threshold) {
			if (firstSpeechWindow === -1) {
				firstSpeechWindow = i;
			}
			lastSpeechWindow = i;
		}
	}

	let speechStart = 0.08;
	let speechEnd = Math.max(0.5, duration - 0.08);

	if (firstSpeechWindow !== -1 && lastSpeechWindow !== -1) {
		const detectedStart = (firstSpeechWindow * windowSize) / sampleRate;
		const detectedEnd = ((lastSpeechWindow + 1) * windowSize) / sampleRate;

		// Add subtle 50ms padding around speech onset
		speechStart = Math.max(0.05, Number((detectedStart - 0.05).toFixed(2)));
		speechEnd = Math.min(duration, Number((detectedEnd + 0.08).toFixed(2)));
	}

	const dataUrl = await blobToDataURL(fileOrBlob);
	const blobUrl = URL.createObjectURL(fileOrBlob);

	return {
		duration,
		speechStart,
		speechEnd,
		speechDuration: Number((speechEnd - speechStart).toFixed(2)),
		dataUrl,
		blobUrl,
		sampleRate,
		numberOfChannels: audioBuffer.numberOfChannels
	};
}

/**
 * In-browser microphone recorder
 */
export class VoiceRecorder {
	constructor() {
		this.mediaRecorder = null;
		this.audioChunks = [];
		this.stream = null;
		this.isRecording = false;
	}

	async start() {
		if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
			throw new Error('Microphone access not supported in this environment.');
		}

		this.stream = await navigator.mediaDevices.getUserMedia({
			audio: {
				echoCancellation: true,
				noiseSuppression: true,
				autoGainControl: true
			}
		});

		const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
			? 'audio/webm;codecs=opus'
			: MediaRecorder.isTypeSupported('audio/mp4')
				? 'audio/mp4'
				: '';

		this.mediaRecorder = mimeType
			? new MediaRecorder(this.stream, { mimeType })
			: new MediaRecorder(this.stream);

		this.audioChunks = [];
		this.mediaRecorder.ondataavailable = (e) => {
			if (e.data && e.data.size > 0) {
				this.audioChunks.push(e.data);
			}
		};

		this.mediaRecorder.start(100);
		this.isRecording = true;
	}

	stop() {
		return new Promise((resolve, reject) => {
			if (!this.mediaRecorder || !this.isRecording) {
				reject(new Error('Recorder is not active'));
				return;
			}

			this.mediaRecorder.onstop = () => {
				const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
				const audioBlob = new Blob(this.audioChunks, { type: mimeType });

				// Stop tracks
				if (this.stream) {
					this.stream.getTracks().forEach((track) => track.stop());
					this.stream = null;
				}

				this.isRecording = false;
				resolve(audioBlob);
			};

			this.mediaRecorder.stop();
		});
	}
}
