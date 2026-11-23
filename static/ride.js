// The end of the About page: the chef pulls up in her car, honks, and offers
// you a lift to the restaurant. "Okay, coming!" drives off and fades to the
// home page; "No" starts a cheeky argument the visitor can only lose.
// Clicking the car honks again.
(function () {
  var section = document.querySelector(".ride");
  if (!section) return;
  var car = section.querySelector(".ride-car");
  var chat = section.querySelector(".ride-chat");
  var invite = section.querySelector(".ride-bubble--jam");
  var replies = section.querySelector(".ride-replies");
  var yes = section.querySelector('[data-reply="yes"]');
  var no = section.querySelector('[data-reply="no"]');
  var dark = section.querySelector(".ride-dark");
  var reduced = window.JamTalk ? JamTalk.reduced : matchMedia("(prefers-reduced-motion: reduce)").matches;
  var motion = !!window.gsap && !reduced;
  var talk = window.JamTalk && JamTalk.prepare(invite, { pitch: 450, speed: 22 });
  var answered = false;
  var leaving = false;

  // A car horn: two detuned square waves through a boxy filter, "beep-beep".
  function honk() {
    var ac = window.JamTalk && JamTalk.audio();
    if (!ac || ac.state !== "running") return;
    [0, 0.2].forEach(function (delay) {
      var t = ac.currentTime + delay;
      var out = ac.createGain();
      out.gain.setValueAtTime(0.0001, t);
      out.gain.exponentialRampToValueAtTime(0.18, t + 0.015);
      out.gain.setValueAtTime(0.18, t + 0.13);
      out.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
      var f = ac.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 1800;
      f.connect(out).connect(ac.destination);
      [415, 523].forEach(function (hz) {
        var o = ac.createOscillator();
        o.type = "square";
        o.frequency.value = hz;
        o.connect(f);
        o.start(t);
        o.stop(t + 0.18);
      });
    });
    if (motion) gsap.fromTo(car, { y: 0 }, { keyframes: [{ y: -6, duration: 0.08 }, { y: 0, duration: 0.3, ease: "bounce.out" }] });
  }

  function message(text, who) {
    var b = document.createElement("div");
    b.className = "ride-bubble ride-bubble--" + who;
    b.textContent = text;
    chat.insertBefore(b, replies);
    if (motion) gsap.from(b, { autoAlpha: 0, y: 10, scale: 0.9, duration: 0.35, ease: "back.out(2)" });
    return b;
  }

  function ask() {
    replies.hidden = false;
    if (motion) gsap.from(replies.children, { autoAlpha: 0, y: 8, stagger: 0.08, duration: 0.3, ease: "power2.out" });
  }

  // ---- Arriving
  function arrive() {
    if (!motion) {
      section.classList.add("is-here");
      if (talk) talk.finish();
      ask();
      return;
    }
    section.classList.add("is-here");
    gsap.timeline()
      .fromTo(car, { xPercent: -160 }, { xPercent: 0, duration: 1.6, ease: "power3.out" })
      .add(honk, "-=0.15")
      .fromTo(invite, { autoAlpha: 0, scale: 0.6, transformOrigin: "20% 100%" }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, "+=0.35")
      .add(function () { if (talk) { talk.play(); } })
      .add(function waitForWords() {
        if (!talk || talk.done) ask();
        else setTimeout(waitForWords, 120);
      }, "+=0.2");
  }
  // Without scripts the replies are plain links and buttons, always shown.
  replies.hidden = true;
  if (motion) {
    gsap.set(car, { xPercent: -160 });
    gsap.set(invite, { autoAlpha: 0 });
  }
  new IntersectionObserver(function (entries, obs) {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    arrive();
  }, { threshold: 0.45 }).observe(section);

  // ---- Answers
  car.addEventListener("click", function () { if (!leaving) honk(); });
  if (talk) invite.addEventListener("click", function () { talk.finish(); });

  // Saying no starts a running argument. Each no gets a cheekier answer
  // and a new way to say no, until the only reply left is yes.
  var refusals = JSON.parse(section.getAttribute("data-refusals") || "[]");
  var round = 0;
  function honks(n) {
    for (var i = 0; i < n; i++) setTimeout(honk, i * 480);
  }
  no.addEventListener("click", function () {
    if (answered || leaving) return;
    var r = refusals[round++];
    if (!r) return;
    answered = true;
    no.disabled = true;
    message(no.textContent, "you");
    setTimeout(function () {
      honks(r.honk || (round === 1 ? 1 : 0));
      message(r.answer, "jam");
      if (r.next) {
        no.textContent = r.next;
        no.disabled = false;
        answered = false;
      } else {
        // Out of excuses: the only button left is yes.
        no.hidden = true;
        yes.textContent = section.getAttribute("data-give-in");
      }
      if (motion) gsap.from(replies.children, { autoAlpha: 0, y: 8, stagger: 0.08, duration: 0.3, ease: "power2.out" });
      chat.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 500);
  });

  yes.addEventListener("click", function (e) {
    if (leaving) return e.preventDefault();
    if (!motion) return; // plain link to the restaurant
    e.preventDefault();
    leaving = true;
    var href = yes.href;
    message(yes.textContent, "you");
    gsap.timeline({ onComplete: function () { location.href = href; } })
      .to(replies, { autoAlpha: 0, duration: 0.2 })
      .add(honk, "+=0.3")
      .to(car, { xPercent: 170, duration: 1.3, ease: "power2.in" }, "+=0.35")
      .to(dark, { autoAlpha: 1, duration: 0.6, ease: "power1.in" }, "-=0.5")
      .to({}, { duration: 0.25 });
  });
})();
