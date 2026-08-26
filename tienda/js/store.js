(() => {
  const cfg = window.MAZA_STORE_CONFIG || {};
  const apiBase = (cfg.apiBase || '').replace(/\/$/, '');

  async function api(path, options = {}) {
    if (!apiBase || apiBase.includes('up.railway.app') && !window.__MAZA_API_READY) {
      // Intentar /api/config; si falla, devolver error claro
    }
    const res = await fetch(`${apiBase}${path}`, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || 'No se pudo completar la solicitud');
    return data;
  }

  async function loadPublicConfig() {
    try {
      const data = await api('/api/config');
      if (data.paypalClientId) cfg.paypalClientId = data.paypalClientId;
      if (data.apiBase) cfg.apiBase = data.apiBase;
      window.__MAZA_API_READY = true;
      return data;
    } catch (err) {
      console.warn('API de tienda no disponible aún:', err.message);
      return null;
    }
  }

  function showFeedback(el, message, ok) {
    if (!el) return;
    el.hidden = false;
    el.className = `store-feedback ${ok ? 'ok' : 'err'}`;
    el.textContent = message;
  }

  function setLoading(btn, loading, label) {
    if (!btn) return;
    if (loading) {
      btn.dataset.label = btn.textContent;
      btn.disabled = true;
      btn.textContent = label || 'Procesando...';
    } else {
      btn.disabled = false;
      btn.textContent = btn.dataset.label || btn.textContent;
    }
  }

  /* Trial form */
  const trialForm = document.getElementById('trial-form');
  if (trialForm) {
    const feedback = document.getElementById('trial-feedback');
    trialForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = trialForm.querySelector('button[type="submit"]');
      const fd = new FormData(trialForm);
      setLoading(btn, true, 'Activando prueba...');
      try {
        await loadPublicConfig();
        const data = await api('/api/trial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            nombre: fd.get('nombre'),
            email: fd.get('email')
          })
        });
        const params = new URLSearchParams({
          licencia: data.licencia || '',
          email: fd.get('email') || '',
          tipo: 'trial'
        });
        window.location.href = `confirmacion.html?${params.toString()}`;
      } catch (err) {
        showFeedback(feedback, err.message || 'No se pudo activar la prueba.', false);
      } finally {
        setLoading(btn, false);
      }
    });
  }

  /* Nequi comprobante */
  const nequiForm = document.getElementById('nequi-form');
  if (nequiForm) {
    const feedback = document.getElementById('nequi-feedback');
    nequiForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = nequiForm.querySelector('button[type="submit"]');
      setLoading(btn, true, 'Enviando comprobante...');
      try {
        await loadPublicConfig();
        const fd = new FormData(nequiForm);
        fd.set('metodo', 'nequi');
        fd.set('producto', 'maza-smart-bot');
        const res = await fetch(`${apiBase}/api/nequi/comprobante`, {
          method: 'POST',
          body: fd,
          headers: { Accept: 'application/json' }
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'No se pudo enviar el comprobante');
        window.location.href = 'comprobante-recibido.html';
      } catch (err) {
        showFeedback(feedback, err.message || 'Error al enviar el comprobante.', false);
      } finally {
        setLoading(btn, false);
      }
    });
  }

  /* PayPal */
  const paypalMount = document.getElementById('paypal-buttons');
  if (paypalMount) {
    const feedback = document.getElementById('paypal-feedback');
    const nameInput = document.getElementById('paypal-nombre');
    const emailInput = document.getElementById('paypal-email');

    (async () => {
      try {
        await loadPublicConfig();
        if (!cfg.paypalClientId) {
          showFeedback(feedback, 'PayPal aún no está configurado en Railway. Usa Nequi o vuelve pronto.', false);
          return;
        }
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(cfg.paypalClientId)}&currency=USD`;
          s.onload = resolve;
          s.onerror = () => reject(new Error('No se pudo cargar PayPal SDK'));
          document.head.appendChild(s);
        });

        window.paypal.Buttons({
          style: { layout: 'vertical', color: 'blue', shape: 'rect', label: 'paypal' },
          createOrder: (_data, actions) => {
            const nombre = nameInput?.value?.trim();
            const email = emailInput?.value?.trim();
            if (!nombre || !email) {
              showFeedback(feedback, 'Completa nombre y correo antes de pagar.', false);
              return actions.reject();
            }
            const price = cfg.products?.smartBot?.priceUsd || 150;
            return actions.order.create({
              purchase_units: [{
                description: 'MAZA Smart Bot — licencia 6 meses',
                amount: { currency_code: 'USD', value: String(price) }
              }]
            });
          },
          onApprove: async (data) => {
            try {
              const result = await api('/api/paypal/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                  orderId: data.orderID,
                  nombre: nameInput.value.trim(),
                  email: emailInput.value.trim(),
                  producto: 'maza-smart-bot'
                })
              });
              const params = new URLSearchParams({
                licencia: result.licencia || '',
                email: emailInput.value.trim(),
                tipo: 'paypal'
              });
              window.location.href = `confirmacion.html?${params.toString()}`;
            } catch (err) {
              showFeedback(feedback, err.message || 'Pago capturado pero falló la licencia. Escríbenos a comercial@mazafl.com.', false);
            }
          },
          onError: () => showFeedback(feedback, 'Error en PayPal. Intenta de nuevo o usa Nequi.', false)
        }).render('#paypal-buttons');
      } catch (err) {
        showFeedback(feedback, err.message || 'No se pudo iniciar PayPal.', false);
      }
    })();
  }

  /* Confirmación */
  const licenseEl = document.getElementById('license-key');
  if (licenseEl) {
    const params = new URLSearchParams(window.location.search);
    licenseEl.textContent = params.get('licencia') || 'Revisa tu correo';
    const emailEl = document.getElementById('confirm-email');
    if (emailEl) emailEl.textContent = params.get('email') || cfg.contactEmail;
  }

  /* Año footer */
  const year = document.getElementById('current-year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* Menú móvil simple */
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  toggle?.addEventListener('click', () => {
    const open = !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
})();
