// The PeriodT kitchen. Each scene gets one GSAP timeline scrubbed by scroll, and
// the art is authored in its final pose, so each timeline first moves the parts
// to the start of the scene, then plays them back to where they belong.
(function () {
  var root = document.documentElement;
  window.__kitchenRan = true;
  if (!root.classList.contains("kitchen-on")) return;
  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove("kitchen-on");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  function scene(id, build) {
    var el = document.getElementById(id);
    if (!el) return;
    var $ = gsap.utils.selector(el);
    var tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.5 },
    });
    build(tl, $, el);
  }

  // ---- 1. The lights come on, and the recipe book opens.
  (function lights() {
    var dark = document.querySelector(".kitchen-dark");
    var cone = document.querySelector(".lamp-cone");
    var bulbs = document.querySelectorAll(".bulb");
    var button = document.querySelector(".lights");
    var svg = document.querySelector(".art--lamp");
    var cordSvg = document.querySelector(".art--pull");
    if (!dark || !svg || !cordSvg) return;
    // The switch: a sharp plastic click, then the hum-and-tick of a bulb
    // catching. It uses the site's sound switch (talk.js), so "Sound off"
    // silences it, and browsers may hold it until the first tap.
    function click(on) {
      var ac = window.JamTalk && JamTalk.audio();
      if (!ac || ac.state !== "running") return;
      var t = ac.currentTime;
      var len = Math.floor(ac.sampleRate * 0.05);
      var buf = ac.createBuffer(1, len, ac.sampleRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
      var src = ac.createBufferSource();
      src.buffer = buf;
      var hp = ac.createBiquadFilter();
      hp.type = "bandpass";
      hp.frequency.value = on ? 3200 : 2400;
      hp.Q.value = 1.4;
      var g = ac.createGain();
      g.gain.value = 0.55;
      src.connect(hp).connect(g).connect(ac.destination);
      src.start(t);
      // The body of the switch: a tiny low knock under the click.
      var knock = ac.createOscillator();
      var kg = ac.createGain();
      knock.frequency.setValueAtTime(on ? 180 : 140, t);
      knock.frequency.exponentialRampToValueAtTime(60, t + 0.04);
      kg.gain.setValueAtTime(0.25, t);
      kg.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      knock.connect(kg).connect(ac.destination);
      knock.start(t);
      knock.stop(t + 0.06);
    }
    // A fluorescent flicker: a quieter tick for each stutter of the light.
    function tick() {
      var ac = window.JamTalk && JamTalk.audio();
      if (!ac || ac.state !== "running") return;
      var t = ac.currentTime;
      var o = ac.createOscillator();
      var g = ac.createGain();
      o.type = "square";
      o.frequency.value = 120;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.05, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      o.connect(g).connect(ac.destination);
      o.start(t);
      o.stop(t + 0.05);
    }

    gsap.set([cone, bulbs], { opacity: 0.1 });
    gsap
      .timeline({ delay: 0.5 })
      .add(function () { click(true); })
      .to(dark, { opacity: 0.35, duration: 0.05 })
      .to([cone, bulbs], { opacity: 1, duration: 0.05 }, "<")
      .add(tick, "+=0.08")
      .to(dark, { opacity: 0.8, duration: 0.07 })
      .to([cone, bulbs], { opacity: 0.2, duration: 0.07 }, "<")
      .add(tick, "+=0.18")
      .to(dark, { opacity: 0, duration: 0.5, ease: "power2.out" })
      .to([cone, bulbs], { opacity: 1, duration: 0.2 }, "<");

    function toggle() {
      var on = button.getAttribute("aria-pressed") !== "true";
      click(on);
      button.setAttribute("aria-pressed", String(on));
      gsap.to(dark, { opacity: on ? 0 : 0.62, duration: 0.25 });
      gsap.to([cone, bulbs], { opacity: on ? 1 : 0.1, duration: 0.25 });
      // The pull rocks the lamp on its flex.
      gsap.fromTo(svg.querySelector(".lamp-rig"), { rotation: 2.5 }, { rotation: 0, duration: 1.6, ease: "elastic.out(1, 0.25)", svgOrigin: "400 -260" });
      gsap.to(document.querySelector(".pull-hint"), { autoAlpha: 0, duration: 0.3 });
    }

    // ---- The pull cord: a chain of points with gravity (Verlet), pinned under
    // the lamp. Drag the bead down past its slack and let go to switch.
    var pull = cordSvg.querySelector(".pull");
    var cordPath = cordSvg.querySelector(".pull-cord");
    var bead = cordSvg.querySelector(".pull-bead");
    var N = 12, SEG = 10.5, LEN = N * SEG;
    var AX = 452, AY = 115; // the front lip of the shade, below the lit inside
    var pts = [];
    for (var i = 0; i <= N; i++) pts.push({ x: AX, y: AY + i * SEG, px: AX, py: AY + i * SEG });
    var drag = null, running = false, armed = false;

    function svgPoint(e) {
      var pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      return pt.matrixTransform(cordSvg.getScreenCTM().inverse());
    }
    function step() {
      var energy = 0;
      for (var i = 1; i <= N; i++) {
        var p = pts[i];
        var vx = (p.x - p.px) * 0.985, vy = (p.y - p.py) * 0.985;
        p.px = p.x; p.py = p.y;
        p.x += vx; p.y += vy + 0.45;
        energy += vx * vx + vy * vy;
      }
      var end = pts[N];
      if (drag) {
        var dx = drag.x - AX, dy = drag.y - AY, d = Math.hypot(dx, dy), max = LEN * 1.3;
        if (d > max) { dx *= max / d; dy *= max / d; }
        end.x = AX + dx; end.y = AY + dy;
        armed = dy > LEN * 1.12;
      }
      for (var k = 0; k < 12; k++) {
        for (var j = 0; j < N; j++) {
          var a = pts[j], b = pts[j + 1];
          var ddx = b.x - a.x, ddy = b.y - a.y, dist = Math.hypot(ddx, ddy) || 0.001;
          var diff = (dist - SEG) / dist;
          var wa = j === 0 ? 0 : 0.5, wb = drag && j + 1 === N ? 0 : 0.5;
          if (!wa && !wb) continue;
          var f = 1 / (wa + wb);
          a.x += ddx * diff * wa * f; a.y += ddy * diff * wa * f;
          b.x -= ddx * diff * wb * f; b.y -= ddy * diff * wb * f;
        }
      }
      pts[0].x = AX; pts[0].y = AY;
      return energy;
    }
    function draw() {
      var d = "M" + pts[0].x.toFixed(1) + "," + pts[0].y.toFixed(1);
      for (var i = 1; i <= N; i++) d += " L" + pts[i].x.toFixed(1) + "," + pts[i].y.toFixed(1);
      cordPath.setAttribute("d", d);
      var a = pts[N - 1], b = pts[N];
      var angle = Math.atan2(b.x - a.x, b.y - a.y) * -180 / Math.PI;
      bead.setAttribute("transform", "translate(" + b.x.toFixed(1) + " " + (b.y + 10).toFixed(1) + ") rotate(" + angle.toFixed(1) + ")");
    }
    function loop() {
      var energy = step();
      draw();
      if (drag || energy > 0.002) requestAnimationFrame(loop);
      else running = false;
    }
    function wake() { if (!running) { running = true; requestAnimationFrame(loop); } }

    pull.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      pull.setPointerCapture(e.pointerId);
      pull.classList.add("is-dragging");
      drag = svgPoint(e);
      wake();
    });
    pull.addEventListener("pointermove", function (e) { if (drag) drag = svgPoint(e); });
    function release() {
      if (!drag) return;
      drag = null;
      pull.classList.remove("is-dragging");
      if (armed) toggle();
      armed = false;
      wake();
    }
    pull.addEventListener("pointerup", release);
    pull.addEventListener("pointercancel", release);
    // Brushing past the cord sets it swinging.
    document.getElementById("intro").addEventListener("pointermove", function (e) {
      if (drag) return;
      var p = svgPoint(e);
      pts.forEach(function (q, i) {
        if (i && Math.abs(q.x - p.x) < 14 && Math.abs(q.y - p.y) < 14) { q.px -= (e.movementX || 0) * 0.4; wake(); }
      });
    });
    // The button is the same switch, and gives the cord a tug.
    button.addEventListener("click", function () {
      pts[N].y += 26;
      toggle();
      wake();
    });
    draw();
  })();

  scene("intro", function (tl, $) {
    var book = $(".book3d");
    var cover = $(".b3-cover");
    // Closed and centred on the counter; scrolling opens it to the recipe.
    gsap.set(book, { "--bx": "-25%" });
    gsap.set(cover, { rotationY: 0 });
    tl.to($(".scroll-cue"), { opacity: 0, duration: 0.15 }, 0)
      .to(cover, { rotationY: -180, duration: 0.9, ease: "power1.inOut" }, 0.1)
      .to(book, { "--bx": "0%", duration: 0.9, ease: "sine.inOut" }, 0.1);
    // Tabbing into the closed book scrolls far enough to open it.
    book[0].addEventListener("focusin", function () {
      if (tl.progress() < 0.9) {
        var st = tl.scrollTrigger;
        window.scrollTo({ top: st.end - 10, behavior: "smooth" });
      }
    });
  });

  // ---- 2. The knife chops an ingredient into the athlete's real concerns.
  scene("challenge", function (tl, $) {
    var X0 = 130, W = 80, GAP = 30;
    var slices = $(".slice");
    var tags = $(".slice-tag");
    var knife = $(".knife");
    var juice = $(".juice");
    var towel = $(".towel");
    slices.forEach(function (s, i) { gsap.set(s, { x: -i * GAP }); });
    gsap.set(tags, { autoAlpha: 0, scale: 0.4, transformOrigin: "50% 100%" });
    // The hand reaches in level from the right, then chops along from the left end.
    gsap.set(knife, { x: 900, y: 60, rotation: 0 });

    // Real ingredients are chopped through the middle, each swapping for its
    // cut version as the knife lands; the pink veg is cut between slices.
    var produce = !!$(".slice .cut").length;
    tl.to(knife, { x: X0 + W, y: 60, duration: 0.6, ease: "sine.out" });
    for (var k = 1; k <= 5; k++) {
      var at = produce ? X0 + (k - 1) * (W + GAP) + W / 2 + 14
        : k < 5 ? X0 + k * W + (k - 1) * GAP : X0 + 4 * (W + GAP) + W * 0.84;
      // Down all the way through, a beat on the board, then back up.
      tl.to(knife, { x: at, duration: 0.3, ease: "sine.inOut" })
        .to(knife, { y: 304, duration: 0.16, ease: "power3.in" })
        .addLabel("cut" + k);
      if (k < 5) {
        tl.to(slices.slice(k), { x: "+=" + GAP, duration: 0.14, ease: "power2.out" }, "cut" + k)
          .to(juice[k - 1], { opacity: 1, duration: 0.08 }, "cut" + k);
      }
      if (produce) {
        var piece = slices[k - 1];
        tl.set(piece.querySelector(".whole"), { autoAlpha: 0 }, "cut" + k)
          .fromTo(piece.querySelector(".cut"), { autoAlpha: 1, scale: 0.92, svgOrigin: (X0 + (k - 1) * (W + GAP) + W / 2) + " 450" }, { scale: 1, duration: 0.2, ease: "back.out(3)", immediateRender: false }, "cut" + k);
      }
      tl.to(tags[k - 1], { autoAlpha: 1, scale: 1, duration: 0.24, ease: "back.out(2)" }, "cut" + k + "+=0.05")
        .to(knife, { y: 60, duration: 0.24, ease: "sine.out" }, "cut" + k + "+=0.1");
    }
    tl.to(knife, { x: 470, y: 60, duration: 0.5, ease: "sine.inOut" });

    // Then a cloth comes up and wipes the juice off the board in one swipe.
    gsap.set(towel, { x: 150, y: 1100 });
    tl.to(towel, { y: 490, duration: 0.4, ease: "power2.out" })
      .addLabel("wipe")
      .to(towel, { x: 600, rotation: 6, duration: 0.6, ease: "sine.inOut" });
    juice.forEach(function (j, i) {
      tl.to(j, { opacity: 0, duration: 0.12 }, "wipe+=" + (0.08 + i * 0.13));
    });
    tl.to(towel, { y: 1100, duration: 0.4, ease: "power2.in" }, "wipe+=0.6").to({}, { duration: 0.4 });

    // Pointing at a slice lights up its line on the ticket, and the other way round.
    var items = $(".scene-ticket li");
    slices.forEach(function (s, i) {
      function hot(on) {
        if (items[i]) items[i].classList.toggle("is-hot", on);
        gsap.to(s, { y: on ? -8 : 0, duration: 0.2, overwrite: "auto" });
      }
      s.addEventListener("pointerenter", function () { hot(true); });
      s.addEventListener("pointerleave", function () { hot(false); });
      if (items[i]) {
        items[i].addEventListener("pointerenter", function () { hot(true); });
        items[i].addEventListener("pointerleave", function () { hot(false); });
      }
    });
  });

  // ---- 3. Everything falls into the bowl and gets mixed into one idea.
  scene("research", function (tl, $) {
    var chips = $(".chip");
    var whisk = $(".whisk");
    gsap.set(chips, { y: -720, rotation: function (i) { return [-14, 10, 18, -9, 12][i]; }, transformOrigin: "50% 50%" });
    gsap.set(whisk, { y: -160, autoAlpha: 0 });
    gsap.set($(".bowl-result"), { y: 120, scale: 0.7, autoAlpha: 0, transformOrigin: "50% 100%" });
    gsap.set($(".swirl"), { opacity: 0, svgOrigin: "400 350" });

    tl.to(chips, { y: 0, rotation: 0, duration: 0.7, ease: "bounce.out", stagger: 0.16 });
    chips.forEach(function (c, i) {
      var x = +c.dataset.x;
      var y = +c.dataset.y;
      tl.to(c, { x: 400 - x, y: 372 - y, scale: 0.55, rotation: i % 2 ? 40 : -40, duration: 0.42, ease: "power2.in" }, 1.7 + i * 0.16);
      tl.to(c, { autoAlpha: 0, duration: 0.05 }, 2.07 + i * 0.16);
      tl.fromTo($(".batter"), { attr: { cy: 350 } }, { attr: { cy: 346 }, duration: 0.09, yoyo: true, repeat: 1, immediateRender: false }, 2.05 + i * 0.16);
    });
    tl.to(whisk, { y: 340, autoAlpha: 1, duration: 0.35, ease: "power2.out" }, 2.9)
      .to($(".swirl"), { opacity: 1, duration: 0.3 }, 3.1);
    for (var i = 0; i < 4; i++) {
      tl.to(whisk, { x: 330, rotation: -9, duration: 0.2, ease: "sine.inOut" }, 3.2 + i * 0.42)
        .to(whisk, { x: 470, rotation: 9, duration: 0.2, ease: "sine.inOut" }, 3.4 + i * 0.42)
        .to($(".swirl"), { scaleX: i % 2 ? 1 : -1, duration: 0.42, ease: "sine.inOut" }, 3.2 + i * 0.42);
    }
    tl.to(whisk, { y: -160, autoAlpha: 0, duration: 0.3, ease: "power2.in" }, 4.9)
      .to($(".bowl-result"), { y: 0, scale: 1, autoAlpha: 1, duration: 0.45, ease: "back.out(1.7)" }, 5.1)
      .to({}, { duration: 0.3 });

    $(".chip").forEach(function (c) {
      c.addEventListener("pointerenter", function () { gsap.to(c.firstElementChild, { attr: { r: 26 }, duration: 0.15 }); });
      c.addEventListener("pointerleave", function () { gsap.to(c.firstElementChild, { attr: { r: 22 }, duration: 0.15 }); });
    });
  });

  // ---- 4. The recipe paper unfolds and the wireframes are drawn on it.
  scene("lofi", function (tl, $) {
    var left = $(".paper-left");
    var right = $(".paper-right");
    var pencil = $(".pencil");
    gsap.set(left, { scaleX: 0, svgOrigin: "280 0" });
    gsap.set(right, { scaleX: 0, svgOrigin: "520 0" });
    gsap.set($(".paper-mid"), { y: -24, svgOrigin: "400 520" });
    gsap.set($(".draw"), { strokeDashoffset: 1 });
    gsap.set($(".draw-label"), { opacity: 0 });
    gsap.set($(".shot"), { opacity: 0 });
    gsap.set(pencil, { x: 720, y: 150, rotation: 24 });
    var flip = $(".flip-hand");
    gsap.set(flip, { x: 300, y: 1000 });

    // A hand comes up and opens each fold of the paper.
    tl.to($(".paper-mid"), { y: 0, duration: 0.4, ease: "bounce.out" })
      .to(flip, { y: 330, duration: 0.35, ease: "power2.out" }, 0.3)
      .to(left, { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, 0.65)
      .to(flip, { x: 70, duration: 0.5, ease: "power2.inOut" }, 0.65)
      .to(flip, { x: 500, duration: 0.4, ease: "sine.inOut" }, 1.2)
      .to(right, { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, 1.6)
      .to(flip, { x: 730, duration: 0.5, ease: "power2.inOut" }, 1.6)
      .to(flip, { y: 1000, duration: 0.35, ease: "power2.in" }, 2.15);

    [[left, 160], [$(".paper-mid"), 400], [right, 640]].forEach(function (panel, i) {
      var group = gsap.utils.toArray(panel[0][0].querySelectorAll(".draw"));
      var at = 2.4 + i * 1.15;
      tl.to(pencil, { x: panel[1] + 30, y: 240, duration: 0.2, ease: "sine.inOut" }, at);
      tl.to(pencil, { keyframes: [
          { x: panel[1] - 40, y: 440, duration: 0.3 },
          { x: panel[1] + 40, y: 280, duration: 0.3 },
          { x: panel[1] - 20, y: 400, duration: 0.25 },
        ], ease: "sine.inOut" }, at + 0.2);
      tl.to(panel[0][0].querySelector(".draw-label"), { opacity: 1, duration: 0.2 }, at + 0.1);
      if (group.length) tl.to(group, { strokeDashoffset: 0, duration: 0.3, stagger: 0.7 / group.length }, at + 0.1);
      var shot = panel[0][0].querySelector(".shot");
      if (shot) tl.to(shot, { opacity: 1, duration: 0.7 }, at + 0.1);
    });
    tl.to(pencil, { x: 690, y: 440, rotation: 30, duration: 0.4, ease: "sine.inOut" }).to({}, { duration: 0.3 });
  });

  // ---- PeriodT Coach's dish: no knife. The dish settles as you scroll in,
  // then each tap (on the dish, the fork or the "Take a bite" button) sends
  // the fork in for a bite. Two bites and the app is underneath.
  function eatMeatballs(tl, $, el) {
    var screen = $(".plate-phone");
    var fork = $(".fork")[0];
    var bites = $(".bite");
    var btn = el.querySelector(".bite-btn");
    var eaten = 0;
    var busy = false;
    gsap.set(screen, { x: 348, y: 180, scale: 0.68 });
    gsap.set($(".slicer"), { autoAlpha: 0 });
    gsap.set(fork, { x: 760, y: 250, rotation: 28 });
    gsap.set(bites, { svgOrigin: "400 300" });

    tl.fromTo($(".meatball-dish"), { scale: 0.9, svgOrigin: "400 300" }, { scale: 1, duration: 0.6, ease: "back.out(1.6)" }, 0.1)
      .to(fork, { x: 600, duration: 0.6, ease: "power2.out" }, 0.4)
      .fromTo(btn, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.3 }, 0.8)
      .to({}, { duration: 1 });

    // Where each bite is taken from: the left of the mound, then the right.
    var SPOTS = [{ x: 352, y: 300 }, { x: 446, y: 290 }];
    function bite() {
      if (busy || eaten >= bites.length) return;
      busy = true;
      var b = bites[eaten];
      var spot = SPOTS[eaten];
      eaten += 1;
      var last = eaten === bites.length;
      if (btn) btn.textContent = last ? "Enjoy!" : "One more bite";
      gsap.set(b, { svgOrigin: spot.x + " " + spot.y });
      gsap.timeline({ onComplete: function () {
        busy = false;
        if (last) {
          gsap.to($(".garnish"), { autoAlpha: 0, duration: 0.3 });
          gsap.to(screen, { x: 325, y: 128, scale: 1, duration: 0.8, ease: "back.out(1.3)" });
          playOnPlate();
        }
      } })
        // The fork digs in...
        .to(fork, { x: spot.x + 22, y: spot.y + 128, rotation: 10, duration: 0.35, ease: "power2.in" })
        // ...scoops up a forkful (the bite gathers onto the tines)...
        .to(b, { scale: 0.34, duration: 0.25, ease: "power2.out" })
        .to([fork, b], { y: "-=50", duration: 0.25, ease: "power1.out" }, "<0.1")
        // ...and brings it up to you, growing as it nears the screen.
        .to(fork, { x: 420, y: 780, scale: 2.6, rotation: -6, duration: 0.6, ease: "power2.in" }, ">0.05")
        .to(b, { x: 400 - spot.x, y: 360 - spot.y, scale: 1.25, duration: 0.6, ease: "power2.in" }, "<")
        // Munch.
        .add(munch, ">-0.08")
        .to(b, { autoAlpha: 0, duration: 0.12 }, "<")
        // A clean fork comes back for the next bite.
        .set(fork, { x: 780, y: 250, scale: 1, rotation: 28 }, ">0.25")
        .to(fork, { x: 600, duration: 0.45, ease: "power2.out" });
    }
    // The munch, on the site's sound switch (static/talk.js).
    var munchSound = null;
    function munch() {
      if (window.JamTalk && !JamTalk.isOn()) return;
      if (!munchSound) munchSound = new Audio(root() + "kitchen/munch.mp3");
      // The file opens with a quarter-second of silence; skip it so the
      // crunch lands as the forkful arrives.
      munchSound.currentTime = 0.22;
      munchSound.play().catch(function () {});
    }
    function root() {
      var link = document.querySelector('link[href$="kitchen.css"]');
      return link ? link.getAttribute("href").replace("kitchen.css", "") : "";
    }
    // Once the plate is clear, the app plays through on the phone's screen
    // (muted, looping); tapping it opens the full walkthrough (static/appbox.js).
    function playOnPlate() {
      var box = document.querySelector(".app-box");
      var phone = screen[0];
      var gif = box && box.getAttribute("data-gif");
      if (!gif || !phone || phone.querySelector("foreignObject")) return;
      var NS = "http://www.w3.org/2000/svg";
      var fo = document.createElementNS(NS, "foreignObject");
      fo.setAttribute("x", 6);
      fo.setAttribute("y", 6);
      fo.setAttribute("width", 138);
      fo.setAttribute("height", 294);
      fo.setAttribute("clip-path", "url(#k-screen)");
      var img = document.createElement("img");
      img.src = gif;
      img.alt = "";
      img.className = "plate-video";
      fo.appendChild(img);
      // On top of the still screenshot (the recording has its own island).
      phone.appendChild(fo);
      // Tell people the app on the plate is theirs to open.
      if (btn) {
        btn.textContent = "Tap the app to open it";
        gsap.to(btn, { autoAlpha: 1, duration: 0.3, delay: 0.9 });
        btn.removeEventListener("click", bite);
        btn.addEventListener("click", function () { phone.dispatchEvent(new MouseEvent("click", { bubbles: true })); });
      }
      gsap.fromTo(phone, { rotation: 0 }, { keyframes: [{ rotation: -3, duration: 0.12 }, { rotation: 3, duration: 0.12 }, { rotation: 0, duration: 0.2 }], delay: 1.4, transformOrigin: "50% 50%", repeat: 1, repeatDelay: 1.6 });
    }

    [$(".meatball-dish")[0], fork, btn].forEach(function (t) {
      if (!t) return;
      t.style.pointerEvents = "auto";
      t.addEventListener("click", bite);
    });
  }

  // ---- 5, 6, 7. The prototype goes in the oven low-fi and comes out finished.
  scene("development", function (tl, $) {
    var door = $(".door");
    var tray = $(".tray");
    var lo = $(".ph-lo");
    var mid = $(".ph-mid");
    door[0].removeAttribute("transform");
    gsap.set(door, { scaleY: 1, svgOrigin: "470 500" });
    gsap.set(tray, { x: 60, y: 214, scale: 1 });
    gsap.set([lo, mid], { opacity: 1 });
    gsap.set($(".stage-lo"), { opacity: 1 });
    gsap.set($(".stage-hi"), { opacity: 0 });
    gsap.set($(".dial-mark"), { svgOrigin: "0 0" });
    var dialMarks = $(".dial-mark");
    gsap.set(dialMarks[0], { svgOrigin: "300 153" });
    gsap.set(dialMarks[1], { svgOrigin: "640 153" });

    tl.to(door, { scaleY: -0.2, duration: 1, ease: "power2.inOut" }, 0.1)
      .to(tray, { x: 410, y: 216, scale: 0.8, duration: 1.2, ease: "power2.inOut" }, 0.9)
      .to(door, { scaleY: 1, duration: 0.9, ease: "power2.inOut" }, 2.15)
      .to($(".oven-heat"), { opacity: 0.85, duration: 0.5 }, 3)
      .to(dialMarks[0], { rotation: 300, duration: 2.9 }, 3)
      .to(lo, { opacity: 0, duration: 0.45 }, 3.8)
      .to($(".stage-lo"), { opacity: 0, duration: 0.1 }, 3.9)
      .to($(".stage-mid"), { opacity: 1, duration: 0.1 }, 3.95)
      .to(mid, { opacity: 0, duration: 0.45 }, 5)
      .to($(".stage-mid"), { opacity: 0, duration: 0.1 }, 5.1)
      .to($(".stage-hi"), { opacity: 1, duration: 0.1 }, 5.15)
      .to($(".oven-heat"), { opacity: 0, duration: 0.5 }, 5.8)
      .to(door, { scaleY: -0.2, duration: 1, ease: "power2.inOut" }, 6)
      .to(tray, { x: 60, y: 214, scale: 1, duration: 1.2, ease: "power2.inOut" }, 6.85)
      .to({}, { duration: 0.3 });

    // The right-hand dial works the oven light; the left one just turns.
    var lamp = false;
    $(".dial").forEach(function (d) {
      d.addEventListener("click", function () {
        if (d.dataset.dial !== "lamp") return;
        lamp = !lamp;
        gsap.to($(".oven-lamp"), { opacity: lamp ? 0.3 : 0, duration: 0.2 });
        gsap.to(dialMarks[1], { rotation: lamp ? 90 : 0, duration: 0.25 });
      });
    });
  });

  // ---- 8. The finished dish is sliced, and the app is underneath.
  scene("plated", function (tl, $, el) {
    if ($(".meatball-dish").length) return eatMeatballs(tl, $, el);
    var left = $(".cake--left");
    var right = $(".cake--right");
    var screen = $(".plate-phone");
    left[0].removeAttribute("transform");
    right[0].removeAttribute("transform");
    gsap.set([left, right], { svgOrigin: "400 285" });
    gsap.set([left, right], { x: 0, y: 0, scale: 0.78 });
    gsap.set($(".seam"), { opacity: 0 });
    gsap.set($(".slicer"), { x: 400, y: 1000 });
    gsap.set(screen, { x: 348, y: 180, scale: 0.68 });
    gsap.set($(".award"), { scale: 0, autoAlpha: 0, rotation: -40, transformOrigin: "50% 50%" });

    tl.to($(".slicer"), { y: 460, duration: 0.7, ease: "power2.out" }, 0.1)
      .to($(".slicer"), { y: 500, duration: 0.2 }, 0.8)
      .to($(".seam"), { opacity: 1, duration: 0.25 }, 0.45)
      .to($(".slicer"), { y: 1000, duration: 0.4, ease: "power2.in" }, 1)
      .to(left, { x: -260, y: 150, scale: 0.5, rotation: -14, duration: 0.9, ease: "power2.inOut" }, 1.25)
      .to(right, { x: 260, y: 150, scale: 0.5, rotation: 14, duration: 0.9, ease: "power2.inOut" }, 1.3)
      .to(screen, { x: 325, y: 128, scale: 1, duration: 0.8, ease: "back.out(1.3)" }, 1.95)
      .to($(".award"), { scale: 1, autoAlpha: 1, rotation: 8, duration: 0.45, ease: "back.out(2)" }, 2.6)
      .to({}, { duration: 0.5 });

    // The finished phone leans towards the pointer.
    if (matchMedia("(hover: hover)").matches) {
      var turn = gsap.quickTo(screen[0], "rotation", { duration: 0.4, ease: "power2.out" });
      gsap.set(screen, { transformOrigin: "50% 50%" });
      el.addEventListener("pointermove", function (e) {
        turn(((e.clientX / innerWidth) - 0.5) * 7);
      });
    }
  });

  // Lazy images and fonts can shift heights after load.
  addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
