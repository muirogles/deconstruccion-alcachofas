// Fills [web] and [sistema] slots inside every prompt from two inputs.
// Presets (e.g. Arcasiles) set both values at once. Values persist per viewer.
// Every change is broadcast as a «slots:change» event (used by the service rail).
import { readValue, writeValue } from './storage.js';
import { announce } from './announce.js';

const SLOT_NAMES = ['web', 'system'];
const SCOPE_KEY = 'scope-demo';

function render(name, value) {
  document.querySelectorAll(`[data-slot="${name}"]`).forEach((slot) => {
    slot.textContent = value || slot.dataset.placeholder;
  });
  document.querySelectorAll(`[data-slot-input="${name}"]`).forEach((input) => {
    if (input.value !== value) input.value = value;
  });
  document.dispatchEvent(new CustomEvent('slots:change', { detail: { name, value } }));
}

function setValue(name, value) {
  const clean = value.trim();
  writeValue(`slot-${name}`, clean);
  render(name, clean);
}

// Empties both values (used by «Nueva mesa» in the service)
export function resetSlots() {
  SLOT_NAMES.forEach((name) => setValue(name, ''));
}

export function readSlot(name) {
  return readValue(`slot-${name}`) || '';
}

function captureAndRender() {
  SLOT_NAMES.forEach((name) => {
    // Remember the placeholder text written in the HTML (or in the translation)
    document.querySelectorAll(`[data-slot="${name}"]`).forEach((slot) => {
      if (!slot.dataset.placeholder) slot.dataset.placeholder = slot.textContent;
    });
    render(name, readValue(`slot-${name}`) || '');
  });
}

export function initSlots() {
  captureAndRender();
  // Values update live; pressing Enter must not reload the page
  document.querySelectorAll('[data-slot-form]').forEach((form) => {
    form.addEventListener('submit', (event) => event.preventDefault());
  });
  document.addEventListener('i18n:applied', captureAndRender);

  SLOT_NAMES.forEach((name) => {
    document.querySelectorAll(`[data-slot-input="${name}"]`).forEach((input) => {
      input.addEventListener('input', () => setValue(name, input.value));
    });
  });

  document.querySelectorAll('[data-slot-preset]').forEach((button) => {
    button.hidden = false;
    button.addEventListener('click', () => {
      setValue('web', button.dataset.presetWeb || '');
      setValue('system', button.dataset.presetSystem || '');
      announce(button.dataset.presetMessage || 'Comandas actualizadas');
    });
  });

  // Demo scope: optional sentence that limits the sample (demo timing only)
  const renderScope = (enabled) => {
    document.querySelectorAll('[data-slot="scope"]').forEach((slot) => {
      slot.textContent = enabled ? slot.dataset.scopeText || '' : '';
      slot.hidden = !enabled;
    });
  };
  document.querySelectorAll('[data-scope-toggle]').forEach((toggle) => {
    // The sentence lives on the toggle (translatable); the prompts' slots get a copy
    const syncScope = () => {
      const text = toggle.dataset.scopeText || '';
      document.querySelectorAll('[data-slot="scope"]').forEach((slot) => {
        slot.dataset.scopeText = text;
      });
      renderScope(toggle.checked);
    };
    toggle.checked = readValue(SCOPE_KEY) === 'true';
    syncScope();
    // A language change rewrites the prompts: give their new slots the sentence again
    document.addEventListener('i18n:applied', syncScope);
    toggle.closest('[hidden]')?.removeAttribute('hidden');
    toggle.addEventListener('change', () => {
      writeValue(SCOPE_KEY, String(toggle.checked));
      renderScope(toggle.checked);
      announce(toggle.checked
        ? toggle.dataset.scopeOn || 'Modo demo activado: solo la home, en escritorio y móvil'
        : toggle.dataset.scopeOff || 'Modo demo desactivado');
    });
  });
}
