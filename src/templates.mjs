import { esc, isVideo } from "./render.mjs";

export function zone(config, category) {
  return config.categories[category] || { ...config.defaultCategory, label: category || config.defaultCategory.label };
}

export function linkLabel(url) {
  return /^https?:\/\/(www\.)?github\.com\//i.test(url) ? "View code" : "Try it live";
}

function media(src, alt, cls = "") {
  if (!src) return `<div class="media media--empty ${cls}" aria-hidden="true"></div>`;
  if (isVideo(src)) {
    return `<video class="media ${cls}" src="${esc(src)}" autoplay muted loop playsinline aria-label="${esc(alt)}"></video>`;
  }
  return `<img class="media ${cls}" src="${esc(src)}" alt="${esc(alt)}" loading="lazy">`;
}

function zoneStyle(z) {
  return `--zone:${z.color};--zone-ink:${z.ink}`;
}

function layout({ config, root, title, description, body, head = "", scripts = "" }) {
  const { links } = config;
  const contact = [
    links.email && `<a href="mailto:${esc(links.email)}">Email</a>`,
    links.github && `<a href="${esc(links.github)}" rel="me noopener">GitHub</a>`,
    links.linkedin && `<a href="${esc(links.linkedin)}" rel="me noopener">LinkedIn</a>`,
  ].filter(Boolean);

  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Schibsted+Grotesk:wght@500;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${root}styles.css">
${head}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <a class="wordmark" href="${root}">${esc(config.name)}</a>
  <nav aria-label="Main">
    <a href="${root}#projects">Projects</a>
    ${contact.length ? `<a href="${root}#contact">Contact</a>` : ""}
  </nav>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer" id="contact">
  <p class="footer-name">${esc(config.name)}</p>
  ${contact.length ? `<p class="footer-links">${contact.join("")}</p>` : ""}
</footer>
<script>
  // Respect reduced motion: stop looping cover videos and give people controls instead.
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("video[autoplay]").forEach(function (v) { v.pause(); v.removeAttribute("autoplay"); v.controls = true; });
  }
</script>
${scripts}
</body>
</html>
`;
}

export function homePage({ config, projects, menu }) {
  const directory = projects
    .map((p) => {
      const z = zone(config, p.category);
      return `<li style="${zoneStyle(z)}">
        <a href="projects/${esc(p.slug)}/">
          <span class="dir-zone">${esc(z.label)}</span>
          <span class="dir-title">${esc(p.title)}</span>
          <span class="dir-year">${p.year ?? ""}</span>
        </a>
      </li>`;
    })
    .join("\n");

  const zonesUsed = [...new Set(projects.map((p) => p.category))].map((c) => zone(config, c));
  const legend = zonesUsed
    .map((z) => `<li style="${zoneStyle(z)}"><span class="swatch" aria-hidden="true"></span>${esc(z.label)}</li>`)
    .join("");

  const body = `
<section class="hero">
  <div class="hero-text">
    <h1>${esc(config.name)}</h1>
    <p class="intro">${esc(config.intro)}</p>
  </div>
  <div class="directory" aria-label="Project directory">
    <h2 class="directory-heading">Directory</h2>
    ${projects.length ? `<ul class="directory-list">${directory}</ul>` : `<p class="empty">No projects are published yet. Tick "Featured on Portfolio" on a row in Notion, then rebuild.</p>`}
    ${legend ? `<ul class="legend" aria-label="Categories">${legend}</ul>` : ""}
  </div>
</section>
<section class="menu-section" id="projects" aria-labelledby="menu-heading">
  <h2 class="menu-heading" id="menu-heading">Project menu</h2>
  <div class="stage">
    <div class="stage-lace" aria-hidden="true"></div>
    <div class="book-perspective">
      <div class="book">
        <div class="book-shadow" aria-hidden="true"></div>
        <div class="receipt-slot"><div class="receipt-wrap"><div class="receipt"></div></div></div>
        <div class="sheets"></div>
        <div class="spine" aria-hidden="true"></div>
      </div>
    </div>
  </div>
  <script type="application/json" id="menu-data">${JSON.stringify(menu).replace(/</g, "\\u003c")}</script>
</section>`;

  const head = `<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,700&family=Outfit:wght@700&family=Cedarville+Cursive&family=Monsieur+La+Doulaise&display=swap" rel="stylesheet">
<link rel="stylesheet" href="menu.css">`;
  const scripts = `<script src="menu.js"></script>`;

  return layout({ config, root: "", title: config.title, description: config.intro, body, head, scripts });
}

export function projectPage({ config, project: p, next, contentHtml }) {
  const z = zone(config, p.category);
  const meta = [
    p.role && ["Role", esc(p.role)],
    p.year && ["Year", String(p.year)],
    p.tools.length && ["Tools", p.tools.map(esc).join(", ")],
    ["Category", esc(z.label)],
  ].filter(Boolean);

  const body = `
<article class="case" style="${zoneStyle(z)}">
  <header class="case-header"><div class="case-header-inner">
    <a class="back-link" href="../../#projects">All projects</a>
    <h1>${esc(p.title)}</h1>
    ${p.summary ? `<p class="case-summary">${esc(p.summary)}</p>` : ""}
    <dl class="case-meta">${meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
    ${p.link ? `<p class="actions"><a class="btn btn--light" href="${esc(p.link)}" rel="noopener">${linkLabel(p.link)}</a></p>` : ""}
  </div></header>
  <div class="case-cover">${media(p.cover, p.title, "media--cover")}</div>
  <div class="prose">
    ${contentHtml || `<p class="empty">The full write-up for this project is on its way.</p>`}
  </div>
  ${
    next
      ? `<nav class="next" aria-label="Next project" style="${zoneStyle(zone(config, next.category))}">
    <a href="../${esc(next.slug)}/"><span class="next-label">Next project</span><span class="next-title">${esc(next.title)}</span></a>
  </nav>`
      : ""
  }
</article>`;

  return layout({
    config,
    root: "../../",
    title: `${p.title} | ${config.title}`,
    description: p.summary || config.intro,
    body,
  });
}
