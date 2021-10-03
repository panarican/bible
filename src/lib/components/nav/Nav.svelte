<nav class="nav">
	<a tabindex="2" class="nav__item nav__item--active" href="/">Standard</a>
	<a tabindex="3" class="nav__item" href="/favorite/">Favorite</a>
	<a tabindex="4" class="nav__item" href="/jump/">Jump</a>
	<a tabindex="5" class="nav__item" href="/es/">Spanish</a>
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

<script>
	import { page } from '$app/stores';
	let links = [];
</script>
