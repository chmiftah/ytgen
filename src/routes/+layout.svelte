<script>
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>YouTube Long Generator - AI Studio</title>
</svelte:head>

{@render children()}
