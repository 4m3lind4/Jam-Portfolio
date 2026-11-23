import { esc, isVideo } from "./render.mjs";
import { artDefs, bookArt } from "./kitchen-art.mjs";

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

// A project's tags as on the menu: where it came from (Work, Education or
// Competition), and its tools, each in the colour the menu gives it.
const kindTag = (z) => `<p class="tag-kind" style="background:${z.color};color:${z.ink}">${esc(z.label)}</p>`;
const toolTags = (p) =>
  p.tags?.length
    ? `<ul class="tags" aria-label="Tools">${p.tags.map((t) => `<li class="tag" style="background:${t.bg};color:${t.ink}">${esc(t.name)}</li>`).join("")}</ul>`
    : "";

function zoneStyle(z) {
  return `--zone:${z.color};--zone-ink:${z.ink}`;
}

// The switch for the talking sound in speech bubbles (static/talk.js shows it).
export const SOUND_BUTTON = `<button class="talk-sound" type="button" aria-pressed="false" hidden><span aria-hidden="true">♪</span> <span class="talk-sound-label">Sound off</span></button>`;

const MENU_FONTS = `<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,700&family=Outfit:wght@700&family=Cedarville+Cursive&family=Monsieur+La+Doulaise&display=swap" rel="stylesheet">`;

// Torn top and bottom edges for a paper ticket.
function tornEdges(teeth = 18, depth = 1.2) {
  const pts = [];
  for (let i = 0; i <= teeth; i++) pts.push(`${((i / teeth) * 100).toFixed(2)}% ${i % 2 ? depth : 0}%`);
  for (let i = teeth; i >= 0; i--) pts.push(`${((i / teeth) * 100).toFixed(2)}% ${i % 2 ? 100 - depth : 100}%`);
  return `polygon(${pts.join(",")})`;
}

function layout({ config, root, title, description, body, head = "", scripts = "", bodyClass = "", footer = true, current = "" }) {
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
<body${bodyClass ? ` class="${bodyClass}"` : ""}>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <a class="wordmark" href="${root}"><img src="${root}jam-logo.webp" alt="${esc(config.name)}, home" width="44" height="44"></a>
  <nav aria-label="Main">
    ${config.about ? `<a href="${root}about/"${current === "about" ? ` aria-current="page"` : ""}>About</a>` : ""}
    <a href="${root}#welcome"${current === "projects" ? ` aria-current="page"` : ""}>Projects</a>
    ${contact.length ? `<a href="${root}#contact">Contact</a>` : ""}
  </nav>
</header>
<main id="main">
${body}
</main>
${
  footer
    ? `<footer class="site-footer" id="contact">
  <p class="footer-name">${esc(config.name)}</p>
  ${contact.length ? `<p class="footer-links">${contact.join("")}</p>` : ""}
</footer>`
    : ""
}
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

export function homePage({ config, menu }) {
  const body = `
<section class="welcome" id="welcome" aria-labelledby="welcome-title">
  <div class="welcome-pin">
    <div class="welcome-room" aria-hidden="true">
      <div class="welcome-sign"><img src="jam-logo.webp" alt=""><span>Jam</span></div>
      <div class="welcome-door">
        <div class="welcome-glow"></div>
        <div class="door door--left"><span class="door-window"></span><span class="door-handle"></span></div>
        <div class="door door--right"><span class="door-window"></span><span class="door-handle"></span></div>
      </div>
      <div class="welcome-floor"></div>
    </div>
    <img class="waiter" src="menu/waiter.webp" alt="${esc(config.name)}, dressed for service, holding a plate" width="1573" height="1000">
    <div class="bubble welcome-bubble">
      <h1 class="talk-text" id="welcome-title">${config.welcome.map(esc).join(" ")}</h1>
      ${SOUND_BUTTON}
    </div>
    <div class="welcome-flash" aria-hidden="true"></div>
    <a class="welcome-go" href="#projects">${esc(config.welcomeCta)} <span aria-hidden="true">↓</span></a>
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
  <div class="menu-end" id="contact"></div>
  <script type="application/json" id="menu-data">${JSON.stringify(menu).replace(/</g, "\\u003c")}</script>
</section>`;

  // The site opens on About the Chef. Arriving at the bare address goes
  // there; every way into the restaurant (the Projects link, the car ride,
  // Back to the Menu, Contact) carries a #section, so those stay here.
  const head = `<script>if (!location.hash) location.replace("about/");</script>
${MENU_FONTS}
<link rel="stylesheet" href="menu.css">
<link rel="stylesheet" href="welcome.css">
<script>
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.add("welcome-on");
    addEventListener("load", function () { if (!window.__welcomeRan) document.documentElement.classList.remove("welcome-on"); });
  }
</script>`;
  const scripts = `<script src="talk.js"></script>
<script src="vendor/gsap.min.js"></script>
<script src="vendor/ScrollTrigger.min.js"></script>
<script src="welcome.js"></script>
<script src="menu.js"></script>`;

  return layout({ config, root: "", title: config.title, description: config.intro, body, head, scripts, bodyClass: "page-home", footer: false, current: "projects" });
}

// Hide what the sauce animation will reveal before first paint. If sauce.js
// never runs, the page is shown as normal once it has loaded.
const SAUCE_HEAD = `
<script>
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.add("sauce-on");
    addEventListener("load", function () { if (!window.__sauceRan) document.documentElement.classList.remove("sauce-on"); });
  }
</script>`;

export function aboutPage({ config, aboutHtml }) {
  const sauce = aboutHtml.includes('class="sauce"');
  return layout({
    config,
    root: "../",
    title: `${config.about.heading} | ${config.title}`,
    description: config.intro,
    body: aboutHtml,
    head: `${MENU_FONTS}
<link rel="stylesheet" href="../about.css">${sauce ? SAUCE_HEAD : ""}
<script>
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.add("folder-on");
    addEventListener("load", function () { if (!window.__folderRan) document.documentElement.classList.remove("folder-on"); });
  }
</script>`,
    scripts: `<script src="../talk.js"></script>
<script src="../vendor/gsap.min.js"></script>
<script src="../vendor/ScrollTrigger.min.js"></script>
${sauce ? `<script src="../sauce.js"></script>\n` : ""}<script src="../about.js"></script>\n<script src="../ride.js"></script>`,
    bodyClass: "page-about",
    footer: false,
    current: "about",
  });
}

// Hide nothing, but give the scenes their scroll length only once the script is
// sure to run. Reduced motion and no-JS visitors get the stacked, static page.
const KITCHEN_HEAD = `
<link rel="stylesheet" href="../../kitchen.css">
<script>
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.add("kitchen-on");
    addEventListener("load", function () { if (!window.__kitchenRan) document.documentElement.classList.remove("kitchen-on"); });
  }
</script>`;

export function kitchenPage({ config, project: p, next, story }) {
  const root = "../../";
  const z = zone(config, p.category);
  const demo = config.demos?.[p.slug];
  const ticket = [
    ["Role", esc(story.role)],
    ["Course", esc(story.course)],
    p.year && ["Year", String(p.year)],
    p.tools.length && ["Tools", p.tools.map(esc).join(", ")],
    ["Category", esc(z.label)],
  ].filter(Boolean);

  const scenes = story.scenes
    .map(
      (s) => `<section class="scene scene--${s.id}" id="${s.id}" aria-labelledby="${s.id}-title">
  <div class="scene-pin">
    ${s.art(root, s.labels, s.shots, s.opts)}
    ${s.opts?.dish === "meatballs" ? `<button class="bite-btn" type="button">Tap the dish to take a bite</button>` : ""}
    <div class="scene-copy">
      <div class="scene-ticket">
        <p class="ticket-step">Step ${s.step}</p>
        <h2 id="${s.id}-title">${esc(s.title)}</h2>
        ${s.kicker ? `<p class="ticket-kicker">${esc(s.kicker)}</p>` : ""}
        ${s.html}
        ${s.id === "plated" && demo ? `<p class="ticket-links"><button class="app-open" type="button">Open the app <span aria-hidden="true">↗</span></button></p>` : ""}
      </div>
    </div>
  </div>
</section>`
    )
    .join("\n");

  const body = `${artDefs}
<article class="kitchen">
<section class="scene scene--intro" id="intro" aria-labelledby="intro-title">
  <div class="scene-pin">
    <div class="kitchen-dark" aria-hidden="true"></div>
    ${bookArt(p.cover, "", story.scenes.map((s) => ({ id: s.id, step: s.step, title: esc(s.title) })), esc(p.title), esc(story.course))}
    <div class="scene-copy">
      <div class="scene-ticket">
        ${kindTag(z)}
        <h1 id="intro-title" class="ticket-title">${esc(p.title)}</h1>
        ${toolTags(p)}
        <p class="ticket-kicker">${esc(story.heading)}</p>
        ${story.overview.map((t) => `<p>${t}</p>`).join("")}
        <dl class="ticket-meta">
          <div><dt>Role</dt><dd>${esc(story.role)}</dd></div>
          <div><dt>Course</dt><dd>${esc(story.course)}</dd></div>
        </dl>
        <p class="ticket-links">
          ${p.link ? `<a href="${esc(p.link)}" rel="noopener">${linkLabel(p.link)}</a>` : ""}
          <a href="#plated">Skip to the finished app</a>
        </p>
      </div>
    </div>
    <button class="lights" type="button" aria-pressed="true">Kitchen lights</button>
    <p class="scroll-cue" aria-hidden="true">Scroll to start cooking</p>
  </div>
</section>
${scenes}
<nav class="step-nav" aria-label="Steps in this project">
  ${story.scenes
    .map((s) => ({ id: s.id, title: s.title }))
    .concat([{ id: "brought", title: "What I brought" }])
    .map((s) => `<a href="#${s.id}"><span class="step-dot" aria-hidden="true"></span><span class="step-pill">${esc(s.title)}</span></a>`)
    .join("\n  ")}
</nav>
${demo ? `<dialog class="app-box" aria-label="${esc(p.title)} app" data-src="${root}${esc(demo.video || demo.path)}" data-kind="${demo.video ? "video" : "demo"}"${demo.gif ? ` data-gif="${root}${esc(demo.gif)}"` : ""}>
  <button class="app-close" type="button" aria-label="Close">×</button>
  <div class="app-phone"></div>
</dialog>` : ""}
<section class="kitchen-end" id="brought" aria-labelledby="brought-title">
  ${demo ? `<div class="kitchen-demo">
    <div class="kitchen-demo-copy">
      <h2>${esc(demo.title)}</h2>
      <p>${esc(demo.intro)}</p>
      ${demo.path ? `<p><a href="${root}${esc(demo.path)}" target="_blank" rel="noopener">Open it full screen <span aria-hidden="true">↗</span></a></p>` : ""}
    </div>
    <div class="phone">${
      demo.path
        ? `<iframe src="${root}${esc(demo.path)}" title="${esc(p.title)} app demo" loading="lazy"></iframe>`
        : `<video src="${root}${esc(demo.video)}"${demo.poster ? ` poster="${root}${esc(demo.poster)}"` : ""} controls playsinline preload="none" aria-label="${esc(p.title)} app walkthrough"></video>`
    }</div>
  </div>` : ""}
  ${demo?.path && demo.video ? `<div class="kitchen-walkthrough">
    <h2>The full walkthrough</h2>
    <p>Every screen of the finished app, recorded on iPhone.</p>
    <video src="${root}${esc(demo.video)}"${demo.poster ? ` poster="${root}${esc(demo.poster)}"` : ""} controls playsinline preload="none" aria-label="${esc(p.title)} app walkthrough"></video>
  </div>` : ""}
  ${story.slides ? `<div class="kitchen-slides prose">
    <h2>${esc(story.slides.title)}</h2>
    ${story.slides.html}
  </div>` : ""}
  <div class="kitchen-end-inner">
    <div class="brought">
      <h2 id="brought-title">What I brought to the project</h2>
      <dl>${story.brought.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
    </div>
    <aside class="case-ticket" aria-label="Project details">
      <div class="case-ticket-paper" style="clip-path:${tornEdges()}">
        <p class="ticket-head">Order details</p>
        <dl>${ticket.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
        <p class="ticket-thanks">Thank you!</p>
      </div>
    </aside>
  </div>
  <nav class="case-nav" aria-label="More projects">
    <a class="case-back" href="../../#projects"><span class="case-nav-label">Back to the</span><span class="case-nav-title">Menu</span></a>
    ${next ? `<a class="case-next" href="../${esc(next.slug)}/"><span class="case-nav-label">Next course</span><span class="case-nav-title">${esc(next.title)}</span></a>` : ""}
  </nav>
</section>
</article>`;

  return layout({
    config,
    root,
    title: `${p.title} | ${config.title}`,
    current: "projects",
    description: p.summary || config.intro,
    body,
    head: MENU_FONTS + KITCHEN_HEAD,
    scripts: `<script src="../../talk.js"></script>\n<script src="../../vendor/gsap.min.js"></script>\n<script src="../../vendor/ScrollTrigger.min.js"></script>\n<script src="../../kitchen.js"></script>\n<script src="../../stepnav.js"></script>${demo ? "\n<script src=\"../../appbox.js\"></script>" : ""}`,
    bodyClass: `page-case page-kitchen page-kitchen--${p.slug}`,
    footer: false,
  });
}

// A project's gallery: each piece in a 3D frame (a kiosk on a stand, a
// freestanding totem, a screen in a wall) that opens in a close-up.
function gallery(g, root) {
  const parts = {
    stand: (img) => `<div class="dev-screen">${img}</div><div class="dev-neck"></div><div class="dev-base"></div>`,
    totem: (img) => `<div class="dev-body"><div class="dev-screen">${img}</div><div class="dev-grille"></div></div><div class="dev-plinth"></div>`,
    wall: (img) => `<div class="dev-wall"><div class="dev-recess"><div class="dev-screen">${img}</div></div></div>`,
    photo: (img) => img,
  };
  const items = g.items
    .map((it, i) => {
      const img = `<img src="${root}${esc(it.src)}" alt="" loading="lazy">`;
      return `<li class="gal-item gal-item--${esc(it.frame)}">
      <button class="gal-open" type="button" data-gal="${i}" aria-label="Close-up: ${esc(it.title)}">
        <span class="dev dev--${esc(it.frame)}"><span class="dev-rig">${parts[it.frame](img)}</span></span>
      </button>
      <p class="gal-title">${esc(it.title)}</p>
      <template class="gal-text"><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p>${it.link ? `<p class="gal-link"><a href="${esc(it.link)}" target="_blank" rel="noopener">${esc(it.linkText || "Read more")} <span aria-hidden="true">↗</span></a></p>` : ""}</template>
    </li>`;
    })
    .join("\n");
  return `<section class="gallery" aria-labelledby="gallery-title">
  <h2 id="gallery-title">${esc(g.title)}</h2>
  ${g.intro ? `<p class="gallery-intro">${esc(g.intro)}</p>` : ""}
  <ul class="gal-list">${items}</ul>
  <dialog class="gal-box" aria-labelledby="gal-box-title">
    <button class="gal-close" type="button" aria-label="Close">×</button>
    <div class="gal-box-stage"></div>
    <div class="gal-box-copy" id="gal-box-title"></div>
  </dialog>
</section>`;
}

export function projectPage({ config, project: p, next, contentHtml }) {
  const z = zone(config, p.category);
  const section = config.menu.sections.find((s) => s.category === p.category);
  const banner = section ? section.banner : config.menu.otherBanner;
  const ticket = [
    p.role && ["Role", esc(p.role)],
    p.year && ["Year", String(p.year)],
    p.tools.length && ["Tools", p.tools.map(esc).join(", ")],
    ["Category", esc(z.label)],
  ].filter(Boolean);

  const body = `
<article class="case">
  <header class="case-hero">
    <div class="case-hero-inner">
      <div class="case-plate">${media(p.cover, p.title, config.menu.cutouts?.includes(p.slug) ? "media--cutout" : "")}</div>
      <div class="case-card">
        <p class="case-banner">${esc(banner)}</p>
        <div class="case-card-body">
          ${kindTag(z)}
          <h1>${esc(p.title)}</h1>
          ${toolTags(p)}
          ${p.summary ? `<p class="case-summary">${esc(p.summary)}</p>` : ""}
          ${p.role ? `<p class="case-role">${esc(p.role)}${p.year ? `, ${p.year}` : ""}</p>` : ""}
          ${p.link ? `<p class="actions"><a class="btn btn--order" href="${esc(p.link)}" rel="noopener">${linkLabel(p.link)}</a></p>` : ""}
        </div>
      </div>
    </div>
  </header>
  <div class="case-body">
    <div class="prose">
      ${contentHtml || `<p class="empty">The full write-up for this project is on its way.</p>`}
    </div>
    <aside class="case-ticket" aria-label="Project details">
      <div class="case-ticket-paper" style="clip-path:${tornEdges()}">
        <p class="ticket-head">Order details</p>
        <dl>${ticket.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
        <p class="ticket-thanks">Thank you!</p>
      </div>
    </aside>
  </div>
  ${config.galleries?.[p.slug] ? gallery(config.galleries[p.slug], "../../") : ""}
  <nav class="case-nav" aria-label="More projects">
    <a class="case-back" href="../../#projects"><span class="case-nav-label">Back to the</span><span class="case-nav-title">Menu</span></a>
    ${next ? `<a class="case-next" href="../${esc(next.slug)}/"><span class="case-nav-label">Next course</span><span class="case-nav-title">${esc(next.title)}</span></a>` : ""}
  </nav>
</article>`;

  return layout({
    config,
    root: "../../",
    title: `${p.title} | ${config.title}`,
    current: "projects",
    scripts: config.galleries?.[p.slug] ? `<script src="../../gallery.js"></script>` : "",
    description: p.summary || config.intro,
    body,
    head: MENU_FONTS,
    bodyClass: "page-case",
  });
}
