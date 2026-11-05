// Turns Notion blocks into HTML. Unsupported block types are skipped quietly.

export const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;
export const isVideo = (url) => VIDEO_EXT.test(url);

export function richText(rich = []) {
  return rich
    .map((t) => {
      let html = esc(t.plain_text).replace(/\n/g, "<br>");
      const a = t.annotations || {};
      if (a.code) html = `<code>${html}</code>`;
      if (a.bold) html = `<strong>${html}</strong>`;
      if (a.italic) html = `<em>${html}</em>`;
      if (a.strikethrough) html = `<s>${html}</s>`;
      if (a.underline) html = `<u>${html}</u>`;
      const href = t.href || t.text?.link?.url;
      if (href && /^https?:\/\//.test(href)) html = `<a href="${esc(href)}" rel="noopener">${html}</a>`;
      return html;
    })
    .join("");
}

function mediaUrl(b) {
  const m = b[b.type];
  return m?.type === "external" ? m.external?.url : m?.file?.url;
}

// `asset(url, kind)` downloads a Notion-hosted file and returns its local path.
export async function renderBlocks(blocks = [], asset) {
  const out = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    // Group consecutive list items into one list element.
    if (b.type === "bulleted_list_item" || b.type === "numbered_list_item") {
      const tag = b.type === "bulleted_list_item" ? "ul" : "ol";
      const items = [];
      while (i < blocks.length && blocks[i].type === b.type) {
        const item = blocks[i];
        const nested = item.children ? await renderBlocks(item.children, asset) : "";
        items.push(`<li>${richText(item[item.type].rich_text)}${nested}</li>`);
        i++;
      }
      i--;
      out.push(`<${tag}>${items.join("")}</${tag}>`);
      continue;
    }
    out.push(await renderBlock(b, asset));
  }
  return out.filter(Boolean).join("\n");
}

async function renderBlock(b, asset) {
  const d = b[b.type] || {};
  const kids = b.children ? await renderBlocks(b.children, asset) : "";
  switch (b.type) {
    case "paragraph": {
      const inner = richText(d.rich_text);
      return inner ? `<p>${inner}</p>${kids}` : kids;
    }
    case "heading_1":
    case "heading_2":
      return `<h2>${richText(d.rich_text)}</h2>${kids}`;
    case "heading_3":
      return `<h3>${richText(d.rich_text)}</h3>${kids}`;
    case "quote":
      return `<blockquote>${richText(d.rich_text)}${kids}</blockquote>`;
    case "callout":
      return `<aside class="callout"><div>${richText(d.rich_text)}${kids}</div></aside>`;
    case "toggle":
      return `<details><summary>${richText(d.rich_text)}</summary>${kids}</details>`;
    case "to_do":
      return `<p class="todo"><input type="checkbox" disabled${d.checked ? " checked" : ""}> ${richText(d.rich_text)}</p>`;
    case "code":
      return `<pre><code>${esc(d.rich_text.map((t) => t.plain_text).join(""))}</code></pre>`;
    case "divider":
      return `<hr>`;
    case "column_list":
      return `<div class="columns">${kids}</div>`;
    case "column":
      return `<div class="column">${kids}</div>`;
    case "image": {
      const src = await asset(mediaUrl(b), "image");
      const cap = richText(d.caption);
      return `<figure><img src="${esc(src)}" alt="${esc(d.caption?.map((t) => t.plain_text).join("") || "")}" loading="lazy">${cap ? `<figcaption>${cap}</figcaption>` : ""}</figure>`;
    }
    case "video": {
      const url = mediaUrl(b);
      if (d.type === "external" && !isVideo(url)) return embed(url);
      const src = await asset(url, "video");
      return `<figure><video src="${esc(src)}" controls playsinline preload="metadata"></video></figure>`;
    }
    case "embed":
    case "bookmark":
    case "link_preview":
      return embed(d.url);
    default:
      return "";
  }
}

function embed(url) {
  if (!url) return "";
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  if (yt) {
    return `<figure class="embed"><iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}" title="Video" allowfullscreen loading="lazy"></iframe></figure>`;
  }
  if (/figma\.com\/(file|design|proto)\//.test(url)) {
    return `<figure class="embed"><iframe src="https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}" title="Figma prototype" allowfullscreen loading="lazy"></iframe></figure>`;
  }
  return `<p><a class="bookmark" href="${esc(url)}" rel="noopener">${esc(url.replace(/^https?:\/\//, ""))}</a></p>`;
}
