import { derived, writable } from 'svelte/store';
import de from './de.json';
import en from './en.json';

const messages = { de, en };

/** @type {import('svelte/store').Writable<'de'|'en'>} */
export const locale = writable('de');

/**
 * Translation function store.
 * Usage: $t('home.title') or $t('quiz.question')
 */
export const t = derived(locale, ($locale) => {
  /**
   * @param {string} key  Dot-separated key, e.g. 'home.title'
   * @param {Record<string,string>} [vars]  Optional placeholder substitutions
   * @returns {string}
   */
  return (key, vars) => {
    const keys = key.split('.');
    let value = messages[$locale];
    for (const k of keys) {
      value = value?.[k];
    }
    let str = (typeof value === 'string' ? value : key);
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replaceAll(`{${k}}`, v);
      }
    }
    return str;
  };
});

/**
 * Helper to get a localised string from a bilingual object like { de: '...', en: '...' }
 * @param {{ de: string, en: string } | string | undefined} obj
 * @param {'de'|'en'} lang
 */
export function loc(obj, lang) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj[lang] ?? obj['de'] ?? '';
}
