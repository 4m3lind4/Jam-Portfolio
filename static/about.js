// About the Chef: the chef talks through her comments once the heading has
// been squeezed out, then the résumé folder opens and, as you scroll, its
// sheets slide out one by one onto a pile beside it.
(function () {
  var root = document.documentElement;

  // ---- The speech bubble
  var bubble = document.querySelector(".about-intro .bubble");
  var talk = bubble && window.JamTalk && JamTalk.prepare(bubble, { pitch: 450, speed: 13 });
  if (talk) {
    var seen = false;
    var ready = !root.classList.contains("sauce-on");
    var go = function () { if (seen && ready) talk.play(); };
    var heard = function () { ready = true; go(); };
    document.addEventListener("sauce:said", heard);
    document.addEventListener("sauce:done", heard);
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { seen = true; go(); }
    }, { threshold: 0.2 }).observe(bubble);
    bubble.addEventListener("click", function (e) { if (!e.target.closest(".talk-sound")) talk.finish(); });
  }

  // ---- The skip button: shown while the intro plays, gone once it's over.
  var skipButton = document.querySelector(".skip-anim");
  if (skipButton) {
    var hideSkip = function () { skipButton.hidden = true; };
    document.addEventListener("jam:skip", function () {
      if (talk) talk.finish();
      hideSkip();
    });
    // No skip needed once the chef has finished talking.
    var checkDone = setInterval(function () {
      if (!talk || talk.done) { clearInterval(checkDone); hideSkip(); }
    }, 300);
  }

  // ---- The folder
  window.__folderRan = true;
  var folder = document.querySelector(".folder");
  if (!folder || !root.classList.contains("folder-on")) return;
  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove("folder-on");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  var cover = folder.querySelector(".folder-cover");
  var caseEl = folder.querySelector(".folder-case");
  var tabs = gsap.utils.toArray(folder.querySelectorAll(".folder-tab"));
  var sheets = gsap.utils.toArray(folder.querySelectorAll(".folder-sheet"));
  var OPEN = 0.5, HOLD = 1, MOVE = 0.8;
  // Each part draws with its own perspective rather than sharing one 3D
  // scene, so z-index alone decides what's in front.
  var DEPTH = 1600;
  // How each sheet lands on the pile: a slight turn and nudge, so the four
  // read as a hand-made stack rather than one block.
  var LAND = [{ r: -3, x: 0, y: 6 }, { r: 2.2, x: 10, y: -4 }, { r: -1.4, x: -6, y: 2 }, { r: 1, x: 6, y: -2 }];
  var current = -1;
  var tl = null;
  var st = null;
  var starts = [];

  function show(i) {
    if (i === current) return;
    current = i;
    sheets.forEach(function (s, n) { s.classList.toggle("is-open", n === i); });
    tabs.forEach(function (t, n) {
      t.classList.toggle("is-open", n === i);
      if (n === i) t.setAttribute("aria-current", "true");
      else t.removeAttribute("aria-current");
    });
  }
  // The lit tab follows what's on screen (the animation), not the scroll
  // position, which runs ahead of it while the scrub catches up.
  function sync() {
    var t = tl.time();
    var i = 0;
    starts.forEach(function (s, n) { if (t >= s) i = n; });
    show(i);
  }

  // The cover opens once and lies flat on the left, showing the four sheets
  // tucked inside. Then, one per stretch of scroll, the top sheet slides out
  // and lands on the open pink cover, so a pile grows there from one sheet to
  // four and the newest one, on top, is the one to read. On narrow screens
  // the cover can't lie flat beside the folder, so the pile builds on top of
  // the folder itself.
  // matchMedia rebuilds the timeline if the window crosses between the two.
  gsap.matchMedia().add({ wide: "(min-width: 761px)", narrow: "(max-width: 760px)" }, function (mm) {
    var wide = mm.conditions.wide;
    current = -1;
    starts = [];
    gsap.set(cover, { transformPerspective: DEPTH, rotationY: 0, zIndex: 3 });
    // In the folder, the first sheet is on top.
    sheets.forEach(function (s, i) { gsap.set(s, { autoAlpha: 1, x: 0, y: 0, rotation: 0, zIndex: sheets.length - i }); });
    sheets.forEach(function (s) { gsap.set(s.children, { opacity: 1 }); });
    // Where the pile sits: centred on the open cover, which lies flat to the
    // left of the folder, exactly one folder-width across.
    var pileX = function (s) { return wide ? -caseEl.offsetWidth + (caseEl.offsetWidth - s.offsetWidth) / 2 - s.offsetLeft : 0; };

    tl = gsap.timeline({ defaults: { ease: "power2.inOut" }, onUpdate: sync });
    tl.fromTo(cover, { rotationY: 0 }, { rotationY: wide ? -180 : -168, duration: OPEN, immediateRender: false }, 0);
    // Once the cover is past upright it's behind the pages, not over them.
    tl.set(cover, { zIndex: 0 }, OPEN / 2);
    // The folder slides right as it opens, so cover and folder are centred.
    if (wide) tl.fromTo(caseEl, { xPercent: 0 }, { xPercent: 50, duration: OPEN, immediateRender: false }, 0);
    sheets.forEach(function (s, i) {
      var at = tl.duration();
      var land = LAND[i % LAND.length];
      starts.push(at + MOVE / 2);
      // On top of the pile as soon as it lifts out, so it never slips under.
      tl.set(s, { zIndex: 10 + i }, at);
      tl.fromTo(s,
        { x: 0, y: 0, rotation: 0 },
        { x: function () { return pileX(s) + land.x; }, y: land.y, rotation: land.r, duration: MOVE, immediateRender: false },
        at);
      // A little lift on the way, like paper picked up and set down.
      // The sheet it's landing on fades back, so only the top of the pile
      // reads at full strength.
      if (i > 0) tl.fromTo(sheets[i - 1].children, { opacity: 1 }, { opacity: 0.3, duration: MOVE * 0.6, ease: "none", immediateRender: false }, at + MOVE * 0.4);
      tl.fromTo(s, { scale: 1 }, { keyframes: [{ scale: 1.03, duration: MOVE / 2, ease: "power1.out" }, { scale: 1, duration: MOVE / 2, ease: "power1.in" }], immediateRender: false }, at);
      tl.fromTo(s, { boxShadow: "0 12px 20px rgba(71, 11, 35, 0.18)" }, { keyframes: [{ boxShadow: "0 30px 40px rgba(71, 11, 35, 0.3)", duration: MOVE / 2 }, { boxShadow: "0 6px 12px rgba(71, 11, 35, 0.16)", duration: MOVE / 2 }], immediateRender: false }, at);
      tl.to({}, { duration: HOLD });
    });

    st = ScrollTrigger.create({ trigger: folder, start: "top top", end: "bottom bottom", scrub: 0.5, animation: tl, invalidateOnRefresh: true });
    sync();
  });

  // A tab takes you to its part of the scroll. The scrub then moves the
  // sheets in between in order, and always ends with that sheet on top of the
  // pile, however quickly or often the tabs are clicked.
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function (e) {
      e.preventDefault();
      var at = (starts[i] + MOVE / 2 + HOLD / 2) / tl.duration();
      window.scrollTo({ top: st.start + at * (st.end - st.start), behavior: "instant" });
    });
  });
})();
