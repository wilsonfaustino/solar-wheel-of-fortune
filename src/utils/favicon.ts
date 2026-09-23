const SPOKE_COUNT = 12;
const SPOKE_INNER_RADIUS = 7;
const SPOKE_OUTER_RADIUS = 13;
// spoke index 9 of 12 points straight up (270 degrees); it is drawn white as the "selected" marker
const SELECTED_SPOKE_INDEX = 9;

function buildSpokes(accent: string) {
  return Array.from({ length: SPOKE_COUNT }, (_, spokeIndex) => {
    if (spokeIndex === SELECTED_SPOKE_INDEX) return '';
    const angle = (spokeIndex * 2 * Math.PI) / SPOKE_COUNT;
    const [x1, y1, x2, y2] = [SPOKE_INNER_RADIUS, SPOKE_OUTER_RADIUS].flatMap((radius) => [
      (16 + Math.cos(angle) * radius).toFixed(2),
      (16 + Math.sin(angle) * radius).toFixed(2),
    ]);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>`;
  }).join('');
}

export function buildFaviconHref(accent: string) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
    '<rect width="32" height="32" rx="7" fill="#000"/>' +
    buildSpokes(accent) +
    '<line x1="16" y1="9" x2="16" y2="2.5" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>' +
    `<circle cx="16" cy="16" r="4" fill="${accent}"/>` +
    '</svg>';
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
