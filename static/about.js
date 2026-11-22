// About the Chef: the chef talks through her comments once the heading has
// been squeezed out, then the résumé folder opens to each tab in turn as you
// scroll, closing again before the next one.
(function () {
  var root = document.documentElement;

  // ---- The speech bubble
  var bubble = document.querySelector(".about-intro .bubble");
  var talk = bubble && window.JamTalk && JamTalk.prepare(bubble, { pitch: 450, speed: 22 });
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
  var OPEN = 0.5, HOLD = 1, FLIP = 0.7;
  // Each part draws with its own perspective rather than sharing one 3D
  // scene, so z-index alone decides what's in front (in a shared 3D scene the
  // open cover and a turning page sit at the same depth and fight).
  var DEPTH = 1600;
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

  // The cover opens once. After that, each tab turns the page over like a
  // book: the open sheet lifts from the folder's spine and lands face down on
  // the left, uncovering the next one, which is already lying underneath.
  // Wide screens lay the cover fully open beside the folder; narrow ones have
  // no room, so it swings back just far enough to read the sheet. matchMedia
  // rebuilds the timeline if the window crosses between the two.
  gsap.matchMedia().add({ wide: "(min-width: 761px)", narrow: "(max-width: 760px)" }, function (mm) {
    var wide = mm.conditions.wide;
    current = -1;
    starts = [];
    gsap.set(cover, { transformPerspective: DEPTH, rotationY: 0, zIndex: 3 });
    gsap.set(sheets, { autoAlpha: 0, rotationY: 0, zIndex: 0, transformPerspective: DEPTH });
    // Hinge every page on the spine: its own left edge sits a little in from it.
    sheets.forEach(function (s) { gsap.set(s, { transformOrigin: -s.offsetLeft + "px 50%" }); });
    // Headings of the later sheets start hidden, so fading them in never
    // means first snapping them out.
    sheets.forEach(function (s, i) { if (i) gsap.set(s.querySelector(".label"), { autoAlpha: 0 }); });

    tl = gsap.timeline({ defaults: { ease: "power2.inOut" }, onUpdate: sync });
    sheets.forEach(function (s, i) {
      var at = tl.duration();
      if (i === 0) {
        starts.push(at);
        tl.set(s, { autoAlpha: 1, zIndex: 1 }, at);
        tl.fromTo(cover, { rotationY: 0 }, { rotationY: wide ? -180 : -168, duration: OPEN, immediateRender: false }, at);
        // Once the cover is past upright it's behind the pages, not over them.
        tl.set(cover, { zIndex: 0 }, at + OPEN / 2);
        if (wide) tl.fromTo(caseEl, { xPercent: 0 }, { xPercent: 50, duration: OPEN, immediateRender: false }, at);
      } else {
        var prev = sheets[i - 1];
        var label = s.querySelector(".label");
        starts.push(at + FLIP / 2);
        // The next sheet is already lying underneath; the turning one is on top.
        tl.set(s, { autoAlpha: 1, zIndex: 1 }, at);
        tl.set(prev, { zIndex: 2 }, at);
        tl.fromTo(prev, { rotationY: 0 }, { rotationY: -180, duration: FLIP, ease: "power1.inOut", immediateRender: false }, at);
        // Paper lifts: the shadow deepens as it rises and settles as it lands.
        tl.fromTo(prev, { boxShadow: "0 12px 20px rgba(71, 11, 35, 0.18)" }, { keyframes: [{ boxShadow: "0 30px 40px rgba(71, 11, 35, 0.32)", duration: FLIP / 2 }, { boxShadow: "0 6px 10px rgba(71, 11, 35, 0.12)", duration: FLIP / 2 }], immediateRender: false }, at);
        // Past halfway it's the back of the page we see, so its words go.
        tl.set(prev.children, { autoAlpha: 0 }, at + FLIP / 2);
        // The page settles on the left, then lifts away to keep the pink inside showing.
        tl.to(prev, { autoAlpha: 0, duration: 0.2, ease: "none" }, at + FLIP + 0.1);
        // The new section's heading fades in where it is, without moving.
        tl.fromTo(label, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "none", immediateRender: false }, at + FLIP * 0.5);
      }
      tl.to({}, { duration: HOLD });
    });

    st = ScrollTrigger.create({ trigger: folder, start: "top top", end: "bottom bottom", scrub: 0.5, animation: tl });
    sync();
  });

  // A tab takes you to its part of the scroll. The scrub then turns the pages
  // in between in order, like flicking through, and always ends on that sheet,
  // however quickly or often the tabs are clicked.
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function (e) {
      e.preventDefault();
      var at = (starts[i] + FLIP / 2 + HOLD / 2) / tl.duration();
      window.scrollTo({ top: st.start + at * (st.end - st.start), behavior: "instant" });
    });
  });
})();
