// The kitchen objects, drawn as inline SVG. Each one is authored in its final
// pose, which is also what reduced motion and no-JS visitors see. static/kitchen.js
// moves the parts by class name. All art shares a 800 x 620 stage whose counter
// starts at y=520, so objects line up with the steel counter behind them.
const stage = (name, inner) =>
  `<svg class="art art--${name}" viewBox="0 0 800 620" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">${inner}</svg>`;

export const artDefs = `<svg class="art-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
  <linearGradient id="k-steel" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f1f1f3"/><stop offset=".45" stop-color="#b9bbc1"/><stop offset=".55" stop-color="#8d8f97"/><stop offset="1" stop-color="#d7d8dc"/></linearGradient>
  <linearGradient id="k-steel-side" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#8d8f97"/><stop offset=".3" stop-color="#eeeef0"/><stop offset=".6" stop-color="#a9abb2"/><stop offset="1" stop-color="#6f7178"/></linearGradient>
  <linearGradient id="k-wood" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#c79a6b"/><stop offset="1" stop-color="#9c7147"/></linearGradient>
  <linearGradient id="k-veg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ff7fab"/><stop offset=".5" stop-color="#ff0866"/><stop offset="1" stop-color="#a80a47"/></linearGradient>
  <linearGradient id="k-bowl" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#d9d3bd"/><stop offset=".3" stop-color="#fbf9ef"/><stop offset=".7" stop-color="#ece8d6"/><stop offset="1" stop-color="#bdb6a0"/></linearGradient>
  <linearGradient id="k-blade" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fafafa"/><stop offset=".5" stop-color="#c4c6cc"/><stop offset="1" stop-color="#8e9098"/></linearGradient>
  <linearGradient id="k-cover" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#2c0714"/><stop offset=".12" stop-color="#6a1436"/><stop offset="1" stop-color="#470b23"/></linearGradient>
  <linearGradient id="k-cone" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff3cf" stop-opacity=".55"/><stop offset="1" stop-color="#fff3cf" stop-opacity="0"/></linearGradient>
  <radialGradient id="k-heat" cx=".5" cy=".6" r=".7"><stop offset="0" stop-color="#ffd27a"/><stop offset=".55" stop-color="#ff5c6e"/><stop offset="1" stop-color="#7a0f33"/></radialGradient>
  <linearGradient id="k-arm-fade" x1="0" x2="0" y1="0" y2="1"><stop offset=".72" stop-color="#fff"/><stop offset=".97" stop-color="#000"/></linearGradient>
  <clipPath id="k-screen"><rect x="6" y="6" width="138" height="294" rx="18"/></clipPath>
  <mask id="k-arm" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#k-arm-fade)"/></mask>
  <radialGradient id="k-icing" cx=".42" cy=".36" r=".75"><stop offset="0" stop-color="#ffb1cb"/><stop offset=".55" stop-color="#ff5a96"/><stop offset="1" stop-color="#c90a55"/></radialGradient>
</defs></svg>`;

// A hand photo, placed so the image point (px, py) sits at the group's origin.
// The arm fades out towards the cut edge of the photo.
const HANDS = {
  knife: { file: "hand-knife.png", w: 377, h: 1192 },
  cloth: { file: "hand-cloth.webp", w: 563, h: 895 },
  open: { file: "hand-open.png", w: 406, h: 993 },
};
// `mirror` flips the photo left to right before it's turned.
const hand = (root, name, px, py, scale, turn = 0, mirror = false) => {
  const { file, w, h } = HANDS[name];
  return `<image href="${root}kitchen/${file}" width="${w}" height="${h}" mask="url(#k-arm)" transform="rotate(${turn}) scale(${mirror ? -scale : scale} ${scale}) translate(${-px} ${-py})"/>`;
};

const shadow = (cx, cy, rx, ry, cls = "") =>
  `<ellipse class="k-shadow ${cls}" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`;

// The PeriodT home screen at three fidelities. The final layer is rebuilt from
// the "Your Cycle" screen in the portfolio design; lo and mid are its structure.
// A screenshot from Notion (`screen`) takes the place of the drawn final layer.
// `lo` and `mid` are images of the real low-fi and mid-fi designs; when given
// they replace the drawn stand-ins in those layers.
export function phone(cls = "", screen = null, lo = null, mid = null) {
  const tabs = ["Cycle", "Calendar", "Track", "Journal", "Exercise"]
    .map((t, i) => `<circle cx="${23 + i * 26}" cy="270" r="4" fill="${i ? "#3a2230" : "#ff2d6f"}"/><text x="${23 + i * 26}" y="282" text-anchor="middle" font-size="5" fill="#3a2230">${t}</text>`)
    .join("");
  return `<g class="phone ${cls}">
    <rect width="150" height="306" rx="23" fill="#1d1118"/>
    <rect x="6" y="6" width="138" height="294" rx="18" fill="#fff"/>
    <rect x="52" y="11" width="46" height="12" rx="6" fill="#1d1118"/>
    ${screen ? `<g class="ph-hi"><image href="${screen}" x="6" y="6" width="138" height="294" preserveAspectRatio="xMidYMid slice" clip-path="url(#k-screen)"/></g>` : `<g class="ph-hi k-sans">
      <text x="75" y="42" text-anchor="middle" font-size="12" fill="#2b1a22">Your Cycle</text>
      <rect x="16" y="50" width="118" height="30" rx="5" fill="#fff" stroke="#ff9fbf"/>
      <rect x="16" y="50" width="118" height="12" rx="5" fill="#ffd3e2"/>
      <text x="75" y="59" text-anchor="middle" font-size="6.5" fill="#ff2d6f">Upcoming event</text>
      <text x="75" y="73" text-anchor="middle" font-size="6.5" font-weight="700" fill="#2b1a22">29 days till Competition</text>
      <circle cx="75" cy="130" r="35" fill="none" stroke="#f4e9ef" stroke-width="10"/>
      <path d="M45,112 A35,35 0 0 1 105,112" fill="none" stroke="#ff7ea8" stroke-width="10" stroke-linecap="round"/>
      <text x="75" y="122" text-anchor="middle" font-size="7" fill="#ff5a8d">Period in</text>
      <text x="75" y="138" text-anchor="middle" font-size="16" font-weight="700" fill="#ff2d6f">7</text>
      <text x="75" y="149" text-anchor="middle" font-size="7" fill="#ff5a8d">Days</text>
      <rect x="16" y="178" width="118" height="70" rx="5" fill="#fff" stroke="#ff9fbf"/>
      <rect x="16" y="178" width="118" height="16" rx="5" fill="#ffd3e2"/>
      <text x="75" y="190" text-anchor="middle" font-size="7" fill="#ff2d6f">Feeling Forecast</text>
      <text x="75" y="210" text-anchor="middle" font-size="6.5" fill="#2b1a22">It's okay to be tired! You are</text>
      <text x="75" y="220" text-anchor="middle" font-size="6.5" fill="#2b1a22">running low on</text>
      <text x="75" y="230" text-anchor="middle" font-size="6.5" fill="#2b1a22">emotional energy</text>
      ${tabs}
    </g>`}
    ${mid ? `<g class="ph-mid"><rect x="6" y="6" width="138" height="294" rx="18" fill="#fff"/><image href="${mid}" x="6" y="6" width="138" height="294" preserveAspectRatio="xMidYMin slice" clip-path="url(#k-screen)"/></g>` : `<g class="ph-mid k-sans">
      <rect x="6" y="6" width="138" height="294" rx="18" fill="#f3f2ee"/>
      <rect x="52" y="11" width="46" height="12" rx="6" fill="#1d1118"/>
      <text x="75" y="42" text-anchor="middle" font-size="12" fill="#555">Your Cycle</text>
      <rect x="16" y="50" width="118" height="30" rx="4" fill="#d8d7d1"/>
      <text x="75" y="69" text-anchor="middle" font-size="6.5" fill="#555">Upcoming event</text>
      <circle cx="75" cy="130" r="35" fill="none" stroke="#c6c5be" stroke-width="10"/>
      <text x="75" y="136" text-anchor="middle" font-size="14" fill="#555">7</text>
      <rect x="16" y="178" width="118" height="70" rx="4" fill="#d8d7d1"/>
      <text x="75" y="212" text-anchor="middle" font-size="7" fill="#555">Feeling Forecast</text>
      <rect x="14" y="262" width="122" height="24" rx="4" fill="#c6c5be"/>
    </g>`}
    ${lo ? `<g class="ph-lo"><rect x="6" y="6" width="138" height="294" rx="18" fill="#fff"/><image href="${lo}" x="-2" y="-2" width="154" height="310" preserveAspectRatio="xMidYMid meet"/></g>` : `<g class="ph-lo" fill="none" stroke="#6b6660" stroke-width="1.6">
      <rect x="6" y="6" width="138" height="294" rx="18" fill="#fbfaf3" stroke="none"/>
      <rect x="52" y="11" width="46" height="12" rx="6" fill="#1d1118" stroke="none"/>
      <path d="M50,40 H100"/>
      <rect x="16" y="50" width="118" height="30"/><path d="M16,50 L134,80 M134,50 L16,80"/>
      <circle cx="75" cy="130" r="38"/><circle cx="75" cy="130" r="26"/>
      <rect x="16" y="178" width="118" height="70"/><path d="M26,198 H124 M26,212 H124 M26,226 H90"/>
      <path d="M14,262 H136 M14,286 H136 M38,262 V286 M62,262 V286 M88,262 V286 M112,262 V286"/>
    </g>`}
  </g>`;
}

// The opening scene: a pendant lamp over the recipe book. The lamp is SVG,
// shaded to read as a dome, with a pull cord that static/kitchen.js runs as a
// little rope simulation. The book is HTML so it can turn in real 3D and its
// chapters can be links; it sits in the same 800 x 620 box as the drawing.
export const bookArt = (cover, root, chapters = [], title = "", course = "") => `<div class="art art--book"><div class="art-box">
  ${stage("lamp", `
  <defs>
    <!-- The shade is lit from the upper left: a cylinder-style sweep across it,
         a soft hotspot, and darkening towards the rim where it curls under. -->
    <linearGradient id="k-shade" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#5c0a2c"/><stop offset=".16" stop-color="#b81052"/><stop offset=".36" stop-color="#ff3d82"/><stop offset=".52" stop-color="#ff1a6e"/><stop offset=".8" stop-color="#a30c47"/><stop offset="1" stop-color="#4a0822"/></linearGradient>
    <radialGradient id="k-shade-hot" cx=".34" cy=".28" r=".42"><stop offset="0" stop-color="#ffd0e0" stop-opacity=".85"/><stop offset=".5" stop-color="#ff8db4" stop-opacity=".25"/><stop offset="1" stop-color="#ff8db4" stop-opacity="0"/></radialGradient>
    <linearGradient id="k-shade-rim" x1="0" x2="0" y1="0" y2="1"><stop offset=".6" stop-color="#2c0714" stop-opacity="0"/><stop offset="1" stop-color="#2c0714" stop-opacity=".55"/></linearGradient>
    <linearGradient id="k-collar" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#1c0510"/><stop offset=".3" stop-color="#6b3a4e"/><stop offset=".45" stop-color="#c8a3b2"/><stop offset=".6" stop-color="#5a2a3d"/><stop offset="1" stop-color="#1c0510"/></linearGradient>
    <!-- Inside the shade: dark up in the crown, warm where the bulb lights it. -->
    <radialGradient id="k-inside" cx=".5" cy=".15" r=".95"><stop offset="0" stop-color="#fff1c8"/><stop offset=".35" stop-color="#f2be6e"/><stop offset=".75" stop-color="#9a4a2a"/><stop offset="1" stop-color="#3a0b1c"/></radialGradient>
    <radialGradient id="k-bulb" cx=".42" cy=".38" r=".62"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#fff6dc"/><stop offset="1" stop-color="#ffd98a"/></radialGradient>
    <radialGradient id="k-bulb-glow"><stop offset="0" stop-color="#fff6d9"/><stop offset=".45" stop-color="#ffe9a6" stop-opacity=".7"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
  </defs>
  <path class="lamp-cone" d="M334,104 L466,104 L720,520 L80,520 Z" fill="url(#k-cone)"/>
  <g class="lamp-rig">
    <rect x="398" y="-260" width="4" height="226" fill="#2c0714"/>
    <!-- Collar: a little metal cylinder where the cord meets the shade. -->
    <rect x="384" y="-36" width="32" height="26" rx="3" fill="url(#k-collar)"/>
    <ellipse cx="400" cy="-36" rx="16" ry="4" fill="#8f6375"/>
    <path d="M378,-12 H422 L428,-2 H372 Z" fill="url(#k-collar)"/>
    <!-- The shade, a bell that flares slightly at the rim. -->
    <path class="lamp" d="M318,100 C318,56 340,8 376,-4 C390,-8 410,-8 424,-4 C460,8 482,56 482,100 Z" fill="url(#k-shade)"/>
    <path d="M318,100 C318,56 340,8 376,-4 C390,-8 410,-8 424,-4 C460,8 482,56 482,100 Z" fill="url(#k-shade-hot)"/>
    <path d="M318,100 C318,56 340,8 376,-4 C390,-8 410,-8 424,-4 C460,8 482,56 482,100 Z" fill="url(#k-shade-rim)"/>
    <!-- Specular streak and a faint rim light on the shadow side. -->
    <path d="M338,84 C336,48 354,16 380,4" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="5" stroke-linecap="round"/>
    <path d="M344,90 C343,76 344,66 346,58" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>
    <path d="M472,88 C470,60 458,32 440,14" fill="none" stroke="#ff9fbf" stroke-opacity=".35" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Looking up into it: the lit inside, the bulb, then the rolled lip. -->
    <ellipse cx="400" cy="100" rx="82" ry="17" fill="url(#k-inside)"/>
    <ellipse class="bulb-glow bulb" cx="400" cy="108" rx="74" ry="36" fill="url(#k-bulb-glow)"/>
    <circle class="bulb" cx="400" cy="104" r="21" fill="url(#k-bulb)"/>
    <path d="M318,100 A82,17 0 0 0 482,100" fill="none" stroke="#470b23" stroke-width="5"/>
    <path d="M318,100 A82,17 0 0 1 482,100" fill="none" stroke="#2c0714" stroke-width="2.5" stroke-opacity=".8"/>
    <path d="M330,106 A76,14 0 0 0 470,106" fill="none" stroke="#ff7fab" stroke-opacity=".45" stroke-width="1.5"/>
  </g>
  ${shadow(400, 526, 300, 16)}`)}
  <p class="pull-hint" aria-hidden="true">pull me</p>
  <div class="book3d">
    <div class="b3-page b3-right">
      <p class="b3-recipe">Recipe</p>
      <ol class="b3-chapters">${chapters
        .map((c) => `<li><a href="#${c.id}"><span class="b3-num">${c.step}</span> ${c.title}</a></li>`)
        .join("")}</ol>
    </div>
    <div class="b3-cover">
      <div class="b3-face b3-front"><span class="b3-title">${title}</span><span class="b3-sub">THE RECIPE</span></div>
      <div class="b3-face b3-back">
        ${cover ? `<img src="${root + cover}" alt="">` : ""}
        <span class="b3-title">${title}</span>
        <span class="b3-sub">${course}</span>
      </div>
    </div>
  </div>
  ${stage("pull", `
    <g class="pull" aria-hidden="true">
      <path class="pull-cord" d="M452,115 V231" fill="none" stroke="#f9f7eb" stroke-width="2.5" stroke-linecap="round"/>
      <g class="pull-bead" transform="translate(452 241)">
        <circle r="22" fill="transparent"/>
        <path d="M-7,-12 H7 L9,10 Q0,16 -9,10 Z" fill="#c4c6cc" stroke="#6f7178"/>
        <ellipse cy="-12" rx="7" ry="2.5" fill="#eeeef0"/>
      </g>
    </g>`)}
</div></div>`;

const SLICES = ["Training", "Energy levels", "Recovery", "Exercise", "Performance"];
export const BOARD = { x0: 130, w: 80, gap: 30 };

// A label's pill is as wide as its word (about 10.6 units a character at
// this size, plus padding), never narrower than the short ones.
const pill = (name) => Math.max(112, Math.round(name.length * 10.6 + 34));

export const boardArt = (root, labels = SLICES) => {
  const { x0, w, gap } = BOARD;
  const slices = labels.map((name, i) => {
    const x = x0 + i * (w + gap);
    const high = i % 2 === 1;
    return `<g class="slice" data-i="${i}">
      ${i === 0 ? `<path d="M${x + 6},428 C${x - 34},400 ${x - 44},444 ${x - 66},416 C${x - 40},452 ${x - 34},462 ${x + 6},454 Z" fill="#7d9a54"/>` : ""}
      <rect x="${x}" y="412" width="${w}" height="66" rx="${i === 0 || i === 4 ? 26 : 8}" fill="url(#k-veg)"/>
      <ellipse cx="${x + w - 3}" cy="445" rx="9" ry="31" fill="#ffc2d6" opacity="${i === 4 ? 0 : 1}"/>
      <rect x="${x + 8}" y="420" width="${w - 22}" height="8" rx="4" fill="#fff" opacity=".35"/>
      <g class="slice-tag">
        <path d="M${x + w / 2},${high ? 330 : 390} V412" stroke="#f9f7eb" stroke-width="2" stroke-dasharray="3 4"/>
        <rect x="${x + w / 2 - pill(name) / 2}" y="${high ? 292 : 352}" width="${pill(name)}" height="38" rx="19" fill="#f9f7eb"/>
        <text x="${x + w / 2}" y="${high ? 317 : 377}" text-anchor="middle" class="k-sans" font-size="19" font-weight="700" fill="#470b23">${name}</text>
      </g>
    </g>`;
  }).join("");
  return stage("board", `
    ${shadow(400, 546, 350, 14)}
    <path d="M90,470 H710 L752,520 H48 Z" fill="url(#k-wood)"/>
    <rect x="48" y="520" width="704" height="20" rx="3" fill="#7d5733"/>
    <path d="M110,484 H690 M84,500 H716" stroke="#8a6238" stroke-opacity=".4"/>
    ${slices}
    ${labels.slice(0, 4).map((_, i) => {
      const x = x0 + (i + 1) * w + i * gap + gap / 2;
      return `<g class="juice" fill="#ff4f8b" opacity="0"><ellipse cx="${x - 14}" cy="496" rx="9" ry="3.5"/><ellipse cx="${x + 12}" cy="504" rx="5" ry="2.5"/><circle cx="${x - 2}" cy="489" r="2.5"/></g>`;
    }).join("")}
    <g class="knife" transform="translate(470 60)">${hand(root, "knife", 380.7, 30.7, 0.5, -95)}</g>
    <g class="towel" transform="translate(400 1100)">${hand(root, "cloth", 280, 300, 0.36)}</g>`);
};

// `opts.chips` (five short names) fall into the bowl and mix into `opts.result`.
const FOLDS = ["Athlete context", "Team strengths", "Interests", "Development goals", "Shared ownership"];
export const bowlArt = (root, labels, shots, opts = {}) => {
  const chips = (opts.chips || FOLDS).map((name, i) => {
    const x = [150, 400, 650, 215, 585][i];
    const y = [120, 80, 120, 222, 222][i];
    return `<g class="chip" data-x="${x}" data-y="${y}">
      <circle cx="${x}" cy="${y - 42}" r="22" fill="url(#k-veg)"/><ellipse cx="${x - 6}" cy="${y - 49}" rx="9" ry="5" fill="#fff" opacity=".4"/>
      <rect x="${x - 88}" y="${y - 18}" width="176" height="38" rx="19" fill="#f9f7eb"/>
      <text x="${x}" y="${y + 7}" text-anchor="middle" class="k-sans" font-size="18" font-weight="700" fill="#470b23">${name}</text>
    </g>`;
  }).join("");
  return stage("bowl", `
    ${shadow(400, 526, 200, 14)}
    <ellipse cx="400" cy="340" rx="214" ry="44" fill="#a59e88"/>
    <ellipse class="batter" cx="400" cy="350" rx="192" ry="32" fill="url(#k-icing)"/>
    <path class="swirl" d="M300,350 C340,326 460,330 490,350 C460,370 360,372 340,352 C360,340 430,342 440,352" fill="none" stroke="#ffd3e2" stroke-width="5" stroke-linecap="round"/>
    <g class="whisk" transform="translate(470 340)">
      <rect x="-5" y="-196" width="10" height="110" rx="5" fill="#470b23"/>
      <path d="M0,-90 C-34,-50 -30,6 0,16 C30,6 34,-50 0,-90 M0,-90 C-16,-50 -14,6 0,16 C14,6 16,-50 0,-90" fill="none" stroke="#c4c6cc" stroke-width="3.5"/>
    </g>
    ${chips}
    <g class="bowl-result">
      <rect x="282" y="252" width="236" height="46" rx="23" fill="#f9f7eb"/>
      <text x="400" y="282" text-anchor="middle" class="k-sans" font-size="21" font-weight="700" fill="#ff0866">${opts.result || "Cycle × Training"}</text>
    </g>
    <path d="M186,340 C192,450 280,520 400,520 C520,520 608,450 614,340 C600,382 500,384 400,384 C300,384 200,382 186,340 Z" fill="url(#k-bowl)"/>
    <path d="M200,398 C260,428 540,428 600,398" fill="none" stroke="#470b23" stroke-width="7" stroke-opacity=".85"/>`);
};

const wire = (x) => `
  <rect class="draw" pathLength="1" x="${x}" y="196" width="118" height="236" rx="16"/>
  <path class="draw" pathLength="1" d="M${x + 34},216 H${x + 84}"/>`;

// Screenshots from the Notion section, in order, replace the drawn wireframes
// of the left, middle and right panels. Their captions replace the labels.
const shotIn = (shot, cx, label) => shot
  ? `<image class="shot" href="${shot.src}" x="${cx - 104}" y="186" width="208" height="318" preserveAspectRatio="xMidYMid meet"/>
    <text x="${cx}" y="168" text-anchor="middle" class="k-script draw-label" font-size="24" fill="#470b23">${shot.caption || label}</text>`
  : null;

// `opts.papers` names the three drawn wireframes, left to right.
export const paperArt = (root, labels, shots = [], opts = {}) => {
  const names = opts.papers || ["Onboarding", "Cycle home", "Calendar"];
  const [left, mid, right] = [shotIn(shots[0], 160, names[0]), shotIn(shots[1], 400, names[1]), shotIn(shots[2], 640, names[2])];
  return stage("paper", `
  ${shadow(400, 532, 320, 14)}
  <g class="paper-mid">
    <rect x="280" y="120" width="240" height="400" fill="#f9f7eb"/>
${mid || `    ${wire(341)}
    <g class="wire-marks" fill="none">
      <circle class="draw" pathLength="1" cx="400" cy="296" r="40"/><circle class="draw" pathLength="1" cx="400" cy="296" r="25"/>
      <rect class="draw" pathLength="1" x="356" y="236" width="88" height="10"/>
      <rect class="draw" pathLength="1" x="356" y="350" width="88" height="46"/>
      <path class="draw" pathLength="1" d="M352,412 H448"/>
    </g>
    <text x="400" y="168" text-anchor="middle" class="k-script draw-label" font-size="24" fill="#470b23">${names[1]}</text>`}
  </g>
  <g class="paper-left">
    <rect x="40" y="120" width="240" height="400" fill="#f4f1e2"/>
${left || `    ${wire(101)}
    <g fill="none">
      <path class="draw" pathLength="1" d="M122,250 H198 M122,262 H178"/>
      <circle class="draw" pathLength="1" cx="130" cy="296" r="7"/><path class="draw" pathLength="1" d="M146,296 H198"/>
      <circle class="draw" pathLength="1" cx="130" cy="326" r="7"/><path class="draw" pathLength="1" d="M146,326 H198"/>
      <circle class="draw" pathLength="1" cx="130" cy="356" r="7"/><path class="draw" pathLength="1" d="M146,356 H198"/>
      <rect class="draw" pathLength="1" x="122" y="392" width="76" height="22" rx="11"/>
    </g>
    <text x="160" y="168" text-anchor="middle" class="k-script draw-label" font-size="24" fill="#470b23">${names[0]}</text>`}
    <path class="draw" pathLength="1" d="M226,314 C250,300 306,300 334,314 M322,304 L335,314 L320,322" fill="none"/>
  </g>
  <g class="paper-right">
    <rect x="520" y="120" width="240" height="400" fill="#f4f1e2"/>
${right || `    ${wire(581)}
    <g fill="none">
      <path class="draw" pathLength="1" d="M600,240 H684 M600,270 H684 M600,300 H684 M600,330 H684 M600,360 H684 M628,240 V360 M656,240 V360"/>
      <rect class="draw" pathLength="1" x="600" y="380" width="84" height="32"/>
    </g>
    <text x="640" y="168" text-anchor="middle" class="k-script draw-label" font-size="24" fill="#470b23">${names[2]}</text>`}
    <path class="draw" pathLength="1" d="M466,314 C490,300 546,300 574,314 M562,304 L575,314 L560,322" fill="none"/>
  </g>
  <path d="M280,120 V520 M520,120 V520" stroke="#470b23" stroke-opacity=".14"/>
  <g class="pencil" transform="translate(690 440) rotate(30)">
    <path d="M0,0 L-9,-24 L9,-24 Z" fill="#e7c9a4"/><path d="M0,0 L-3,-8 L3,-8 Z" fill="#2c0714"/>
    <rect x="-9" y="-120" width="18" height="96" fill="#ff0866"/><rect x="-9" y="-136" width="18" height="16" rx="3" fill="#c4c6cc"/>
  </g>
  <g class="flip-hand" transform="translate(400 1000)">${hand(root, "open", 210, 420, 0.5)}</g>`);
};

export const ovenArt = (root, labels, shots = [], opts = {}) => stage("oven", `
  ${shadow(470, 528, 250, 12)}
  <rect x="240" y="120" width="460" height="400" rx="10" fill="url(#k-steel-side)"/>
  <rect x="240" y="120" width="460" height="66" rx="10" fill="#2c0714"/>
  <g class="oven-stages k-sans" font-size="20" font-weight="700" text-anchor="middle">
    <rect x="384" y="134" width="172" height="38" rx="5" fill="#120308"/>
    <text class="stage-lo" x="470" y="160" fill="#ff7ea8">LOW-FI</text>
    <text class="stage-mid" x="470" y="160" fill="#ff7ea8">MID-FI</text>
    <text class="stage-hi" x="470" y="160" fill="#ff7ea8">FINAL</text>
  </g>
  <g class="dial" data-dial="left"><circle cx="300" cy="153" r="22" fill="url(#k-steel-side)" stroke="#120308" stroke-width="2"/><rect class="dial-mark" x="298" y="134" width="4" height="18" fill="#470b23"/></g>
  <g class="dial dial--lamp" data-dial="lamp"><circle cx="640" cy="153" r="22" fill="url(#k-steel-side)" stroke="#120308" stroke-width="2"/><rect class="dial-mark" x="638" y="134" width="4" height="18" fill="#470b23"/></g>
  <rect x="262" y="198" width="416" height="300" rx="6" fill="#170409"/>
  <rect class="oven-heat" x="262" y="198" width="416" height="300" rx="6" fill="url(#k-heat)" opacity="0"/>
  <rect class="oven-lamp" x="262" y="198" width="416" height="300" rx="6" fill="#fff0c4" opacity="0"/>
  <path d="M272,400 H668 M272,300 H668" stroke="#55121f" stroke-width="3"/>
  <g class="tray" transform="translate(60 214)">
    <rect x="-34" y="292" width="218" height="14" rx="4" fill="url(#k-steel)"/>
    ${shadow(75, 292, 92, 7)}
    ${phone("oven-phone", shots[0]?.src, opts.lo && root + opts.lo, opts.mid && root + opts.mid)}
  </g>
  <g class="door" transform="translate(0 500) scale(1 -0.2) translate(0 -500)">
    <path fill-rule="evenodd" d="M260,192 H680 Q688,192 688,200 V492 Q688,500 680,500 H260 Q252,500 252,492 V200 Q252,192 260,192 Z M298,246 Q290,246 290,254 V460 Q290,468 298,468 H642 Q650,468 650,460 V254 Q650,246 642,246 Z" fill="url(#k-steel)"/>
    <rect class="door-glass" x="290" y="246" width="360" height="222" rx="8" fill="#1a060c" fill-opacity=".22" stroke="#120308" stroke-width="3"/>
    <path d="M308,262 L402,262 L330,452 L308,452 Z" fill="#fff" opacity=".07"/>
    <rect x="290" y="208" width="360" height="18" rx="9" fill="url(#k-steel-side)" stroke="#6f7178"/>
  </g>`);

// `opts.award: null` leaves the award rosette off the plate.
// PeriodT Coach's dish: Swedish meatballs in gravy on a mound of mash, with
// peas, lingonberry jam and parsley. There's no knife: a fork takes two bites
// (static/kitchen.js), and the app is underneath.
const meatball = (cx, cy, r) => `<g>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#k-mb)"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#k-mb-edge)"/>
  <g fill="#3a1a0c" opacity=".55"><circle cx="${cx - r * 0.35}" cy="${cy + r * 0.1}" r="${r * 0.1}"/><circle cx="${cx + r * 0.3}" cy="${cy + r * 0.35}" r="${r * 0.08}"/><circle cx="${cx + r * 0.15}" cy="${cy - r * 0.2}" r="${r * 0.07}"/></g>
  <path d="M${cx - r * 0.8},${cy - r * 0.1} C${cx - r * 0.6},${cy - r * 0.85} ${cx + r * 0.55},${cy - r * 0.9} ${cx + r * 0.8},${cy - r * 0.15} C${cx + r * 0.7},${cy + r * 0.1} ${cx + r * 0.45},${cy - r * 0.05} ${cx + r * 0.35},${cy + r * 0.2} C${cx + r * 0.2},${cy + r * 0.05} ${cx - r * 0.1},${cy + r * 0.25} ${cx - r * 0.3},${cy + r * 0.05} C${cx - r * 0.5},${cy + r * 0.15} ${cx - r * 0.7},${cy + r * 0.05} ${cx - r * 0.8},${cy - r * 0.1} Z" fill="#a8774a" opacity=".85"/>
  <ellipse cx="${cx - r * 0.3}" cy="${cy - r * 0.48}" rx="${r * 0.26}" ry="${r * 0.1}" fill="#fff" opacity=".45" transform="rotate(-18 ${cx - r * 0.3} ${cy - r * 0.48})"/>
  <g fill="#2f7a2a"><rect x="${cx + r * 0.1}" y="${cy - r * 0.55}" width="${r * 0.14}" height="${r * 0.07}" transform="rotate(25 ${cx} ${cy})"/><rect x="${cx - r * 0.2}" y="${cy - r * 0.3}" width="${r * 0.1}" height="${r * 0.06}" transform="rotate(-40 ${cx} ${cy})"/></g>
</g>`;
const peas = () => {
  const out = [];
  // A loose heap of peas, packed by rings with a little jitter.
  for (let i = 0; i < 46; i++) {
    const a = i * 2.399, d = 9 * Math.sqrt(i);
    const x = 228 + Math.cos(a) * d * 1.05, y = 300 + Math.sin(a) * d * 1.35;
    out.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9.5" fill="url(#k-pea)"/><circle cx="${(x - 3).toFixed(1)}" cy="${(y - 3).toFixed(1)}" r="2.6" fill="#fff" opacity=".5"/>`);
  }
  return out.join("");
};
const meatballs = () => `<defs>
      <radialGradient id="k-mb" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#a86c44"/><stop offset=".55" stop-color="#7a4528"/><stop offset="1" stop-color="#4a2414"/></radialGradient>
      <radialGradient id="k-mb-edge" cx=".5" cy=".5" r=".5"><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2a1006" stop-opacity=".6"/></radialGradient>
      <radialGradient id="k-mash" cx=".45" cy=".35" r=".75"><stop offset="0" stop-color="#fffdf4"/><stop offset=".7" stop-color="#f3ead2"/><stop offset="1" stop-color="#d9caa6"/></radialGradient>
      <radialGradient id="k-pea" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#9be060"/><stop offset=".6" stop-color="#4fae2c"/><stop offset="1" stop-color="#2c6e18"/></radialGradient>
      <radialGradient id="k-lingon" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#b0123e"/><stop offset=".7" stop-color="#6e0a24"/><stop offset="1" stop-color="#3e0614"/></radialGradient>
      <linearGradient id="k-silver" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#8d8f96"/><stop offset=".35" stop-color="#ffffff"/><stop offset=".6" stop-color="#c9cbd1"/><stop offset="1" stop-color="#7c7e85"/></linearGradient>
    </defs>
    <g class="meatball-dish">
      <g class="side">${peas()}
        <path d="M250,392 C232,370 262,350 292,362 C322,352 344,376 330,398 C340,420 306,440 282,428 C252,438 236,414 250,392 Z" fill="url(#k-lingon)"/>
        <g fill="#d61d55" opacity=".7"><circle cx="270" cy="380" r="5"/><circle cx="298" cy="372" r="4"/><circle cx="312" cy="398" r="5"/><circle cx="284" cy="412" r="4"/></g>
        <ellipse cx="278" cy="372" rx="12" ry="4" fill="#fff" opacity=".35"/>
      </g>
      <g class="bite bite--1">
        <path d="M296,240 C286,176 338,146 398,158 C414,240 412,340 400,430 C344,446 292,414 286,366 C264,332 276,284 296,240 Z" fill="url(#k-mash)"/>
        <path d="M312,224 C330,210 356,212 372,224 M306,300 C322,290 344,292 360,304 M314,372 C330,362 352,366 366,378" fill="none" stroke="#e4d8b8" stroke-width="3" stroke-linecap="round"/>
        <path d="M330,206 C346,192 380,196 388,218 L390,310 C372,328 340,324 330,302 C318,276 318,232 330,206 Z" fill="#a8774a" opacity=".45"/>
        ${meatball(348, 214, 34)}${meatball(360, 286, 38)}${meatball(334, 352, 33)}
      </g>
      <g class="bite bite--2">
        <path d="M398,158 C458,148 516,182 516,248 C532,300 522,356 502,392 C476,440 432,446 400,430 C412,340 414,240 398,158 Z" fill="url(#k-mash)"/>
        <path d="M418,206 C436,196 458,200 470,212 M424,320 C440,310 462,314 474,326" fill="none" stroke="#e4d8b8" stroke-width="3" stroke-linecap="round"/>
        <path d="M404,204 C430,192 470,204 478,236 C484,280 476,330 456,350 C434,362 410,348 402,322 Z" fill="#a8774a" opacity=".45"/>
        ${meatball(430, 222, 36)}${meatball(462, 288, 34)}${meatball(428, 340, 37)}${meatball(402, 260, 30)}
      </g>
      <g fill="#2f7a2a" opacity=".9">${[[332, 260], [380, 238], [452, 250], [410, 310], [470, 352], [356, 392], [300, 330], [220, 270], [250, 340]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="6" height="3" transform="rotate(${i * 37} ${x} ${y})"/>`).join("")}</g>
    </g>
    <g class="fork" transform="translate(600 250) rotate(28)">
      <path d="M-16,-150 L-16,-112 M-5,-152 L-5,-112 M6,-152 L6,-112 M17,-150 L17,-112" stroke="url(#k-silver)" stroke-width="7" stroke-linecap="round"/>
      <path d="M-22,-118 C-22,-92 -12,-76 -6,-62 L-5,90 C-5,104 5,104 5,90 L6,-62 C12,-76 22,-92 22,-118 Z" fill="url(#k-silver)" stroke="#8d8f96" stroke-width="1"/>
      <path d="M-4,-40 L-3,80" stroke="#fff" stroke-opacity=".7" stroke-width="2"/>
    </g>`;

export const plateArt = (root, labels, shots = [], opts = {}) => stage("plate", `
  <g class="plate-group">
    ${shadow(400, 524, 240, 16)}
    <image href="${root}menu/plate-platter.webp" x="120" y="50" width="560" height="470" preserveAspectRatio="xMidYMid meet"/>
    <g class="plate-phone" transform="translate(325 128)">${phone("plate-screen", shots[0]?.src)}</g>
    ${opts.dish === "meatballs" ? meatballs() : `    <g class="cake cake--left" transform="translate(400 285) translate(-260 150) scale(.5) translate(-400 -285)">
      <path d="M400,90 A195,195 0 0 0 400,480 Z" fill="url(#k-icing)"/>
      <path class="seam" d="M396,90 V480" stroke="#fff3f7" stroke-width="7"/>
      <g fill="#fff"><circle cx="300" cy="200" r="5"/><circle cx="340" cy="320" r="5"/><circle cx="270" cy="350" r="5"/><circle cx="350" cy="170" r="5"/><circle cx="310" cy="420" r="5"/></g>
    </g>
    <g class="cake cake--right" transform="translate(400 285) translate(260 150) scale(.5) translate(-400 -285)">
      <path d="M400,90 A195,195 0 0 1 400,480 Z" fill="url(#k-icing)"/>
      <path class="seam" d="M404,90 V480" stroke="#fff3f7" stroke-width="7"/>
      <g fill="#fff"><circle cx="470" cy="210" r="5"/><circle cx="520" cy="300" r="5"/><circle cx="450" cy="380" r="5"/><circle cx="500" cy="170" r="5"/><circle cx="490" cy="430" r="5"/></g>
    </g>`}
  </g>
  <g class="slicer" transform="translate(400 520)">${hand(root, "knife", 70, 587, 0.6)}</g>
  ${opts.award === null ? "" : `  <g class="award" transform="translate(640 150)">
    <circle r="82" fill="#470b23"/><circle r="72" fill="none" stroke="#f9f7eb" stroke-dasharray="2 5"/>
    <text y="-22" text-anchor="middle" class="k-script" font-size="20" fill="#ff7ea8">Best</text>
    <text y="2" text-anchor="middle" class="k-sans" font-size="14" font-weight="700" fill="#f9f7eb">INTERACTION</text>
    <text y="20" text-anchor="middle" class="k-sans" font-size="14" font-weight="700" fill="#f9f7eb">DESIGN</text>
    <text y="42" text-anchor="middle" class="k-sans" font-size="12" fill="#f9f7eb">TechFest</text>
  </g>`}`);
