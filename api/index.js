const { fetchGitHubUser, fetchRepos } = require("../src/fetch");
const { themes } = require("../src/themes");
const { svgTag } = require("../src/utils");
const { renderStatsCard } = require("../src/cards/stats-card");
const { renderStreakCard } = require("../src/cards/streak-card");
const { renderLanguagesCard } = require("../src/cards/languages-card");
const { renderTrophyCard } = require("../src/cards/trophy-card");

const CARD_RENDERERS = {
  stats: renderStatsCard,
  streak: renderStreakCard,
  languages: renderLanguagesCard,
  trophy: renderTrophyCard,
};

const DEFAULT_THEME = "tokyonight";
const DEFAULT_CARD = "stats";

module.exports = async function handler(req, res) {
  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const username = searchParams.get("username") || "PTFacts";
  const card = searchParams.get("card") || DEFAULT_CARD;
  const themeName = searchParams.get("theme") || DEFAULT_THEME;
  const width = parseInt(searchParams.get("width")) || undefined;
  const height = parseInt(searchParams.get("height")) || undefined;
  const raw = searchParams.get("raw") === "true";

  const theme = themes[themeName] || themes[DEFAULT_THEME];

  try {
    const token = process.env.GITHUB_TOKEN || "";
    const [user, repos] = await Promise.all([
      fetchGitHubUser(username, token),
      fetchRepos(username, token),
    ]);

    const renderer = CARD_RENDERERS[card] || CARD_RENDERERS[DEFAULT_CARD];
    const svgContent = renderer(user, repos, theme, { width, height });
    const fullSvg = svgTag(svgContent, width || 480, height || 220);

    if (raw) {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.end(fullSvg);
    }

    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=7200");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.end(fullSvg);
  } catch (err) {
    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.end(svgTag(renderErrorCard(err.message, theme, width || 480, height || 160), width || 480, height || 160));
  }
};

function renderErrorCard(message, theme, W, H) {
  const t = theme;
  return `
  <rect width="${W}" height="${H}" rx="12" fill="${t.bg}" stroke="${t.red}" stroke-width="2"/>
  <text x="${W / 2}" y="${H / 2 - 8}" fill="${t.red}" font-size="14" text-anchor="middle" font-weight="600">Error</text>
  <text x="${W / 2}" y="${H / 2 + 16}" fill="${t.textMuted}" font-size="11" text-anchor="middle">${t.textMuted}</text>
`;
}
