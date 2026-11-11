// Build the HTML element for one tile.
// Step 6: simple placeholder tile (demo style). Step 7 replaces this with the real design.

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
  if (text !== undefined) node.textContent = text;
  return node;
}

export function createTile(person, index) {
  const tile = el('div', 'tile');
  tile.style.backgroundColor = `rgba(0, 127, 127, ${Math.random() * 0.5 + 0.25})`;

  tile.append(
    el('div', 'tile-number', String(index + 1)),
    el('div', 'tile-symbol', initials(person.name)),
    el('div', 'tile-details', person.name),
  );
  return tile;
}
