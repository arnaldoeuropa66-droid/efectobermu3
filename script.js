/* ==========================================================================
   EFECTO BERMU — JavaScript principal
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     Detección de capacidades
     ------------------------------------------------------------------------ */
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     1. CURSOR PERSONALIZADO
     Solo se activa en dispositivos con puntero fino y sin reduce-motion
     ------------------------------------------------------------------------ */
  const cursor = document.getElementById('cursor');
  const cring = document.getElementById('cring');

  if (cursor && cring && !isTouch && !prefersReducedMotion) {
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';
    }, { passive: true });

    (function loopCursor() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      cring.style.left = rx + 'px';
      cring.style.top = ry + 'px';
      requestAnimationFrame(loopCursor);
    })();

    // Escalar al pasar sobre elementos interactivos
    const interactiveSelector = 'a, button, .port-item, .svc, .price-card';
    document.querySelectorAll(interactiveSelector).forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        cursor.style.transform = 'translate(-50%,-50%) scale(2.5)';
        cring.style.transform = 'translate(-50%,-50%) scale(1.4)';
        cring.style.borderColor = 'rgba(201,168,76,.8)';
      });
      el.addEventListener('mouseleave', function () {
        cursor.style.transform = 'translate(-50%,-50%) scale(1)';
        cring.style.transform = 'translate(-50%,-50%) scale(1)';
        cring.style.borderColor = 'rgba(201,168,76,.5)';
      });
    });
  } else {
    // Fallback: no mostrar cursor personalizado, restaurar cursor nativo
    if (cursor) cursor.remove();
    if (cring) cring.remove();
  }

  /* ------------------------------------------------------------------------
     2. NAV — cambio de fondo al hacer scroll
     ------------------------------------------------------------------------ */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = function () {
      nav.classList.toggle('scrolled', window.scrollY > 80);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // estado inicial
  }

  /* ------------------------------------------------------------------------
     3. NAV — menú hamburguesa móvil
     ------------------------------------------------------------------------ */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    const openMenu = function () {
      navLinks.classList.add('open');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Cerrar menú');
      document.body.style.overflow = 'hidden';
    };
    const closeMenu = function () {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Abrir menú');
      document.body.style.overflow = '';
    };

    navToggle.addEventListener('click', function () {
      if (navLinks.classList.contains('open')) closeMenu();
      else openMenu();
    });

    // Cerrar al pulsar un enlace
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Cerrar con Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        closeMenu();
        navToggle.focus();
      }
    });

    // Cerrar al redimensionar a desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1000 && navLinks.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  /* ------------------------------------------------------------------------
     4. REVEAL ON SCROLL — IntersectionObserver
     Si el navegador no lo soporta, mostramos todo directamente.
     Si reduce-motion está activo, también mostramos todo sin animación.
     ------------------------------------------------------------------------ */
  const reveals = document.querySelectorAll('.reveal');

  if (reveals.length) {
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
      const observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target); // una sola vez
          }
        });
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      });

      reveals.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      // Fallback: mostrar todo sin animación
      reveals.forEach(function (el) {
        el.classList.add('visible');
      });
    }
  }

  /* ------------------------------------------------------------------------
     5. SCROLL SUAVE para anclas (fallback si el navegador no lo soporta)
     ------------------------------------------------------------------------ */
  if (!('scrollBehavior' in document.documentElement.style)) {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#' || targetId === '#inicio') return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const offset = 80;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     6. AÑO DINÁMICO en el footer (por si quieres olvidarte de actualizarlo)
     ------------------------------------------------------------------------ */
  const yearSpan = document.querySelector('[data-current-year]');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------------------
     7. CERRAR MENÚ al hacer click fuera (backdrop)
     ------------------------------------------------------------------------ */
  if (navLinks && navToggle) {
    document.addEventListener('click', function (e) {
      if (!navLinks.classList.contains('open')) return;
      if (navLinks.contains(e.target) || navToggle.contains(e.target)) return;
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }, { passive: true });
  }

})();