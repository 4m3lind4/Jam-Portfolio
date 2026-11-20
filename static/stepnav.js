// The dots down the left of a kitchen page: one per heading, the current one
// filled, with its name popping out beside it for a moment. They appear once you're past the first screen.
(function () {
  var nav = document.querySelector(".step-nav");
  if (!nav) return;
  var links = Array.prototype.slice.call(nav.querySelectorAll("a"));
  var targets = links.map(function (a) { return document.getElementById(a.hash.slice(1)); });
  var intro = document.getElementById("intro");

  function update() {
    var mid = innerHeight * 0.4;
    nav.classList.toggle("is-shown", !intro || intro.getBoundingClientRect().bottom < innerHeight * 0.5);
    var current = -1;
    targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= mid) current = i; });
    if (current === last) return;
    last = current;
    links.forEach(function (a, i) {
      if (i === current) a.setAttribute("aria-current", "step");
      else a.removeAttribute("aria-current");
    });
    // The name pops out as you reach a heading, then tucks away so it never
    // sits over the text for long.
    nav.classList.add("is-announcing");
    clearTimeout(tuck);
    tuck = setTimeout(function () { nav.classList.remove("is-announcing"); }, 1800);
  }
  var last = null;
  var tuck = null;
  var queued = false;
  addEventListener("scroll", function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; update(); });
  }, { passive: true });
  addEventListener("resize", update);
  update();
})();
