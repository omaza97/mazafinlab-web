// MAZA FINLAB — Sitio Corporativo

document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initContactForm();
    initHeaderScroll();
    initNavSpy();
    initScrollReveal();
    initHeroRotator();
    initCinematicHero();
    initFocusRails();
    initFocusRailHints();
});

function initCinematicHero() {
    const hero = document.querySelector('.hero-cinematic');
    if (!hero) return;
    const img = hero.querySelector('.hero-split-visual img');
    const markLoaded = () => hero.classList.add('is-loaded');
    if (img?.complete) markLoaded();
    else img?.addEventListener('load', markLoaded, { once: true });
    setTimeout(markLoaded, 800);
}

function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (!toggle || !navLinks) return;

    const setNavOpen = (open) => {
        navLinks.classList.toggle('active', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };

    toggle.addEventListener('click', () => {
        setNavOpen(!navLinks.classList.contains('active'));
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setNavOpen(false));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            setNavOpen(false);
            toggle.focus();
        }
    });
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function setFieldError(group, message) {
    if (!group) return;
    const errorEl = group.querySelector('.field-error');
    group.classList.toggle('is-invalid', Boolean(message));
    if (errorEl) errorEl.textContent = message || '';
}

function clearFormErrors(form) {
    form.querySelectorAll('.form-group').forEach((group) => setFieldError(group, ''));
}

function showFormFeedback(form, message, type = 'info') {
    const feedback = form.querySelector('#form-feedback');
    if (!feedback) return;
    feedback.hidden = false;
    feedback.textContent = message;
    feedback.className = `form-feedback form-feedback--${type}`;
}

function hideFormFeedback(form) {
    const feedback = form.querySelector('#form-feedback');
    if (!feedback) return;
    feedback.hidden = true;
    feedback.textContent = '';
    feedback.className = 'form-feedback';
}

function validateContactForm(form) {
    clearFormErrors(form);
    hideFormFeedback(form);

    const nombre = form.nombre.value.trim();
    const email = form.email.value.trim();
    const mensaje = form.mensaje.value.trim();
    let valid = true;

    if (!nombre) {
        setFieldError(form.querySelector('[data-field="nombre"]'), 'Escribe tu nombre completo.');
        valid = false;
    }

    if (!email) {
        setFieldError(form.querySelector('[data-field="email"]'), 'Escribe tu correo electrónico.');
        valid = false;
    } else if (!isValidEmail(email)) {
        setFieldError(form.querySelector('[data-field="email"]'), 'El correo no tiene un formato válido.');
        valid = false;
    }

    if (!mensaje) {
        setFieldError(form.querySelector('[data-field="mensaje"]'), 'Cuéntanos brevemente sobre tu proyecto.');
        valid = false;
    } else if (mensaje.length < 10) {
        setFieldError(form.querySelector('[data-field="mensaje"]'), 'Escribe al menos 10 caracteres.');
        valid = false;
    }

    if (!valid) {
        const firstInvalid = form.querySelector('.form-group.is-invalid input, .form-group.is-invalid textarea');
        firstInvalid?.focus();
        showFormFeedback(form, 'Revisa los campos marcados antes de enviar.', 'error');
    }

    return valid;
}

function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.querySelectorAll('input, textarea, select').forEach((field) => {
        field.addEventListener('input', () => {
            const group = field.closest('.form-group');
            if (group?.classList.contains('is-invalid')) {
                setFieldError(group, '');
            }
            hideFormFeedback(form);
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateContactForm(form)) return;

        const nombre = form.nombre.value.trim();
        const email = form.email.value.trim();
        const servicio = form.servicio.value;
        const mensaje = form.mensaje.value.trim();

        const whatsappRaw = (form.dataset.whatsapp || '').trim();
        const emailTo = (form.dataset.email || 'contacto@mazafinlab.com').trim();
        const hasWhatsapp = whatsappRaw && whatsappRaw !== 'TU_NUMERO';

        const bodyText =
            `Hola, soy ${nombre}.\n` +
            `Email: ${email}\n` +
            `Servicio de interés: ${servicio}\n\n` +
            `${mensaje}`;

        if (hasWhatsapp) {
            const text = encodeURIComponent(bodyText);
            window.open(`https://wa.me/${whatsappRaw}?text=${text}`, '_blank', 'noopener');
            showFormFeedback(
                form,
                'Te redirigimos a WhatsApp con tu mensaje. Si no se abrió, usa el botón de contacto.',
                'success'
            );
        } else {
            const subject = encodeURIComponent(`Consulta web — ${servicio}`);
            const body = encodeURIComponent(bodyText);
            window.location.href = `mailto:${emailTo}?subject=${subject}&body=${body}`;
            showFormFeedback(
                form,
                `Tu cliente de correo se abrirá para enviar a ${emailTo}. Si no aparece, escríbenos directamente.`,
                'info'
            );
        }

        form.reset();
        clearFormErrors(form);
    });
}

function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    const onScroll = () => {
        header.classList.toggle('is-scrolled', window.scrollY > 50);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
}

/** Resalta enlace de navegación según sección visible */
function initNavSpy() {
    const links = document.querySelectorAll('.nav-links a[href^="#"]');
    const sections = [...links]
        .map((link) => {
            const id = link.getAttribute('href').slice(1);
            const el = document.getElementById(id);
            return el ? { id, el, link } : null;
        })
        .filter(Boolean);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const match = sections.find((s) => s.el === entry.target);
                if (!match) return;
                links.forEach((l) => l.classList.remove('is-active'));
                match.link.classList.add('is-active');
            });
        },
        { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach(({ el }) => observer.observe(el));
}

/** Animación al entrar en viewport (estilo n8n) */
function initScrollReveal() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = document.querySelectorAll('[data-reveal], .reveal');

    if (prefersReduced) {
        items.forEach((el) => el.classList.add('is-visible'));
        return;
    }

    const heroItems = document.querySelectorAll('.hero-cinematic .reveal, .hero .reveal');
    heroItems.forEach((el) => {
        const delayStr = el.style.getPropertyValue('--reveal-delay') || '0ms';
        const delay = parseInt(delayStr, 10) || 0;
        setTimeout(() => el.classList.add('is-visible'), 180 + delay);
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    items.forEach((el) => {
        if (el.closest('.hero-cinematic') || el.closest('.hero')) return;
        observer.observe(el);
    });

    document.querySelectorAll('[data-count]').forEach((el) => {
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    animateCount(el);
                    obs.unobserve(el);
                });
            },
            { threshold: 0.5 }
        );
        obs.observe(el);
    });
}

function animateCount(el) {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (!Number.isFinite(target)) return;

    const duration = 1200;
    const start = performance.now();

    function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = `${Math.round(target * eased)}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

/** Rotador de casos de uso (estilo "You can" de n8n) */
function initHeroRotator() {
    const el = document.getElementById('hero-rotator-text');
    if (!el) return;

    const phrases = [
        'automatizar procesos con IA',
        'lanzar tu sitio web corporativo',
        'gestionar proyectos con software a medida',
        'integrar APIs y sistemas existentes',
        'escalar tu operación sin improvisar',
        'documentar cada entrega con claridad'
    ];

    let index = 0;

    setInterval(() => {
        el.classList.add('is-changing');
        setTimeout(() => {
            index = (index + 1) % phrases.length;
            el.textContent = phrases[index];
            el.classList.remove('is-changing');
        }, 350);
    }, 3200);
}

/** Galaxia de estrellas en la sección de servicios */
function initStarfield() {
    const canvas = document.querySelector('.section-stars');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let stars = [];
    let width = 0;
    let height = 0;
    let animId = 0;

    function createStars(count) {
        return Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 1.4 + 0.2,
            speed: Math.random() * 0.35 + 0.08,
            twinkle: Math.random() * Math.PI * 2,
            twinkleSpeed: Math.random() * 0.02 + 0.008
        }));
    }

    function resize() {
        const parent = canvas.parentElement;
        if (!parent) return;
        width = parent.offsetWidth;
        height = parent.offsetHeight;
        canvas.width = width;
        canvas.height = height;
        const density = Math.min(180, Math.floor((width * height) / 5500));
        stars = createStars(density);
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        stars.forEach((star) => {
            star.y -= star.speed;
            if (star.y < -2) {
                star.y = height + 2;
                star.x = Math.random() * width;
            }

            star.twinkle += star.twinkleSpeed;
            const alpha = 0.25 + (Math.sin(star.twinkle) + 1) * 0.25;

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(220, 230, 255, ${alpha})`;
            ctx.fill();
        });

        animId = requestAnimationFrame(draw);
    }

    resize();
    draw();

    window.addEventListener('resize', resize);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animId);
        } else {
            draw();
        }
    });
}

/** Carrusel con peso suave bajo el cursor (inspirado en n8n) */
function initFocusRails() {
    document.querySelectorAll('[data-focus-rail]').forEach((rail) => {
        const cards = [...rail.querySelectorAll('.focus-card')];
        if (!cards.length) return;

        const reset = () => {
            cards.forEach((card) => {
                card.style.setProperty('--focus-weight', '0');
                card.classList.remove('is-active', 'is-inactive');
            });
        };

        rail.addEventListener('mousemove', (e) => {
            const pointerX = e.clientX;

            cards.forEach((card) => {
                const rect = card.getBoundingClientRect();
                const center = rect.left + rect.width / 2;
                const dist = Math.abs(pointerX - center);
                const maxDist = rect.width * 1.1;
                const weight = Math.max(0, 1 - dist / maxDist);
                const eased = weight * weight;

                card.style.setProperty('--focus-weight', eased.toFixed(3));
                card.classList.toggle('is-active', eased > 0.55);
                card.classList.toggle('is-inactive', eased <= 0.2);
            });
        });

        rail.addEventListener('mouseleave', reset);

        cards.forEach((card, i) => {
            card.addEventListener('focusin', () => {
                cards.forEach((c, j) => {
                    const w = j === i ? '1' : '0';
                    c.style.setProperty('--focus-weight', w);
                });
            });
        });

        rail.addEventListener('focusout', (e) => {
            if (!rail.contains(e.relatedTarget)) reset();
        });
    });
}

/** Oculta pista "Desliza" tras el primer scroll en móvil */
function initFocusRailHints() {
    document.querySelectorAll('[data-rail-wrap]').forEach((wrap) => {
        const rail = wrap.querySelector('.focus-rail');
        if (!rail) return;

        const markScrolled = () => wrap.classList.add('is-scrolled');

        rail.addEventListener('scroll', markScrolled, { once: true, passive: true });
        rail.addEventListener('touchstart', markScrolled, { once: true, passive: true });
    });
}
