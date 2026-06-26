// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'SportGuru Unirii',
    address: 'Bulevardul Unirii nr. 69, Bucuresti',
    phone: '0374 050 029',
    hours: 'Mon-Fri: 10:00-20:00, Sat: 10:00-17:00',
  },
  {
    name: 'SportGuru Pipera',
    address: 'Soseaua Pipera nr. 44, Bucuresti',
    phone: '0374 992 999',
    hours: 'Mon-Fri: 10:00-19:00, Sat: 10:00-17:00',
  },
];

// Brand palette from BuildWidgetRequest — used to derive card background.
const PALETTE = ['#6100a2', '#3de525'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);
const ACCENT = PALETTE[0] || '#6100a2';

// Lighten a hex color toward white so accent text stays readable on the dark card bg.
function lightenForText(hex, amount = 0.62) {
  let h = (hex || '').replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (h.length !== 6) return '#d8b4f0';
  let [r, g, b] = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '#d8b4f0';
  r = Math.round(r + (255 - r) * amount);
  g = Math.round(g + (255 - g) * amount);
  b = Math.round(b + (255 - b) * amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
const PHONE_COLOR = lightenForText(ACCENT);

function pinIcon(size, color) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', color);
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z');
  const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  c.setAttribute('cx', '12'); c.setAttribute('cy', '10'); c.setAttribute('r', '3');
  svg.appendChild(p); svg.appendChild(c);
  return svg;
}

function renderEmptyState(block, bridge) {
  const card = document.createElement('div');
  card.className = 'find-store-empty';
  card.style.cssText = `background:${theme?.bg ?? '#1a3a5c'};color:${theme?.fg ?? '#fff'}`;

  const iconWrap = document.createElement('div');
  iconWrap.className = 'find-store-empty-icon';
  iconWrap.appendChild(pinIcon(40, theme?.fg ?? '#fff'));
  card.appendChild(iconWrap);

  const heading = document.createElement('h3');
  heading.className = 'find-store-empty-heading';
  heading.textContent = 'Find a store near you';
  card.appendChild(heading);

  const form = document.createElement('div');
  form.className = 'find-store-form';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'find-store-input';
  input.placeholder = 'Enter city…';
  input.setAttribute('aria-label', 'City');
  form.appendChild(input);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'find-store-btn';
  btn.textContent = 'Find Nearby';
  btn.style.background = ACCENT;
  const submit = () => {
    const val = input.value.trim();
    if (bridge) bridge.sendMessage(val ? `Find a SportGuru store near ${val}` : 'Find a SportGuru store near me');
  };
  btn.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  form.appendChild(btn);

  card.appendChild(form);
  block.appendChild(card);
}

function renderStores(block, stores, bridge) {
  const row = document.createElement('div');
  row.className = 'find-store-row';

  stores.forEach((store) => {
    const card = document.createElement('div');
    card.className = 'find-store-card';
    card.style.cssText = `background:${theme?.bg ?? '#1a3a5c'};color:${theme?.fg ?? '#fff'}`;

    const pin = document.createElement('div');
    pin.className = 'find-store-pin';
    pin.appendChild(pinIcon(18, theme?.fg ?? '#fff'));
    card.appendChild(pin);

    const name = document.createElement('div');
    name.className = 'find-store-name';
    name.textContent = store.name || '';
    card.appendChild(name);

    if (store.address) {
      const addr = document.createElement('div');
      addr.className = 'find-store-address';
      addr.textContent = store.address;
      card.appendChild(addr);
    }

    if (store.phone) {
      const phone = document.createElement('div');
      phone.className = 'find-store-phone';
      phone.textContent = store.phone;
      phone.style.color = PHONE_COLOR;
      card.appendChild(phone);
    }

    if (store.hours) {
      const hours = document.createElement('div');
      hours.className = 'find-store-hours';
      hours.textContent = store.hours;
      card.appendChild(hours);
    }

    row.appendChild(card);
  });

  block.appendChild(row);
}

function render(block, stores, bridge) {
  block.textContent = '';
  if (stores && stores.length) {
    renderStores(block, stores, bridge);
  } else {
    renderEmptyState(block, bridge);
  }
}

export default async function decorate(block, bridge) {
  let stores;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      stores = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.stores — bare array outputSchema; key derived from actionName "find_store"
      stores = structuredContent?.stores || [];
    }
    render(block, stores, bridge);
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  } else {
    stores = SAMPLE_DATA;
    render(block, stores, bridge);
  }
}
