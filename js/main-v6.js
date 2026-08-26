/**
 * MAZA FINLAB — Sitio v6 (producción)
 * Future Product OS + servicios ampliados + menú + Web3Forms
 */
(() => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const navLinks = [...document.querySelectorAll('.main-nav a')];
  const sections = [...document.querySelectorAll('main section[id]')];

  function updateHeader() {
    header?.classList.toggle('scrolled', window.scrollY > 24);
  }

  function closeMenu() {
    nav?.classList.remove('open');
    toggle?.classList.remove('active');
    toggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  toggle?.addEventListener('click', () => {
    const willOpen = !nav.classList.contains('open');
    nav.classList.toggle('open', willOpen);
    toggle.classList.toggle('active', willOpen);
    toggle.setAttribute('aria-expanded', String(willOpen));
    document.body.classList.toggle('menu-open', willOpen);
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: '-34% 0px -58% 0px', threshold: 0 }
  );
  sections.forEach((section) => sectionObserver.observe(section));

  const year = document.getElementById('current-year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* Engineering network — animated systems map */
  const canvas = document.getElementById('hero-network');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');
    let nodes = [];
    let raf = 0;
    let pointer = { x: 0, y: 0, active: false };
    let size = { width: 0, height: 0 };

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      size = { width: rect.width, height: rect.height };
      const count = Math.min(58, Math.max(34, Math.floor((rect.width * rect.height) / 25000)));
      nodes = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        radius: index % 11 === 0 ? 2.4 : 1.35,
        type: index % 13 === 0 ? 'module' : index % 7 === 0 ? 'cross' : 'node',
        phase: Math.random() * Math.PI * 2
      }));
    }

    function drawNode(node, time) {
      const pulse = 0.72 + Math.sin(time * 0.0012 + node.phase) * 0.22;

      if (node.type === 'module') {
        ctx.strokeStyle = `rgba(104,174,239,${0.5 * pulse})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(node.x - 4, node.y - 4, 8, 8);
        ctx.fillStyle = `rgba(34,116,212,${0.24 * pulse})`;
        ctx.fillRect(node.x - 2, node.y - 2, 4, 4);
        return;
      }

      if (node.type === 'cross') {
        ctx.strokeStyle = `rgba(112,88,221,${0.42 * pulse})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(node.x - 3.5, node.y);
        ctx.lineTo(node.x + 3.5, node.y);
        ctx.moveTo(node.x, node.y - 3.5);
        ctx.lineTo(node.x, node.y + 3.5);
        ctx.stroke();
        return;
      }

      ctx.fillStyle = `rgba(104,174,239,${0.66 * pulse})`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    function frame(time = 0) {
      const w = size.width;
      const h = size.height;
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;

        if (pointer.active) {
          const dx = pointer.x - n.x;
          const dy = pointer.y - n.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 180 && distance > 0) {
            const pull = (1 - distance / 180) * 0.0022;
            n.x += dx * pull;
            n.y += dy * pull;
          }
        }

        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.x = Math.max(0, Math.min(w, n.x));
        n.y = Math.max(0, Math.min(h, n.y));
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          const range = 152;
          if (dist < range) {
            const alpha = (1 - dist / range) * 0.2;
            ctx.strokeStyle = `rgba(104,174,239,${alpha})`;
            ctx.lineWidth = .75;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((node) => drawNode(node, time));
      raf = requestAnimationFrame(frame);
    }

    resize();
    frame();
    canvas.parentElement.addEventListener('pointermove', (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        active: true
      };
    }, { passive: true });
    canvas.parentElement.addEventListener('pointerleave', () => {
      pointer.active = false;
    }, { passive: true });
    window.addEventListener('resize', () => {
      cancelAnimationFrame(raf);
      resize();
      frame();
    });
  }

  /* Product-led portfolio tabs */
  const productTabs = [...document.querySelectorAll('.product-tab[role="tab"]')];

  function selectProduct(tab, moveFocus = false) {
    productTabs.forEach((item) => {
      const isActive = item === tab;
      const panel = document.getElementById(item.getAttribute('aria-controls'));
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-selected', String(isActive));
      item.tabIndex = isActive ? 0 : -1;
      if (panel) {
        panel.hidden = !isActive;
        panel.classList.toggle('is-active', isActive);
      }
    });
    if (moveFocus) tab.focus();
  }

  productTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectProduct(tab));
    tab.addEventListener('keydown', (event) => {
      const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = productTabs.length - 1;
      else {
        const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
        nextIndex = (index + direction + productTabs.length) % productTabs.length;
      }
      selectProduct(productTabs[nextIndex], true);
    });
  });

  /* Web3Forms */
  const form = document.getElementById('project-form');
  const feedback = document.getElementById('form-feedback');

  function showFeedback(msg, ok) {
    if (!feedback) return;
    feedback.hidden = false;
    feedback.className = `form-feedback ${ok ? 'ok' : 'err'}`;
    feedback.textContent = msg;
  }

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const accessKey =
      window.MAZA_SITE_CONFIG?.web3formsAccessKey?.trim() ||
      form.dataset.web3formsKey?.trim() ||
      '';
    const notifyEmail =
      window.MAZA_SITE_CONFIG?.notifyEmail?.trim() ||
      form.dataset.notifyEmail?.trim() ||
      'comercial@mazafl.com';

    if (!accessKey || accessKey === 'CONFIGURA_TU_ACCESS_KEY' || accessKey === 'TU_ACCESS_KEY') {
      showFeedback(`Web3Forms no configurado. Escríbenos a ${notifyEmail} o por WhatsApp.`, false);
      return;
    }

    const nombre = data.get('nombre');
    const empresa = data.get('empresa') || 'No indicada';
    const correo = data.get('correo');
    const telefono = data.get('telefono') || '';
    const servicio = data.get('servicio');
    const mensaje = data.get('mensaje');

    if (!nombre || !correo || !telefono || !mensaje) {
      showFeedback('Completa los campos obligatorios para continuar.', false);
      return;
    }

    const bodyText =
      `Nombre: ${nombre}\n` +
      `Empresa: ${empresa}\n` +
      `Correo: ${correo}\n` +
      `Teléfono: ${telefono}\n` +
      `Servicio: ${servicio}\n\n` +
      `Proceso o necesidad:\n${mensaje}`;

    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.dataset.label = btn.textContent;
      btn.textContent = 'Enviando...';
    }

    try {
      const payload = new FormData();
      payload.append('access_key', accessKey);
      payload.append('name', String(nombre));
      payload.append('email', String(correo));
      payload.append('phone', String(telefono));
      payload.append('subject', `Consulta web — ${servicio}`);
      payload.append('message', bodyText);
      payload.append('from_name', 'Sitio Maza FinLab');
      payload.append('replyto', String(correo));

      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: payload,
        headers: { Accept: 'application/json' }
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'No se pudo enviar');

      showFeedback('Mensaje enviado. Te contactaremos pronto.', true);
      form.reset();
    } catch (err) {
      showFeedback(
        err.message || `Error al enviar. Escríbenos a ${notifyEmail} o por WhatsApp.`,
        false
      );
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = btn.dataset.label || 'Solicitar evaluación';
      }
    }
  });

  /* Lightbox: clic en capturas de producto */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox?.querySelector('.lightbox-image');
  const lightboxClose = lightbox?.querySelector('.lightbox-close');
  let lightboxTrigger = null;

  const openLightbox = (src, alt, trigger) => {
    if (!lightbox || !lightboxImg || !src) return;
    lightboxTrigger = trigger || null;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add('is-open'));
    document.body.classList.add('lightbox-open');
    lightboxClose?.focus();
  };

  const closeLightbox = () => {
    if (!lightbox || !lightboxImg) return;
    lightbox.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
    const finish = () => {
      if (lightbox.classList.contains('is-open')) return;
      lightbox.hidden = true;
      lightboxImg.src = '';
      lightboxImg.alt = '';
      lightboxTrigger?.focus?.();
      lightboxTrigger = null;
    };
    lightbox.addEventListener('transitionend', finish, { once: true });
    setTimeout(finish, 320);
  };

  document.querySelectorAll('[data-lightbox]').forEach((el) => {
    const activate = () => {
      const img = el.querySelector('img');
      const src = el.getAttribute('data-lightbox-src') || img?.currentSrc || img?.src || '';
      const alt = img?.alt || el.getAttribute('aria-label') || '';
      openLightbox(src, alt, el);
    };
    el.addEventListener('click', activate);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox?.classList.contains('is-open')) {
      e.preventDefault();
      closeLightbox();
    }
  });

  /* Product rail focus effect */
  document.querySelectorAll('[data-focus-rail]').forEach((rail) => {
    const cards = [...rail.querySelectorAll('.product-tile')];
    if (!cards.length) return;

    const reset = () => {
      cards.forEach((card) => {
        card.style.setProperty('--focus-weight', '0');
        card.classList.remove('is-active', 'is-inactive');
      });
    };

    rail.addEventListener('mousemove', (e) => {
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const dist = Math.abs(e.clientX - center);
        const maxDist = rect.width * 1.1;
        const weight = Math.max(0, 1 - dist / maxDist);
        const eased = weight * weight;
        card.style.setProperty('--focus-weight', eased.toFixed(3));
        card.classList.toggle('is-active', eased > 0.55);
        card.classList.toggle('is-inactive', eased <= 0.2);
      });
    });

    rail.addEventListener('mouseleave', reset);
  });

  document.querySelectorAll('[data-rail-wrap]').forEach((wrap) => {
    const rail = wrap.querySelector('.products-rail');
    if (!rail) return;
    const mark = () => wrap.classList.add('is-scrolled');
    rail.addEventListener('scroll', mark, { once: true, passive: true });
    rail.addEventListener('touchstart', mark, { once: true, passive: true });
  });
})();
