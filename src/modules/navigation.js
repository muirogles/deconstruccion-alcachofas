// Dot navigation and grouped index, both generated from the sections in the DOM
// so there is a single source of truth: <section data-nav-label data-part>.

const ACTIVE_ATTR = 'aria-current';

function getSections() {
  return [...document.querySelectorAll('.slide[data-nav-label]')];
}

function buildDots(sections) {
  const list = document.querySelector('[data-dot-nav-list]');
  if (!list) return [];
  const links = sections.map((section) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.className = 'dot-nav__link';
    link.href = `#${section.id}`;
    const label = document.createElement('span');
    label.className = 'dot-nav__label';
    label.textContent = section.dataset.navLabel;
    link.append(label);
    item.append(link);
    list.append(item);
    return link;
  });
  list.closest('.dot-nav')?.removeAttribute('hidden');
  return links;
}

function buildIndex(sections) {
  const container = document.querySelector('[data-index-nav]');
  if (!container) return [];
  const groups = new Map();
  sections.forEach((section) => {
    const part = section.dataset.part || '';
    if (!groups.has(part)) groups.set(part, []);
    groups.get(part).push(section);
  });

  const links = [];
  let counter = 0;
  groups.forEach((items, part) => {
    const group = document.createElement('div');
    group.className = 'index-nav__group';
    const title = document.createElement('h3');
    title.className = 'index-nav__group-title';
    title.textContent = part;
    const list = document.createElement('ol');
    list.className = 'index-nav__list';
    list.setAttribute('role', 'list');
    items.forEach((section) => {
      counter += 1;
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'index-nav__link';
      link.href = `#${section.id}`;
      const number = document.createElement('span');
      number.className = 'index-nav__number';
      number.setAttribute('aria-hidden', 'true');
      number.textContent = String(counter).padStart(2, '0');
      const text = document.createElement('span');
      text.textContent = section.dataset.navLabel;
      link.append(number, text);
      item.append(link);
      list.append(item);
      links.push(link);
    });
    group.append(title, list);
    container.append(group);
  });
  return links;
}

function initIndexDialog() {
  const dialog = document.getElementById('index-dialog');
  const opener = document.querySelector('[data-open-index]');
  if (!dialog || !opener || typeof dialog.showModal !== 'function') return;
  opener.hidden = false;
  opener.addEventListener('click', () => dialog.showModal());
  dialog.querySelector('[data-close-dialog]')?.addEventListener('click', () => dialog.close());
  // Close after choosing a section so the page can scroll to it
  dialog.addEventListener('click', (event) => {
    if (event.target.closest('a')) dialog.close();
    if (event.target === dialog) dialog.close(); // click on backdrop
  });
  dialog.addEventListener('close', () => opener.focus());
}

function trackActive(sections, linkSets) {
  if (!('IntersectionObserver' in window)) return;
  const setActive = (id) => {
    linkSets.flat().forEach((link) => {
      if (link.hash === `#${id}`) link.setAttribute(ACTIVE_ATTR, 'true');
      else link.removeAttribute(ACTIVE_ATTR);
    });
  };
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-45% 0px -45% 0px' },
  );
  sections.forEach((section) => observer.observe(section));
}

// After a language change the sections carry translated labels: rewrite both menus
function relabel(sections, dots, index) {
  const byHash = new Map(sections.map((section) => [`#${section.id}`, section]));
  dots.forEach((link) => {
    const label = link.querySelector('.dot-nav__label');
    if (label && byHash.has(link.hash)) label.textContent = byHash.get(link.hash).dataset.navLabel;
  });
  index.forEach((link) => {
    const text = link.lastElementChild;
    if (text && byHash.has(link.hash)) text.textContent = byHash.get(link.hash).dataset.navLabel;
  });
  document.querySelectorAll('[data-index-nav] .index-nav__group').forEach((group) => {
    const first = byHash.get(group.querySelector('a')?.hash);
    const title = group.querySelector('.index-nav__group-title');
    if (first && title) title.textContent = first.dataset.part || '';
  });
}

export function initNavigation() {
  const sections = getSections();
  if (!sections.length) return;
  const dots = buildDots(sections);
  const index = buildIndex(sections);
  initIndexDialog();
  trackActive(sections, [dots, index]);
  document.addEventListener('i18n:applied', () => relabel(sections, dots, index));
}
