/**
 * Centrale configuratie — pas hier aan, nergens anders.
 * Secrets (SumUp key) worden ingeladen vanuit omgevingsvariabelen
 * die in GitHub Actions worden gezet als repository secret.
 */
const config = {
  // Betaling
  price: Number(import.meta.env.VITE_PRICE ?? 3.00),
  currency: 'EUR',
  sumupAffiliateKey: import.meta.env.VITE_SUMUP_KEY ?? 'YOUR_KEY_HERE',

  // Fotobooth gedrag
  totalPhotos: 4,
  countdownSecs: 3,
  autoRestartSecs: 15,

  // Fotostrip
  stripFooter: 'Photobooth ✦ 2026',
  stripBg: '#000000',

  // URL scheme callback (moet overeenkomen met GitHub Pages URL)
  baseUrl: import.meta.env.VITE_BASE_URL ?? 'https://achimpieters.github.io/photobooth',
}

export default config
