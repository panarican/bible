<!-- src/_layout.svelte -->
<script>
	import Footer from '$lib/components/footer/Footer.svelte';
	import Top from '$lib/components/top/Top.svelte';
	import Verse from '$lib/components/verse/Verse.svelte';
	import Header from '$lib/components/header/Header.svelte';
	import Nav from '$lib/components/nav/Nav.svelte';
	import Book from '$lib/components/book/Book.svelte';
	import { count, results } from '$lib/stores.js';
	import { _, locale } from 'svelte-i18n';
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
	results.subscribe((value) => (searchResults = value));
</script>

<svelte:window bind:scrollY={y} />

<Header />
<Nav />

{#if $count}
	<div class="count">{$_('footer.count', { values: { count: $count } })}</div>
{/if}

<slot />

<main class="main">
	{#each searchResults as result, i}
		{#if Array.isArray(result.chapters)}
			<Book {...result} />
		{:else if result.content}
			<Verse {...result} />
		{/if}
	{/each}
</main>

<Footer />
<Top {y} />

<style lang="scss">
	.main {
		justify-items: center;
		display: grid;
		gap: calc(var(--spacing) / 1.5);
		padding-bottom: 0;
    grid-template-rows: masonry;
    grid-template-columns: repeat(auto-fill, minmax(293px, 1fr));
	}
</style>
