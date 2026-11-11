// Red below 100K, orange from 100K to 200K inclusive, green above 200K.
export const NET_WORTH_THRESHOLDS = { low: 100_000, high: 200_000 };

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
  img.draggable = false; // native image drag would interfere with rotating the scene
  img.addEventListener('error', () => img.replaceWith(fallback), { once: true });
  return img;
}

export function createTile(person) {
  const tile = el('div', `tile tile--${netWorthLevel(person.netWorth)}`);
  tile.title = `${person.name} - Net worth ${currency.format(person.netWorth)}`;

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
