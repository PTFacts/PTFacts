const { escapeXml } = require("../utils");

function renderTrophyCard(user, repos, theme, opts = {}) {
  const W = opts.width || 480;
  const H = opts.height || 200;
  const t = theme;

  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);
  const totalSize = repos.reduce((s, r) => s + (r.size || 0), 0);

  const trophies = [
    { name: "Star Collector", desc: `${totalStars} stars`, earned: totalStars > 0, color: t.yellow },
    { name: "Fork Champion", desc: `${totalForks} forks`, earned: totalForks > 0, color: t.green },
    { name: "Code Builder", desc: `${repos.length} repos`, earned: repos.length >= 3, color: t.accent },
    { name: "Veteran", desc: `Since ${new Date(user.created_at).getFullYear()}`, earned: true, color: "#56b6c2" },
    { name: "Heavy Lifter", desc: `${(totalSize / 1024).toFixed(0)} MB`, earned: totalSize > 10240, color: t.red },
    { name: "Polyglot", desc: `${new Set(repos.map((r) => r.language).filter(Boolean)).size} langs`, earned: true, color: "#c678dd" },
  ];

  const svg = `
  <rect width="${W}" height="${H}" rx="12" fill="${t.bg}" stroke="${t.border}" stroke-width="2"/>

  <text x="24" y="26" fill="${t.text}" font-size="13" font-weight="700">🏆 Achievements</text>
  <line x1="24" y1="38" x2="${W - 24}" y2="38" stroke="${t.border}" stroke-width="1" opacity="0.5"/>

  ${trophies
    .map((tr, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 30 + col * 150;
      const y = 54 + row * 70;
      const earned = tr.earned;
      return `
    <rect x="${x}" y="${y}" width="140" height="60" rx="8" fill="${t.bgAlt}" stroke="${earned ? tr.color : t.border}" stroke-width="${earned ? 1.5 : 1}" opacity="${earned ? 1 : 0.5}"/>
    <text x="${x + 70}" y="${y + 24}" fill="${earned ? tr.color : t.textMuted}" font-size="10" font-weight="700" text-anchor="middle">${escapeXml(tr.name)}</text>
    <text x="${x + 70}" y="${y + 42}" fill="${earned ? t.text : t.textMuted}" font-size="11" text-anchor="middle">${escapeXml(tr.desc)}</text>
    `;
    })
    .join("")}
`;

  return svg;
}

module.exports = { renderTrophyCard };
