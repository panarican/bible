<button tabindex="5" id="top" class="top">Back to top</button>
<style lang="scss">
    .top {
        outline: none;
        cursor: pointer;
        position: fixed;
        bottom: calc(var(--spacing) / 1.5);
        right: calc(var(--spacing) / 1.5);
        width: 50px;
        height: 50px;
        border: none;
        text-indent: -99999px;
        white-space: nowrap;
        overflow: hidden;
        border-radius: 50%;
        -webkit-appearance: none;
        appearance: none;
        transition: all 0.25s ease-in-out;
        background-size: 50% auto;
        transform: translateY(70px) scale(1);
        opacity: 0;
        z-index: 9999;
        user-select: none;
			background: #333 url('/assets/images/chevron-up.svg') center center no-repeat;
    }
    .top--active {
        transform: translateY(0) scale(1);
        opacity: 1;
    }
    .top--active:hover {
        transform: translateY(0) scale(1.1);
    }
</style>
