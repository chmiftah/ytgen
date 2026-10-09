import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { robustJsonParse } from '$lib/utils/jsonParser.js';

const DEFAULT_DEEPSEEK_KEY = env.DEEPSEEK_API_KEY || '';

export async function POST({ request }) {
	try {
		const {
			scenes = [],
			characterDescription = 'A minimalist 2D black stickman with clean vector line art and expressive pose',
			style2D = '2D Minimalist Vector Stickman',
			apiKey
		} = await request.json();

		if (!scenes || scenes.length === 0) {
			return json({ success: false, error: 'Tidak ada scene yang diberikan untuk generate prompt.' }, { status: 400 });
		}

		const effectiveKey = (apiKey && apiKey.trim()) || DEFAULT_DEEPSEEK_KEY;
		if (!effectiveKey) {
			return json({
				success: false,
				error: 'DeepSeek API Key belum diatur di server atau settings.'
			}, { status: 400 });
		}

		const systemPrompt = `You are a World-Class AI Art Prompt Director specializing in 2D vector illustrations, stickman characters, and narrative storyboarding for Midjourney v6, Flux.1, and Stable Diffusion.

CRITICAL OBJECTIVE:
Generate high-conversion, visually striking Text-to-Image prompts for each scene. Every single prompt MUST maintain STRICT 100% VISUAL AND CHARACTER CONSISTENCY.

CONSISTENCY RULES:
1. CHARACTER ANCHOR: You MUST include the exact character definition in every prompt:
   "${characterDescription}"
2. ART STYLE: ${style2D}. Clean 2D flat vector aesthetic, high contrast, clean solid or dark textured background, expressive gesture, dynamic cinematic composition, dramatic lighting cues, crisp silhouettes. No photorealistic 3D, no messy gradients, no distorted anatomy.
3. FORMAT: English prompts, descriptive, comma-separated keywords and camera angles, ending with "--ar 16:9".
4. OUTPUT FORMAT: PURE JSON ONLY. No conversational prelude or markdown codeblock.
{
  "prompts": [
    {
      "sceneNumber": 1,
      "prompt": "2D minimalist vector stickman illustration, [character action based on narration], clean black ink lines, solid dark slate blue background, dramatic rim light, wide angle cinematic shot, high contrast, expressive emotion, clean flat design, award-winning storyboard --ar 16:9"
    }
  ]
}`;

		const scenesInput = scenes.map((/** @type {any} */ s) => ({
			sceneNumber: s.sceneNumber,
			narration: s.narration,
			visualAction: s.visualAction
		}));

		const response = await fetch('https://api.deepseek.com/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${effectiveKey}`
			},
			body: JSON.stringify({
				model: 'deepseek-chat',
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: `Generate consistent 2D text-to-image prompts for these scenes:\n${JSON.stringify(scenesInput, null, 2)}` }
				],
				temperature: 0.8,
				response_format: { type: 'json_object' }
			})
		});

		if (!response.ok) {
			const errText = await response.text();
			console.error('DeepSeek API error in generate-prompts:', errText);
			return json({
				success: false,
				error: `DeepSeek API error: ${response.status} - ${errText}`
			}, { status: response.status });
		}

		const data = await response.json();
		const rawContent = data.choices?.[0]?.message?.content;
		const parsed = robustJsonParse(rawContent);

		if (!parsed || !parsed.prompts) {
			console.error('Failed to parse prompt JSON from AI:', rawContent);
			return json({
				success: false,
				error: 'Gagal memproses prompt gambar dari AI.'
			}, { status: 500 });
		}

		return json({
			success: true,
			prompts: parsed.prompts || []
		});

	} catch (/** @type {any} */ error) {
		console.error('Unexpected error in generate-prompts:', error);
		return json({
			success: false,
			error: error?.message || 'Terjadi kesalahan sistem saat membuat prompt gambar.'
		}, { status: 500 });
	}
}
