<script>
	import Header from '$lib/header/Header.svelte';
	import Nav from '$lib/nav/Nav.svelte';
	import Footer from '$lib/footer/Footer.svelte';
	import Top from '$lib/top/Top.svelte';
	import { count } from '$lib/stores.js';
	import '../app.scss';

	let resultsCount = 0;

	count.subscribe(value => {
		resultsCount = value;
	});
</script>

<Header />
<Nav />

<main class="{resultsCount === 0 ? 'main main--no-results' : 'main'}">
	<slot />
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
