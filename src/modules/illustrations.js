// Injects the own SVG illustrations into [data-illustration] placeholders
// and marks sections as in view so their (finite) animations can run.
// Illustrations are decorative: hidden from assistive technology.

const sources = import.meta.glob('../illustrations/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const svgByName = Object.fromEntries(
  Object.entries(sources).map(([path, svg]) => [path.split('/').pop().replace('.svg', ''), svg]),
);

function inject() {
  document.querySelectorAll('[data-illustration]').forEach((holder) => {
    const svg = svgByName[holder.dataset.illustration];
    if (!svg) return;
    holder.innerHTML = svg;
    const node = holder.querySelector('svg');
    node.setAttribute('aria-hidden', 'true');
    node.setAttribute('focusable', 'false');
  });
}

function observe() {
  const targets = document.querySelectorAll('.slide, .reveal');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in-view'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in-view');
        observer.unobserve(entry.target); // Animate once
      });
    },
    { threshold: 0.25 },
  );
  targets.forEach((el) => observer.observe(el));
}

export function initIllustrations() {
  inject();
  observe();
}
