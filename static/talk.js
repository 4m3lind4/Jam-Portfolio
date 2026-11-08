// Speech bubbles that "talk": the words type in with a little synthesised
// babble, a blip per syllable. The real text stays in the page for screen
// readers; the typed copy beside it is decoration. Sound is off until the
// visitor turns it on (browsers only allow audio after a click), and the
// choice is remembered across pages.
(function () {
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var KEY = "jam-sound";
  var ctx = null;
  var on = false;
  try { on = localStorage.getItem(KEY) === "on"; } catch (e) {}

  function audio() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // One syllable: a short sliding tone through a vowel-ish filter.
  var VOWEL = { a: 0, e: 4, i: 7, o: -3, u: -5, y: 5 };
  function blip(ch, pitch) {
    if (!on) return;
    var ac = audio();
    if (!ac || ac.state !== "running") return;
    var t = ac.currentTime;
    var step = VOWEL[ch] != null ? VOWEL[ch] : (ch.charCodeAt(0) % 9) - 4;
    var f = pitch * Math.pow(2, (step + (Math.random() * 2 - 1)) / 12);
    var osc = ac.createOscillator();
    var filter = ac.createBiquadFilter();
    var gain = ac.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(f * 1.12, t);
    osc.frequency.exponentialRampToValueAtTime(f, t + 0.05);
    filter.type = "bandpass";
    filter.frequency.value = f * 2.4;
    filter.Q.value = 1.2;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.16, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.075);
    osc.connect(filter).connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  // Wrap every visible character of `el` in a span, keeping links and bold.
  function split(el) {
    var chars = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          for (var i = 0; i < n.textContent.length; i++) {
            var s = document.createElement("span");
            s.className = "talk-ch";
            s.textContent = n.textContent[i];
            frag.appendChild(s);
            chars.push(s);
          }
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) {
          walk(n);
        }
      });
    })(el);
    return chars;
  }

  // Make a bubble's `.talk-text` speakable. Returns { play, finish, done }.
  function prepare(bubble, opts) {
    opts = opts || {};
    var source = bubble.querySelector(".talk-text");
    if (!source || bubble.__talk) return bubble.__talk;
    var copy = source.cloneNode(true);
    copy.removeAttribute("id");
    copy.classList.add("talk-copy");
    copy.setAttribute("aria-hidden", "true");
    copy.querySelectorAll("a, button").forEach(function (a) { a.setAttribute("tabindex", "-1"); });
    source.classList.add("talk-source");
    source.parentNode.insertBefore(copy, source.nextSibling);
    var chars = split(copy);
    var pitch = opts.pitch || 420;
    var speed = opts.speed || 26;
    var shown = 0;
    var timer = null;
    var api = { done: false };

    function finish() {
      clearTimeout(timer);
      for (; shown < chars.length; shown++) chars[shown].classList.add("is-on");
      api.done = true;
      bubble.classList.remove("is-talking");
      if (opts.onDone) opts.onDone();
    }
    function tick() {
      if (shown >= chars.length) return finish();
      var s = chars[shown++];
      s.classList.add("is-on");
      var c = s.textContent.toLowerCase();
      var wait = speed;
      if (/[.!?]/.test(c)) wait = speed * 9;
      else if (/[,;:—–]/.test(c)) wait = speed * 5;
      else if (/[a-z]/.test(c) && shown % 2) blip(c, pitch);
      timer = setTimeout(tick, wait);
    }
    api.play = function () {
      if (api.done || timer) return;
      if (reduced) return finish();
      bubble.classList.add("is-talking");
      tick();
    };
    api.finish = finish;
    if (reduced) finish();
    bubble.__talk = api;
    return api;
  }

  // The sound switch: any .talk-sound button on the page.
  function sync() {
    document.querySelectorAll(".talk-sound").forEach(function (b) {
      b.hidden = reduced;
      b.setAttribute("aria-pressed", String(on));
      b.querySelector(".talk-sound-label").textContent = on ? "Sound on" : "Sound off";
    });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".talk-sound");
    if (!b) return;
    on = !on;
    try { localStorage.setItem(KEY, on ? "on" : "off"); } catch (err) {}
    if (on) { audio(); blip("a", 420); }
    sync();
  });
  // A remembered "on" still needs one gesture before audio can start.
  ["pointerdown", "keydown"].forEach(function (type) {
    addEventListener(type, function () { if (on) audio(); }, { once: true, capture: true });
  });
  document.addEventListener("DOMContentLoaded", sync);
  sync();

  window.JamTalk = { prepare: prepare, reduced: reduced };
})();
