/* ==========================================================================
   Project Samruddhi — script.js
   Vanilla JS. No dependencies beyond the Bootstrap bundle already loaded.
   Handles: footer year, navbar shrink, scroll progress, mobile-menu close,
            reveal-on-scroll, animated counters, growing timeline line,
            back-to-top. All motion respects prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Navbar: shrink + scroll progress ---------- */
  const navbar = document.getElementById("mainNav");
  const progress = document.getElementById("scrollProgress");

  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;

    // Shrink navbar after a little scroll
    if (navbar) navbar.classList.toggle("scrolled", y > 24);

    // Scroll progress bar
    if (progress) {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? (y / docH) * 100 : 0;
      progress.style.width = pct + "%";
    }

    // Back-to-top visibility
    if (toTop) toTop.classList.toggle("show", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- In-page navigation ----------
     Smooth-scroll to a target with a navbar-height offset. On mobile, the
     collapsed menu must finish closing BEFORE we measure the target's
     position — otherwise the open (tall) menu throws the offset off and the
     page lands at the top. So on mobile we close first, then scroll on the
     Bootstrap 'hidden.bs.collapse' event. On desktop we scroll immediately. */
  const navCollapse = document.getElementById("navItems");
  const toggler = document.querySelector(".navbar-toggler");

  function navOffset() {
    return (navbar ? navbar.offsetHeight : 72) + 8;
  }

  function scrollToTarget(target) {
    const top = target.getBoundingClientRect().top + window.scrollY - navOffset();
    window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function isMobileMenu() {
    return toggler && window.getComputedStyle(toggler).display !== "none";
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      const href = link.getAttribute("href");
      if (!href || href.length < 2) return;          // ignore bare "#"
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      // Mobile + menu open: close it, then scroll once it has collapsed.
      if (isMobileMenu() && navCollapse && navCollapse.classList.contains("show")) {
        const instance =
          bootstrap.Collapse.getInstance(navCollapse) ||
          new bootstrap.Collapse(navCollapse, { toggle: false });
        navCollapse.addEventListener("hidden.bs.collapse", function handler() {
          navCollapse.removeEventListener("hidden.bs.collapse", handler);
          scrollToTarget(target);
          history.replaceState(null, "", href);
        });
        instance.hide();
      } else {
        // Desktop (or menu already closed): scroll right away.
        scrollToTarget(target);
        history.replaceState(null, "", href);
      }
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    const revObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => revObserver.observe(el));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll(".counter");

  function animateCount(el) {
    const target = parseInt(el.getAttribute("data-target"), 10) || 0;
    if (reduceMotion) {
      el.textContent = target.toLocaleString("en-IN");
      return;
    }
    const duration = 1600;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target).toLocaleString("en-IN");
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString("en-IN");
    }
    requestAnimationFrame(tick);
  }

  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCount);
    } else {
      const countObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach((c) => countObserver.observe(c));
    }
  }

  /* ---------- Growing timeline line ---------- */
  const track = document.getElementById("timeline-track");
  const growLine = document.getElementById("growLine");

  function growTimeline() {
    if (!track || !growLine) return;
    const fullH = track.offsetHeight - 12; // matches CSS track inset (top:6 / bottom:6)
    growLine.style.height = fullH + "px";
  }

  if (track && growLine) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      growLine.style.height = (track.offsetHeight - 12) + "px";
    } else {
      const tlObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              growTimeline();
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );
      tlObserver.observe(track);
    }
    // Recalculate on resize so the line stays aligned
    window.addEventListener("resize", function () {
      if (growLine.style.height && growLine.style.height !== "0px") growTimeline();
    });
  }

  /* ---------- Back to top ---------- */
  const toTop = document.getElementById("toTop");
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Initial paint ---------- */
  onScroll();
})();
