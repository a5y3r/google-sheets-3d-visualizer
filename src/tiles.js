// Build the HTML element for one person tile (Image B).
//
//   ┌──────────────────┐
//   │ MY            45 │  country · age
//   │     [ photo ]    │
//   │    Full Name     │
//   │     Interest     │
//   └──────────────────┘

// Net worth thresholds from the brief:
//   Red < $100K, Orange $100K–$200K (inclusive), Green > $200K
export const NET_WORTH_THRESHOLDS = { low: 100_000, high: 200_000 };

/** Business rule → level name. CSS decides what each level looks like. */
export function netWorthLevel(netWorth) {
  if (netWorth < NET_WORTH_THRESHOLDS.low) return 'low';
  if (netWorth > NET_WORTH_THRESHOLDS.high) return 'high';
  return 'medium';
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

/** Helper: create an element with a class and text (textContent = safe from HTML injection). */
function el(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function createPhoto(person) {
  const fallback = el('div', 'tile-photo tile-photo--fallback', initials(person.name));
  if (!person.photo) return fallback;

  const img = el('img', 'tile-photo');
  img.src = person.photo;
  img.alt = person.name;
  img.draggable = false; // otherwise dragging to rotate the scene "picks up" the image
  img.addEventListener('error', () => img.replaceWith(fallback), { once: true });
  return img;
}

export function createTile(person) {
  const tile = el('div', `tile tile--${netWorthLevel(person.netWorth)}`);
  tile.title = `${person.name} — Net worth ${currency.format(person.netWorth)}`;

  const header = el('div', 'tile-header');
  header.append(el('span', 'tile-country', person.country), el('span', 'tile-age', person.age));

  tile.append(
    header,
    createPhoto(person),
    el('div', 'tile-name', person.name),
    el('div', 'tile-interest', person.interest),
  );
  return tile;
}
