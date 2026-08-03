const { fetchGitHubUser, fetchRepos } = require("../src/fetch");
const { themes } = require("../src/themes");
const { svgTag } = require("../src/utils");
const { renderStatsCard } = require("../src/cards/stats-card");
const { renderStreakCard } = require("../src/cards/streak-card");
const { renderLanguagesCard } = require("../src/cards/languages-card");
const { renderTrophyCard } = require("../src/cards/trophy-card");

const CARD_RENDERERS = { stats: renderStatsCard, streak: renderStreakCard, languages: renderLanguagesCard, trophy: renderTrophyCard };
const CARD_SIZES = { stats: [500, 240], streak: [500, 240], languages: [500, 240], trophy: [500, 220] };

module.exports = async function handler(req, res) {
  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const username = searchParams.get("username") || "PTFacts";
  const card = searchParams.get("card") || "stats";
  const themeName = searchParams.get("theme") || "tokyonight";

  const theme = themes[themeName] || themes.tokyonight;
  const [defW, defH] = CARD_SIZES[card] || [480, 220];

  try {
    const token = process.env.GITHUB_TOKEN || "";
    const [user, repos] = await Promise.all([
      fetchGitHubUser(username, token),
      fetchRepos(username, token),
    ]);

    const renderer = CARD_RENDERERS[card] || CARD_RENDERERS.stats;
    const svgContent = renderer(user, repos, theme, { width: defW, height: defH });
    const fullSvg = svgTag(svgContent, defW, defH);

    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=7200");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.end(fullSvg);
  } catch (err) {
    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.end(svgTag(errorCard(theme, defW, defH), defW, defH));
  }
};

function errorCard(t, W, H) {
  return `
  <rect width="${W}" height="${H}" rx="14" fill="${t.bg}" stroke="${t.red}" stroke-width="2"/>
  <text x="${W/2}" y="${H/2-6}" fill="${t.red}" font-size="14" text-anchor="middle" font-weight="700">Error loading card</text>
  <text x="${W/2}" y="${H/2+14}" fill="${t.textMuted}" font-size="11" text-anchor="middle">Set GITHUB_TOKEN env var on Vercel</text>
`;
}
