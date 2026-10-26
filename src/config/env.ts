const aiEndpoint = (import.meta.env.VITE_AI_ENDPOINT as string | undefined)?.trim() ?? '';
const adminAuth = (import.meta.env.VITE_ADMIN_AUTH as string | undefined)?.trim() ?? '';
const leadsEndpoint = (import.meta.env.VITE_LEADS_ENDPOINT as string | undefined)?.trim() ?? '';

export const env = {
  /** Server endpoint for optional AI answers (e.g. "/api/assistant"). Empty = structured engine only. */
  aiEndpoint,
  aiEnabled: Boolean(aiEndpoint),
  /** "required" locks the client-side dashboard until real admin auth is wired up. */
  adminAuthRequired: adminAuth === 'required',
  leadsEndpoint: leadsEndpoint || 'https://formsubmit.co/ajax/hello.nidheesh@gmail.com',
  /** Router basename, derived from Vite's base (e.g. "/events-2026/ai-event-assistant/dist"). */
  basePath: import.meta.env.BASE_URL.replace(/\/$/, ''),
};
