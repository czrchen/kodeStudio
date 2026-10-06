// Generates public/og-image.png (1200×630), the preview shown when the site is shared.
// Run: node scripts/og-image.mjs
import sharp from 'sharp';

const font = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#ffffff" stroke-opacity="0.06" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="#121513"/>
  <rect width="1200" height="630" fill="url(#grid)"/>

  <g transform="translate(80 80)">
    <rect width="56" height="56" rx="14" fill="#dfff56"/>
    <path d="M22 20l-10 12 10 12M38 20l10 12-10 12M33 17l-7 30" transform="translate(-2 -4)" fill="none" stroke="#121513" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="76" y="39" font-family="${font}" font-size="32" fill="#ffffff">Kode<tspan font-weight="700">Studio</tspan></text>
  </g>

  <text x="80" y="300" font-family="${font}" font-size="76" font-weight="700" fill="#ffffff" letter-spacing="-2">Automate the busywork.</text>
  <text x="80" y="390" font-family="${font}" font-size="76" font-weight="700" fill="#dfff56" letter-spacing="-2">Grow the business.</text>
  <text x="80" y="460" font-family="${font}" font-size="30" fill="#a9b0aa">Custom workflow automation for Malaysian SMEs</text>

  <g font-family="${font}" font-size="22" fill="#ffffff">
    <rect x="80" y="520" width="132" height="44" rx="22" fill="none" stroke="#ffffff" stroke-opacity="0.25"/>
    <text x="146" y="549" text-anchor="middle">Sales</text>
    <rect x="226" y="520" width="168" height="44" rx="22" fill="none" stroke="#ffffff" stroke-opacity="0.25"/>
    <text x="310" y="549" text-anchor="middle">HR &amp; claims</text>
    <rect x="408" y="520" width="160" height="44" rx="22" fill="none" stroke="#ffffff" stroke-opacity="0.25"/>
    <text x="488" y="549" text-anchor="middle">Approvals</text>
    <rect x="582" y="520" width="168" height="44" rx="22" fill="none" stroke="#ffffff" stroke-opacity="0.25"/>
    <text x="666" y="549" text-anchor="middle">Reporting</text>
  </g>
  <text x="1120" y="549" text-anchor="end" font-family="${font}" font-size="22" fill="#a9b0aa">kodestudio.klyihao.com</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/og-image.png');
console.log('Wrote public/og-image.png');
