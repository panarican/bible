<script>
	import { _ } from 'svelte-i18n';
	export let count = 0;
</script>

<footer class="footer">
	{#if count}
		<div class="count">{$_('footer.count', { values: { count } })}</div>
	{/if}
</footer>
