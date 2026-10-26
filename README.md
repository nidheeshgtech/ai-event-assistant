# AI Event Assistant — EventVerse Studio, product 02

A bilingual (English/Arabic) event assistant for exhibitions, conferences and festivals. Visitors ask questions in plain language and get answers built **only from the event's own data**: exhibitors, sessions, speakers, halls, facilities, announcements and FAQs. Results are rich cards, and any stand, hall or facility can be highlighted on an interactive floorplan.

> **DEMO CONTENT.** *Dubai Future Innovation Expo 2026*, *Gulf Leadership & Digital Transformation Summit 2026* and *Industrial Manufacturing Exhibition 2026* are fictional. So are all of their companies, people, venues and dates. Every screen labels them as demo content.

This is a standalone app in its own folder, next to the original `eventverse/` Catch the Gift project. That project is not modified.

## Quick start

```bash
cd events-2026/ai-event-assistant
npm install
npm run dev        # http://localhost:5174
npm test           # engine, dataset and API tests (vitest)
npm run build      # typecheck + production build into dist/
```

No keys are needed. The demo runs fully in the browser.

## Routes

| Path | What it is |
| --- | --- |
| `/solutions/ai-event-assistant` | Product page: what it does, who it's for, how it works, features, customisation, live demo, Request a Demo form, FAQ, plus the floating widget |
| `/demo/ai-event-assistant` | Full-page assistant (kiosk / event app view), with a preset switcher and an event info sidebar |
| `/demo/ai-event-assistant/map` | Interactive floorplan. Accepts `?stand=H2-15`, `?hall=H3` and `?facility=prayer,first-aid`, and includes the floating widget |
| `/demo/ai-event-assistant/dashboard` | Organiser dashboard: analytics, questions, event profile, branding, exhibitors, speakers, sessions, FAQs, announcements, settings, import/export |

Every demo route takes `?preset=tech|corporate|manufacturing`. `/` redirects to the product page.

## How answers work

```
question ──► parse (EN/AR normalisation, intents, entities, dates, halls, stands)
         ──► route (stand → facility → named exhibitor/speaker → hours → hall
                    → directory → announcements → speakers → sessions → exhibitors
                    → follow-ups from context → FAQ / free-text search → "I don't know")
         ──► reply = text + card blocks that reference dataset ids
```

- **Engine:** `src/engine/`. It is pure, synchronous and deterministic. Search is weighted token matching with IDF, prefix and one-typo fuzzy matching, and category keyword expansion.
- **Arabic support:** the normaliser removes diacritics and tatweel, unifies letter variants (أ/إ/آ→ا, ى→ي, ة→ه) and converts Arabic-Indic digits. It also strips light prefixes and suffixes (ال، و، بال، ات…). Arabic questions are answered in Arabic.
- **Cards show real records only.** A card is rendered from an id, so the engine cannot invent an exhibitor, session, time or stand.
- **No answer means no guess.** The visitor is told the information isn't available and is pointed to the information desk or organiser contact. The question is then marked unanswered for the dashboard report.
- **Follow-ups use conversation context.** Examples: "Where is their stand?", "Tell me about the first one", "Who is speaking?", "What about tomorrow?", "What else is on that day?", "Explain this in Arabic".
- **"Today" and "now":** during the event days the real date and time are used. On any other day, the per-preset **demo clock** is used (default Day 1, 11:30), and answers say so.
- **No walking directions.** The data holds published location text, such as "Concourse, between the entrances to Hall 1 and Hall 3". The map is labelled as schematic.

### Three modes, one engine

- **Visitor:** programme, speakers, halls, facilities, hours.
- **Exhibitor:** company, product and category search, stands, brochure and enquiry links.
- **Organizer:** announcements, FAQs and support. Important announcements appear on greeting.

The mode changes the suggested questions, the greeting and how ambiguous topics are ranked.

## Data

- **Schema:** `src/types/event.ts`.
- **Datasets:**
  - `src/data/dfie/`: the main demo. 30 exhibitors, 15 speakers, 20 sessions, 4 halls, 4 stages, 12 categories, 17 facilities, 6 announcements, 14 FAQs.
  - `src/data/conference/`: a 2-day summit.
  - `src/data/manufacturing/`: a 3-day trade show.
- **Text format:** every visitor-facing string is `{ en, ar }`.
- **Stands:** codes are `H{hall}-{slot}`. Each hall has up to 20 slots, drawn 5 per row on the map.
- **Facilities:** placed by `zone` (a hall id or `concourse`) plus `x`/`y` from 0 to 1 inside that zone.
- **Validation:** `src/services/datasetValidation.ts` checks structure, ids, stands, references, times and same-stage overlaps. It runs on every dashboard save and import.

## White-label presets

`src/config/presets.ts` has three presets on the same engine:

| Preset | Dataset | Assistant | Colours | Widget |
| --- | --- | --- | --- | --- |
| Technology Exhibition | Dubai Future Innovation Expo 2026 | Nova / نوفا | sky + violet | bottom right |
| Corporate Conference | Gulf Leadership & Digital Transformation Summit 2026 | Summit Concierge / مساعد القمة | gold + blue | bottom right |
| Manufacturing Exhibition | Industrial Manufacturing Exhibition 2026 | Forge / فورج | orange + green | bottom left |

These are all editable in **Dashboard → Branding & languages**: logo (PNG/JPG/WebP, resized to 256px, SVG rejected), event name, colours, welcome message, assistant name, languages, default language, suggested questions per mode, and widget placement.

## Optional AI model (server-side)

`api/assistant.ts` is a Vercel function that calls Claude through the official Anthropic SDK.

- **When it is called:** only when `VITE_AI_ENDPOINT` is set, and only for questions the structured engine could not answer. Identical questions are cached per session. Datasets edited locally never go to the AI, because the server only knows the published data.
- **Key handling:** the key lives only on the server (`ANTHROPIC_API_KEY`). The browser never sees it.
- **Grounding:** the server uses its own copy of the dataset, never data sent by the client. The full dataset goes in a prompt-cached system prompt with strict rules: answer only from `EVENT_DATA`, say when information is missing, and give no directions or distances.
- **Prompt injection:** the visitor's question is fenced in `<visitor_question>` tags and treated as untrusted input. The rules tell the model to ignore instructions inside it.
- **Output checks:** the response is schema-constrained JSON, with the answer plus the ids of the records mentioned. Every id is re-checked against the dataset, and unknown ids are dropped before any card is shown.
- **Abuse limits:** input is validated (500 characters max, known preset, mode and language). Requests are rate-limited per IP (8 per minute and 60 per hour by default). An optional origin allow-list is available.
- **Failures:** timeouts, errors, refusals and malformed output return an error status. The client then shows the engine's answer with a note that the AI service is unavailable.
- **Model:** default is `claude-opus-5-5` at low effort, with server-side fallbacks enabled. Override with `AI_MODEL`.

To enable AI answers, deploy to Vercel, set `ANTHROPIC_API_KEY` in the project's environment variables, and set `VITE_AI_ENDPOINT=/api/assistant`. See `.env.example` for every variable.

## Privacy

- No visitor accounts, names or contact details are collected by the assistant.
- Question logging can be switched off per preset in Dashboard → Assistant settings. When it is on:
  - Only the question text is stored, with emails and phone numbers redacted, capped at 160 characters.
  - The chat shows a notice and asks visitors not to share personal information.
  - In demo mode the log stays in the visitor's own browser.
- Real conversations are never shown publicly. Dashboard analytics are labelled **Sample data**, except the "Your test questions" panel, which reads this browser's own log.
- The Request a Demo form says how the details are used and has a honeypot field against bots.

## Deploying

- **Vercel (recommended):** create a new Vercel project with this folder as the root directory. `vercel.json` handles the SPA rewrites (excluding `/api`), the function timeout, asset caching and basic security headers.
- **MAMP:** run `npm run build:mamp`, then open `http://localhost:8888/events-2026/ai-event-assistant/dist/`. The `.htaccess` in `public/` provides the SPA fallback. The AI endpoint is not available on MAMP; the structured engine still works.

### Linking from the EventVerse site

The brief asks for this product to appear in the EventVerse homepage and solutions catalogue under the same domain. Doing that means editing the `eventverse/` project, which was intentionally left untouched. When you're ready, either:

1. Add links and a product card on the EventVerse homepage pointing at this app's deployment URL, or
2. Add Vercel rewrites in the EventVerse project that proxy `/solutions/ai-event-assistant`, `/demo/ai-event-assistant/*` and `/assets/*` to this deployment.

## Tests

`npm test` runs 106 tests:

- **The brief's scenarios:**
  - a real exhibitor
  - a nonexistent exhibitor
  - sessions by topic
  - a speaker
  - Hall 3 in English and Arabic
  - stand lookup for the map
  - switching to Arabic
  - follow-ups
  - no-answer and prompt-injection questions
- **Every other visitor question in the brief**, in English and Arabic.
- **Grounding:** every card id, for every preset, refers to a real record.
- **Datasets:** all three pass validation, and validation catches broken stands, overlapping sessions and unknown speakers.
- **Suggested questions:** every branded suggested question, for each preset, mode and language, gets a real answer.
- **API helpers:** id sanitising, malformed output, prompt fencing and rate limiting.
- **Privacy:** redaction of emails and phone numbers.

## Production features that still need backend configuration

| Area | Demo behaviour | Needed for production |
| --- | --- | --- |
| Admin authentication | Dashboard open to everyone; `VITE_ADMIN_AUTH=required` locks it | Identity provider (e.g. Supabase Auth) and role checks on a server API; the dashboard must call that API instead of `localStorage` |
| Event data storage | Edits saved per browser; built-in data in the bundle | Database tables for events, exhibitors, sessions and so on, a publish step, and server reads so edits reach every visitor and the AI backend |
| Question log and analytics | Sample charts plus this browser's log | Server-side logging (redacted), retention policy, aggregated reports, organiser-only access |
| AI answers | Off unless `ANTHROPIC_API_KEY` and `VITE_AI_ENDPOINT` are set | API key, spend limits, monitoring; rate limits in a shared store (e.g. Upstash/Redis), since the in-memory limiter is per function instance |
| Lead capture | FormSubmit email | CRM integration and a consent record if required |
| Exhibitor brochures and enquiries | `.example` placeholder links show a notice | Real file hosting and enquiry routing |
| Floorplan | Schematic 4-slot layout | Venue CAD/SVG import if exact geometry is needed (still no walking routes without route data) |
| Multi-event hosting | Three fixed presets | Tenant and event management, custom domains, per-client widget embed script |
