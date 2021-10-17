<div class="book">
		<h3 class='book__name'>{name}</h3>
		<div class='book__chapters'>
			{#each chapters as chapter, i}
				<div class='book__chapter' on:click={updateSearch({name, chapter})}>{chapter}</div>
			{/each}
		</div>
</div>

<script>
	import { search } from '$lib/stores.js';
	export let name = '';
	export let chapters = [];

	/**
	 * Handle Search
	 * @param {String} name
	 * @param {String} chapter
	 * return {Boolean}
	 */
	function updateSearch({ name, chapter }) {
		search.set(`${name} ${chapter}`);
		return false;
	}
</script>

<style lang="scss">
	.book {
    border-radius: calc(var(--spacing) / 3);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
    width: 100%;
    height: 100%;
    min-height: 110px;
    text-align: center;
    -webkit-backface-visibility: hidden;
    transform-style: preserve-3d;
    backface-visibility: hidden;
    transition: all 0.4s ease-in-out;
    padding: calc(var(--spacing) / 1.5);
    background-color: #fff;
    position: relative;
    top: 0;
    z-index: 900;
    transform: rotateX(0deg) rotateY(0deg);
		&__name {
      font-size: 24px;
			display: block;
      margin: 0 0 10px;
    }
		&__chapters {
			display: flex;
      flex-wrap: wrap;
      justify-content: center;
			margin-left: -10px;
			margin-right: -10px;
		}
		&__chapter {
			display: flex;
			justify-content: center;
			align-items: center;
			transition: all .25s ease-in-out;
			text-align: center;
			width: 40px;
			height: 40px;
			line-height: 1;
			padding: 0;
			margin: 4px;
			cursor: pointer;
			color: #333;
			border: 1px solid #333;
      border-radius: 5px;
			background-color: #eee;
			&:hover {
				background-color: darkred;
				border-color: darkred;
				color: #fff;
			}
		}
	}
</style>
