const { formatNumber, escapeXml } = require("../utils");

function isoCube(cx, cy, size, height, fill) {
  const s = size;
  const h = height;
  const top = `${cx},${cy - h} ${cx + s},${cy - s * 0.5 - h} ${cx + s * 2},${cy - h} ${cx + s},${cy + s * 0.5 - h}`;
  const left = `${cx},${cy - h} ${cx + s},${cy + s * 0.5 - h} ${cx + s},${cy + s * 0.5} ${cx},${cy}`;
  const right = `${cx + s},${cy + s * 0.5 - h} ${cx + s * 2},${cy - h} ${cx + s * 2},${cy} ${cx + s},${cy + s * 0.5}`;

  const r = parseInt(fill.slice(1, 3), 16);
  const g = parseInt(fill.slice(3, 5), 16);
  const b = parseInt(fill.slice(5, 7), 16);

  const topFill = `rgb(${Math.min(255, r + 40)},${Math.min(255, g + 40)},${Math.min(255, b + 40)})`;
  const leftFill = `rgb(${Math.max(0, r - 30)},${Math.max(0, g - 30)},${Math.max(0, b - 30)})`;
  const rightFill = fill;

  return `
    <polygon points="${left}" fill="${leftFill}" stroke="${leftFill}" stroke-width="0.5"/>
    <polygon points="${right}" fill="${rightFill}" stroke="${rightFill}" stroke-width="0.5"/>
    <polygon points="${top}" fill="${topFill}" stroke="${topFill}" stroke-width="0.5"/>
  `;
}

function renderStatsCard(user, repos, theme, opts = {}) {
  const W = opts.width || 500;
  const H = opts.height || 240;
  const t = theme;

  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);
  const languages = [...new Set(repos.map((r) => r.language).filter(Boolean))];
  const avgStarsPerRepo = repos.length > 0 ? (totalStars / repos.length).toFixed(1) : "0";

  const createdDate = new Date(user.created_at);
  const monthsActive = Math.floor((Date.now() - createdDate.getTime()) / 2629800000);
  const reposPerMonth = monthsActive > 0 ? (user.public_repos / monthsActive).toFixed(1) : "0";

  const linePoints = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const count = repos.filter((r) => {
      const rd = new Date(r.pushed_at || r.created_at);
      return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth();
    }).length;
    linePoints.push(count);
  }
  const maxP = Math.max(...linePoints, 1);
  const lx = (i) => 290 + i * 18;
  const ly = (v) => 200 - (v / maxP) * 60;

  const linePath = linePoints.map((v, i) => `${i === 0 ? "M" : "L"}${lx(i)} ${ly(v)}`).join(" ");
  const areaPath = `${linePath} L${lx(11)} ${200} L${lx(0)} ${200} Z`;

  const barData = [
    { label: "Repos", value: user.public_repos, max: 60 },
    { label: "Stars", value: totalStars, max: 300 },
    { label: "Forks", value: totalForks, max: 200 },
    { label: "Langs", value: languages.length, max: 15 },
  ];

  const svg = `
  <defs>
    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${t.accent}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${t.accent}" stop-opacity="0.02"/>
    </linearGradient>
    <linearGradient id="barGrad1" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${t.accent}"/>
      <stop offset="100%" stop-color="${t.green}"/>
    </linearGradient>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${t.bg}"/>
      <stop offset="100%" stop-color="${t.bgAlt}"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" rx="14" fill="url(#bgGrad)" stroke="${t.border}" stroke-width="1.5"/>

  <text x="22" y="28" fill="${t.text}" font-size="14" font-weight="800" letter-spacing="0.5">GITHUB STATS</text>
  <text x="${W - 22}" y="28" fill="${t.textMuted}" font-size="11" text-anchor="end" font-family="monospace">@${escapeXml(user.login)}</text>
  <line x1="22" y1="40" x2="${W - 22}" y2="40" stroke="${t.border}" stroke-width="1"/>

  ${barData.map((b, i) => {
    const y = 56 + i * 32;
    const barW = Math.min((b.value / b.max) * 160, 160);
    return `
    <text x="22" y="${y + 12}" fill="${t.text}" font-size="11" font-weight="500">${b.label}</text>
    <rect x="70" y="${y + 2}" width="${Math.max(barW, 2)}" height="16" rx="8" fill="url(#barGrad1)" opacity="0.85"/>
    <text x="${Math.min(74 + barW, 230)}" y="${y + 12}" fill="${t.text}" font-size="11" font-weight="700">${b.value}</text>
    `;
  }).join("")}

  <text x="${W / 2}" y="200" fill="${t.textMuted}" font-size="9" text-anchor="middle">Monthly repo activity</text>

  <path d="${areaPath}" fill="url(#lineGrad)"/>
  <polyline points="${linePoints.map((v, i) => `${lx(i)},${ly(v)}`).join(" ")}" fill="none" stroke="${t.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  ${linePoints.map((v, i) => `<circle cx="${lx(i)}" cy="${ly(v)}" r="2.5" fill="${t.accent}"/>`).join("")}

  ${[0, 3, 6, 9, 11].map(i => `<text x="${lx(i)}" y="215" fill="${t.textMuted}" font-size="8" text-anchor="middle">${["Jan","Apr","Jul","Oct","Dec"][[0,3,6,9,11].indexOf(i)] || ""}</text>`).join("")}

  <text x="${W - 22}" y="235" fill="${t.textMuted}" font-size="8" text-anchor="end">${avgStarsPerRepo} stars/repo · ${reposPerMonth} repos/month</text>
`;

  return svg;
}

module.exports = { renderStatsCard };
