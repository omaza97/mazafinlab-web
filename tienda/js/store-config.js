/**
 * Configuración pública de la tienda Maza FinLab.
 * No colocar secretos aquí.
 *
 * Tras desplegar en Railway, reemplaza apiBase con la URL real del servicio
 * (también define BASE_URL igual en variables Railway).
 */
window.MAZA_STORE_CONFIG = {
  apiBase: 'https://mazafl-tienda-api-production.up.railway.app',
  siteUrl: 'https://mazafl.com',
  contactEmail: 'contacto@mazafl.com',
  supportWhatsApp: '573245209070',
  paypalClientId: '', // Se obtiene de GET /api/config
  products: {
    smartBot: {
      id: 'maza-smart-bot',
      name: 'MAZA Smart Bot',
      priceUsd: 150,
      durationMonths: 6,
      trialHours: 24
    }
  }
};
