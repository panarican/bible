<script>
	import { locale, json } from 'svelte-i18n';
	import { page } from '$app/stores';

	// Weird hack to get nav to not go MIA
	let nav = $json('nav').length === 8 ? $json('nav').splice(4, 8) : $json('nav');
	locale.subscribe(
		() => (nav = $json('nav').length === 8 ? $json('nav').splice(4, 8) : $json('nav'))
	);
</script>

<nav class="nav">
	{#each nav as item, i}
		<a class="nav__item {$page.path === item.path ? 'nav__item--active' : ''}" href={item.path}
			>{item.label}</a
		>
	{/each}
</nav>

<style lang="scss">
	.nav {
		background-color: #bbb;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 8px;
		user-select: none;
		&__item:active,
		&__item {
			outline: none;
			font-size: 14px;
			color: #fff;
			text-decoration: none;
			padding: 6px 8px;
			border: 1px solid #fff;
			border-radius: 10px;
			margin: 0 4px;
			transition: background-color 0.25s ease-in-out, opacity 0.25s ease-in-out,
				border 0.25s ease-in-out, color 0.25s ease-in-out;
		}
		&__item--active,
		&__item:hover {
			background-color: #fff;
			color: #333;
		}
		&__item:hover:not(.nav__item--active) {
			opacity: 0.5;
		}
	}
</style>
