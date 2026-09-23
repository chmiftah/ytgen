import { getStickmanAssets } from '$lib/services/stickmanService.js';

export async function GET() {
	const assets = getStickmanAssets();
	return new Response(JSON.stringify({ success: true, assets }), {
		headers: { 'Content-Type': 'application/json' }
	});
}
