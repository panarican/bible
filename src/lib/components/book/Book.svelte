<div class="book">
	{name}
</div>

<script>
	export let name = '';
</script>

<style lang="scss">
	.book {
    display: flex;
    align-items: center;
    justify-content: center;
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
		font-size: 30px;
	}
</style>
