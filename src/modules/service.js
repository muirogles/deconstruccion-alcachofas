// «El servicio»: the rail of tickets (comandas). Each prompt lives once, in its ticket.
// Without JS every ticket is listed in order. With JS the rail works as tabs
// (one ticket at a time, large enough to read on a projector) and each ticket
// keeps a state: pending → firing (set when it is copied) → served (set by hand,
// because the page cannot know when the person's AI has finished).
// States are remembered only in this browser, so a reload never loses them.
import { readValue, writeValue } from './storage.js';
import { announce } from './announce.js';
import { resetSlots, readSlot } from './slots.js';

// Versioned key: when the tickets change, saved states start fresh
const STORE_KEY = 'service-v2';
const STEP_TICKET = /^\d{2}$/; // 00–06: the steps of the method, in order
// Shape, not only colour, tells the state apart in the rail (the word is read by screen readers)
const GLYPHS = { pending: '○', firing: '●', served: '✓' };

function load() {
  try {
    return JSON.parse(readValue(STORE_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

function save(data) {
  writeValue(STORE_KEY, JSON.stringify(data));
}

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString(document.documentElement.lang || 'es', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// «Mesa: auditoría de arcasiles.com»: the host of the audited web, without www.
// People often type the address without its protocol («arcasiles.com/es»), so add one to read it.
function tableName(url) {
  const value = (url || '').trim();
  if (!value || /\s/.test(value)) return '';
  try {
    return new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `https://${value}`).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function stateOf(entry = {}) {
  if (entry.served) return 'served';
  if (entry.fired) return 'firing';
  return 'pending';
}

function capitalise(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Short dish name for the rail: the part before « · » (e.g. «Menú completo»)
function dishName(ticket) {
  return (ticket.querySelector('.ticket__title > span:not(.ticket__number)')?.textContent || '').split(' · ')[0];
}

function buildTab(ticket, index) {
  const tab = document.createElement('button');
  tab.type = 'button';
  tab.className = 'rail__ticket';
  tab.id = `tab-${ticket.id}`;
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-controls', `tabpanel-${ticket.id}`);
  tab.style.setProperty('--ticket-index', index);

  const number = document.createElement('span');
  number.className = 'rail__number';
  number.textContent = ticket.querySelector('.ticket__number').textContent;
  const name = document.createElement('span');
  name.className = 'rail__name';
  name.textContent = dishName(ticket);
  const state = document.createElement('span');
  state.className = 'rail__state';
  const glyph = document.createElement('span');
  glyph.className = 'rail__glyph';
  glyph.setAttribute('aria-hidden', 'true');
  const word = document.createElement('span');
  word.className = 'u-visually-hidden';
  state.append(glyph, word);
  tab.append(number, name, state);
  return tab;
}

export function initService() {
  const rail = document.querySelector('[data-rail]');
  if (!rail) return;
  // Only the tickets of the service; the takeaway order lives in «Para llevar»
  const tickets = [...rail.closest('.service').querySelectorAll('.ticket[data-ticket]')];
  if (!tickets.length) return;

  const text = rail.dataset; // labels and messages, translatable via data-i18n-attr
  const data = load();
  const tableSlots = [...document.querySelectorAll('[data-ticket-table]')];
  const tablePlaceholder = tableSlots[0]?.textContent || '';

  rail.setAttribute('role', 'tablist');
  rail.setAttribute('aria-labelledby', 'rail-title');
  const panels = [];
  const tabs = tickets.map((ticket, index) => {
    const tab = buildTab(ticket, index);
    rail.append(tab);
    const panel = document.createElement('div');
    panel.className = 'service__ticket-panel';
    panel.id = `tabpanel-${ticket.id}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = -1;
    ticket.before(panel);
    panel.append(ticket);
    panels.push(panel);
    // The body of the order may scroll inside the ticket: reachable with the keyboard
    const body = ticket.querySelector('.ticket__body');
    const title = ticket.querySelector('.ticket__title');
    if (body && title?.id) {
      body.tabIndex = 0;
      body.setAttribute('role', 'region');
      body.setAttribute('aria-labelledby', title.id);
    }
    ticket.querySelector('[data-ticket-serve]')?.removeAttribute('hidden');
    return tab;
  });
  rail.hidden = false;
  document.querySelectorAll('[data-rail-legend]').forEach((legend) => {
    legend.hidden = false;
  });
  rail.closest('.service')?.classList.add('service--rail');

  const render = (index) => {
    const ticket = tickets[index];
    const entry = data[ticket.dataset.ticket];
    const state = stateOf(entry);
    ticket.dataset.state = state;
    tabs[index].dataset.state = state;
    tabs[index].querySelector('.rail__glyph').textContent = GLYPHS[state];
    tabs[index].querySelector('.rail__state .u-visually-hidden').textContent = text[`label${capitalise(state)}`] || '';

    const stamp = ticket.querySelector('[data-ticket-stamp]');
    if (state === 'pending') {
      stamp.hidden = true;
      stamp.textContent = '';
    } else {
      const time = formatTime(state === 'served' ? entry.served : entry.fired);
      stamp.textContent = `${text[`stamp${capitalise(state)}`] || ''} · ${time}`;
      stamp.hidden = false;
    }
    ticket.querySelector('[data-ticket-serve]')?.setAttribute('aria-pressed', String(state === 'served'));
  };

  // A language change rewrites the tickets and the rail labels: redraw the rail
  document.addEventListener('i18n:applied', () => {
    tabs.forEach((tab, index) => {
      tab.querySelector('.rail__name').textContent = dishName(tickets[index]);
      render(index);
    });
    // The placeholder («[tu web]») is a translated attribute: show the table again in the new language
    renderTable(readSlot('web'));
  });

  const select = (index, { focus } = {}) => {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    });
    if (focus === 'tab') tabs[index].focus();
    if (focus === 'ticket') {
      panels[index].scrollIntoView({ block: 'start' });
      panels[index].focus({ preventScroll: true });
    }
  };

  const renderTable = (url) => {
    const name = tableName(url);
    tableSlots.forEach((slot) => {
      slot.textContent = name || slot.dataset.placeholder || tablePlaceholder;
    });
  };

  // Rail as tabs: click or arrow keys (automatic activation)
  tabs.forEach((tab, index) => tab.addEventListener('click', () => select(index)));
  rail.addEventListener('keydown', (event) => {
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    const last = tabs.length - 1;
    const next = {
      ArrowRight: current === last ? 0 : current + 1,
      ArrowDown: current === last ? 0 : current + 1,
      ArrowLeft: current === 0 ? last : current - 1,
      ArrowUp: current === 0 ? last : current - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next, { focus: 'tab' });
  });

  // Firing: any copy of a prompt (from the ticket or from its step) marks it
  document.addEventListener('prompt:copied', (event) => {
    const ticket = document.getElementById(event.detail.id)?.closest('.ticket[data-ticket]');
    if (!ticket || !tickets.includes(ticket)) return;
    const key = ticket.dataset.ticket;
    data[key] = { ...data[key], fired: new Date().toISOString() };
    save(data);
    render(tickets.indexOf(ticket));
  });

  // Served: marked by hand once the file is saved
  tickets.forEach((ticket, index) => {
    ticket.querySelector('[data-ticket-serve]')?.addEventListener('click', () => {
      const key = ticket.dataset.ticket;
      const entry = { ...data[key] };
      if (entry.served) delete entry.served;
      else entry.served = new Date().toISOString();
      data[key] = entry;
      save(data);
      render(index);
      const number = ticket.querySelector('.ticket__number').textContent;
      announce((entry.served ? text.msgServed : text.msgUnserved || '').replace('{n}', number));
    });
  });

  // «Nueva mesa»: empty web, system and every ticket state
  document.querySelectorAll('[data-service-reset]').forEach((button) => {
    button.hidden = false;
    button.addEventListener('click', () => {
      Object.keys(data).forEach((key) => delete data[key]);
      save(data);
      resetSlots();
      tickets.forEach((_, index) => render(index));
      select(0);
      announce(text.msgReset || '');
    });
  });

  document.addEventListener('slots:change', (event) => {
    if (event.detail.name === 'web') renderTable(event.detail.value);
  });

  // Links to a ticket (from each step) open it in the rail
  const openFromHash = () => {
    const index = tickets.findIndex((ticket) => `#${ticket.id}` === window.location.hash);
    if (index >= 0) select(index, { focus: 'ticket' });
    return index >= 0;
  };
  window.addEventListener('hashchange', openFromHash);
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#comanda-"]');
    if (!link || link.hash !== window.location.hash) return;
    event.preventDefault(); // same hash twice: hashchange would not fire
    openFromHash();
  });

  // First paint: states, table and the next ticket to fire
  tickets.forEach((_, index) => render(index));
  renderTable(readSlot('web'));
  if (!openFromHash()) {
    const next = tickets.findIndex((ticket) => STEP_TICKET.test(ticket.dataset.ticket) && stateOf(data[ticket.dataset.ticket]) !== 'served');
    select(next >= 0 ? next : 0);
  }

  // Tickets come out of the printer once, when the rail first appears
  if ('IntersectionObserver' in window) {
    rail.classList.add('rail--waiting');
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      rail.classList.add('rail--print');
      observer.disconnect();
    }, { threshold: 0.3 });
    observer.observe(rail);
  }
}
