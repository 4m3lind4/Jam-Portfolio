/* The project menu: a scroll-linked book that opens, turns its pages,
   closes, and leaves the bill behind.

   Ported from the original portfolio's book.js. Every visual value is a
   pure function of one number, `progress`, measured in page turns and
   eased toward the raw scroll position once per frame. The pages
   themselves are printed at build time from Notion (src/menu.mjs) and
   handed over in the #menu-data JSON block.

   Wide screens read it as spreads:
     0             closed, the menu face up, the bill tucked underneath
     1 .. n-1      each turn shows the next spread
     n             the menu shuts to the left, uncovering the bill
     n + 1         the bill takes the frame
   Narrow screens turn one page at a time instead. */

(function () {
  const section = document.querySelector(".menu-section");
  const dataEl = document.getElementById("menu-data");
  if (!section || !dataEl) return;
  const DATA = JSON.parse(dataEl.textContent);

  /* ── Maths ─────────────────────────────────────────────────────── */
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const mix = (a, b, t) => a + (b - a) * t;

  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NARROW = matchMedia("(max-width: 759px)");

  /* ── Elements ──────────────────────────────────────────────────── */
  const sheetsEl = section.querySelector(".sheets");
  const bookEl = section.querySelector(".book");
  const spineEl = section.querySelector(".spine");
  const shadowEl = section.querySelector(".book-shadow");
  const receiptEl = section.querySelector(".receipt");
  const receiptSlot = section.querySelector(".receipt-slot");
  const receiptWrap = section.querySelector(".receipt-wrap");

  /* ── Faces ─────────────────────────────────────────────────────── */
  const COVER = { cls: "cover", html: DATA.cover };
  const BACKCOVER = { cls: "backcover", html: DATA.backcover };
  const BLANK_DARK = { cls: "backcover", html: '<div class="page-body"></div>' };
  const FILLER = { cls: "", html: DATA.filler };
  const PAGES = DATA.pages.map((html) => ({ cls: "", html }));

  /* Spread: faces run cover, page 1 (left), page 2 (right), ... back cover,
     two to a sheet, exactly like a folded menu. Pages are padded to an even
     count so the back cover lands on the back of the last sheet.
     Single: every page lives on a sheet's front; backs go dark so the pile
     of turned pages reads as one closed object. */
  const LAYOUTS = {
    spread() {
      const pages = PAGES.length % 2 ? PAGES.concat([FILLER]) : PAGES.slice();
      const faces = [COVER, ...pages, BACKCOVER];
      const out = [];
      for (let i = 0; i < faces.length; i += 2) out.push({ front: faces[i], back: faces[i + 1] });
      return out;
    },
    single() {
      const fronts = [COVER, ...PAGES];
      return fronts.map((front, i) => ({ front, back: i === fronts.length - 1 ? BACKCOVER : BLANK_DARK }));
    },
  };

  /* ── Build ─────────────────────────────────────────────────────── */
  let sheets = [];
  let SHEETS = 0;
  let single = NARROW.matches;

  function buildSheets() {
    single = NARROW.matches;
    section.classList.toggle("single", single);
    sheetsEl.textContent = "";
    const defs = LAYOUTS[single ? "single" : "spread"]();
    SHEETS = defs.length;

    sheets = defs.map((def) => {
      const el = document.createElement("div");
      el.className = "sheet";
      el.innerHTML =
        `<div class="face front ${def.front.cls}">${def.front.html}<div class="gloss"></div><div class="sheen"></div></div>` +
        `<div class="face back ${def.back.cls}">${def.back.html}<div class="gloss"></div><div class="sheen"></div></div>`;
      sheetsEl.appendChild(el);
      const front = el.querySelector(".face.front");
      const back = el.querySelector(".face.back");
      return {
        el,
        front,
        back,
        frontGloss: front.querySelector(".gloss"),
        backGloss: back.querySelector(".gloss"),
        frontSheen: front.querySelector(".sheen"),
        backSheen: back.querySelector(".sheen"),
        frontAnim: [...front.querySelectorAll(".anim")],
        backAnim: [...back.querySelectorAll(".anim")],
        frontLinks: [...front.querySelectorAll("a")],
        backLinks: [...back.querySelectorAll("a")],
        last: { z: -1, fr: -1, br: -1, fv: null, bv: null },
      };
    });

    section.style.setProperty("--sheet-count", SHEETS);
  }

  /* ── The bill ──────────────────────────────────────────────────── */
  receiptEl.innerHTML = DATA.bill;
  const timeEl = receiptEl.querySelector("[data-table-time]");
  if (timeEl) {
    timeEl.textContent += `, ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  const receiptAnim = [...receiptEl.querySelectorAll(".anim")];

  // Torn top and bottom edges. The drop shadow lives on the wrapper
  // because box-shadow does not follow a clip-path.
  (function tornEdges(teeth = 30, depth = 1.0) {
    const pts = [];
    for (let i = 0; i <= teeth; i++) pts.push(`${((i / teeth) * 100).toFixed(2)}% ${i % 2 ? depth : 0}%`);
    for (let i = teeth; i >= 0; i--) pts.push(`${((i / teeth) * 100).toFixed(2)}% ${i % 2 ? 100 - depth : 100}%`);
    receiptEl.style.clipPath = `polygon(${pts.join(",")})`;
  })();

  /* ── Layout ────────────────────────────────────────────────────── */
  let vh = 800;
  let pw = 400;
  const viewportHeight = () => innerHeight || document.documentElement.clientHeight || vh;
  function layout() {
    vh = viewportHeight();
    pw = (sheets[0] && sheets[0].el.offsetWidth) || pw;
  }

  function reveal(items, r) {
    for (let k = 0; k < items.length; k++) {
      const t = easeOutCubic(clamp(r * 1.5 - k * 0.055, 0, 1));
      items[k].style.opacity = t;
      items[k].style.transform = `translate3d(0,${(1 - t) * 16}px,0)`;
    }
  }

  // Only links on a face the reader can actually see are reachable by
  // keyboard and pointer; the rest are taken out of the tab order.
  function setLinks(links, visible, lastKey, s) {
    if (s.last[lastKey] === visible) return;
    s.last[lastKey] = visible;
    for (const a of links) {
      a.tabIndex = visible ? 0 : -1;
      a.style.pointerEvents = visible ? "" : "none";
    }
  }

  /* ── Render ────────────────────────────────────────────────────── */
  let lastBill = -1;

  function render(p) {
    pw = (sheets[0] && sheets[0].el.offsetWidth) || pw;

    const entry = clamp(p + 1, 0, 1);
    const open = clamp(p, 0, 1);
    const close = clamp(p - (SHEETS - 1), 0, 1);
    const focus = clamp(p - SHEETS, 0, 1);

    const eIn = easeOutCubic(entry);
    const eOpen = easeInOutCubic(open);
    const eFocus = easeInOutCubic(focus);

    // Closed, only the right half of a spread carries anything, so the book
    // sits half a page across and settles back as it opens.
    const centred = single ? 0 : (-pw / 2) * (1 - eOpen);
    bookEl.style.transform = `translate3d(${centred}px, ${(1 - eIn) * 60}px, 0) scale(${mix(0.9, 1, eIn)}) rotateX(${(1 - eIn) * 12}deg)`;
    bookEl.style.opacity = eIn > 0.999 ? 1 : eIn;

    spineEl.style.opacity = single ? 0 : (eOpen * (1 - clamp(close * 1.8, 0, 1))).toFixed(3);
    shadowEl.style.opacity = (1 - eFocus * 0.75).toFixed(3);

    for (let i = 0; i < SHEETS; i++) {
      const s = sheets[i];
      const local = clamp(p - i, 0, 1);
      const e = easeInOutCubic(local);
      const turning = local > 0.0005 && local < 0.9995;

      const z = turning ? SHEETS * 2 + 2 : local < 0.5 ? SHEETS - i : i;
      s.el.style.transform = `translateZ(${(z * 1.5).toFixed(2)}px) rotateY(${-180 * e}deg)`;
      if (z !== s.last.z) {
        s.el.style.zIndex = z;
        s.last.z = z;
      }

      const spec = Math.sin(Math.PI * local);
      s.frontGloss.style.setProperty("--gloss", (e * 0.95).toFixed(3));
      s.backGloss.style.setProperty("--gloss", ((1 - e) * 0.95).toFixed(3));
      s.frontSheen.style.setProperty("--sheen", (spec * 0.3).toFixed(3));
      s.backSheen.style.setProperty("--sheen", (spec * 0.3).toFixed(3));

      const fr = clamp(p - (i - 1), 0, 1);
      const br = clamp((local - 0.5) / 0.45, 0, 1);
      if (Math.abs(fr - s.last.fr) > 0.002) {
        reveal(s.frontAnim, fr);
        s.last.fr = fr;
      }
      if (Math.abs(br - s.last.br) > 0.002) {
        reveal(s.backAnim, br);
        s.last.br = br;
      }

      // A front is readable while unturned and on top; a back once turned
      // and not yet covered by the next sheet.
      const frontVisible = local < 0.5 && p > i - 1 && focus < 0.5;
      const nextLocal = i + 1 < SHEETS ? clamp(p - (i + 1), 0, 1) : 0;
      const backVisible = local >= 0.5 && nextLocal < 0.5 && focus < 0.5;
      setLinks(s.frontLinks, frontVisible, "fv", s);
      setLinks(s.backLinks, backVisible, "bv", s);
    }

    sheetsEl.style.opacity = (1 - eFocus * 0.38).toFixed(3);
    sheetsEl.style.transform = `translate3d(${-pw * 0.12 * eFocus}px, ${16 * eFocus}px, 0) scale(${1 - 0.05 * eFocus})`;
    sheetsEl.style.filter = eFocus > 0.001 ? `blur(${(2.2 * eFocus).toFixed(2)}px)` : "none";
    receiptSlot.style.zIndex = eFocus > 0.001 ? 20 : 5;
    receiptSlot.style.transform = `translateZ(${mix(-2, 26, eFocus).toFixed(2)}px)`;

    const uncovered = clamp((close - 0.3) / 0.7, 0, 1);
    const eUnc = easeOutCubic(uncovered);
    const bookW = pw * (single ? 1 : 2);
    const zoom = clamp(
      Math.min(
        Math.min(bookW * 0.62, innerWidth * 0.55, 480) / (receiptWrap.offsetWidth || 1),
        (vh * 0.8) / (receiptWrap.offsetHeight || 1)
      ),
      1,
      2.3
    );

    receiptWrap.style.transform =
      `translate3d(${(single ? 0 : -pw / 2) * eFocus}px, ${mix(12, 0, eUnc) - 6 * eFocus}px, 0) ` +
      `rotate(${mix(-2.6, 0, eFocus).toFixed(2)}deg) ` +
      `scale(${(mix(0.97, 1, eUnc) * mix(1, zoom, eFocus)).toFixed(4)})`;
    receiptWrap.style.filter = `drop-shadow(0 ${mix(8, 22, eFocus).toFixed(1)}px ${mix(14, 34, eFocus).toFixed(1)}px rgba(0,0,0,${mix(0.5, 0.62, eFocus).toFixed(2)}))`;
    if (Math.abs(uncovered - lastBill) > 0.002) {
      reveal(receiptAnim, uncovered);
      lastBill = uncovered;
    }
  }

  /* ── The scroll driver ─────────────────────────────────────────── */
  let smooth = 0;
  let raw = 0;
  let running = false;

  const progress = () => clamp(-section.getBoundingClientRect().top / vh, -1.2, SHEETS + 1.2);

  function frame() {
    vh = viewportHeight();
    raw = progress();
    // Critically damped follow: about 120 ms to settle.
    smooth += (raw - smooth) * (REDUCED ? 1 : 0.14);
    if (Math.abs(raw - smooth) < 0.0005) smooth = raw;
    render(smooth);
    if (Math.abs(raw - smooth) > 0.0004) requestAnimationFrame(frame);
    else running = false;
  }

  const kick = () => {
    if (!running) {
      running = true;
      requestAnimationFrame(frame);
    }
  };

  addEventListener("scroll", kick, { passive: true });
  addEventListener("resize", () => {
    layout();
    smooth = raw;
    kick();
  });
  addEventListener("pageshow", () => {
    layout();
    kick();
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      layout();
      kick();
    }
  });

  NARROW.addEventListener("change", () => {
    buildSheets();
    layout();
    smooth = raw = progress();
    lastBill = -1;
    render(smooth);
    kick();
  });

  buildSheets();
  layout();
  smooth = raw = progress();
  render(smooth);
  kick();
})();
