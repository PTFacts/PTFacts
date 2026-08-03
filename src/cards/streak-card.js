const { formatNumber, escapeXml } = require("../utils");

function renderStreakCard(user, repos, theme, opts = {}) {
  const W = opts.width || 500;
  const H = opts.height || 240;
  const t = theme;

  const dates = [];
  const now = new Date();
  for (let i = 48; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d);
  }

  const contribMap = {};
  repos.forEach((r) => {
    const d = new Date(r.pushed_at || r.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    contribMap[key] = (contribMap[key] || 0) + 1;
  });

  const maxContrib = Math.max(1, ...Object.values(contribMap));

  const colors = [
    t.bgAlt,
    "#1a3a2a",
    "#1a5533",
    "#1a6b3d",
    t.green,
  ];

  function getColor(count) {
    if (count === 0) return colors[0];
    const idx = Math.min(Math.ceil((count / maxContrib) * 4), 4);
    return colors[idx];
  }

  const cellSize = 7;
  const gap = 2;
  const gridW = (cellSize + gap) * 7 + 4;
  const startX = 22;
  const startY = 54;

  const gridCells = dates.map((d, i) => {
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const count = contribMap[key] || 0;
    const col = Math.floor(i / 7);
    const row = i % 7;
    const x = startX + col * (cellSize + gap);
    const y = startY + row * (cellSize + gap);
    return { x, y, count, color: getColor(count), size: cellSize };
  });

  const gridSvg = gridCells.map(c =>
    `<rect x="${c.x}" y="${c.y}" width="${c.size}" height="${c.size}" rx="2" fill="${c.color}" opacity="${c.count > 0 ? 0.95 : 0.3}"/>`
  ).join("");

  const months = ["","","Mar","","","Jun","","","Sep","","","Dec"];
  const monthLabels = [];
  for (let i = 0; i < 7; i++) {
    const d = dates[i * 7];
    if (d && d.getDate() <= 7 && d.getMonth() > 0 && d.getMonth() % 2 === 0) {
      monthLabels.push(`<text x="${startX + i * (cellSize + gap)}" y="${startY + 7 * (cellSize + gap) + 12}" fill="${t.textMuted}" font-size="7">${months[d.getMonth()]}</text>`);
    }
  }

  const dayLabels = ["","M","","","T","","S"].map((d, i) =>
    `<text x="${startX - 12}" y="${startY + i * (cellSize + gap) + 5}" fill="${t.textMuted}" font-size="6">${d || "·"}</text>`
  ).join("");

  const linePoints = [];
  const weekLabels = [];
  for (let w = 0; w < 7; w++) {
    let sum = 0;
    for (let d = 0; d < 7; d++) {
      const i = w * 7 + d;
      if (i < dates.length) {
        const key = `${dates[i].getFullYear()}-${dates[i].getMonth()}-${dates[i].getDate()}`;
        sum += contribMap[key] || 0;
      }
    }
    linePoints.push(sum);
  }

  const lx = (i) => startX + gridW + 20 + i * 24;
  const ly = (v) => 190 - (v / Math.max(...linePoints, 1)) * 80;
  const polyline = linePoints.map((v, i) => `${lx(i)},${ly(v)}`).join(" ");
  const areaLine = `M${lx(0)} ${190} ` + linePoints.map((v, i) => `L${lx(i)} ${ly(v)}`).join(" ") + ` L${lx(6)} ${190} Z`;

  const svg = `
  <defs>
    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${t.accent}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${t.accent}" stop-opacity="0.02"/>
    </linearGradient>
    <linearGradient id="bgGrad2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${t.bg}"/>
      <stop offset="100%" stop-color="${t.bgAlt}"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" rx="14" fill="url(#bgGrad2)" stroke="${t.border}" stroke-width="1.5"/>

  <text x="22" y="28" fill="${t.text}" font-size="14" font-weight="800" letter-spacing="0.5">CONTRIBUTION GRID</text>
  <text x="${W - 22}" y="28" fill="${t.textMuted}" font-size="11" text-anchor="end" font-family="monospace">@${escapeXml(user.login)}</text>
  <line x1="22" y1="40" x2="${W - 22}" y2="40" stroke="${t.border}" stroke-width="1"/>

  ${gridSvg}
  ${dayLabels}
  ${monthLabels.join("")}

  <path d="${areaLine}" fill="url(#areaGrad)"/>
  <polyline points="${polyline}" fill="none" stroke="${t.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  ${linePoints.map((v, i) => `<circle cx="${lx(i)}" cy="${ly(v)}" r="3" fill="${t.accent}"/>`).join("")}
  ${linePoints.map((v, i) => `<text x="${lx(i)}" cy="${ly(v) - 8}" fill="${t.text}" font-size="8" text-anchor="middle">${v}</text>`).join("")}

  <text x="${startX}" y="${startY + 7 * (cellSize + gap) + 24}" fill="${t.green}" font-size="10" font-weight="700">${formatNumber(Object.values(contribMap).reduce((a,b)=>a+b,0))} commits</text>
  <text x="${W - 22}" y="${startY + 7 * (cellSize + gap) + 24}" fill="${t.textMuted}" font-size="9" text-anchor="end">${repos.length} repos · ${user.followers} followers</text>
`;

  return svg;
}

module.exports = { renderStreakCard };
