<script>
	import { _, json } from 'svelte-i18n';
	import en from '$lib/locales/en.json';
	import es from '$lib/locales/es.json';
	import { results, count, bible, bookTerms } from '$lib/stores.js';
	import { locale } from 'svelte-i18n';
	import { page } from '$app/stores';
	// Set vars
	const localeJson = { en, es };
	let isFavorite = false;
	let isJump = false;
	let isStandard = true;
	let lang = 'en';
	let bibleResponse = [];
	let bookTermsResponse = [];
	let books = [];
	let controller = null;
	let placeholder = $_('header.standard.placeholder');
	let normalizeRegEx = /[\u0300-\u036f]/g;
	let punctuationRegEx = /[;|,|!|?|¿|¡|.]/g;
	let logoPath = '';
	let bookChapters = localeJson.en.books.map(({chapters}) => [...Array(chapters).keys()].map(i => i + 1));

	updatePlaceholder();

	locale.subscribe((value) => {
		books = localeJson[value].books.map(({name}) => name);
		logoPath = localeJson[value].nav[0].path;
	});
	page.subscribe(() => init());
	bible.subscribe((value) => (bibleResponse = value));
	bookTerms.subscribe((value) => (bookTermsResponse = value));

	/**
	 * Update the placeholder
	 */
	function updatePlaceholder() {
		lang = $page.path.startsWith('/es') ? 'es' : 'en';
		try {
			document.documentElement.lang = lang;
		} catch (e) {
			// Do nothing
		}
		locale.set(lang);
		isFavorite = $page.path.includes('favorite') || $page.path.includes('favorita');
		isJump = $page.path.includes('jump') || $page.path.includes('salto');
		isStandard = $page.path === '/' || $page.path === '/es' || $page.path === '/es/';

		if (isFavorite) {
			placeholder = $_('header.favorite.placeholder');
		} else if (isJump) {
			placeholder = $_('header.jump.placeholder');
		} else if (isStandard) {
			placeholder = $_('header.standard.placeholder');
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
			const fetchJobs = urls.map((url) =>
				fetch(url, {
					signal: controller.signal
				})
			);

			const responses = await Promise.all(fetchJobs);

			updatePlaceholder();

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
	 * Normalize Text
	 * @param text
	 * @returns {*}
	 */
	function normalizeText(text) {
		return typeof text === 'string'
			? text.replace(punctuationRegEx, '').normalize('NFD').replace(normalizeRegEx, '')
			: '';
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
			if (isFavorite && favorites.find((value) => value === i) >= 0) {
				items.push(bibleResponse[i]);
			} else if (!isFavorite) {
				items.push(bibleResponse[i]);
			}
		}

		for (let i = 0; i < books.length; i++) {
			bookTermsResponse.push({ a: books[i], b: i + 1 });
		}

		const searchValue =
			evt === undefined ? '' : normalizeText(evt.target.value.trim().toLowerCase());
		const term = searchValue
			? bookTermsResponse.find(({ a }) => {
					a = a;
					const termLength = a.split(' ').length;
					const searchParts = searchValue.toLowerCase().split(' ');
					if (termLength === 1) {
						return normalizeText(a.toLowerCase()) === searchParts[0];
					} else if (termLength === 2) {
						const chapterVerseParts =
							Array.isArray(searchValue) && searchValue > 0 ? searchParts[1].split(':') : null;
						const chapterSearch = Array.isArray(chapterVerseParts)
							? isNaN(parseInt(chapterVerseParts[0], 10))
								? null
								: parseInt(chapterVerseParts[0], 10)
							: null;
						return chapterSearch
							? a.toLowerCase() === searchParts[0]
							: a.toLowerCase() === `${searchParts[0]} ${searchParts[1]}`;
					}
					return false;
			  })
			: null;
		const chapterVerse =
			term && searchValue
				? searchValue.split(' ')[searchValue.split(' ').length - 1] || null
				: null;
		const chapterVerseParts = chapterVerse ? chapterVerse.split(':') : null;
		const chapterSearch = Array.isArray(chapterVerseParts)
			? isNaN(parseInt(chapterVerseParts[0], 10))
				? null
				: parseInt(chapterVerseParts[0], 10)
			: null;
		const verseParts =
			Array.isArray(chapterVerseParts) && chapterVerseParts.length > 1
				? chapterVerseParts[1]
						.split('-')
						.map((item) => parseInt(item, 10))
						.filter((item) => !isNaN(item))
				: null;
		const verseLastSearch =
			Array.isArray(verseParts) && verseParts.length > 1 && verseParts[1] > verseParts[0]
				? verseParts[1]
				: null;
		const verseRangeSearch = verseLastSearch
			? Array(verseParts[1] - 1 - (verseParts[0] - 2))
					.fill()
					.map((element, index) => index + verseParts[0])
			: verseParts === null
			? null
			: verseParts;
		const hasVerseRangeSearch = Array.isArray(verseRangeSearch) && verseRangeSearch.length;
		const noValue = evt === undefined || searchValue === '';

		if (!noValue) {
			for (let i = 0; i < items.length; i++) {
				const text = items[i].t;
				const verseMatch = Array.isArray(verseRangeSearch)
					? verseRangeSearch.find((verseItem) => verseItem === items[i].v)
					: null;
				const bookMatch = term && term.b === items[i].b;
				const chapterMatch = chapterSearch === items[i].c;
				const textMatch = term
					? false
					: normalizeText(text.toLowerCase()).indexOf(searchValue) !== -1;

				if (
					(bookMatch && !chapterSearch && !chapterMatch && !hasVerseRangeSearch)
				) {
					searchResults.push({name: books[items[i].b - 1], chapters: bookChapters[items[i].b - 1]});
					break;
				} else if (
					(bookMatch && chapterSearch && chapterMatch && !hasVerseRangeSearch) ||
					(bookMatch && chapterMatch && verseMatch) ||
					textMatch ||
					jumpMatch
				) {
						++searchCount;
						// To help with performance for now let's limit to 500 found results (will do pagination later)
						if (searchCount < 500) {
							jumpMatch = isJump;
							searchResults.push({
								title: `${books[items[i].b - 1]} ${items[i].c}:${items[i].v}`,
								content: text,
								index: items[i].i,
								heart: isFavorite || favorites.find((value) => value === items[i].i) >= 0,
								flip: false
							});
						}
				}
			}
		} else {
			for (let i = 0; i < books.length; i++) {
				searchResults.push({name: books[i], chapters: bookChapters[i]});
			}
		}

		results.set(searchResults);
		count.set(searchCount);
	}
</script>

<header class="header">
	<div class="header__content">
		<a href={logoPath} class='header__logo'>MyBible</a>
		<form class="header__form" id="form" on:submit={handleSubmit}>
			<input
				tabindex="1"
				autocomplete="off"
				autocorrect="off"
				autocapitalize="off"
				spellcheck="false"
				id="search"
				class="search"
				{placeholder}
				type="search"
				on:keyup={handleSearch}
			/>
		</form>
	</div>
</header>

<style lang='scss'>
    .header {
				background-image: url(/assets/images/leather.png);
        background-color: #000;
        position: sticky;
        top: 0;
        z-index: 9999;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
        user-select: none;
			&__logo {
        display: block;
        background: url(/assets/images/logo.svg) left top no-repeat;
        background-size: 145px 45px;
        overflow: hidden;
        text-indent: -9999px;
        width: 53px;
        height: 45px;
        @media (min-width: 550px) {
          width: 145px;
        }
      }
			&__content {
        margin: 0 auto;
        max-width: 530px;
        display: grid;
        column-gap: 15px;
        grid-template-columns: 53px 1fr;
        @media (min-width: 550px) {
          column-gap: 20px;
          grid-template-columns: 145px 1fr;
        }
      }
    }
    .search {
        -webkit-appearance: none;
        appearance: none;
        box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.25);
        font-size: var(--font-size);
        width: 100%;
        color: var(--primary);
        padding: calc(var(--spacing) / 1.5);
        display: block;
        border-radius: calc(var(--spacing) / 3);
        outline: none;
        background-color: var(--secondary);
        border: none;
        text-overflow: ellipsis;
			&:focus {
        outline: none;
      }
    }
</style>
