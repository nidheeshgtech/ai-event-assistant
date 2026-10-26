import { env } from '@/config/env';

/**
 * Lead delivery via FormSubmit (same service as the EventVerse site).
 * Override the endpoint with VITE_LEADS_ENDPOINT, e.g. the random alias FormSubmit issues.
 */
export async function emailLead(subject: string, replyTo: string, fields: Record<string, string>): Promise<void> {
  const res = await fetch(env.leadsEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ _subject: subject, _template: 'table', _replyto: replyTo, ...fields }),
  });
  const body = (await res.json().catch(() => ({}))) as { success?: string | boolean; message?: string };
  if (!res.ok || String(body.success) !== 'true') throw new Error(body.message || `Lead email failed (${res.status})`);
}
