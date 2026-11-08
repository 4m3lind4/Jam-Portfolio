// The "About the Chef" heading is squeezed out of a sauce bottle. One GSAP
// timeline drives everything: the bottle's squeeze and the ribbon's flow share
// a single "pressure" value, so they stay in step. The finished letters are the
// same SVG paths the page was built with, and the real text stays in the <h1>.
(function () {
  var root = document.documentElement;
  var svg = document.querySelector(".sauce");
  window.__sauceRan = true;
  if (!root.classList.contains("sauce-on") || !svg || !window.gsap) {
    root.classList.remove("sauce-on");
    return;
  }

  var NS = "http://www.w3.org/2000/svg";
  var WIDTH = 15; // settled ribbon width
  var SPEED = 1300; // units of ribbon per second
  var HOVER = { x: 16, y: -44 }; // nozzle's resting offset from the ribbon's tip

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  var liquid = svg.querySelector(".sauce-liquid");
  var box = svg.viewBox.baseVal;

  // Fresh sauce sits fat behind the nozzle and relaxes as it settles. Each word
  // gets two wider windows that travel behind the tip to taper the ribbon.
  var words = Array.prototype.map.call(svg.querySelectorAll(".sauce-word"), function (path) {
    var length = path.getTotalLength();
    var wide = path.cloneNode();
    var fat = path.cloneNode();
    wide.setAttribute("stroke-width", 19);
    fat.setAttribute("stroke-width", 24);
    liquid.appendChild(wide);
    liquid.appendChild(fat);
    return { path: path, wide: wide, fat: fat, length: length, drawn: 0 };
  });

  var stream = el("path", { class: "sauce-stream" }, liquid);
  var tip = el("circle", { class: "sauce-tip", r: 0 }, liquid);

  // ---- The bottle. Its nozzle sits at (0,0), with the body running up from it.
  var defs = svg.querySelector("defs");
  defs.insertAdjacentHTML(
    "beforeend",
    '<linearGradient id="sauce-glass" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#2c0714"/><stop offset=".3" stop-color="#7d1a41"/><stop offset=".62" stop-color="#5a0f2c"/><stop offset="1" stop-color="#2c0714"/></linearGradient>' +
      '<linearGradient id="sauce-cap" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#c4004e"/><stop offset=".4" stop-color="#ff5f97"/><stop offset="1" stop-color="#b80049"/></linearGradient>'
  );
  var bottle = el("g", { class: "sauce-bottle" }, svg);
  var inner = el("g", {}, bottle);
  el("path", { d: "M-4.5,1 L4.5,1 L11,-40 L-11,-40 Z", fill: "url(#sauce-cap)", "stroke-linejoin": "round" }, inner);
  el("rect", { x: -19, y: -58, width: 38, height: 20, rx: 5, fill: "url(#sauce-cap)" }, inner);
  var body = el("path", { fill: "url(#sauce-glass)" }, inner);
  var shine = el("path", { fill: "none", stroke: "#fff", "stroke-opacity": 0.32, "stroke-width": 5, "stroke-linecap": "round" }, inner);
  var label = el("g", {}, inner);
  el("rect", { x: -30, y: -160, width: 60, height: 46, rx: 6, fill: "#f9f7eb" }, label);
  el("rect", { x: -26, y: -156, width: 52, height: 38, rx: 4, fill: "none", stroke: "#470b23", "stroke-width": 1.5 }, label);
  var mark = el("text", { x: 0, y: -129, "text-anchor": "middle", class: "sauce-label" }, label);
  mark.textContent = "Jam";

  function shapeBottle(s) {
    var S = 45 + 4 * s; // shoulder
    var W = 44 - 18 * s; // waist, where it's being squeezed
    var B = 43 + 3 * s; // base
    body.setAttribute(
      "d",
      "M-13,-58 C-28,-62 -" + S + ",-74 -" + S + ",-92 C-" + S + ",-112 -" + W + ",-120 -" + W + ",-137 C-" + W + ",-154 -" + B + ",-166 -" + B + ",-184 " +
        "C-" + B + ",-197 -" + (B - 6) + ",-202 -" + (B - 14) + ",-202 L" + (B - 14) + ",-202 C" + (B - 6) + ",-202 " + B + ",-197 " + B + ",-184 " +
        "C" + B + ",-166 " + W + ",-154 " + W + ",-137 C" + W + ",-120 " + S + ",-112 " + S + ",-92 C" + S + ",-74 28,-62 13,-58 Z"
    );
    shine.setAttribute(
      "d",
      "M-" + (S - 11) + ",-84 C-" + (S - 11) + ",-108 -" + (W - 9) + ",-120 -" + (W - 9) + ",-137 C-" + (W - 9) + ",-154 -" + (B - 11) + ",-164 -" + (B - 11) + ",-186"
    );
    var sx = Math.min(1, (W + 3) / 34);
    label.setAttribute("transform", "translate(0 -137) scale(" + sx + " 1) translate(0 137)");
  }

  // Smaller screens shrink the lettering, so the bottle keeps some extra size.
  var scale = svg.getBoundingClientRect().width / box.width;
  var bottleSize = scale < 0.55 ? 1.7 : 1.35;

  // ---- Everything that changes on the timeline lives here.
  var st = { pressure: 0, word: 0, travel: 0, away: 1, rise: 0, tilt: 34 };
  var nozzle = null;
  var lastFrame = performance.now();

  function tipPoint(w) {
    return w.path.getPointAtLength(w.drawn);
  }

  function dash(node, w, windowSize) {
    var size = Math.min(windowSize, w.drawn);
    node.setAttribute("stroke-dasharray", size + " " + (w.length * 2 + windowSize));
    node.setAttribute("stroke-dashoffset", -(w.drawn - size));
  }

  function render(time) {
    words.forEach(function (w) {
      var on = w.drawn > 0 ? "visible" : "hidden";
      w.path.style.visibility = w.wide.style.visibility = w.fat.style.visibility = on;
      w.path.setAttribute("stroke-dasharray", w.drawn + " " + (w.length + 40));
      dash(w.wide, w, 150);
      dash(w.fat, w, 60);
    });

    // The nozzle heads for just above the ribbon's tip, lagging behind so the
    // stream bends and the bottle swings like something held in a hand.
    var w = words[st.word];
    var at = tipPoint(w);
    var tx = at.x;
    var ty = at.y;
    if (st.travel > 0 && words[st.word + 1]) {
      var next = words[st.word + 1].path.getPointAtLength(0);
      tx += (next.x - tx) * st.travel;
      ty += (next.y - ty) * st.travel - Math.sin(st.travel * Math.PI) * 40;
    }
    var gx = tx + HOVER.x + st.away * 900;
    var gy = ty + HOVER.y - st.rise - st.away * 520;
    if (!nozzle) nozzle = { x: gx, y: gy };
    var now = performance.now();
    var follow = 1 - Math.exp(-(now - lastFrame) / 70);
    lastFrame = now;
    var dx = gx - nozzle.x;
    nozzle.x += dx * follow;
    nozzle.y += (gy - nozzle.y) * follow;

    var squeeze = st.pressure * (0.88 + 0.12 * Math.sin(time * 15));
    shapeBottle(squeeze);
    var lean = st.tilt + Math.max(-12, Math.min(12, -dx * 0.28));
    var shake = st.pressure * Math.sin(time * 31) * 0.5;
    bottle.setAttribute(
      "transform",
      "translate(" + nozzle.x + " " + (nozzle.y + shake) + ") rotate(" + lean + ") scale(" + bottleSize + " " + bottleSize * (1 - squeeze * 0.05) + ")"
    );

    // The stream is thickest at full pressure and thins until the goo filter
    // snaps it, which is what breaks the thread between words.
    var flow = st.pressure;
    var nearby = Math.hypot(nozzle.x - at.x, nozzle.y - at.y) < 120;
    if (flow > 0.05 && st.travel === 0 && nearby) {
      var midX = (nozzle.x + at.x) / 2 - dx * 1.4;
      var midY = (nozzle.y + at.y) / 2;
      stream.setAttribute("d", "M" + nozzle.x + "," + nozzle.y + " Q" + midX + "," + midY + " " + at.x + "," + at.y);
      stream.setAttribute("stroke-width", 2 + 9 * flow + Math.sin(time * 22) * flow);
      stream.style.visibility = "visible";
    } else {
      stream.style.visibility = "hidden";
    }

    var blob = w.drawn > 0 && flow > 0.05 && st.travel === 0;
    tip.style.visibility = blob ? "visible" : "hidden";
    if (blob) {
      tip.setAttribute("cx", at.x);
      tip.setAttribute("cy", at.y);
      tip.setAttribute("r", 11.5 + 2.5 * flow + Math.sin(time * 18) * 1.1);
    }
  }

  // ---- The reveal underneath: portrait set down like a plate, then the rest.
  var intro = document.querySelectorAll(".about-intro .portrait");
  var copy = document.querySelectorAll(".about-intro .label, .about-intro .comments > *, .about-intro .talk-sound, .folder");

  var tl = gsap.timeline({
    paused: true,
    onUpdate: function () {
      render(tl.time());
    },
    onComplete: function () {
      root.classList.remove("sauce-on");
      skipOff();
      document.dispatchEvent(new Event("sauce:done"));
    },
  });

  tl.to(st, { away: 0, duration: 0.8, ease: "back.out(1.1)" }, 0);
  tl.fromTo(st, { tilt: 62 }, { tilt: 34, duration: 0.9, ease: "back.out(2)" }, 0);
  tl.to(st, { pressure: 0.2, duration: 0.25, ease: "sine.out" }, 0.5);

  var cursor = 0.8;
  words.forEach(function (w, i) {
    var seconds = w.length / SPEED;
    var fresh = [w.wide, w.fat];

    // Pressure builds first, then sauce arrives: the squeeze leads the flow.
    tl.set(st, { word: i, travel: 0 }, cursor);
    tl.to(st, { pressure: 1, duration: 0.2, ease: "back.out(2.4)" }, cursor);
    tl.to(w, { drawn: w.length, duration: seconds, ease: "sine.inOut" }, cursor + 0.09);
    var end = cursor + 0.09 + seconds;

    // The fat ribbon relaxes down to its final width, with a viscous wobble.
    fresh.forEach(function (node, n) {
      tl.to(node, { attr: { "stroke-width": WIDTH }, duration: 1.1, ease: "elastic.out(1, 0.45)" }, end - 0.05 + n * 0.04);
    });

    // Let go: pressure drops, the thread thins and snaps, the bottle moves on.
    tl.to(st, { pressure: 0, duration: 0.18, ease: "power2.in" }, end - 0.04);
    if (words[i + 1]) {
      tl.to(st, { travel: 1, duration: 0.3, ease: "sine.inOut" }, end + 0.08);
      cursor = end + 0.38;
    } else {
      cursor = end + 0.12;
    }
  });

  // Done: a last pulse of release, and the bottle lifts away.
  tl.to(st, { away: 1, duration: 0.75, ease: "back.in(1.2)" }, cursor);
  tl.to(st, { tilt: 70, duration: 0.75, ease: "sine.in" }, cursor);
  tl.set(bottle, { visibility: "hidden" }, cursor + 0.76);
  tl.to(
    liquid,
    { keyframes: [{ scaleY: 1.025, duration: 0.14, ease: "sine.out" }, { scaleY: 1, duration: 0.8, ease: "elastic.out(1, 0.4)" }], svgOrigin: box.width / 2 + " 160" },
    cursor - 0.02
  );

  var reveal = cursor + 0.1;
  tl.fromTo(intro, { autoAlpha: 0, y: 26, scale: 0.94, rotation: -3 }, { autoAlpha: 1, y: 0, scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.5)" }, reveal);
  tl.fromTo(copy, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.07, clearProps: "transform" }, reveal + 0.12);

  shapeBottle(0);
  render(0);

  // Don't make anyone wait: a click or key speeds it up, and leaving the
  // heading behind finishes it, so the text below is never stuck hidden.
  function skip() {
    tl.timeScale(5);
  }
  function skipOff() {
    window.removeEventListener("pointerdown", skip);
    window.removeEventListener("keydown", skip);
  }
  window.addEventListener("pointerdown", skip);
  window.addEventListener("keydown", skip);

  var started = false;
  new IntersectionObserver(function (entries) {
    var e = entries[0];
    if (e.isIntersecting) {
      if (!started) {
        started = true;
        tl.play();
      }
    } else if (e.boundingClientRect.bottom < 0) {
      started = true;
      tl.progress(1);
    }
  }, { threshold: 0.35 }).observe(svg);
})();
