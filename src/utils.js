function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatNumber(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "k";
  return String(n);
}

function roundedRect(x, y, w, h, r) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="var(--bg)" stroke="var(--border)" stroke-width="2"/>`;
}

function icon(name) {
  const icons = {
    star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z"/>',
    repo: '<path d="M4 9h16v2H4V9zm0 4h10v2H4v-2z"/><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm0 15.2L18.8 16H4V4h16v13.2z"/>',
    commit: '<circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>',
    people: '<path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8zm9 6a4 4 0 00-4-4h-.5"/>',
    fire: '<path d="M12 2C8.5 2 5 6 5 10c0 4 2.5 6.5 5 8l1-1c-2-1-3-2.5-3-5 0-2.5 2-4.5 4-4.5s4 2 4 4.5c0 2.5-1 4-3 5l1 1c2.5-1.5 5-4 5-8 0-4-3.5-8-7-8z"/>',
    code: '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 010-5H6m12 5h1.5a2.5 2.5 0 000-5H18M6 9v1a6 6 0 006 6h0a6 6 0 006-6V9M12 15v4m-3 0h6"/>',
  };
  return icons[name] || "";
}

function svgTag(children, width, height) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <style>
    :root { --bg: #0d1117; --bgAlt: #161b22; --border: #30363d; --text: #c9d1d9; --textMuted: #8b949e; --accent: #6e40c9; --green: #3fb950; --yellow: #d2991d; --red: #f85149; }
    text { font-family: 'Segoe UI', -apple-system, sans-serif; }
  </style>
${children}
</svg>`;
}

module.exports = { escapeXml, formatNumber, roundedRect, icon, svgTag };
