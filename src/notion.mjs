import notionClient from "@notionhq/client";

const { Client } = notionClient;

const MAX_DEPTH = 3;

export function createNotionSource({ token, dataSourceId }) {
  if (!token) throw new Error("NOTION_TOKEN is not set. Add it as an environment variable or GitHub secret.");
  if (!dataSourceId) throw new Error("NOTION_DATA_SOURCE_ID is not set.");
  const notion = new Client({ auth: token });

  async function queryProjects() {
    const pages = [];
    let cursor;
    do {
      const res = await notion.dataSources.query({
        data_source_id: dataSourceId,
        start_cursor: cursor,
        filter: { property: "Featured on Portfolio", checkbox: { equals: true } },
        sorts: [{ property: "Order", direction: "ascending" }],
      });
      pages.push(...res.results);
      cursor = res.has_more ? res.next_cursor : undefined;
    } while (cursor);
    return pages;
  }

  async function getBlocks(blockId, depth = 0) {
    const blocks = [];
    let cursor;
    do {
      const res = await notion.blocks.children.list({ block_id: blockId, start_cursor: cursor, page_size: 100 });
      for (const block of res.results) {
        if (block.has_children && depth < MAX_DEPTH && block.type !== "child_page" && block.type !== "child_database") {
          block.children = await getBlocks(block.id, depth + 1);
        }
        blocks.push(block);
      }
      cursor = res.has_more ? res.next_cursor : undefined;
    } while (cursor);
    return blocks;
  }

  async function queryResume(resumeDataSourceId) {
    const rows = [];
    let cursor;
    do {
      const res = await notion.dataSources.query({
        data_source_id: resumeDataSourceId,
        start_cursor: cursor,
        filter: { property: "Show on Portfolio", checkbox: { equals: true } },
        sorts: [{ property: "Order", direction: "ascending" }],
      });
      rows.push(...res.results);
      cursor = res.has_more ? res.next_cursor : undefined;
    } while (cursor);
    return rows;
  }

  return { queryProjects, getBlocks, queryResume };
}

// ---- Property helpers (work on Notion API page objects) ----

const plain = (rich = []) => rich.map((t) => t.plain_text).join("").trim();

function prop(page, name) {
  return page.properties?.[name];
}

function text(page, name) {
  const p = prop(page, name);
  if (!p) return "";
  if (p.type === "title") return plain(p.title);
  if (p.type === "rich_text") return plain(p.rich_text);
  if (p.type === "url") return p.url || "";
  if (p.type === "select") return p.select?.name || "";
  return "";
}

function number(page, name) {
  const p = prop(page, name);
  return p?.type === "number" ? p.number : null;
}

function multi(page, name) {
  const p = prop(page, name);
  return p?.type === "multi_select" ? p.multi_select.map((o) => o.name) : [];
}

function files(page, name) {
  const p = prop(page, name);
  if (p?.type !== "files") return [];
  return p.files
    .map((f) => (f.type === "external" ? f.external.url : f.file?.url))
    .filter(Boolean);
}

export function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toProject(page) {
  const title = text(page, "Project name") || "Untitled project";
  const slug = slugify(text(page, "Slug") || title) || page.id;
  return {
    id: page.id,
    title,
    slug,
    summary: text(page, "Summary"),
    role: text(page, "My Role"),
    category: text(page, "Category"),
    year: number(page, "Year"),
    order: number(page, "Order"),
    tools: multi(page, "Tools"),
    link: text(page, "Link"),
    covers: files(page, "Cover Image"),
  };
}

export function toResumeRow(page) {
  return {
    title: text(page, "Title"),
    section: text(page, "Section"),
    note: text(page, "Note"),
    meta: text(page, "Role & Dates"),
    description: text(page, "Description"),
    order: number(page, "Order"),
  };
}
