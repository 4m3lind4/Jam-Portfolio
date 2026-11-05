// The "About the Chef" heading as sauce: one stroke per word, hand-drawn for
// static/sauce.js to squeeze out of a bottle. Local coords per letter: baseline
// y=0, x-height -68, ascender -140. Stems and crossbars are retraced, so a whole
// word is poured without lifting the bottle.
import { esc } from "./render.mjs";

const LETTERS = {
  A: { w: 104, d: "M0,0 C18,-40 42,-112 60,-146 C66,-112 69,-82 73,-52 L26,-52 L73,-52 C76,-30 80,-14 84,-6 C88,2 96,0 104,-10" },
  b: { w: 62, d: "M9,-44 L12,-140 L9,-20 C9,-6 17,0 29,0 C46,0 58,-18 58,-36 C58,-56 44,-68 30,-68 C20,-68 13,-60 10,-46 L9,-20 C9,-6 17,0 29,0 C42,0 54,-3 62,-10" },
  o: { w: 66, d: "M9,-8 C14,-2 20,0 28,0 C46,0 58,-18 57,-36 C56,-56 42,-68 28,-68 C12,-68 2,-50 2,-32 C2,-12 14,0 30,0 C42,0 54,-3 66,-12" },
  u: { w: 74, d: "M5,-66 C3,-44 1,-26 4,-14 C8,0 20,3 30,-5 C39,-13 45,-40 47,-66 L45,-20 C45,-6 51,0 59,-1 C65,-2 69,-6 74,-12" },
  t: { w: 46, d: "M9,-36 L11,-68 L-7,-68 L31,-68 L11,-68 L13,-108 L9,-18 C9,-5 17,0 26,-1 C33,-2 39,-6 46,-12" },
  h: { w: 78, d: "M9,-44 L12,-140 L7,0 L10,-40 C18,-58 30,-68 41,-68 C52,-68 55,-58 53,-46 L51,-18 C51,-5 58,0 66,-2 C71,-3 74,-6 78,-12" },
  e: { w: 58, d: "M5,-30 C20,-30 47,-38 47,-54 C47,-65 36,-68 27,-68 C11,-68 2,-50 2,-32 C2,-12 14,0 29,0 C40,0 50,-4 58,-14" },
  C: { w: 82, d: "M78,-114 C70,-142 30,-146 14,-104 C-2,-62 6,0 48,0 C60,0 72,-5 82,-14" },
  f: { w: 40, d: "M9,-44 L9,-68 L-4,-68 L34,-68 L9,-68 L11,-110 C13,-134 28,-146 42,-132 C28,-146 13,-134 11,-110 L8,0" },
};

const PAIR = /(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g;
const shift = (d, dx, dy) => d.replace(PAIR, (_, x, y) => `${+x + dx},${+y + dy}`);
const lastPoint = (d) => [...d.matchAll(PAIR)].pop().slice(1).map(Number);
const firstPoint = (d) => d.match(PAIR)[0].split(",").map(Number);

const LETTER_GAP = 5;
const WORD_GAP = 38;
const BASELINE = 160;
const HEIGHT = 182;
const MARGIN = 18;

function wordPath(word, x) {
  let path = "";
  let pen = x;
  for (const ch of word) {
    const g = LETTERS[ch];
    const d = shift(g.d, pen, BASELINE);
    if (path) {
      const [ex, ey] = lastPoint(path);
      const [sx, sy] = firstPoint(d);
      const h = Math.max(6, (sx - ex) * 0.5);
      path += ` C${ex + h},${ey - h * 0.4} ${sx - h * 0.3},${sy + h * 0.6} ${sx},${sy} ${d.replace(/^M\S+ /, "")}`;
    } else {
      path = d;
    }
    pen += g.w + LETTER_GAP;
  }
  return { d: path, end: pen };
}

// The SVG for a heading, or null if it uses a letter that hasn't been drawn,
// in which case the heading stays plain text.
export function sauceLettering(text) {
  const words = text.trim().split(/\s+/);
  if (![...words.join("")].every((c) => LETTERS[c])) return null;

  let x = MARGIN;
  const paths = words.map((w) => {
    const { d, end } = wordPath(w, x);
    x = end + WORD_GAP;
    return d;
  });
  const width = Math.round(x - WORD_GAP + MARGIN);

  return `<span class="sauce-text">${esc(text)}</span>
  <svg class="sauce" viewBox="0 0 ${width} ${HEIGHT}" aria-hidden="true" focusable="false">
    <defs>
      <filter id="sauce-gloss" filterUnits="userSpaceOnUse" x="-40" y="-120" width="${width + 80}" height="${HEIGHT + 180}" color-interpolation-filters="sRGB">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="blur"/>
        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -7" result="goo"/>
        <feGaussianBlur in="goo" stdDeviation="3" result="height"/>
        <feDiffuseLighting in="height" surfaceScale="4.5" diffuseConstant="1.12" lighting-color="#fff" result="light"><feDistantLight azimuth="235" elevation="62"/></feDiffuseLighting>
        <feComposite in="goo" in2="light" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="shaded"/>
        <feSpecularLighting in="height" surfaceScale="6" specularConstant="0.8" specularExponent="30" lighting-color="#fff" result="shine"><feDistantLight azimuth="235" elevation="52"/></feSpecularLighting>
        <feComposite in="shine" in2="goo" operator="in" result="gloss"/>
        <feOffset in="goo" dy="2.5" result="drop"/>
        <feGaussianBlur in="drop" stdDeviation="2" result="dropBlur"/>
        <feFlood flood-color="#470b23" flood-opacity="0.28"/>
        <feComposite in2="dropBlur" operator="in" result="shadow"/>
        <feMerge><feMergeNode in="shadow"/><feMergeNode in="shaded"/><feMergeNode in="gloss"/></feMerge>
      </filter>
    </defs>
    <g class="sauce-liquid" filter="url(#sauce-gloss)">
      ${paths.map((d) => `<path class="sauce-word" d="${d}"/>`).join("\n      ")}
    </g>
  </svg>`;
}
