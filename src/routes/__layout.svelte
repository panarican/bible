<!-- src/_layout.svelte -->
<script>
	import Footer from '$lib/components/footer/Footer.svelte';
	import Top from '$lib/components/top/Top.svelte';
	import Verse from '$lib/components/verse/Verse.svelte';
	import Header from '$lib/components/header/Header.svelte';
	import Nav from '$lib/components/nav/Nav.svelte';
	import Book from '$lib/components/book/Book.svelte';
	import { count, results } from '$lib/stores.js';
	import { locale } from 'svelte-i18n';
	import '../app.scss';
	import { addMessages, init } from 'svelte-i18n';
	import en from '$lib/locales/en.json';
	import es from '$lib/locales/es.json';
	const localeJson = { en, es };
	let resultsCount = 0;
	let searchResults = [];
	let y;
	let books = localeJson['en'].books

	addMessages('en', en);
	addMessages('es', es);

	init({
		initialLocale: 'en'
	});

	locale.subscribe((value) => books = localeJson[value].books);
	count.subscribe((value) => (resultsCount = value));
	results.subscribe((value) => (searchResults = value));
</script>

<svelte:window bind:scrollY={y} />

<Header />
<Nav />

<slot />

<main class="main{searchResults.length === 0 ? ' main--books' : ' main--verses'}">
	{#if searchResults.length === 0}
		{#each books as { name, chapters }}
			<Book name={name} chapters={[...Array(chapters).keys()].map(i => i + 1)} />
		{/each}
	{:else}
	{#each searchResults as result, i}
		<Verse {...result} />
	{/each}
		{/if}
</main>

<Footer count={resultsCount} />
<Top {y} />

<style lang="scss">
	.main {
		justify-items: center;
		display: grid;
		gap: calc(var(--spacing) / 1.5);
		padding-bottom: 0;
    grid-template-rows: masonry;
    grid-template-columns: repeat(auto-fill, minmax(293px, 1fr));

		&--no-results {
			display: none;
		}

		//&--books {
    //  grid-template-columns: 1fr;
		//}
		//
		//&--verses {
    //  grid-template-rows: masonry;
    //  grid-template-columns: repeat(auto-fill, minmax(293px, 1fr));
		//}
	}
</style>
