// Polite announcements through a single live region (copy feedback, draw results)
const CLEAR_AFTER_MS = 2400;
let timer;

export function announce(message) {
  const region = document.getElementById('toast');
  if (!region) return;
  window.clearTimeout(timer);
  // Clear first so the same message is announced twice in a row
  region.textContent = '';
  window.requestAnimationFrame(() => {
    region.textContent = message;
  });
  timer = window.setTimeout(() => {
    region.textContent = '';
  }, CLEAR_AFTER_MS);
}
