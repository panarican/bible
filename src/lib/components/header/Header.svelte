<header class="header">
	<div class="header__content">
		<form id="form" on:submit={handleSubmit}>
			<input
				tabindex="1"
				autocomplete="off"
				id="search"
				class="search"
				placeholder={placeholder}
				type="search"
				on:keyup={handleSearch}
			/>
		</form>
	</div>
</header>

<script>
	import { _, json } from 'svelte-i18n';
	import { results, count, bible, bookTerms } from '$lib/stores.js';
	import { locale } from 'svelte-i18n';
	import { page } from '$app/stores';
	// Set vars
	let isFavorite = false;
	let isJump = false;
	let isStandard = true;
	let lang = 'en';
	let bibleResponse = [];
	let bookTermsResponse = [];
	let books = [];
	let controller = null;
	let placeholder = $_("header.standard.placeholder");

	page.subscribe(() => init());
	bible.subscribe(value => bibleResponse = value);
	bookTerms.subscribe(value => bookTermsResponse = value)

	/**
	 * Update the placeholder
	 */
	function updatePlaceholder() {
		lang = $page.path.startsWith('/es') ? 'es' : 'en';
		document.documentElement.lang = lang;
		locale.set(lang);
		isFavorite = $page.path === '/favorite' || $page.path === '/es/favorita';
		isJump = $page.path === '/jump' || $page.path === '/es/salto';
		isStandard = $page.path === '/' || $page.path === '/es';
		if (isFavorite) {
			placeholder = $_("header.favorite.placeholder");
		} else if (isJump) {
			placeholder = $_("header.jump.placeholder");
		} else if (isStandard) {
			placeholder = $_("header.standard.placeholder");
		}
		if (isFavorite) {
			placeholder = $_("header.favorite.placeholder");
		} else if (isJump) {
			placeholder = $_("header.jump.placeholder");
		} else if (isStandard) {
			placeholder = $_("header.standard.placeholder");
		}
	}

	/**
	 * Init app
	 * @returns {Promise<void>}
	 */
	async function init() {
		try {

			updatePlaceholder();

			// Kill previous requests
			if (controller) {
				controller.abort();
				controller = null;
			}

			// If controller is not available create new instance
			if (!controller) {
				controller = new AbortController();
			}

			// Fetch
			const jsonPath = `/assets/json/${lang}`;
			const urls = [`${jsonPath}/bible.json`, `${jsonPath}/book-terms.json`];
			const fetchJobs = urls.map(url => fetch(url, {
				signal: controller.signal
			}));

			const responses = await Promise.all(fetchJobs);

			updatePlaceholder();

			books = $json('books');

			const bibleResponse = await responses[0].json();
			const bookTermsResponse = await responses[1].json();

			bible.set(bibleResponse);
			bookTerms.set(bookTermsResponse);

			handleSearch();
		} catch (e) {
			// Do nothing
		}
	}

	/**
	 * Get favorites
	 */
	function getFavorites() {
		const favorites = JSON.parse(localStorage.getItem('favorites'));
		if (Array.isArray(favorites)) {
			return favorites;
		}
		localStorage.setItem('favorites', JSON.stringify([]));

		return [];
	}

	/**
	 * Handle submit
	 * @param {object} evt
	 */
	function handleSubmit(evt) {
		evt.preventDefault();
		setTimeout(() => {
			document.getElementById('search').blur();
		}, 300);
	}

	/**
	 * Handle search
	 * @param {object=} evt
	 */
	function handleSearch(evt) {
		const favorites = getFavorites();
		const searchResults = [];
		let searchCount = 0;
		let items = [];
		let jumpMatch = false;

		results.set(searchResults);
		count.set(searchCount);

		for (let i = 0; i < bibleResponse.length; i++) {
			bibleResponse[i].i = i;
			if (isFavorite && (favorites.find(value => value === i) >= 0)) {
				items.push(bibleResponse[i]);
			} else if (!isFavorite) {
				items.push(bibleResponse[i]);
			}
		}

		for (let i = 0; i < books.length; i++) {
			bookTermsResponse.push({a: books[i], b: (i+1)});
		}

		const searchValue = evt === undefined ? '' : evt.target.value.trim().toLowerCase();
		const term = searchValue ? bookTermsResponse.find(({a}) => {
			const termLength = a.split(' ').length;
			const searchParts = searchValue.toLowerCase().split(' ');
			if (termLength === 1) {
				return a.toLowerCase() === searchParts[0];
			} else if (termLength === 2) {
				const chapterVerseParts = Array.isArray(searchValue) && searchValue > 0 ? searchParts[1].split(':') : null;
				const chapterSearch = Array.isArray(chapterVerseParts) ? isNaN(parseInt(chapterVerseParts[0], 10)) ? null : parseInt(chapterVerseParts[0], 10) : null;
				return chapterSearch ? a.toLowerCase() === searchParts[0] : a.toLowerCase() === `${searchParts[0]} ${searchParts[1]}`;
			}
			return false;
		}) : null;
		const chapterVerse = term && searchValue ? searchValue.split(' ')[searchValue.split(' ').length-1] || null : null;
		const chapterVerseParts = chapterVerse ? chapterVerse.split(':') : null;
		const chapterSearch = Array.isArray(chapterVerseParts) ? isNaN(parseInt(chapterVerseParts[0], 10)) ? null : parseInt(chapterVerseParts[0], 10) : null;
		const verseParts = Array.isArray(chapterVerseParts) && chapterVerseParts.length > 1 ? chapterVerseParts[1].split('-').map(item => parseInt(item, 10)).filter(item => !isNaN(item)) : null;
		const verseLastSearch = Array.isArray(verseParts) && verseParts.length > 1 && verseParts[1] > verseParts[0] ? verseParts[1] : null;
		const verseRangeSearch = verseLastSearch ? Array((verseParts[1]-1) - (verseParts[0]-2)).fill().map((element, index) => index + verseParts[0]) : (verseParts === null ? null : verseParts);
		const hasVerseRangeSearch = Array.isArray(verseRangeSearch) && verseRangeSearch.length;

		for (let i = 0; i < items.length; i++) {
			const text = `${items[i].t}`;
			const verseMatch = Array.isArray(verseRangeSearch) ? verseRangeSearch.find(verseItem => verseItem === items[i].v) : null;
			const bookMatch = (term && (term.b === items[i].b));
			const chapterMatch = chapterSearch === items[i].c;
			const textMatch = term ? false : text.toLowerCase().indexOf(searchValue) !== -1;

			if (
				evt === undefined ||
				searchValue === '' ||
				bookMatch && !chapterSearch && !chapterMatch && !hasVerseRangeSearch ||
				bookMatch && chapterSearch && chapterMatch && !hasVerseRangeSearch ||
				bookMatch && chapterMatch && verseMatch ||
				textMatch ||
				jumpMatch
			) {
				++searchCount;
				// To help with performance for now let's limit to 500 found results (will do pagination later)
				if (searchCount < 500) {
					jumpMatch = isJump;
					searchResults.push({
						title: `${books[(items[i].b-1)]} ${items[i].c}:${items[i].v}`,
						content: `${text} (${books[(items[i].b - 1)]} ${items[i].c}:${items[i].v})`,
						index: items[i].i,
						heart: isFavorite || (favorites.find(value => value === items[i].i) >= 0),
						flip: false
					})
				}
			}
		}

		results.set(searchResults);
		count.set(searchCount);
	}
</script>
