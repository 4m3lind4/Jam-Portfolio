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
  var tabs = gsap.utils.toArray(folder.querySelectorAll(".folder-tab"));
  var sheets = gsap.utils.toArray(folder.querySelectorAll(".folder-sheet"));
  var OPEN = 0.5, HOLD = 1, CLOSE = 0.5;
  // Wide screens lay the folder fully open; narrow ones have no room beside
  // it, so the cover swings back just far enough to read the sheet.
  var WIDE = matchMedia("(min-width: 761px)").matches;
  var ANGLE = WIDE ? -180 : -168;
  var caseEl = folder.querySelector(".folder-case");
  var current = -1;

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

  // One stretch of scroll per tab: the cover opens, holds, and closes again
  // (the last one stays open). Which sheet is inside follows the scroll.
  var tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
  var starts = [];
  sheets.forEach(function (s, i) {
    var at = tl.duration();
    starts.push(at);
    tl.call(show, [i], at);
    tl.fromTo(cover, { rotationY: 0 }, { rotationY: ANGLE, duration: OPEN, immediateRender: false }, at);
    if (WIDE && i === 0) tl.fromTo(caseEl, { xPercent: 0 }, { xPercent: 50, duration: OPEN, immediateRender: false }, at);
    tl.fromTo(s, { y: 30, rotation: -1.5 }, { y: 0, rotation: 0, duration: OPEN, ease: "back.out(1.4)", immediateRender: false }, at + 0.1);
    tl.to({}, { duration: HOLD });
    if (i < sheets.length - 1) tl.to(cover, { rotationY: 0, duration: CLOSE });
  });

  var st = ScrollTrigger.create({
    trigger: folder,
    start: "top top",
    end: "bottom bottom",
    scrub: 0.5,
    animation: tl,
    onUpdate: function (self) {
      var t = self.progress * tl.duration();
      var i = 0;
      starts.forEach(function (s, n) { if (t >= s) i = n; });
      show(i);
    },
  });
  show(0);

  // A tab takes you to its part of the scroll, with that sheet open. It jumps
  // there rather than scrolling past the tabs in between, which would flap the
  // cover open and shut and flash each sheet on the way. Instead the open
  // sheet slides out and the new one slides in.
  var pocket = folder.querySelector(".folder-pocket");
  var swapping = null;
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function (e) {
      e.preventDefault();
      if (i === current && !swapping) return;
      var at = (starts[i] + OPEN + HOLD / 2) / tl.duration();
      var top = st.start + at * (st.end - st.start);
      if (swapping) swapping.kill();
      swapping = gsap.timeline({ onComplete: function () { swapping = null; } })
        .to(pocket, { autoAlpha: 0, x: 24, duration: 0.16, ease: "power1.in" })
        .call(function () {
          window.scrollTo({ top: top, behavior: "instant" });
          st.update();
          var scrub = st.getTween();
          if (scrub) scrub.progress(1);
          tl.progress(at);
          show(i);
        })
        .fromTo(pocket, { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 0.28, ease: "power2.out", clearProps: "transform,opacity,visibility" });
    });
  });
})();
