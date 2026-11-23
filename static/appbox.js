// The finished dish on a kitchen page opens the app itself: tap the phone on
// the plate (or the "Open the app" button on its ticket) and the app fills the
// screen, either the interactive web demo or the walkthrough video.
(function () {
  var box = document.querySelector(".app-box");
  if (!box) return;
  var holder = box.querySelector(".app-phone");
  var opener = null;

  function open(e) {
    opener = e && e.currentTarget;
    if (!holder.firstChild) {
      var src = box.getAttribute("data-src");
      var el;
      if (box.getAttribute("data-kind") === "video") {
        el = document.createElement("video");
        el.src = src;
        el.controls = true;
        el.playsInline = true;
        el.autoplay = true;
      } else {
        el = document.createElement("iframe");
        el.src = src;
        el.title = box.getAttribute("aria-label");
      }
      holder.appendChild(el);
    } else {
      var v = holder.querySelector("video");
      if (v) v.play().catch(function () {});
    }
    if (box.showModal) box.showModal();
    else box.setAttribute("open", "");
  }
  function close() {
    var v = holder.querySelector("video");
    if (v) v.pause();
    if (box.close) box.close();
    else box.removeAttribute("open");
  }

  document.querySelectorAll(".app-open").forEach(function (b) { b.addEventListener("click", open); });
  var phone = document.querySelector(".plate-phone");
  if (phone) {
    phone.classList.add("is-openable");
    phone.addEventListener("click", open);
  }
  box.querySelector(".app-close").addEventListener("click", close);
  box.addEventListener("click", function (e) { if (e.target === box) close(); });
  box.addEventListener("close", function () {
    var v = holder.querySelector("video");
    if (v) v.pause();
    if (opener && opener.focus) opener.focus();
  });
})();
