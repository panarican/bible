<header class="header">
	<div class="header__content">
		<form id="form" on:submit={handleSubmit}>
			<input
				tabindex="1"
				autocomplete="off"
				id="search"
				class="search"
				placeholder="Search a passage or bible verse"
				type="search"
				on:keyup={handleSearch}
			/>
		</form>
	</div>
</header>

<script>
	import { handleSearch, handleSubmit, init } from '$lib/service.js';
	init();
</script>
