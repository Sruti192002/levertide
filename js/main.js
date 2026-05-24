/* Levertide — interactions */
(function () {
  "use strict";

  /* Sticky navbar background on scroll */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu toggle */
  var toggle = document.getElementById("navToggle");
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.querySelectorAll(".nav__links a, .nav__cta").forEach(function (a) {
    a.addEventListener("click", function () {
      nav.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  /* Scroll-reveal animations */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* Current year */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* VSL: lazy-load YouTube iframe only when the user clicks play.
     Saves ~600 KB of YouTube JS on initial page load. */
  document.querySelectorAll(".vsl__frame[data-yt]").forEach(function (frame) {
    var play = frame.querySelector(".vsl__play");
    if (!play) return;
    play.addEventListener("click", function () {
      var id = frame.getAttribute("data-yt");
      var iframe = document.createElement("iframe");
      iframe.src =
        "https://www.youtube-nocookie.com/embed/" + id +
        "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
      iframe.title = "Levertide VSL";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.setAttribute("allowfullscreen", "");
      iframe.loading = "lazy";
      iframe.className = "vsl__iframe";
      frame.innerHTML = "";
      frame.appendChild(iframe);
    });
  });

  /* Contact form — front-end handling.
     Wire ENDPOINT to your backend / form service (see ENV section in README). */
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  var ENDPOINT = (window.LEVERTIDE_FORM_ENDPOINT || "").trim();

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        note.style.color = "#FF8B8B";
        note.textContent = "Please fill in the required fields.";
        return;
      }
      var data = Object.fromEntries(new FormData(form).entries());
      note.style.color = "var(--accent)";

      if (!ENDPOINT) {
        note.textContent =
          "Thanks, " + (data.name || "") + " — message captured. Connect a form endpoint to receive submissions.";
        form.reset();
        return;
      }

      note.textContent = "Sending…";
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (r) {
          if (!r.ok) throw new Error("Request failed");
          note.textContent = "Thanks — we'll be in touch within 24 hours.";
          form.reset();
        })
        .catch(function () {
          note.style.color = "#FF8B8B";
          note.textContent = "Something went wrong. Email us directly at hello@levertide.com.";
        });
    });
  }
})();
