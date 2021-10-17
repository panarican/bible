import { writable } from 'svelte/store';

export const count = writable(0);
export const search = writable('');
export const language = writable('en');
export const results = writable([]);
export const favorites = writable([]);
export const bible = writable([]);
export const bookTerms = writable([]);
