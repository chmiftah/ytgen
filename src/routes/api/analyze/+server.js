import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { analyzeScript as localAnalyzeScript } from '$lib/services/scriptAnalyzer.js';

const DEFAULT_DEEPSEEK_KEY = env.DEEPSEEK_API_KEY || 'sk-0802f45e1d4e41c8ae8d46396c97b746';

export async function POST({ request }) {
	try {
		const { script, apiKey } = await request.json();

		if (!script || !script.trim()) {
			return json({ success: false, error: 'Script cannot be empty' }, { status: 400 });
		}

		const cleanScript = script.trim();
		const effectiveApiKey = (apiKey && apiKey.trim().length > 10) ? apiKey.trim() : DEFAULT_DEEPSEEK_KEY;

		// If we have a DeepSeek API key, query DeepSeek AI
		if (effectiveApiKey) {
			try {
				const response = await fetch('https://api.deepseek.com/chat/completions', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${effectiveApiKey}`
					},
					body: JSON.stringify({
						model: 'deepseek-chat',
						messages: [
							{
								role: 'system',
								content: `You are an elite YouTube video director and editor specializing in high-retention 16:9 YouTube Long videos.
Your task is to analyze the user's script and break it down into sequential scenes (pacing: 12-25 words per scene, about 4-8 seconds each for maximum viewer retention).
In addition, divide the script into 2 to 4 impactful narrative chapters (e.g. Bab 1: Hook & Pengenalan, Bab 2: Inti Masalah / Analisis, Bab 3: Solusi & Masa Depan).

For EACH scene, output:
1. "narration": The spoken text preserved in the script's exact original language (Indonesian, English, etc.).
2. "pexels_query": 3 to 6 high-impact cinematography keywords strictly IN ENGLISH optimized for Pexels video search (e.g. "futuristic artificial intelligence neural network 4k", "cinematic timelapse modern metropolis traffic", "stock market financial growth trading chart", "ocean waves golden hour sunrise drone").
3. "mood": e.g., "tech", "dramatic", "inspirational", "curious", "urgent", "calm".
4. "chapter": (Only for the FIRST scene of each chapter; null for subsequent scenes in that chapter):
   {
     "number": 1,
     "tag": "BAB 01",
     "title": "Short Punchy Chapter Title in Indonesian",
     "subtitle": "One sentence intriguing context"
   }

Return strictly valid JSON in this structure:
{
  "scenes": [
    {
      "narration": "text here...",
      "pexels_query": "english keywords here...",
      "mood": "tech",
      "chapter": { "number": 1, "tag": "BAB 01", "title": "Awal Mula", "subtitle": "Pengantar cerita" }
    },
    {
      "narration": "second scene text...",
      "pexels_query": "...",
      "mood": "tech",
      "chapter": null
    }
  ]
}`
							},
							{
								role: 'user',
								content: cleanScript
							}
						],
						response_format: { type: 'json_object' }
					})
				});

				if (response.ok) {
					const data = await response.json();
					const content = data.choices?.[0]?.message?.content;
					if (content) {
						const parsed = JSON.parse(content);
						if (parsed.scenes && Array.isArray(parsed.scenes) && parsed.scenes.length > 0) {
							const mappedScenes = parsed.scenes.map((sc, idx) => {
								const words = (sc.narration || '').split(/\s+/).filter(Boolean);
								const estimatedDuration = Math.max(3.5, Number((words.length * 0.45).toFixed(1)));
								return {
									id: `scene-${idx + 1}-${Date.now()}`,
									index: idx + 1,
									narration: sc.narration,
									words,
									visualQuery: sc.pexels_query || 'cinematic 4k landscape aesthetic',
									mood: sc.mood || 'cinematic',
									estimatedDuration,
									audioDuration: estimatedDuration,
									footage: null,
									voiceAudioUrl: null,
									wordTimings: [],
									chapter: sc.chapter ? {
										number: sc.chapter.number || 1,
										tag: sc.chapter.tag || `BAB ${String(sc.chapter.number || 1).padStart(2, '0')}`,
										title: sc.chapter.title || 'Judul Bab',
										subtitle: sc.chapter.subtitle || '',
										style: 'center'
									} : null
								};
							});

							return json({
								success: true,
								scenes: mappedScenes,
								source: 'deepseek-ai',
								model: data.model || 'deepseek-chat'
							});
						}
					}
				} else {
					const errText = await response.text();
					console.warn('DeepSeek API responded with error:', errText);
				}
			} catch (aiErr) {
				console.error('DeepSeek AI request failed:', aiErr);
			}
		}

		// Fallback to local heuristic analyzer if DeepSeek fails or not configured
		const fallbackScenes = localAnalyzeScript(cleanScript);
		return json({
			success: true,
			scenes: fallbackScenes,
			source: 'local-heuristic',
			message: 'DeepSeek fallback used'
		});
	} catch (error) {
		console.error('Error in /api/analyze:', error);
		return json({ success: false, error: error.message }, { status: 500 });
	}
}
