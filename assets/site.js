(function () {
  var page = encodeURIComponent(location.origin + location.pathname);
  var text = encodeURIComponent("Put your phone to work. Jasiri for Android: a pocket computer with an AI assistant built in.");

  var nets = {
    linkedin: "https://www.linkedin.com/sharing/share-offsite/?url=" + page,
    x: "https://twitter.com/intent/tweet?url=" + page + "&text=" + text,
    whatsapp: "https://wa.me/?text=" + text + "%20" + page,
    reddit: "https://www.reddit.com/submit?url=" + page + "&title=" + text
  };

  document.querySelectorAll("[data-share]").forEach(function (box) {
    box.querySelectorAll("[data-net]").forEach(function (a) {
      a.href = nets[a.getAttribute("data-net")];
    });
    var copy = box.querySelector("[data-copy]");
    if (!copy) return;
    if (navigator.share) {
      var native = document.createElement("button");
      native.type = "button";
      native.textContent = "Share\u2026";
      native.addEventListener("click", function () {
        navigator.share({ title: document.title, url: location.origin + location.pathname }).catch(function () {});
      });
      box.insertBefore(native, box.querySelector("[data-net]"));
    }
    copy.addEventListener("click", function () {
      var url = location.origin + location.pathname;
      var done = function () {
        copy.textContent = "Copied";
        setTimeout(function () { copy.textContent = "Copy link"; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, done);
      } else {
        done();
      }
    });
  });

  var menu = document.querySelector(".menu");
  var nav = document.getElementById("site-nav");
  if (menu && nav) {
    var setOpen = function (open) {
      nav.classList.toggle("is-open", open);
      menu.setAttribute("aria-expanded", open ? "true" : "false");
      menu.textContent = open ? "Close" : "Menu";
    };
    menu.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        menu.focus();
      }
    });
  }

  /* Looping demo video: muted, with a pause button. Without JavaScript, or when the visitor
     prefers reduced motion, the still image stays and no video is loaded. */
  Array.prototype.forEach.call(document.querySelectorAll("[data-video]"), function (box) {
  if (window.matchMedia) {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    var dark = window.matchMedia("(prefers-color-scheme: dark)");
    var video = null, button = null, paused = false;
    var ext = function () {
      var probe = document.createElement("video");
      return probe.canPlayType && probe.canPlayType('video/mp4; codecs="avc1.42E01E"') ? "mp4" : "webm";
    };
    var label = function () {
      var icon = paused
        ? '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 1l11 6-11 6z"/></svg>'
        : '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 1h4v12H2zM8 1h4v12H8z"/></svg>';
      button.innerHTML = icon + (paused ? "Play video" : "Pause video");
      button.setAttribute("aria-label", paused ? "Play the demo video" : "Pause the demo video");
    };
    var remove = function () {
      if (video) { video.pause(); video.remove(); video = null; }
      if (button) { button.remove(); button = null; }
    };
    var start = function () {
      remove();
      if (reduce.matches) return;
      paused = false;
      video = document.createElement("video");
      video.muted = true; video.loop = true; video.playsInline = true;
      video.setAttribute("muted", ""); video.setAttribute("playsinline", "");
      video.setAttribute("aria-hidden", "true"); video.tabIndex = -1;
      video.preload = "auto";
      video.src = box.getAttribute(dark.matches ? "data-base-dark" : "data-base-light") + "." + ext();
      video.addEventListener("playing", function () { video.classList.add("on"); });
      box.appendChild(video);
      button = document.createElement("button");
      button.type = "button"; button.className = "vbtn";
      label();
      button.addEventListener("click", function () {
        paused = !paused;
        if (paused) video.pause(); else video.play().catch(function () {});
        label();
      });
      box.parentNode.appendChild(button);
      video.play().catch(function () { paused = true; label(); });
    };
    start();
    var again = function () { start(); };
    if (reduce.addEventListener) { reduce.addEventListener("change", again); dark.addEventListener("change", again); }
  }
  });

})();
