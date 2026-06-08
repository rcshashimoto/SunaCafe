document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const navLinks = Array.from(
    document.querySelectorAll(".site-nav a, .site-footer__nav a")
  );
  const revealTargets = Array.from(
    document.querySelectorAll(
      ".section-heading, .intro__content, .menu-card, .gallery-item, .access__info, .access__map, .news__notice, .news__instagram"
    )
  );
  const sectionIds = ["menu", "access", "news", "instagram"];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const getHeaderOffset = () => {
    if (!header) return 0;
    return header.getBoundingClientRect().height;
  };

  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      const targetId = link.getAttribute("href")?.slice(1);
      link.classList.toggle("is-active", targetId === id);
    });
  };

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    link.addEventListener("click", (event) => {
      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      const top =
        target.getBoundingClientRect().top + window.scrollY - getHeaderOffset() - 12;

      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
      history.replaceState(null, "", href);
      setActiveLink(href.slice(1));
    });
  });

  if (revealTargets.length > 0) {
    revealTargets.forEach((target, index) => {
      target.classList.add("reveal");
      target.style.setProperty("--reveal-delay", `${Math.min(index * 70, 280)}ms`);
    });

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealTargets.forEach((target) => target.classList.add("is-visible"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        {
          root: null,
          rootMargin: "0px 0px -10% 0px",
          threshold: 0.2,
        }
      );

      revealTargets.forEach((target) => revealObserver.observe(target));
    }
  }

  if ("IntersectionObserver" in window && sections.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveLink(visible.target.id);
        }
      },
      {
        root: null,
        rootMargin: "-35% 0px -55% 0px",
        threshold: [0.15, 0.3, 0.6],
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  const hashTarget = window.location.hash.slice(1);
  if (hashTarget) {
    setActiveLink(hashTarget);
  } else {
    setActiveLink("menu");
  }
});
