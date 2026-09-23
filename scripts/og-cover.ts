/**
 * Genera la OG card (1200×630) del sitio. Se corre UNA VEZ y el PNG queda
 * commiteado en public/static/og-cover.png — no se regenera en cada build.
 * Regenerar: bun run og-cover
 */
import sharp from "sharp";

const SVG = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1d4bb0"/>
      <stop offset="55%" stop-color="#3b6fd4"/>
      <stop offset="100%" stop-color="#0f2f80"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#sky)"/>
  <rect x="80" y="120" width="1040" height="390" rx="10" fill="#ece9d8" stroke="#0f2f80" stroke-width="4"/>
  <rect x="80" y="120" width="1040" height="64" rx="10" fill="#235cdc"/>
  <rect x="80" y="160" width="1040" height="24" fill="#235cdc"/>
  <text x="112" y="163" font-family="Tahoma, Verdana, sans-serif" font-size="30" font-weight="bold" fill="#ffffff">Ignacio Iglesias</text>
  <text x="112" y="290" font-family="Tahoma, Verdana, sans-serif" font-size="56" font-weight="bold" fill="#111827">Desarrollador Full Stack</text>
  <text x="112" y="360" font-family="Tahoma, Verdana, sans-serif" font-size="34" fill="#374151">Web · Mobile · Desktop nativo · IA</text>
  <text x="112" y="450" font-family="Tahoma, Verdana, sans-serif" font-size="28" fill="#235cdc">www.pepo.ar</text>
</svg>`;

await sharp(Buffer.from(SVG)).png().toFile("public/static/og-cover.png");
console.log("og-cover: public/static/og-cover.png (1200×630)");
