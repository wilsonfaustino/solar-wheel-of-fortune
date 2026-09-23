import { buildFaviconHref } from './favicon';

describe('buildFaviconHref', () => {
  it('returns an SVG data URL', () => {
    expect(buildFaviconHref('#00FFFF')).toMatch(/^data:image\/svg\+xml,/);
  });

  it('paints 11 accent spokes, the center dot, and one white selected spoke', () => {
    const svg = decodeURIComponent(buildFaviconHref('#FF6B35'));
    expect(svg.match(/stroke="#FF6B35"/g)).toHaveLength(11);
    expect(svg).toContain('<circle cx="16" cy="16" r="4" fill="#FF6B35"/>');
    expect(svg.match(/stroke="#fff"/g)).toHaveLength(1);
  });
});
