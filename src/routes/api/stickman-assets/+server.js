import { getStickmanAssets, getStickmanCategories } from '$lib/services/stickmanService.js';

export async function GET() {
	const assets = getStickmanAssets();
	const categories = getStickmanCategories();
	return new Response(JSON.stringify({ success: true, assets, categories }), {
		headers: { 'Content-Type': 'application/json' }
	});
}
