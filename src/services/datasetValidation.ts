import type { EventDataset, Localized } from '@/types/event';

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const STAND = /^H(\d)-(\d{2})$/;
const ID = /^[a-z0-9][a-z0-9-]{0,63}$/i;

const isLoc = (v: unknown): v is Localized => !!v && typeof v === 'object' && typeof (v as Localized).en === 'string' && typeof (v as Localized).ar === 'string';
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

/**
 * Structural and referential checks for an imported or edited dataset.
 * Returns human-readable problems; an empty list means the dataset is safe to use.
 */
export function validateDataset(input: unknown): string[] {
  const errors: string[] = [];
  const push = (msg: string) => errors.length < 40 && errors.push(msg);
  if (!input || typeof input !== 'object') return ['The file is not a JSON object.'];
  const d = input as EventDataset;

  if (typeof d.id !== 'string' || !ID.test(d.id)) push('Missing or invalid dataset "id".');
  if (!d.info || !isLoc(d.info.name)) push('info.name must have "en" and "ar" text.');
  const days = arr(d.info?.days);
  if (!days.length) push('info.days needs at least one day.');
  days.forEach((x, i) => {
    const day = x as EventDataset['info']['days'][number];
    if (!DATE.test(day?.date ?? '')) push(`Day ${i + 1}: date must be YYYY-MM-DD.`);
    if (!TIME.test(day?.open ?? '') || !TIME.test(day?.close ?? '')) push(`Day ${i + 1}: open/close must be HH:MM.`);
    else if (day.close <= day.open) push(`Day ${i + 1}: closing time must be after opening time.`);
  });

  for (const key of ['halls', 'stages', 'categories', 'exhibitors', 'speakers', 'sessions', 'facilities', 'announcements', 'faqs'] as const) {
    if (!Array.isArray(d[key])) push(`"${key}" must be a list.`);
  }
  if (errors.length) return errors;

  const unique = (name: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (typeof id !== 'string' || !ID.test(id)) push(`${name}: invalid id "${String(id)}".`);
      else if (seen.has(id)) push(`${name}: duplicate id "${id}".`);
      seen.add(id);
    }
    return seen;
  };

  const halls = unique('Halls', d.halls.map((h) => h.id));
  if (d.halls.length > 4) push('The floorplan supports up to 4 halls.');
  const slots = new Set<number>();
  d.halls.forEach((h) => {
    if (!isLoc(h.name) || !isLoc(h.theme)) push(`Hall ${h.id}: name and theme need en/ar text.`);
    if (![0, 1, 2, 3].includes(h.slot) || slots.has(h.slot)) push(`Hall ${h.id}: slot must be a unique value 0–3.`);
    slots.add(h.slot);
    if (!Number.isInteger(h.standCount) || h.standCount < 1 || h.standCount > 20) push(`Hall ${h.id}: standCount must be 1–20.`);
  });
  const stages = unique('Stages', d.stages.map((s) => s.id));
  d.stages.forEach((s) => !halls.has(s.hallId) && push(`Stage ${s.id}: unknown hall "${s.hallId}".`));
  const cats = unique('Categories', d.categories.map((c) => c.id));

  unique('Exhibitors', d.exhibitors.map((e) => e.id));
  const stands = new Set<string>();
  d.exhibitors.forEach((e) => {
    if (typeof e.name !== 'string' || e.name.trim().length < 2) push(`Exhibitor ${e.id}: name is required.`);
    if (!isLoc(e.description)) push(`Exhibitor ${e.id}: description needs en/ar text.`);
    const m = STAND.exec(e.stand ?? '');
    const hall = d.halls.find((h) => h.id === e.hallId);
    if (!hall) push(`Exhibitor ${e.id}: unknown hall "${e.hallId}".`);
    if (!m) push(`Exhibitor ${e.id}: stand must look like H2-15.`);
    else if (hall && (Number(m[1]) !== hall.number || Number(m[2]) < 1 || Number(m[2]) > hall.standCount)) push(`Exhibitor ${e.id}: stand ${e.stand} is not in ${hall.id}.`);
    if (stands.has(e.stand)) push(`Stand ${e.stand} is assigned twice.`);
    stands.add(e.stand);
    arr(e.categoryIds).forEach((c) => !cats.has(c as string) && push(`Exhibitor ${e.id}: unknown category "${String(c)}".`));
    if (!Array.isArray(e.aliases) || !Array.isArray(e.tags) || !Array.isArray(e.products)) push(`Exhibitor ${e.id}: aliases, tags and products must be lists.`);
  });

  const speakers = unique('Speakers', d.speakers.map((s) => s.id));
  d.speakers.forEach((s) => (typeof s.name !== 'string' || !s.name.trim()) && push(`Speaker ${s.id}: name is required.`));

  unique('Sessions', d.sessions.map((s) => s.id));
  d.sessions.forEach((s) => {
    if (!isLoc(s.title)) push(`Session ${s.id}: title needs en/ar text.`);
    if (!Number.isInteger(s.dayIndex) || s.dayIndex < 0 || s.dayIndex >= days.length) push(`Session ${s.id}: dayIndex out of range.`);
    if (!TIME.test(s.start) || !TIME.test(s.end) || s.end <= s.start) push(`Session ${s.id}: start/end must be HH:MM with end after start.`);
    if (!stages.has(s.stageId)) push(`Session ${s.id}: unknown stage "${s.stageId}".`);
    arr(s.speakerIds).forEach((x) => !speakers.has(x as string) && push(`Session ${s.id}: unknown speaker "${String(x)}".`));
  });
  // Two sessions on one stage at the same time would give contradictory answers.
  for (const a of d.sessions)
    for (const b of d.sessions)
      if (a.id < b.id && a.stageId === b.stageId && a.dayIndex === b.dayIndex && a.start < b.end && b.start < a.end) push(`Sessions ${a.id} and ${b.id} overlap on the same stage.`);

  unique('Facilities', d.facilities.map((f) => f.id));
  d.facilities.forEach((f) => {
    if (f.zone !== 'concourse' && !halls.has(f.zone)) push(`Facility ${f.id}: zone must be "concourse" or a hall id.`);
    if (!(f.x >= 0 && f.x <= 1 && f.y >= 0 && f.y <= 1)) push(`Facility ${f.id}: x and y must be between 0 and 1.`);
    if (!isLoc(f.name) || !isLoc(f.location)) push(`Facility ${f.id}: name and location need en/ar text.`);
  });
  unique('Announcements', d.announcements.map((a) => a.id));
  d.announcements.forEach((a) => (!isLoc(a.title) || !isLoc(a.body)) && push(`Announcement ${a.id}: title and body need en/ar text.`));
  unique('FAQs', d.faqs.map((f) => f.id));
  d.faqs.forEach((f) => (!isLoc(f.question) || !isLoc(f.answer)) && push(`FAQ ${f.id}: question and answer need en/ar text.`));
  return errors;
}
