// Copy buttons for prompts. The copied text includes the current slot values.
// After a successful copy, «prompt:copied» tells the service rail which prompt was fired.
import { announce } from './announce.js';

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback for browsers without the async clipboard API
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.append(area);
  area.select();
  document.execCommand('copy');
  area.remove();
}

// Messages live on the live region as translatable attributes; Spanish is the fallback
function message(name, fallback) {
  return document.getElementById('toast')?.dataset[name] || fallback;
}

export function initCopy() {
  document.querySelectorAll('[data-copy-target]').forEach((button) => {
    button.hidden = false;
    button.addEventListener('click', async () => {
      const source = document.getElementById(button.dataset.copyTarget);
      if (!source) return;
      try {
        await copyText(source.innerText.trim());
        announce(message('msgCopied', '¡Marchando! Comanda copiada'));
        document.dispatchEvent(new CustomEvent('prompt:copied', { detail: { id: source.id } }));
      } catch {
        announce(message('msgCopyFailed', 'No se ha podido copiar. Selecciona el texto y cópialo a mano.'));
      }
    });
  });
}
