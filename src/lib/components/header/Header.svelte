<header class="header">
	<div class="header__content">
		<form id="form" on:submit={handleSubmit}>
			<input
				tabindex="1"
				autocomplete="off"
				id="search"
				class="search"
				placeholder={$_("header.standard.placeholder")}
				type="search"
				on:keyup={handleSearch}
			/>
		</form>
	</div>
</header>

<script>
	import { _ } from 'svelte-i18n';
	import { handleSearch, handleSubmit, init } from '$lib/service.js';
	init();
</script>
