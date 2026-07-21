(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Sticky header state */
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile nav toggle */
  const navToggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  navToggle.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  mobileNav.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* Active nav link on scroll (desktop + mobile share data-nav-link) */
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navLinks = Array.from(document.querySelectorAll('[data-nav-link]'));
  const setActive = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  };
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((s) => navObserver.observe(s));
  }

  /* Reveal on scroll */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));

    document.querySelectorAll('.stagger').forEach((group) => {
      Array.from(group.children).forEach((child, i) => child.style.setProperty('--i', i));
    });

    /* Safety net: if IntersectionObserver ever fails to fire (older
       WebViews, odd embedding contexts), never leave content stuck
       invisible — reveal anything in view shortly after load, and keep
       checking on scroll as a standing fallback (cheap once everything
       has been revealed, since the query result shrinks to empty). */
    const revealFallbackCheck = () => {
      document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-visible');
      });
    };
    window.addEventListener('load', () => setTimeout(revealFallbackCheck, 1200));
    window.addEventListener('scroll', () => setTimeout(revealFallbackCheck, 50), { passive: true });
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* Hero rotating word ticker */
  const tickerList = document.querySelector('.ticker-list');
  if (tickerList && !reduceMotion) {
    const items = tickerList.children.length;
    let i = 0;
    setInterval(() => {
      i = (i + 1) % items;
      tickerList.style.transform = `translateY(-${i * 1.15}em)`;
    }, 2200);
  }

  /* Subtle hero parallax drift */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg && !reduceMotion) {
    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          heroBg.style.transform = `translateY(${Math.min(y * 0.18, 120)}px) scale(1.06)`;
          ticking = false;
        });
      },
      { passive: true }
    );
  }
})();
