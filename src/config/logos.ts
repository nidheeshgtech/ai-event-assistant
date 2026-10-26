/** Fictional event logos for the three presets, as SVG data URIs. */
const svg = (body: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${body}</svg>`)}`;

export const LOGOS = {
  tech: svg(
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#2dd4bf"/></linearGradient></defs>` +
      `<rect width="64" height="64" rx="16" fill="#0b1030"/><circle cx="32" cy="32" r="17" fill="none" stroke="url(#g)" stroke-width="3"/>` +
      `<path d="M32 15v34M15 32h34" stroke="url(#g)" stroke-width="2" opacity=".55"/><circle cx="32" cy="32" r="6" fill="url(#g)"/>` +
      `<circle cx="44" cy="20" r="3" fill="#2dd4bf"/><circle cx="20" cy="44" r="3" fill="#38bdf8"/>`,
  ),
  corporate: svg(
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe7a3"/><stop offset="1" stop-color="#c99a2e"/></linearGradient></defs>` +
      `<rect width="64" height="64" rx="16" fill="#101433"/><path d="M18 46V24l14-8 14 8v22" fill="none" stroke="url(#g)" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M25 46V32h14v14" fill="none" stroke="url(#g)" stroke-width="3"/><path d="M14 46h36" stroke="url(#g)" stroke-width="3" stroke-linecap="round"/>`,
  ),
  manufacturing: svg(
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fdba74"/><stop offset="1" stop-color="#ea580c"/></linearGradient></defs>` +
      `<rect width="64" height="64" rx="16" fill="#1a1220"/><circle cx="32" cy="32" r="11" fill="none" stroke="url(#g)" stroke-width="3"/>` +
      `<path d="M32 13v6M32 45v6M13 32h6M45 32h6M18.6 18.6l4.2 4.2M41.2 41.2l4.2 4.2M18.6 45.4l4.2-4.2M41.2 22.8l4.2-4.2" stroke="url(#g)" stroke-width="3.5" stroke-linecap="round"/>` +
      `<circle cx="32" cy="32" r="4" fill="#34d399"/>`,
  ),
};
