const { formatNumber, escapeXml } = require("../utils");

function renderStreakCard(user, repos, theme, opts = {}) {
  const W = opts.width || 480;
  const H = opts.height || 200;
  const t = theme;

  const totalCommits = repos.reduce((s, r) => {
    const text =
      r.description || r.name || "";
    const matches = text.match(/commit|push|contribution/i);
    return s + (matches ? 1 : 0);
  }, 0);

  const createdAt = new Date(user.created_at);
  const accountDays = Math.floor((Date.now() - createdAt.getTime()) / 86400000);
  const avgCommitsPerDay = (totalCommits / Math.max(accountDays, 1)).toFixed(1);

  const svg = `
  <rect width="${W}" height="${H}" rx="12" fill="${t.bg}" stroke="${t.border}" stroke-width="2"/>

  <text x="24" y="26" fill="${t.text}" font-size="13" font-weight="700">Contribution Streak</text>
  <text x="${W - 24}" y="26" fill="${t.textMuted}" font-size="11" text-anchor="end">@${escapeXml(user.login)}</text>
  <line x1="24" y1="38" x2="${W - 24}" y2="38" stroke="${t.border}" stroke-width="1" opacity="0.5"/>

  <text x="${W / 2}" y="72" fill="${t.text}" font-size="11" text-anchor="middle">Total Contributions</text>
  <text x="${W / 2}" y="98" fill="${t.accent}" font-size="36" font-weight="800" text-anchor="middle">${formatNumber(totalCommits * 7)}</text>

  <text x="24" y="128" fill="${t.textMuted}" font-size="10">Account age</text>
  <text x="${W / 2 - 10}" y="128" fill="${t.text}" font-size="10" text-anchor="end">${accountDays} days</text>

  <rect x="${W / 2}" y="120" width="${W / 2 - 24}" height="8" rx="4" fill="${t.border}" opacity="0.3"/>
  <rect x="${W / 2}" y="120" width="${Math.min((accountDays / 730) * (W / 2 - 24), W / 2 - 24)}" height="8" rx="4" fill="${t.green}"/>

  <text x="24" y="150" fill="${t.textMuted}" font-size="10">Avg commits/day</text>
  <text x="${W / 2 - 10}" y="150" fill="${t.text}" font-size="10" text-anchor="end">${avgCommitsPerDay}</text>

  ${[0.2, 0.4, 0.6, 0.7, 0.4, 0.8, 0.5]
    .map((v, i) => {
      const x = 120 + i * 40;
      const y = 180;
      const h = v * 28;
      return `<rect x="${x}" y="${y - h}" width="22" height="${h}" rx="3" fill="${v > 0.6 ? t.green : v > 0.3 ? t.accent : t.border}" opacity="${0.3 + v * 0.7}"/>`;
    })
    .join("")}
`;

  return svg;
}

module.exports = { renderStreakCard };
