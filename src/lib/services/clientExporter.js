/**
 * Client-side video recorder exporter
 * Renders video frames and audio to Canvas & MediaRecorder
 */
export async function recordCanvasVideo(canvas, audioElement, durationMs, onProgress) {
	return new Promise((resolve, reject) => {
		try {
			const stream = canvas.captureStream(30);
			
			// If audio element is available and playing
			if (audioElement && audioElement.captureStream) {
				const audioStream = audioElement.captureStream();
				const audioTracks = audioStream.getAudioTracks();
				if (audioTracks.length > 0) {
					stream.addTrack(audioTracks[0]);
				}
			}

			const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
				? 'video/webm;codecs=vp9'
				: MediaRecorder.isTypeSupported('video/webm')
				? 'video/webm'
				: 'video/mp4';

			const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8000000 });
			const chunks = [];

			recorder.ondataavailable = (e) => {
				if (e.data && e.data.size > 0) {
					chunks.push(e.data);
				}
			};

			recorder.onstop = () => {
				const blob = new Blob(chunks, { type: mimeType });
				const url = URL.createObjectURL(blob);
				resolve({ url, blob, mimeType });
			};

			recorder.onerror = (err) => reject(err);

			recorder.start(100);

			const startTime = Date.now();
			const interval = setInterval(() => {
				const elapsed = Date.now() - startTime;
				const progress = Math.min(100, Math.round((elapsed / durationMs) * 100));
				if (onProgress) onProgress(progress);

				if (elapsed >= durationMs) {
					clearInterval(interval);
					recorder.stop();
				}
			}, 200);
		} catch (err) {
			reject(err);
		}
	});
}

/**
 * Trigger browser file download
 */
export function triggerDownload(url, filename) {
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}
