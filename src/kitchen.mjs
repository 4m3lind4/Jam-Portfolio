// Project pages told as a walk through the kitchen. A project gets this layout
// by having an entry here. Its properties (cover, tools, year, link) come from
// Notion, and storyFromNotion swaps in the text of its Notion page, section by
// heading. The text below is the fallback for any section the page doesn't have.
import { richText, renderBlocks, mediaUrl } from "./render.mjs";
import { boardArt, bowlArt, paperArt, ovenArt, plateArt } from "./kitchen-art.mjs";

export const KITCHENS = {
  periodt: {
    heading: "A Period Tracker Designed Around Athletic Performance",
    role: "UX/UI Designer · Developer · Team Coordinator",
    course: "Introduction to iOS Development, UTS",
    focus: "UX/UI · Product Design · Software Development · Team Collaboration",
    overview: [
      "PeriodT is an athlete-focused period tracking concept designed to help athletes understand how their menstrual cycle may interact with <strong>training, recovery and performance</strong>.",
      "The project was developed within a two-week development period and combined interaction design with software development.",
    ],
    scenes: [
      {
        id: "challenge",
        art: boardArt,
        step: "01",
        title: "The Challenge",
        html: `<p>Traditional period trackers primarily focus on menstrual health and cycle prediction. For athletes, however, the menstrual cycle can also intersect with:</p>
          <ul><li>Training</li><li>Energy levels</li><li>Recovery</li><li>Exercise</li><li>Performance</li></ul>
          <p>The goal was to explore how menstrual information could be presented in a way that was more relevant to an athlete's training routine.</p>`,
      },
      {
        id: "research",
        art: bowlArt,
        step: "02",
        title: "Research & Team Planning",
        html: `<p>Because the project focused on a problem space I was personally familiar with as an athlete, I was able to bring contextual knowledge into the research and ideation process.</p>
          <p>At the beginning of the project, I worked with my team to identify individual strengths, interests and development goals.</p>
          <p>We then allocated responsibilities across the project based on these strengths while maintaining shared ownership of the final product.</p>`,
      },
      {
        id: "lofi",
        art: paperArt,
        step: "03",
        title: "Low-Fidelity Design",
        html: `<p>With less than two weeks to complete the project, another team member and I rapidly developed the initial low-fidelity prototype.</p>
          <p>We established the core user flows before refining the concept into a mid-fidelity design.</p>
          <p>I took responsibility for reviewing the mid-fidelity experience and ensuring that the interactions and visual hierarchy remained consistent across the product.</p>`,
      },
      {
        id: "development",
        art: ovenArt,
        step: "04",
        title: "Product Development",
        kicker: "Translating the design into a working product",
        html: `<p>Once the core screens were confirmed, the team divided the development workload across the main product flows:</p>
          <ul><li>Onboarding questionnaire</li><li>Cycle home screen</li><li>Calendar</li><li>Predicted period</li><li>Workout and exercise information</li></ul>
          <p>I contributed to the software development process and worked with the team through GitHub to combine and integrate our individual components.</p>
          <p>This required us to maintain consistency between the design and the implemented product while working within a highly compressed timeline.</p>`,
      },
      {
        id: "plated",
        art: plateArt,
        step: "05",
        title: "Final Product",
        html: `<p>The final concept provided athletes with cycle-related information alongside training and exercise guidance.</p>
          <p>The experience was designed to help users move beyond simply <strong>predicting their period</strong> towards understanding how their cycle could be considered within their broader training routine.</p>
          <h3>Best Interaction Design, TechFest</h3>
          <p>Selected from 40 selected projects and 200+ applicants. I also completed the course with a High Distinction.</p>
          <p>Following the project, PeriodT received interest from industry and is currently being explored for further development.</p>`,
      },
    ],
    brought: [
      ["Product thinking", "Connected menstrual-cycle tracking with the specific needs of athletes."],
      ["UX/UI", "Contributed to the core interaction flows and visual design."],
      ["Development", "Contributed to implementing the product and integrating team code through GitHub."],
      ["Team coordination", "Helped allocate development responsibilities according to team strengths and project requirements."],
      ["Outcome", "Delivered an award-winning interaction design concept within a two-week development period."],
    ],
  },
};

// Headings are matched without their numbering, so "01 — The Challenge" works.
const SECTIONS = {
  overview: "overview",
  "the challenge": "challenge",
  "research & team planning": "research",
  "research and team planning": "research",
  "low-fidelity design": "lofi",
  "product development": "development",
  "final product": "plated",
  outcome: "outcome",
  "what i brought to the project": "brought",
};
// How many images each scene takes from its section to use as art.
const SHOT_SCENES = { lofi: 3, plated: 1 };
const HEADING = /^heading_[123]$/;
const plain = (b) => (b[b.type]?.rich_text || []).map((t) => t.plain_text).join("").trim();
const keyOf = (b) => SECTIONS[plain(b).replace(/^\d+\s*[—–.:-]*\s*/, "").trim().toLowerCase()];

// Toggle headings keep their content as children, so lay those out flat.
const flatten = (blocks) =>
  blocks.flatMap((b) => (HEADING.test(b.type) && b.children ? [{ ...b, children: undefined }, ...flatten(b.children)] : [b]));

export async function storyFromNotion(fallback, blocks, asset) {
  const flat = flatten(blocks);
  const found = {};
  const titles = {};
  let subtitle = null;
  let current = null;
  for (const b of flat) {
    if (HEADING.test(b.type)) {
      const key = keyOf(b);
      if (key) {
        current = found[key] = [];
        titles[key] = plain(b).replace(/^\d+\s*[—–.:-]*\s*/, "").trim();
        continue;
      }
      // An unknown top-level heading ends the section; smaller ones belong to it.
      if (b.type !== "heading_3") {
        if (!Object.keys(found).length) subtitle = plain(b);
        current = null;
        continue;
      }
    }
    if (current && b.type !== "divider") current.push(b);
  }

  const field = (name) => {
    const b = flat.find((x) => x.type === "paragraph" && new RegExp(`^${name}\\s*:`, "i").test(plain(x)));
    return b ? plain(b).replace(/^[^:]*:\s*/, "") : null;
  };
  const html = (list) => renderBlocks(list, asset);

  const story = { ...fallback, role: field("Role") || fallback.role, course: field("Course") || fallback.course };
  const fromNotion = [];

  if (found.overview?.length) {
    story.overview = found.overview.filter((b) => b.type === "paragraph" && plain(b)).map((b) => richText(b.paragraph.rich_text));
    if (subtitle) story.heading = subtitle;
    fromNotion.push("Overview");
  }

  story.scenes = await Promise.all(
    fallback.scenes.map(async (scene) => {
      const list = found[scene.id];
      if (!list?.length) return scene;
      fromNotion.push(scene.title);
      // Images in these sections become the art: the wireframes on the paper,
      // and the finished screen on the plate. The rest stays on the ticket.
      const shots = SHOT_SCENES[scene.id] ? list.filter((b) => b.type === "image").slice(0, SHOT_SCENES[scene.id]) : [];
      const text = list.filter((b) => !shots.includes(b));
      const out = { ...scene, title: titles[scene.id], kicker: null, html: await html(text) };
      if (shots.length) out.shots = await Promise.all(shots.map(async (b) => ({ src: await asset(mediaUrl(b), "image"), caption: (b.image.caption || []).map((t) => t.plain_text).join("").trim() })));
      if (scene.id === "challenge") {
        // The five bullets name the five chopped slices. Any other shape keeps
        // the drawn labels, because the knife choreography is built for five.
        const items = list.filter((b) => b.type === "bulleted_list_item").map(plain);
        if (items.length === 5 && items.every((t) => t.length <= 16)) out.labels = items;
      }
      if (scene.id === "plated" && found.outcome?.length) out.html += await html(found.outcome);
      return out;
    })
  );

  // The oven bakes the same finished screen that's served on the plate.
  const plated = story.scenes.find((s) => s.id === "plated");
  if (plated?.shots) story.scenes = story.scenes.map((s) => (s.id === "development" ? { ...s, shots: plated.shots } : s));

  const rows = (found.brought || [])
    .filter((b) => b.type === "paragraph" && plain(b).includes(":"))
    .map((b) => {
      const text = plain(b);
      const at = text.indexOf(":");
      return [text.slice(0, at).trim(), text.slice(at + 1).trim()];
    });
  if (rows.length) {
    story.brought = rows;
    fromNotion.push("What I brought");
  }

  console.log(`Kitchen story: ${fromNotion.length ? `from Notion: ${fromNotion.join(", ")}` : "no matching sections in Notion"}.`);
  return story;
}
