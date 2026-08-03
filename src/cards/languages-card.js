const { formatNumber, escapeXml } = require("../utils");

function renderLanguagesCard(user, repos, theme, opts = {}) {
  const W = opts.width || 500;
  const H = opts.height || 240;
  const t = theme;

  const langMap = {};
  let totalBytes = 0;
  repos.forEach((r) => {
    if (r.language) {
      langMap[r.language] = (langMap[r.language] || 0) + (r.size || 1) * 1024;
      totalBytes += (r.size || 1) * 1024;
    }
  });

  const sorted = Object.entries(langMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const maxVal = sorted[0] ? sorted[0][1] : 1;
  const totalTop = sorted.reduce((s, [, v]) => s + v, 0);
  const langColors = ["#7aa2f7", "#9ece6a", "#e0af68", "#f7768e", "#bb9af7", "#73daca"];

  const ringColors = sorted.map((_, i) => langColors[i]);
  const ringPaths = [];
  let cumulative = 0;
  const cx = 382, cy = 130, outerR = 55, innerR = 32;
  sorted.forEach(([, val], i) => {
    const angle = (val / maxVal) * (i === 0 ? 360 : 120);
    const startAngle = cumulative;
    const endAngle = cumulative + angle;
    cumulative = endAngle;

    const x1 = cx + outerR * Math.cos((startAngle - 90) * Math.PI / 180);
    const y1 = cy + outerR * Math.sin((startAngle - 90) * Math.PI / 180);
    const x2 = cx + outerR * Math.cos((endAngle - 90) * Math.PI / 180);
    const y2 = cy + outerR * Math.sin((endAngle - 90) * Math.PI / 180);
    const xi1 = cx + innerR * Math.cos((startAngle - 90) * Math.PI / 180);
    const yi1 = cy + innerR * Math.sin((startAngle - 90) * Math.PI / 180);
    const xi2 = cx + innerR * Math.cos((endAngle - 90) * Math.PI / 180);
    const yi2 = cy + innerR * Math.sin((endAngle - 90) * Math.PI / 180);

    const large = endAngle - startAngle > 180 ? 1 : 0;
    ringPaths.push(
      `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${outerR} ${outerR} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L${xi2.toFixed(1)} ${yi2.toFixed(1)} A${innerR} ${innerR} 0 ${large} 0 ${xi1.toFixed(1)} ${yi1.toFixed(1)} Z" fill="${ringColors[i]}" opacity="0.85"/>`
    );
  });

  const svg = `
  <defs>
    <linearGradient id="bgLang" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${t.bg}"/>
      <stop offset="100%" stop-color="${t.bgAlt}"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.2"/>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" rx="14" fill="url(#bgLang)" stroke="${t.border}" stroke-width="1.5"/>

  <text x="22" y="28" fill="${t.text}" font-size="14" font-weight="800" letter-spacing="0.5">LANGUAGES</text>
  <text x="${W - 22}" y="28" fill="${t.textMuted}" font-size="11" text-anchor="end" font-family="monospace">${sorted.length} langs</text>
  <line x1="22" y1="40" x2="${W - 22}" y2="40" stroke="${t.border}" stroke-width="1"/>

  ${sorted.map(([lang, val], i) => {
    const y = 56 + i * 30;
    const barW = Math.max((val / maxVal) * 180, 10);
    const pct = totalTop > 0 ? ((val / totalTop) * 100).toFixed(0) : "0";
    return `
    <text x="22" y="${y + 6}" fill="${t.text}" font-size="11" font-weight="500">${escapeXml(lang)}</text>
    <rect x="92" y="${y}" width="${barW}" height="14" rx="7" fill="${langColors[i]}" opacity="0.8" filter="url(#shadow)"/>
    <text x="${Math.min(96 + barW, 276)}" y="${y + 10}" fill="${t.text}" font-size="10" font-weight="600">${pct}%</text>
    `;
  }).join("")}

  <text x="${cx}" y="${cy}" fill="${t.text}" font-size="12" font-weight="800" text-anchor="middle">${sorted.length}</text>
  <text x="${cx}" y="${cy + 14}" fill="${t.textMuted}" font-size="9" text-anchor="middle">langs</text>

  ${ringPaths.join("")}

  <text x="${W - 22}" y="235" fill="${t.textMuted}" font-size="8" text-anchor="end">${repos.length} repos · ${formatNumber(totalBytes / 1024)} KB</text>
`;

  return svg;
}

module.exports = { renderLanguagesCard };
