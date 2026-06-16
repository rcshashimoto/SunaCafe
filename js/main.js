document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const hero = document.querySelector(".hero");
  const menuToggle = document.querySelector("#menu-toggle");
  const mobileMenu = document.querySelector("#mobile-menu");
  const mobileMenuClose = document.querySelector("#mobile-menu-close");
  const navLinks = Array.from(
    document.querySelectorAll(".site-nav a, .site-footer__nav a")
  );
  const revealTargets = Array.from(
    document.querySelectorAll(
      ".section-heading, .intro__content, .menu-featured-card, .menu-list-card, .gallery-item, .access__info, .access__map, .news__notice, .news__instagram"
    )
  );
  const sectionIds = ["menu", "access", "news", "instagram"];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const desktopHeaderThemeQuery = window.matchMedia("(min-width: 768px)");

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

  const setMobileMenuOpen = (isOpen) => {
    if (!menuToggle || !mobileMenu) return;

    mobileMenu.classList.toggle("hidden", !isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "メニューを閉じる" : "メニューを開く"
    );
  };

  const isMobileMenuOpen = () =>
    Boolean(mobileMenu && !mobileMenu.classList.contains("hidden"));

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const updateHeaderTheme = () => {
    if (!header || !hero) return;

    if (!desktopHeaderThemeQuery.matches) {
      header.classList.remove("is-over-hero");
      return;
    }

    if (window.scrollY <= 0) {
      header.classList.remove("is-over-hero");
      return;
    }

    const headerHeight = getHeaderOffset();
    const heroRect = hero.getBoundingClientRect();
    const isOverHero =
      heroRect.top <= headerHeight && heroRect.bottom > headerHeight;

    header.classList.toggle("is-over-hero", isOverHero);
  };

  let headerThemeRaf = 0;
  const scheduleHeaderThemeUpdate = () => {
    if (headerThemeRaf) return;

    headerThemeRaf = window.requestAnimationFrame(() => {
      headerThemeRaf = 0;
      updateHeaderTheme();
    });
  };

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    link.addEventListener("click", (event) => {
      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      closeMobileMenu();
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

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      setMobileMenuOpen(!isMobileMenuOpen());
    });

    if (mobileMenuClose) {
      mobileMenuClose.addEventListener("click", closeMobileMenu);
    }

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768) {
        closeMobileMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    });
  }

  window.addEventListener("scroll", scheduleHeaderThemeUpdate, {
    passive: true,
  });
  window.addEventListener("resize", scheduleHeaderThemeUpdate);
  desktopHeaderThemeQuery.addEventListener("change", scheduleHeaderThemeUpdate);

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
