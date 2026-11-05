// Builds the printed pages of the project menu from Notion projects.
// static/menu.js turns these pages into sheets and animates them on scroll.
import { esc, isVideo } from "./render.mjs";

const PER_PAGE = 2;

// Pill colours from the original menu, assigned to tools in order of first use.
const PILLS = [
  { bg: "#4b1726", ink: "#fff" },
  { bg: "#FF0866", ink: "#fff" },
  { bg: "#386592", ink: "#fff" },
  { bg: "#7e150e", ink: "#fff" },
  { bg: "#aeb0ac", ink: "#2C0714" },
];

function pillPalette(projects) {
  const map = new Map();
  for (const p of projects) for (const t of p.tools) if (!map.has(t)) map.set(t, PILLS[map.size % PILLS.length]);
  return map;
}

// Every project is served on a plate, handed out in menu order.
const PLATES = ["platter", "hearts", "scallop", "square", "rim"];

function dishMedia(p, plate) {
  if (!p.cover) return "";
  const media = isVideo(p.cover)
    ? `<video src="${esc(p.cover)}" muted loop playsinline autoplay aria-hidden="true"></video>`
    : `<img src="${esc(p.cover)}" alt="" loading="lazy">`;
  return `<div class="dish-media plate plate--${plate}">${media}</div>`;
}

function dish(p, pills, reverse, plate) {
  const tags = p.tools
    .map((t) => {
      const c = pills.get(t);
      return `<span class="tag" style="background:${c.bg};color:${c.ink}">${esc(t)}</span>`;
    })
    .join("");
  return `<a class="dish anim${reverse ? " reverse" : ""}" href="projects/${esc(p.slug)}/" target="_top">
    ${dishMedia(p, plate)}
    <div class="dish-body">
      <p class="dish-title">${esc(p.title)}</p>
      ${tags ? `<div class="tags">${tags}</div>` : ""}
      ${p.summary ? `<p class="dish-desc">${esc(p.summary)}</p>` : ""}
      ${p.role ? `<p class="dish-role">${esc(p.role)}${p.year ? `, ${p.year}` : ""}</p>` : ""}
    </div>
  </a>`;
}

function reviewsBlock(r) {
  return `<div class="reviews">
    <p class="reviews-title anim">${esc(r.title)}</p>
    <p class="reviews-sub anim">${esc(r.text)}</p>
    <div class="reviews-shot anim"><img src="${esc(r.image)}" alt="A judge's testimonial" loading="lazy"></div>
  </div>`;
}

function page(banner, align, items) {
  return `<div class="page-body">
    <div class="menu-banner anim${align === "right" ? " right" : ""}">${esc(banner)}</div>
    ${items.join("\n")}
  </div>`;
}

// Deterministic "price" per project for the bill, so it doesn't change between builds.
function price(slug) {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return 12 + (h % 170) + ((h >> 8) % 4) * 0.25;
}

export function buildMenu(config, projects) {
  const m = config.menu;
  const pills = pillPalette(projects);

  // Group into sections in the configured order; unknown categories go last.
  const known = m.sections.map((s) => s.category);
  const groups = m.sections
    .map((s) => ({ banner: s.banner, items: projects.filter((p) => p.category === s.category) }))
    .concat([{ banner: m.otherBanner, items: projects.filter((p) => !known.includes(p.category)) }])
    .filter((g) => g.items.length);

  // Lay each section out across as many pages as it needs.
  // A reviews block takes up one dish slot on the page of its project.
  const pages = [];
  let served = 0;
  for (const g of groups) {
    let slots = [];
    const flush = () => {
      if (!slots.length) return;
      // A dish alone on its page gets the large feature layout.
      if (slots.length === 1) slots[0] = slots[0].replace('class="dish anim', 'class="dish dish--feature anim');
      const align = pages.length % 2 ? "right" : "left";
      pages.push(page(g.banner, align, slots));
      slots = [];
    };
    for (const p of g.items) {
      const withReviews = m.reviews && m.reviews.slug === p.slug;
      const need = withReviews ? 2 : 1;
      if (slots.length + need > PER_PAGE) flush();
      slots.push(dish(p, pills, slots.length % 2 === 1, PLATES[served++ % PLATES.length]));
      if (withReviews) slots.push(reviewsBlock(m.reviews));
    }
    flush();
  }

  const cover = `<div class="page-body">
    <div class="cover-card anim"><img class="cover-card-img" src="menu/cover-front.png" alt="Project menu"></div>
  </div>`;

  const backcover = `<div class="page-body">
    ${m.backCover.map((l) => `<p class="bc-line anim">${esc(l)}</p>`).join("")}
    <div class="bc-gap"></div>
    ${m.contact.map((l) => `<p class="bc-contact anim">${esc(l)}</p>`).join("")}
  </div>`;

  const filler = `<div class="page-body page-filler">
    <p class="filler-line anim">More on the way.</p>
  </div>`;

  const lines = projects.map((p) => ({ title: p.title, value: price(p.slug) }));
  const subtotal = lines.reduce((a, l) => a + l.value, 0);
  const gst = subtotal / 11;
  const b = m.bill;
  const bill = `
  <div class="r-center anim">
    <img class="r-logo" src="menu/brand-logo.png" alt="">
    <p class="r-brand">${esc(b.brand)}</p>
    <p class="r-sub">${esc(b.place)}</p>
    <p class="r-sub" data-table-time>Table 1, 1 guest</p>
    ${b.contact.map((c) => `<p class="r-sub">${esc(c)}</p>`).join("")}
  </div>
  <hr class="r-rule anim">
  ${lines
    .map((l) => `<div class="r-row anim"><span class="q">1</span><span class="l">${esc(l.title)}</span><span class="v">${l.value.toFixed(2)}</span></div>`)
    .join("")}
  <hr class="r-rule anim">
  <div class="r-row anim"><span class="q"></span><span class="l">Includes GST</span><span class="v">${gst.toFixed(2)}</span></div>
  <hr class="r-rule anim">
  <div class="r-row total anim"><span class="l">TOTAL</span><span class="v">${subtotal.toFixed(2)}</span></div>
  <p class="r-note anim">${esc(b.card)}</p>
  <hr class="r-rule anim">
  <p class="r-thanks anim">Please come again!</p>
  <div class="r-barcode anim"></div>
  <p class="r-note r-spaced anim">THANK YOU!</p>`;

  return { cover, pages, backcover, filler, bill };
}
