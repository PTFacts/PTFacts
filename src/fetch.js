const https = require("https");

const CACHE = new Map();
const CACHE_TTL = 3600000;

function fetchJSON(url, token) {
  const key = `${url}@${token || "noauth"}`;
  const cached = CACHE.get(key);
  if (cached && Date.now() - cached.time < CACHE_TTL) return cached.data;

  return new Promise((resolve, reject) => {
    const headers = { "User-Agent": "PTFacts-Git-Stats", Accept: "application/vnd.github.v3+json" };
    if (token) headers.Authorization = `token ${token}`;

    https.get(url, { headers }, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => {
        try {
          if (res.statusCode !== 200) return reject(new Error(`GitHub API: ${res.statusCode}`));
          const data = JSON.parse(body);
          CACHE.set(key, { data: Promise.resolve(data), time: Date.now() });
          resolve(data);
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

async function fetchGitHubUser(username, token) {
  return fetchJSON(`https://api.github.com/users/${username}`, token);
}

async function fetchRepos(username, token) {
  return fetchJSON(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`, token);
}

async function fetchEvents(username, token) {
  return fetchJSON(`https://api.github.com/users/${username}/events/public?per_page=100`, token);
}

module.exports = { fetchGitHubUser, fetchRepos, fetchEvents, fetchJSON };
