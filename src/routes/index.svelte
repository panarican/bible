<script context="module" lang="ts">
	export const prerender = true;
	import Verse from '$lib/verse/Verse.svelte';
</script>

<script>
	import { results } from '$lib/stores.js';

	let searchResults = [];

	results.subscribe(value => {
		searchResults = value;
	});
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

{#each searchResults as result, i}
	<Verse {...result} />
{/each}
