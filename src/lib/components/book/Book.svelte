<div class="book">
	<h3 class='book__name'>{name}</h3>
	<div class='book__chapters'>
		{#each chapters as chapter, i}
			<button class='book__chapter'>{chapter}</button>
		{/each}
	</div>
</div>

<script>
	export let name = '';
	export let chapters = [];
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
      font-size: 20px;
			display: block;
      margin: 0 0 10px;
    }
		&__chapters {
			display: block;
			margin-left: -10px;
			margin-right: -10px;
		}
		&__chapter {
			width: 40px;
			height: 40px;
			margin: 4px;
			display: inline-block;
			text-align: center;
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
