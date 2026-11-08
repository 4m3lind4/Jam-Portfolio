// The welcome at the door. The waiter talks as the page opens; scrolling then
// opens the doors, she steps aside, and the view walks in towards the menu.
(function () {
  var root = document.documentElement;
  var section = document.getElementById("welcome");
  if (!section) return;
  var bubble = section.querySelector(".welcome-bubble");
  var talk = window.JamTalk && JamTalk.prepare(bubble, { pitch: 470 });
  if (talk) {
    setTimeout(talk.play, 700);
    bubble.addEventListener("click", function (e) { if (!e.target.closest(".talk-sound")) talk.finish(); });
  }

  window.__welcomeRan = true;
  if (!root.classList.contains("welcome-on")) return;
  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove("welcome-on");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  var $ = gsap.utils.selector(section);
  var tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      // Scrolling on means the visitor isn't waiting for the sentence to end.
      onUpdate: function (st) { if (talk && st.progress > 0.04) talk.finish(); },
    },
  });

  tl.to(bubble, { autoAlpha: 0, y: -30, duration: 0.15 }, 0)
    .to($(".welcome-go"), { autoAlpha: 0, duration: 0.1 }, 0)
    .to($(".door--left"), { rotationY: -105, duration: 0.35, ease: "power2.inOut" }, 0.08)
    .to($(".door--right"), { rotationY: 105, duration: 0.35, ease: "power2.inOut" }, 0.08)
    .to($(".welcome-glow"), { opacity: 1, duration: 0.3 }, 0.1)
    // She steps aside and gestures you through.
    .to($(".waiter"), { xPercent: -115, scale: 1.12, transformOrigin: "50% 100%", duration: 0.5, ease: "power1.in" }, 0.2)
    // Walk in through the door.
    .to($(".welcome-room"), { scale: 5.5, duration: 0.6, ease: "power2.in" }, 0.4)
    // ...and into the warm light, which the menu table rises out of.
    .to($(".welcome-flash"), { opacity: 1, duration: 0.25 }, 0.72);
})();
