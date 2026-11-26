// Translation-ready layer.
// The HTML is the source of truth in Spanish. Other languages live in
// public/i18n/<lang>.json with the same keys as public/i18n/es.json.
// Elements: data-i18n="key" (innerHTML) · data-i18n-attr="aria-label:key;alt:key2"
// The language switcher only appears when more than one language is available.
import { readValue, writeValue } from './storage.js';

const DEFAULT_LANG = 'es';
const LANGUAGES = ['es', 'en'];

const original = new Map();
// Original (Spanish) attribute values, per element and attribute name.
// Kept here and not in dataset: names such as data-qr-title are not valid dataset keys.
const originalAttrs = new Map();

function snapshot() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    original.set(el, { html: el.innerHTML });
  });
}

function apply(dict) {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const value = dict ? dict[el.dataset.i18n] : original.get(el)?.html;
    if (typeof value === 'string') el.innerHTML = value;
  });
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':').map((part) => part.trim());
      if (!originalAttrs.has(el)) originalAttrs.set(el, {});
      const saved = originalAttrs.get(el);
      if (!(attr in saved)) saved[attr] = el.getAttribute(attr) || '';
      const value = dict ? dict[key] : saved[attr];
      if (typeof value === 'string') el.setAttribute(attr, value);
    });
  });
}

async function setLanguage(lang) {
  if (!LANGUAGES.includes(lang)) return;
  if (lang === DEFAULT_LANG) {
    apply(null);
  } else {
    const response = await fetch(`./i18n/${lang}.json`);
    if (!response.ok) return;
    apply(await response.json());
  }
  document.documentElement.lang = lang;
  writeValue('lang', lang);
  // Let other modules (slots) refresh content that was just replaced
  document.dispatchEvent(new CustomEvent('i18n:applied', { detail: { lang } }));
}

// The switch shows every language and underlines the current one
function markActive(switcher, lang) {
  switcher.querySelectorAll('[data-lang-label]').forEach((label) => {
    label.dataset.active = String(label.dataset.langLabel === lang);
  });
}

export function initI18n() {
  snapshot();
  const switcher = document.querySelector('[data-lang-switcher]');
  if (LANGUAGES.length < 2 || !switcher) return;
  switcher.hidden = false;
  // One control: each click moves to the next language
  switcher.addEventListener('click', () => {
    const current = document.documentElement.lang || DEFAULT_LANG;
    const next = LANGUAGES[(LANGUAGES.indexOf(current) + 1) % LANGUAGES.length];
    setLanguage(next);
  });
  document.addEventListener('i18n:applied', (event) => markActive(switcher, event.detail.lang));
  const saved = readValue('lang');
  if (saved && saved !== DEFAULT_LANG) setLanguage(saved);
  else markActive(switcher, DEFAULT_LANG);
}
