// ─── ZanLux website settings ───
// Point API at your FBBMS backend (the same one the management app uses), ending in /api
window.ZANLUX = {
  API: window.ZANLUX_API || (['localhost', '127.0.0.1'].includes(location.hostname) ? 'http://localhost:5000/api' : 'https://api.fourbrothers.online/api'),
  SLUG: 'zanlux',                 // business slug in FBBMS
  CURRENCY: 'TZS',
  POLL_MS: 30000                  // how often products refresh automatically
};
