import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { analyzeScript as localAnalyzeScript, splitSentenceIntoPacedSegments } from '$lib/services/scriptAnalyzer.js';

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
Your task is to analyze the user's script and break it down into natural, organic sequential scenes. Each scene should represent a complete sentence or unified thought (natural flow, typically 15-30 words per scene). Let the narration breathe naturally without cutting single sentences into artificial short fragments.
In addition, divide the script into 2 to 4 impactful narrative chapters.

Chapter Tag Rules (CRITICAL):
- If the first section is a Hook or Cold Open (e.g. [HOOK: ...] or script starts with cold open before Chapter/Bab 1), set "tag": "HOOK", "number": 0, "is_hook": true.
- If the user's script is in English or uses "Chapter 1", set "tag": "CHAPTER 01" (or "CHAPTER 02", etc.).
- If the user's script uses "Part 1", set "tag": "PART 1" (or "PART 2", etc.).
- If the user's script uses "Bagian 1", set "tag": "BAGIAN 1" (or "BAGIAN 2", etc.).
- If the user's script uses "Bab 1", set "tag": "BAB 01".
- If the user's script provides only chapter titles without "Chapter", "Bab" or "Part", or requests only title, set "tag": "" (empty string).
- DO NOT force "BAB" if the user specifically wrote "Chapter", "Part", "Bagian", or if the script is in English.

For EACH scene, output:
1. "narration": The spoken text preserved in the script's exact original language (English, Indonesian, etc.).
2. "pexels_query": 3 to 6 high-impact cinematography keywords strictly IN ENGLISH optimized for Pexels video search (e.g. "futuristic artificial intelligence neural network 4k", "cinematic timelapse modern metropolis traffic", "stock market financial growth trading chart", "ocean waves golden hour sunrise drone").
3. "stickman_query": 2 to 4 English keywords describing a concrete 2D stickman character action, posture, emotion, or prop matching this scene (e.g. "standing gold coins", "typing computer desk", "crying sad tissue", "shrugging confusion", "holding heavy boulder", "pointing light idea", "sleeping bed tired", "running exercise", "drinking water bottle", "giving thumbs up").
4. "mood": e.g., "tech", "dramatic", "inspirational", "curious", "urgent", "calm".
5. "key_point": 2 to 4 words IN THE SAME LANGUAGE AS THE SCRIPT (English for English script, Indonesian for Indonesian script) capturing the single most essential idea/keyword of this scene's narration — punchy noun phrase, no filler. (Examples in English: "Deep Fear", "Midnight Loop", "Silent Panic", "Financial Trap", "Time Illusion", "Ego Battle"). Must be 2-4 words.
6. "chapter": (Only for the FIRST scene of each chapter/hook; null for subsequent scenes in that chapter):
   {
     "number": 0 (for hook) or 1..N,
     "tag": "HOOK" or "CHAPTER 01" or "PART 1" or "BAB 01" or "BAGIAN 1" or "" (match user language & preference),
     "title": "Short Punchy Chapter Title in the same language as the script",
     "subtitle": "One sentence intriguing context",
     "is_hook": true (if hook/cold open)
   }

Return strictly valid JSON in this structure:
{
  "scenes": [
    {
      "narration": "text here...",
      "pexels_query": "english keywords here...",
      "stickman_query": "typing computer desk",
      "mood": "tech",
      "key_point": "Key Point Text",
      "chapter": { "number": 0, "tag": "HOOK", "title": "Cold Open", "subtitle": "Hook intro context", "is_hook": true }
    },
    {
      "narration": "second scene text...",
      "pexels_query": "...",
      "stickman_query": "standing gold coins",
      "mood": "tech",
      "key_point": "Key Point Text",
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
							const userWantsChapter = /\bchapter\s*\d+/i.test(cleanScript);
							const userWantsBagian = /\bbagian\s*\d+/i.test(cleanScript);
							const userWantsPart = /\bpart\s*\d+/i.test(cleanScript);
							const userWantsBab = /\bbab\s*\d+/i.test(cleanScript);
							const userWantsOnlyTitle = /\b(hanya judul|tanpa bab|tanpa tag|no tag|title only)\b/i.test(cleanScript);
							const isEnglishScript = /\b(the|this|that|with|for|what|why|how|when|they|have|from|will|your|about)\b/i.test(cleanScript);

							// Natural scene pacing: keep AI-generated scenes intact and natural
							const pacedRawScenes = parsed.scenes || [];

							const mappedScenes = pacedRawScenes.map((sc, idx) => {
								const words = (sc.narration || '').split(/\s+/).filter(Boolean);
								const estimatedDuration = Math.max(3.5, Number((words.length * 0.45).toFixed(1)));

								let chapterObj = null;
								if (sc.chapter) {
									const isHook = Boolean(
										sc.chapter.is_hook || 
										/^hook\b|^cold\s*open\b|^teaser\b|^intro\b|^pembuka\b/i.test(String(sc.chapter.tag || '')) ||
										/^hook\b|^cold\s*open\b|^teaser\b/i.test(String(sc.chapter.title || ''))
									);
									const chNum = isHook ? 0 : (sc.chapter.number || 1);
									const defaultTag = isHook 
										? 'HOOK' 
										: (userWantsChapter || (isEnglishScript && !userWantsBab)) 
											? `CHAPTER ${String(chNum).padStart(2, '0')}` 
											: `BAB ${String(chNum).padStart(2, '0')}`;

									let tag = (sc.chapter.tag !== undefined && sc.chapter.tag !== null) 
										? String(sc.chapter.tag).trim() 
										: defaultTag;

									// Align tag with user's explicit wording in script
									if (isHook) {
										tag = 'HOOK';
									} else if (userWantsOnlyTitle) {
										tag = '';
									} else if (userWantsChapter || (isEnglishScript && !userWantsBab && !userWantsPart)) {
										tag = tag.replace(/^BAB\s*0?(\d+)/i, 'CHAPTER $1');
										if (!/^CHAPTER/i.test(tag) && !/^PART/i.test(tag)) tag = `CHAPTER ${String(chNum).padStart(2, '0')}`;
									} else if (userWantsBagian && !userWantsBab) {
										tag = tag.replace(/^BAB\s*0?(\d+)/i, 'BAGIAN $1');
										if (!/^BAGIAN/i.test(tag)) tag = `BAGIAN ${chNum}`;
									} else if (userWantsPart && !userWantsBab) {
										tag = tag.replace(/^BAB\s*0?(\d+)/i, 'PART $1');
										if (!/^PART/i.test(tag)) tag = `PART ${chNum}`;
									}

									chapterObj = {
										number: chNum,
										tag,
										title: sc.chapter.title || (isHook ? 'Cold Open' : isEnglishScript ? 'Chapter Overview' : 'Judul Bab'),
										subtitle: sc.chapter.subtitle || '',
										style: isHook ? 'hook' : 'center',
										isHook
									};
								}

								return {
									id: `scene-${idx + 1}-${Date.now()}`,
									index: idx + 1,
									narration: sc.narration,
									keyPoint: (sc.key_point || '').toString().trim().slice(0, 48),
									words,
									visualQuery: sc.pexels_query || 'cinematic 4k landscape aesthetic',
									stickmanQuery: (sc.stickman_query || '').toString().trim(),
									mood: sc.mood || 'cinematic',
									estimatedDuration,
									audioDuration: estimatedDuration,
									footage: null,
									voiceAudioUrl: null,
									wordTimings: [],
									chapter: chapterObj
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
