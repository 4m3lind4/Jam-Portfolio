// A project's gallery: clicking a piece opens a close-up of it, front on and
// larger, with its description, over a darkened page. Esc, the close button or
// a click on the dark backdrop puts it away.
(function () {
  var box = document.querySelector(".gal-box");
  if (!box) return;
  var stage = box.querySelector(".gal-box-stage");
  var copy = box.querySelector(".gal-box-copy");
  var opener = null;

  document.querySelectorAll(".gal-open").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".gal-item");
      stage.innerHTML = "";
      var dev = btn.querySelector(".dev").cloneNode(true);
      stage.appendChild(dev);
      stage.className = "gal-box-stage " + [].filter.call(item.classList, function (c) { return c.indexOf("gal-item--") === 0; }).join(" ").replace("gal-item--", "is-");
      copy.innerHTML = item.querySelector(".gal-text").innerHTML;
      opener = btn;
      if (box.showModal) box.showModal();
      else box.setAttribute("open", "");
    });
  });

  function close() {
    if (box.close) box.close();
    else box.removeAttribute("open");
  }
  box.querySelector(".gal-close").addEventListener("click", close);
  // A click on the backdrop lands on the dialog itself, not its contents.
  box.addEventListener("click", function (e) { if (e.target === box) close(); });
  box.addEventListener("close", function () { if (opener) opener.focus(); });
})();
