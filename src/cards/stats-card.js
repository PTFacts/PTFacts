const { roundedRect, formatNumber, escapeXml } = require("../utils");

function renderStatsCard(user, repos, theme, opts = {}) {
  const W = opts.width || 480;
  const H = opts.height || 210;
  const t = theme;

  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);
  const langs = new Set(repos.map((r) => r.language).filter(Boolean));

  const stats = [
    { icon: "repo", label: "Repositories", value: user.public_repos },
    { icon: "star", label: "Stars", value: totalStars },
    { icon: "people", label: "Followers", value: user.followers },
    { icon: "code", label: "Languages", value: langs.size },
  ];

  const svg = `
  <rect width="${W}" height="${H}" rx="12" fill="${t.bg}" stroke="${t.border}" stroke-width="2"/>

  <line x1="24" y1="38" x2="${W - 24}" y2="38" stroke="${t.border}" stroke-width="1" opacity="0.5"/>

  <text x="24" y="26" fill="${t.text}" font-size="13" font-weight="700">${escapeXml(user.login)}'s GitHub Stats</text>
  <text x="${W - 24}" y="26" fill="${t.textMuted}" font-size="11" text-anchor="end">@${escapeXml(user.login)}</text>

  ${stats
    .map((s, i) => {
      const cx = 40 + i * ((W - 80) / 3);
      const cy = 75;
      const r = 28;
      return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${t.bgAlt}" stroke="${t.border}" stroke-width="1"/>
    <text x="${cx}" y="${cy + 4}" fill="${t.accent}" font-size="18" font-weight="800" text-anchor="middle">${formatNumber(s.value)}</text>
    <text x="${cx}" y="${cy + 40}" fill="${t.textMuted}" font-size="10" text-anchor="middle">${s.label}</text>
    `;
    })
    .join("")}

  <rect x="24" y="130" width="${W - 48}" height="8" rx="4" fill="${t.border}" opacity="0.3"/>
  <rect x="24" y="130" width="${Math.min((user.public_repos / (user.public_repos + 50)) * (W - 48), W - 48)}" height="8" rx="4" fill="${t.accent}"/>

  <text x="24" y="158" fill="${t.textMuted}" font-size="10">Public repos</text>
  <text x="${W - 24}" y="158" fill="${t.text}" font-size="10" text-anchor="end">${user.public_repos}</text>

  <rect x="24" y="168" width="${W - 48}" height="6" rx="3" fill="${t.border}" opacity="0.3"/>
  <rect x="24" y="168" width="${Math.min((totalStars / (totalStars + 100)) * (W - 48), W - 48)}" height="6" rx="3" fill="${t.yellow}"/>

  <text x="24" y="190" fill="${t.textMuted}" font-size="10">Total stars</text>
  <text x="${W - 24}" y="190" fill="${t.text}" font-size="10" text-anchor="end">${totalStars}</text>
`;

  return svg;
}

module.exports = { renderStatsCard };
