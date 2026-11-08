// "About the Chef": the Chef's Comments text from the About the Chef page in
// Notion, then the Résumé table grouped into Experience, Education, Skills
// and Awards. Styled after the résumé sheet in the original portfolio.
import { esc, renderBlocks } from "./render.mjs";
import { SOUND_BUTTON } from "./templates.mjs";
import { sauceLettering } from "./sauce.mjs";

// The first image block on the page becomes the portrait; the first heading
// becomes the label beside it. Everything else is the comments text.
async function splitPage(blocks, asset) {
  let photo = null;
  let label = "Chef's Comments";
  let labelTaken = false;
  const rest = [];
  for (const b of blocks) {
    if (!photo && b.type === "image") {
      const m = b.image;
      photo = await asset(m.type === "external" ? m.external.url : m.file.url);
      continue;
    }
    if (!labelTaken && /^heading_[123]$/.test(b.type)) {
      label = b[b.type].rich_text.map((t) => t.plain_text).join("").trim() || label;
      labelTaken = true;
      continue;
    }
    rest.push(b);
  }
  return { photo, label, blocks: rest };
}

function entry(row) {
  const title = `${esc(row.title)}${row.note ? `<br><span class="entry-note">${esc(row.note)}</span>` : ""}`;
  return `<div class="entry">
    <h3>${title}</h3>
    ${row.meta ? `<p class="meta">${esc(row.meta)}</p>` : ""}
    ${row.description ? `<p class="body">${esc(row.description)}</p>` : ""}
  </div>`;
}

const RENDER = {
  // Skills read as "Area: details" in one paragraph.
  Skills: (row) =>
    `<p class="body"><strong>${esc(row.title)}${row.description ? ":" : ""}</strong>${row.description ? ` ${esc(row.description)}` : ""}</p>`,
  // Awards read as "Award | Result, year" on one line.
  Awards: (row) => `<p class="body">${esc(row.title)}${row.meta ? ` | ${esc(row.meta)}` : ""}</p>`,
};

export async function buildAbout(config, { blocks, rows }, asset, root = "") {
  const a = config.about;
  const page = await splitPage(blocks, asset);
  const comments = await renderBlocks(page.blocks, asset);
  const photo = page.photo || (a.photo && root + a.photo);

  const order = a.sections;
  const names = [...new Set(rows.map((r) => r.section).filter(Boolean))].sort((x, y) => {
    const ix = order.indexOf(x) === -1 ? 99 : order.indexOf(x);
    const iy = order.indexOf(y) === -1 ? 99 : order.indexOf(y);
    return ix - iy;
  });

  // The résumé sits in a folder with a tab per section. Without scripts the
  // tabs are links and every sheet is shown, one after another.
  const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const tabs = names
    .map((name) => `<a class="folder-tab" href="#about-${esc(slug(name))}" id="tab-${esc(slug(name))}">${esc(name)}</a>`)
    .join("");
  const sheets = names
    .map((name) => {
      const render = RENDER[name] || entry;
      const items = rows.filter((r) => r.section === name).map(render).join("\n");
      return `<section class="about-block folder-sheet" id="about-${esc(slug(name))}" aria-labelledby="about-${esc(slug(name))}-title">
        <h2 class="label" id="about-${esc(slug(name))}-title">${esc(name)}</h2>
        ${items}
      </section>`;
    })
    .join("\n");
  const folder = names.length
    ? `<div class="folder" id="resume" style="--sheets:${names.length}">
    <div class="folder-pin">
      <div class="folder-case">
        <nav class="folder-tabs" aria-label="Résumé sections">${tabs}</nav>
        <div class="folder-pocket">${sheets}</div>
        <div class="folder-cover" aria-hidden="true"><span>${esc(config.name)}'s file</span></div>
      </div>
    </div>
  </div>`
    : "";

  return `<section class="about" id="about" aria-labelledby="about-heading">
  <h1 class="about-heading" id="about-heading">${sauceLettering(a.heading) || esc(a.heading)}</h1>
  <div class="about-intro">
    ${photo ? `<div class="portrait"><img src="${esc(photo)}" alt="${esc(config.name)} in a chef's hat"></div>` : ""}
    <div class="intro-copy bubble">
      <h2 class="label">${esc(page.label)}</h2>
      <div class="comments talk-text">${comments}</div>
      ${SOUND_BUTTON}
    </div>
  </div>
  ${folder}
  ${a.resumePdf ? `<div class="about-block"><a class="pdf" href="${esc(a.resumePdf)}" rel="noopener">Download PDF resume</a></div>` : ""}
</section>`;
}
