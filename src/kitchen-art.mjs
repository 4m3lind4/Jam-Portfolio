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
export function phone(cls = "", screen = null) {
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
    <g class="ph-mid k-sans">
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
    </g>
    <g class="ph-lo" fill="none" stroke="#6b6660" stroke-width="1.6">
      <rect x="6" y="6" width="138" height="294" rx="18" fill="#fbfaf3" stroke="none"/>
      <rect x="52" y="11" width="46" height="12" rx="6" fill="#1d1118" stroke="none"/>
      <path d="M50,40 H100"/>
      <rect x="16" y="50" width="118" height="30"/><path d="M16,50 L134,80 M134,50 L16,80"/>
      <circle cx="75" cy="130" r="38"/><circle cx="75" cy="130" r="26"/>
      <rect x="16" y="178" width="118" height="70"/><path d="M26,198 H124 M26,212 H124 M26,226 H90"/>
      <path d="M14,262 H136 M14,286 H136 M38,262 V286 M62,262 V286 M88,262 V286 M112,262 V286"/>
    </g>
  </g>`;
}

// The opening scene: a pendant lamp over the recipe book. The lamp is SVG,
// shaded to read as a dome, with a pull cord that static/kitchen.js runs as a
// little rope simulation. The book is HTML so it can turn in real 3D and its
// chapters can be links; it sits in the same 800 x 620 box as the drawing.
export const bookArt = (cover, root, chapters = [], title = "", course = "") => `<div class="art art--book"><div class="art-box">
  ${stage("lamp", `
  <defs>
    <radialGradient id="k-dome" cx=".34" cy=".3" r=".9"><stop offset="0" stop-color="#ff7fab"/><stop offset=".35" stop-color="#ff0866"/><stop offset=".8" stop-color="#8a0d3c"/><stop offset="1" stop-color="#470b23"/></radialGradient>
    <radialGradient id="k-dome-in" cx=".5" cy=".2" r=".8"><stop offset="0" stop-color="#ffe7a8"/><stop offset=".6" stop-color="#e0a35a"/><stop offset="1" stop-color="#5a1a1a"/></radialGradient>
    <radialGradient id="k-bulb-glow"><stop offset="0" stop-color="#fff6d9"/><stop offset=".45" stop-color="#ffe9a6" stop-opacity=".7"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
  </defs>
  <path class="lamp-cone" d="M334,104 L466,104 L720,520 L80,520 Z" fill="url(#k-cone)"/>
  <g class="lamp-rig">
    <rect x="398" y="-260" width="4" height="232" fill="#2c0714"/>
    <path d="M386,-28 H414 L418,-14 H382 Z" fill="#2c0714"/>
    <path class="lamp" d="M322,100 C322,40 360,-14 400,-14 C440,-14 478,40 478,100 Z" fill="url(#k-dome)"/>
    <path d="M342,86 C340,44 366,6 394,-4" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="400" cy="100" rx="78" ry="15" fill="url(#k-dome-in)"/>
    <ellipse class="bulb-glow bulb" cx="400" cy="108" rx="70" ry="34" fill="url(#k-bulb-glow)"/>
    <ellipse class="bulb" cx="400" cy="104" rx="26" ry="11" fill="#fff6d9"/>
    <ellipse cx="400" cy="100" rx="78" ry="15" fill="none" stroke="#470b23" stroke-width="3"/>
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
      <path class="pull-cord" d="M452,104 V220" fill="none" stroke="#f9f7eb" stroke-width="2.5" stroke-linecap="round"/>
      <g class="pull-bead" transform="translate(452 230)">
        <circle r="22" fill="transparent"/>
        <path d="M-7,-12 H7 L9,10 Q0,16 -9,10 Z" fill="#c4c6cc" stroke="#6f7178"/>
        <ellipse cy="-12" rx="7" ry="2.5" fill="#eeeef0"/>
      </g>
    </g>`)}
</div></div>`;

const SLICES = ["Training", "Energy levels", "Recovery", "Exercise", "Performance"];
export const BOARD = { x0: 130, w: 80, gap: 30 };

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
        <rect x="${x + w / 2 - 66}" y="${high ? 292 : 352}" width="132" height="38" rx="19" fill="#f9f7eb"/>
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

const FOLDS = ["Athlete context", "Team strengths", "Interests", "Development goals", "Shared ownership"];
export const bowlArt = () => {
  const chips = FOLDS.map((name, i) => {
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
      <text x="400" y="282" text-anchor="middle" class="k-sans" font-size="21" font-weight="700" fill="#ff0866">Cycle × Training</text>
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

export const paperArt = (root, labels, shots = []) => {
  const [left, mid, right] = [shotIn(shots[0], 160, "Onboarding"), shotIn(shots[1], 400, "Cycle home"), shotIn(shots[2], 640, "Calendar")];
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
    <text x="400" y="168" text-anchor="middle" class="k-script draw-label" font-size="24" fill="#470b23">Cycle home</text>`}
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
    <text x="160" y="168" text-anchor="middle" class="k-script draw-label" font-size="24" fill="#470b23">Onboarding</text>`}
    <path class="draw" pathLength="1" d="M226,314 C250,300 306,300 334,314 M322,304 L335,314 L320,322" fill="none"/>
  </g>
  <g class="paper-right">
    <rect x="520" y="120" width="240" height="400" fill="#f4f1e2"/>
${right || `    ${wire(581)}
    <g fill="none">
      <path class="draw" pathLength="1" d="M600,240 H684 M600,270 H684 M600,300 H684 M600,330 H684 M600,360 H684 M628,240 V360 M656,240 V360"/>
      <rect class="draw" pathLength="1" x="600" y="380" width="84" height="32"/>
    </g>
    <text x="640" y="168" text-anchor="middle" class="k-script draw-label" font-size="24" fill="#470b23">Calendar</text>`}
    <path class="draw" pathLength="1" d="M466,314 C490,300 546,300 574,314 M562,304 L575,314 L560,322" fill="none"/>
  </g>
  <path d="M280,120 V520 M520,120 V520" stroke="#470b23" stroke-opacity=".14"/>
  <g class="pencil" transform="translate(690 440) rotate(30)">
    <path d="M0,0 L-9,-24 L9,-24 Z" fill="#e7c9a4"/><path d="M0,0 L-3,-8 L3,-8 Z" fill="#2c0714"/>
    <rect x="-9" y="-120" width="18" height="96" fill="#ff0866"/><rect x="-9" y="-136" width="18" height="16" rx="3" fill="#c4c6cc"/>
  </g>
  <g class="flip-hand" transform="translate(400 1000)">${hand(root, "open", 210, 420, 0.5)}</g>`);
};

export const ovenArt = (root, labels, shots = []) => stage("oven", `
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
    ${phone("oven-phone", shots[0]?.src)}
  </g>
  <g class="door" transform="translate(0 500) scale(1 -0.2) translate(0 -500)">
    <path fill-rule="evenodd" d="M260,192 H680 Q688,192 688,200 V492 Q688,500 680,500 H260 Q252,500 252,492 V200 Q252,192 260,192 Z M298,246 Q290,246 290,254 V460 Q290,468 298,468 H642 Q650,468 650,460 V254 Q650,246 642,246 Z" fill="url(#k-steel)"/>
    <rect class="door-glass" x="290" y="246" width="360" height="222" rx="8" fill="#1a060c" fill-opacity=".22" stroke="#120308" stroke-width="3"/>
    <path d="M308,262 L402,262 L330,452 L308,452 Z" fill="#fff" opacity=".07"/>
    <rect x="290" y="208" width="360" height="18" rx="9" fill="url(#k-steel-side)" stroke="#6f7178"/>
  </g>`);

export const plateArt = (root, labels, shots = []) => stage("plate", `
  <g class="plate-group">
    ${shadow(400, 524, 240, 16)}
    <image href="${root}menu/plate-platter.webp" x="120" y="50" width="560" height="470" preserveAspectRatio="xMidYMid meet"/>
    <g class="plate-phone" transform="translate(325 128)">${phone("plate-screen", shots[0]?.src)}</g>
    <g class="cake cake--left" transform="translate(400 285) translate(-260 150) scale(.5) translate(-400 -285)">
      <path d="M400,90 A195,195 0 0 0 400,480 Z" fill="url(#k-icing)"/>
      <path class="seam" d="M396,90 V480" stroke="#fff3f7" stroke-width="7"/>
      <g fill="#fff"><circle cx="300" cy="200" r="5"/><circle cx="340" cy="320" r="5"/><circle cx="270" cy="350" r="5"/><circle cx="350" cy="170" r="5"/><circle cx="310" cy="420" r="5"/></g>
    </g>
    <g class="cake cake--right" transform="translate(400 285) translate(260 150) scale(.5) translate(-400 -285)">
      <path d="M400,90 A195,195 0 0 1 400,480 Z" fill="url(#k-icing)"/>
      <path class="seam" d="M404,90 V480" stroke="#fff3f7" stroke-width="7"/>
      <g fill="#fff"><circle cx="470" cy="210" r="5"/><circle cx="520" cy="300" r="5"/><circle cx="450" cy="380" r="5"/><circle cx="500" cy="170" r="5"/><circle cx="490" cy="430" r="5"/></g>
    </g>
  </g>
  <g class="slicer" transform="translate(400 520)">${hand(root, "knife", 70, 587, 0.6)}</g>
  <g class="award" transform="translate(640 150)">
    <circle r="82" fill="#470b23"/><circle r="72" fill="none" stroke="#f9f7eb" stroke-dasharray="2 5"/>
    <text y="-22" text-anchor="middle" class="k-script" font-size="20" fill="#ff7ea8">Best</text>
    <text y="2" text-anchor="middle" class="k-sans" font-size="14" font-weight="700" fill="#f9f7eb">INTERACTION</text>
    <text y="20" text-anchor="middle" class="k-sans" font-size="14" font-weight="700" fill="#f9f7eb">DESIGN</text>
    <text y="42" text-anchor="middle" class="k-sans" font-size="12" fill="#f9f7eb">TechFest</text>
  </g>`);
