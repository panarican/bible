import { results, count, bible, bookTerms, language } from '$lib/stores.js';
import { page } from '$app/stores';
export const isFavorite = true;
export const isJump =  page.path === 'jump';
export const books = [
    'Genesis',         'Exodus',          'Leviticus',     'Numbers',
    'Deuteronomy',     'Joshua',          'Judges',        'Ruth',
    '1 Samuel',        '2 Samuel',        '1 Kings',       '2 Kings',
    '1 Chronicles',    '2 Chronicles',    'Ezra',          'Nehemiah',
    'Esther',          'Job',             'Psalm',         'Proverbs',
    'Ecclesiastes',    'Song of Solomon', 'Isaiah',        'Jeremiah',
    'Lamentations',    'Ezekiel',         'Daniel',        'Hosea',
    'Joel',            'Amos',            'Obadiah',       'Jonah',
    'Micah',           'Nahum',           'Habakkuk',      'Zephaniah',
    'Haggai',          'Zechariah',       'Malachi',       'Matthew',
    'Mark',            'Luke',            'John',          'Acts',
    'Romans',          '1 Corinthians',   '2 Corinthians', 'Galatians',
    'Ephesians',       'Philippians',     'Colossians',    '1 Thessalonians',
    '2 Thessalonians', '1 Timothy',       '2 Timothy',     'Titus',
    'Philemon',        'Hebrews',         'James',         '1 Peter',
    '2 Peter',         '1 John',          '2 John',        '3 John',
    'Jude',            'Revelation'
];

let currentLang = 'en';
let bibleResponse = [];
let bookTermsResponse = [];

language.subscribe(value => currentLang = value);
bible.subscribe(value => bibleResponse = value);
bookTerms.subscribe(value => bookTermsResponse = value)

/**
 * Init app
 * @returns {Promise<void>}
 */
export async function init() {
    const bibleFetch = await fetch(`/assets/json/${currentLang}/bible.json`);
    const bookTermsFetch = await fetch(`/assets/json/${currentLang}/book-terms.json`);
    const bibleResponse = await bibleFetch.json();
    const bookTermsResponse = await bookTermsFetch.json();
    bible.set(bibleResponse);
    bookTerms.set(bookTermsResponse);
    handleSearch();
}

/**
 * Get favorites
 */
export function getFavorites() {
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
export function handleSubmit(evt) {
    evt.preventDefault();
    setTimeout(() => {
        document.getElementById('search').blur();
    }, 300);
}

/**
 * Handle search
 * @param {object=} evt
 */
export function handleSearch(evt) {
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
