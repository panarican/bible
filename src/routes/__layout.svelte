<!-- src/_layout.svelte -->
<script context="module">
	import { waitLocale } from 'svelte-i18n';

	export async function preload() {
		// awaits for the loading of the 'en-US' and 'en' dictionaries
		return waitLocale()
	}
</script>
<script>
	import Footer from '$lib/components/footer/Footer.svelte';
	import Top from '$lib/components/top/Top.svelte';
	import Verse from '$lib/components/verse/Verse.svelte';
	import Header from '$lib/components/header/Header.svelte';
	import Nav from '$lib/components/nav/Nav.svelte';
	import { count, results } from '$lib/stores.js';
	import '../app.scss';
	import { addMessages, init } from 'svelte-i18n';
	import en from '$lib/locales/en.json';
	import es from '$lib/locales/es.json';

	let resultsCount = 0;
	let searchResults = [];

	count.subscribe(value => resultsCount = value);
	results.subscribe(value => searchResults = value);

	addMessages('en', en);
	addMessages('es', es);

	init({
		initialLocale: 'en'
	});
</script>

<Header />
<Nav />

<slot />

<main class="{resultsCount === 0 ? 'main main--no-results' : 'main'}">
	{#each searchResults as result, i}
		<Verse {...result} />
	{/each}
</main>

<Footer count="{resultsCount}" />
<Top />

<style lang="scss">
	.main {
		justify-items: center;
		display: grid;
		gap: calc(var(--spacing) / 1.5);
		grid-template-rows: masonry;
		grid-template-columns: repeat(auto-fill, minmax(293px, 1fr));
		padding-bottom: 0;

		&--no-results {
			display: none;
		}
	}
</style>
