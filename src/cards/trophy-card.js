const { formatNumber, escapeXml } = require("../utils");

function renderTrophyCard(user, repos, theme, opts = {}) {
  const W = opts.width || 500;
  const H = opts.height || 220;
  const t = theme;

  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);
  const totalSize = repos.reduce((s, r) => s + (r.size || 0), 0);
  const createdDate = new Date(user.created_at);
  const yearsActive = Math.floor((Date.now() - createdDate.getTime()) / 31557600000);
  const languagesCount = new Set(repos.map((r) => r.language).filter(Boolean)).size;
  const hasWebsite = repos.some((r) => r.homepage);
  const hasTopics = repos.filter((r) => (r.topics || []).length > 0).length;

  const recentRepos = repos.filter((r) => {
    const d = new Date(r.pushed_at || r.created_at);
    return (Date.now() - d.getTime()) < 7776000000;
  }).length;

  const trophies = [
    { icon: "★", name: "Star Collector", value: formatNumber(totalStars), earned: totalStars > 0, color: t.yellow },
    { icon: "⑂", name: "Fork Champion", value: formatNumber(totalForks), earned: totalForks > 0, color: t.green },
    { icon: "◈", name: "Repo Builder", value: `${repos.length} repos`, earned: repos.length >= 3, color: t.accent },
    { icon: "⌛", name: "Veteran", value: `${yearsActive}yr`, earned: yearsActive > 0, color: "#73daca" },
    { icon: "⬡", name: "Polyglot", value: `${languagesCount} langs`, earned: true, color: "#bb9af7" },
    { icon: "↗", name: "Active Dev", value: `${recentRepos} recent`, earned: recentRepos > 0, color: t.red },
    { icon: "⬒", name: "Code Base", value: `${(totalSize / 1024).toFixed(0)}mb`, earned: totalSize > 5000, color: "#e0af68" },
    { icon: "☷", name: "Topic Guru", value: `${hasTopics} tagged`, earned: hasTopics > 0, color: "#56b6c2" },
  ];

  const cols = 4;
  const rows = Math.ceil(trophies.length / cols);
  const cellW = (W - 40) / cols;
  const cellH = 70;

  const svg = `
  <defs>
    <linearGradient id="bgTrophy" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${t.bg}"/>
      <stop offset="100%" stop-color="${t.bgAlt}"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" rx="14" fill="url(#bgTrophy)" stroke="${t.border}" stroke-width="1.5"/>

  <text x="22" y="28" fill="${t.text}" font-size="14" font-weight="800" letter-spacing="0.5">ACHIEVEMENTS</text>
  <text x="${W - 22}" y="28" fill="${t.textMuted}" font-size="11" text-anchor="end" font-family="monospace">${trophies.filter(tr => tr.earned).length}/${trophies.length}</text>
  <line x1="22" y1="38" x2="${W - 22}" y2="38" stroke="${t.border}" stroke-width="1"/>

  ${trophies.map((tr, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 24 + col * cellW;
    const y = 48 + row * cellH;
    const earned = tr.earned;
    const cw = cellW - 8;
    const ch = cellH - 8;

    return `
    <rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="8" fill="${t.bgAlt}" stroke="${earned ? tr.color : t.border}" stroke-width="${earned ? 1 : 0.5}" opacity="${earned ? 1 : 0.4}"/>
    <text x="${x + cw / 2}" y="${y + 18}" fill="${earned ? tr.color : t.textMuted}" font-size="${earned ? 16 : 12}" text-anchor="middle">${tr.icon}</text>
    <text x="${x + cw / 2}" y="${y + 34}" fill="${earned ? t.text : t.textMuted}" font-size="9" font-weight="600" text-anchor="middle">${escapeXml(tr.name)}</text>
    <text x="${x + cw / 2}" y="${y + 48}" fill="${earned ? tr.color : t.textMuted}" font-size="8" text-anchor="middle">${escapeXml(tr.value)}</text>
    `;
  }).join("")}
`;

  return svg;
}

module.exports = { renderTrophyCard };
