# Jam Portfolio

A static portfolio site that reads its projects from the **Projects** database on the "Jam Portfolio" page in Notion. Edit a project in Notion, and the site picks up the change on the next build.

## How it works

1. `src/build.mjs` queries the Notion data source for rows with **Featured on Portfolio** ticked, sorted by **Order**.
2. Cover images and any images or videos in a project's page are downloaded into `dist/assets/`, because Notion's file links expire after about an hour.
3. The home page opens on the directory board, then the **project menu**: a scroll-driven book (ported from the original portfolio) whose pages, dishes and bill are printed from your Notion rows. Each Category becomes a menu section; set the order and banner names in `site.config.mjs` under `menu`.
4. **About the Chef** has its own page at `/about/`, linked from the header. It is built from the About the Chef page in Notion (its text is Chef's Comments; an image block replaces the portrait) and its Résumé table (Experience, Education, Skills, Awards). The IDs are in `site.config.mjs` under `about`.
5. Each row also gets a case-study page at `/projects/<Slug>/`, built from the row's page content.
6. A GitHub Action runs the build and deploys `dist/` to GitHub Pages.

| Notion property | Used for |
| --- | --- |
| Project name | Card and page title |
| Summary | One-liner on the card and case-study header |
| Category | Colour zone (set colours in `site.config.mjs`) |
| Year, My Role, Tools | Card details and case-study header |
| Order | Card order (lowest first) |
| Slug | Case-study URL |
| Link | Button: "View code" for GitHub links, "Try it live" for anything else |
| Cover Image | Card and case-study image (images or .mp4/.webm video) |
| Featured on Portfolio | Only ticked rows are published |

## One-time setup

1. **Notion integration.** Create an internal integration at https://www.notion.so/my-integrations and copy its token. On the Projects database, open `•••` > **Connections** and add the integration.
2. **Repository secret.** In this repo, go to Settings > Secrets and variables > Actions:
   - Secrets tab: add `NOTION_TOKEN` with the integration token.
   - Variables tab: add `NOTION_DATA_SOURCE_ID` with `12511c25-c997-4223-88d6-021f22b8b46c`.
3. **GitHub Pages.** Settings > Pages > Build and deployment > Source: **GitHub Actions**.
4. Go to the Actions tab and run **Build from Notion and deploy**.

The site rebuilds on every push to `main`, every morning at 6am Sydney time, and whenever you press **Run workflow**.

## Working locally

```bash
npm install
npm run build:mock   # builds with sample data from fixtures/, no Notion token needed
npm run preview      # serves dist/ at http://localhost:3000

# real data
NOTION_TOKEN=secret_xxx NOTION_DATA_SOURCE_ID=12511c25-c997-4223-88d6-021f22b8b46c npm run build
```

## Changing things

- Name, intro line, contact links and category colours: `site.config.mjs`
- Page structure: `src/templates.mjs`
- Styling: `static/styles.css` (site), `static/about.css` (About the Chef) and `static/menu.css` (menu)
- Menu animation: `static/menu.js`; menu page layout: `src/menu.mjs`
- Supported Notion blocks (headings, paragraphs, lists, quotes, callouts, toggles, images, videos, code, dividers, columns, YouTube and Figma embeds): `src/render.mjs`
