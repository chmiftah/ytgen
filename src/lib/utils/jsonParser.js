/**
 * Robust JSON Parser for AI/LLM outputs
 * Handles markdown code fences, unescaped control characters inside string literals,
 * and truncated brackets.
 */
export function robustJsonParse(raw) {
	if (!raw || typeof raw !== 'string') return null;

	let clean = raw.trim();

	// 1. Remove markdown code fences like ```json ... ``` or ``` ... ```
	clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

	// 2. Try direct JSON.parse first
	try {
		return JSON.parse(clean);
	} catch (e1) {
		// Continue
	}

	// 3. Extract the outermost JSON object { ... } or array [ ... ]
	const firstBrace = clean.indexOf('{');
	const lastBrace = clean.lastIndexOf('}');
	if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
		const sliced = clean.slice(firstBrace, lastBrace + 1);
		try {
			return JSON.parse(sliced);
		} catch (e2) {
			clean = sliced;
		}
	}

	// 4. Fix unescaped control characters (newlines, carriage returns, tabs) inside string literals
	try {
		const fixedControlChars = clean.replace(/"((?:\\.|[^"\\])*)"/gs, (match, content) => {
			const escaped = content
				.replace(/\n/g, '\\n')
				.replace(/\r/g, '\\r')
				.replace(/\t/g, '\\t');
			return `"${escaped}"`;
		});
		return JSON.parse(fixedControlChars);
	} catch (e3) {
		// Continue
	}

	// 5. Attempt bracket auto-closure if response was cut off
	try {
		let attempt = clean;
		const quoteCount = (attempt.match(/"/g) || []).length;
		if (quoteCount % 2 !== 0) {
			attempt += '"';
		}
		const openBrackets = (attempt.match(/\[/g) || []).length;
		const closeBrackets = (attempt.match(/\]/g) || []).length;
		for (let i = 0; i < openBrackets - closeBrackets; i++) attempt += ']';

		const openBraces = (attempt.match(/\{/g) || []).length;
		const closeBraces = (attempt.match(/\}/g) || []).length;
		for (let i = 0; i < openBraces - closeBraces; i++) attempt += '}';

		return JSON.parse(attempt);
	} catch (e4) {
		console.warn('robustJsonParse could not recover JSON:', clean.slice(0, 200));
		return null;
	}
}
