// Builds the static site into dist/ from the Notion "Projects" database.
//   npm run build        -> real Notion data (needs NOTION_TOKEN and NOTION_DATA_SOURCE_ID)
//   npm run build:mock   -> sample data from fixtures/, no Notion access needed
import { mkdir, rm, writeFile, readFile, copyFile, cp } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import config from "../site.config.mjs";
import { createNotionSource, toProject, toResumeRow } from "./notion.mjs";
import { renderBlocks } from "./render.mjs";
import { aboutPage, homePage, kitchenPage, projectPage } from "./templates.mjs";
import { KITCHENS, storyFromNotion } from "./kitchen.mjs";
import { buildMenu } from "./menu.mjs";
import { buildAbout } from "./about.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const ASSETS = path.join(DIST, "assets");
const MOCK = process.argv.includes("--mock");

async function mockSource() {
  const data = JSON.parse(await readFile(path.join(ROOT, "fixtures/notion.json"), "utf8"));
  return {
    queryProjects: async () =>
      data.pages
        .filter((p) => p.properties["Featured on Portfolio"]?.checkbox)
        .sort((a, b) => (a.properties.Order?.number ?? 1e9) - (b.properties.Order?.number ?? 1e9)),
    getBlocks: async (id) => data.blocks[id] || [],
    queryResume: async () => data.resume.filter((p) => p.properties["Show on Portfolio"]?.checkbox),
  };
}

// Notion file URLs expire after about an hour, so every file is copied into dist/assets.
const downloaded = new Map();
async function asset(url) {
  if (!url) return "";
  if (downloaded.has(url)) return downloaded.get(url);
  const clean = url.split(/[?#]/)[0];
  const ext = (path.extname(clean) || ".bin").toLowerCase();
  const isNotionHosted = /amazonaws\.com|notion-static\.com|notion\.so|notionusercontent/.test(url);
  let result = url;
  if (url.startsWith("fixture:")) {
    const name = url.slice("fixture:".length);
    await copyFile(path.join(ROOT, "fixtures", name), path.join(ASSETS, name));
    result = `assets/${name}`;
  } else if (isNotionHosted) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download failed (${res.status}) for ${clean}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const name = createHash("sha1").update(buf).digest("hex").slice(0, 12) + ext;
    await writeFile(path.join(ASSETS, name), buf);
    result = `assets/${name}`;
  }
  downloaded.set(url, result);
  return result;
}

const fromRoot = (p, prefix) => (p && p.startsWith("assets/") ? prefix + p : p);

async function main() {
  const source = MOCK
    ? await mockSource()
    : createNotionSource({ token: process.env.NOTION_TOKEN, dataSourceId: process.env.NOTION_DATA_SOURCE_ID });

  await rm(DIST, { recursive: true, force: true });
  await mkdir(ASSETS, { recursive: true });
  await cp(path.join(ROOT, "static"), DIST, { recursive: true });
  await mkdir(path.join(DIST, "vendor"), { recursive: true });
  for (const file of ["gsap.min.js", "ScrollTrigger.min.js"]) {
    await copyFile(path.join(ROOT, "node_modules/gsap/dist", file), path.join(DIST, "vendor", file));
  }

  // About the Chef is optional: if Notion can't be read, the rest still builds
  // and the header leaves out the About link.
  let aboutHtml = "";
  if (config.about?.pageId) {
    try {
      const blocks = await source.getBlocks(config.about.pageId);
      const rows = config.about.resumeDataSourceId
        ? (await source.queryResume(config.about.resumeDataSourceId)).map(toResumeRow)
        : [];
      const prefixAsset = async (url, kind) => fromRoot(await asset(url, kind), "../");
      aboutHtml = await buildAbout(config, { blocks, rows }, prefixAsset, "../");
    } catch (err) {
      console.warn(`Skipped About the Chef: ${err.message}`);
    }
  }
  const site = { ...config, about: aboutHtml ? config.about : null };

  const pages = await source.queryProjects();
  const projects = pages.map(toProject);

  const seen = new Set();
  for (const p of projects) {
    if (seen.has(p.slug)) {
      const fixed = `${p.slug}-${p.id.slice(0, 4)}`;
      console.warn(`Duplicate slug "${p.slug}" on "${p.title}". Using "${fixed}" instead; give it a unique Slug in Notion.`);
      p.slug = fixed;
    }
    seen.add(p.slug);
    p.coverPath = await asset(p.covers[0]);
  }

  for (const [i, p] of projects.entries()) {
    const blocks = await source.getBlocks(p.id);
    const prefixAsset = async (url, kind) => fromRoot(await asset(url, kind), "../../");
    const next = projects.length > 1 ? projects[(i + 1) % projects.length] : null;
    const page = { config: site, project: { ...p, cover: fromRoot(p.coverPath, "../../") }, next };
    const html = KITCHENS[p.slug]
      ? kitchenPage({ ...page, story: await storyFromNotion(KITCHENS[p.slug], blocks, prefixAsset) })
      : projectPage({ ...page, contentHtml: await renderBlocks(blocks, prefixAsset) });
    const dir = path.join(DIST, "projects", p.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, "index.html"), html);
  }

  const homeProjects = projects.map((p) => ({ ...p, cover: p.coverPath }));
  const menu = buildMenu(config, homeProjects);

  const home = homePage({ config: site, projects: homeProjects, menu });
  await writeFile(path.join(DIST, "index.html"), home);
  if (aboutHtml) {
    await mkdir(path.join(DIST, "about"), { recursive: true });
    await writeFile(path.join(DIST, "about", "index.html"), aboutPage({ config: site, aboutHtml }));
  }
  await writeFile(path.join(DIST, ".nojekyll"), "");

  console.log(`Built ${projects.length} project${projects.length === 1 ? "" : "s"} into dist/`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
