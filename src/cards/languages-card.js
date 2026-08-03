const { formatNumber, escapeXml } = require("../utils");

function renderLanguagesCard(user, repos, theme, opts = {}) {
  const W = opts.width || 480;
  const H = opts.height || 220;
  const t = theme;

  const langMap = {};
  repos.forEach((r) => {
    if (r.language) {
      langMap[r.language] = (langMap[r.language] || 0) + 1;
    }
  });

  const sorted = Object.entries(langMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const maxVal = sorted[0] ? sorted[0][1] : 1;
  const barColors = [t.accent, t.green, t.yellow, t.red, "#61afef", "#c678dd", "#e5c07b", "#56b6c2"];

  const svg = `
  <rect width="${W}" height="${H}" rx="12" fill="${t.bg}" stroke="${t.border}" stroke-width="2"/>

  <text x="24" y="26" fill="${t.text}" font-size="13" font-weight="700">Top Languages</text>
  <text x="${W - 24}" y="26" fill="${t.textMuted}" font-size="11" text-anchor="end">${sorted.length} languages</text>
  <line x1="24" y1="38" x2="${W - 24}" y2="38" stroke="${t.border}" stroke-width="1" opacity="0.5"/>

  ${sorted
    .map(([lang, count], i) => {
      const y = 54 + i * 20;
      const barW = Math.max((count / maxVal) * (W * 0.45), 8);
      const color = barColors[i % barColors.length];
      const pct = ((count / repos.length) * 100).toFixed(0);
      return `
    <text x="24" y="${y + 10}" fill="${t.text}" font-size="11">${escapeXml(lang)}</text>
    <rect x="120" y="${y + 3}" width="${barW}" height="14" rx="4" fill="${color}" opacity="0.8"/>
    <text x="${130 + barW}" y="${y + 10}" fill="${t.textMuted}" font-size="10">${count} repos (${pct}%)</text>
    `;
    })
    .join("")}

  <rect x="24" y="${54 + sorted.length * 20 + 8}" width="${W - 48}" height="8" rx="4" fill="${t.border}" opacity="0.3"/>
  <rect x="24" y="${54 + sorted.length * 20 + 8}" width="${Math.min((sorted.length / 8) * (W - 48), W - 48)}" height="8" rx="4" fill="${t.accent}"/>

  <text x="24" y="${54 + sorted.length * 20 + 30}" fill="${t.textMuted}" font-size="10">${repos.length} repos analyzed</text>
`;

  return svg;
}

module.exports = { renderLanguagesCard };
