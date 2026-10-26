import { useMemo, useState, type ReactNode } from 'react';
import { useDashboard } from '@/components/dashboard/useDashboard';
import { Button } from '@/components/ui/Button';
import { SelectField, TextArea, TextField } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { GlassCard } from '@/components/ui/Misc';
import { useToast } from '@/components/ui/Toast';
import { normalize } from '@/engine/normalize';
import { configStore } from '@/services/configStore';
import { validateDataset } from '@/services/datasetValidation';
import { clean } from '@/services/validation';
import type { EventDataset, Lang, Localized } from '@/types/event';

type Kind = 'exhibitors' | 'speakers' | 'sessions' | 'faqs' | 'announcements';
type Rec = Record<string, unknown>;
type L = [string, string];

type Field =
  | { key: string; label: L; type: 'text' | 'time' | 'email' | 'url'; required?: boolean; hint?: L; dir?: 'ltr' }
  | { key: string; label: L; type: 'loc' | 'locArea'; required?: boolean }
  | { key: string; label: L; type: 'select'; options: (d: EventDataset, lang: Lang) => { value: string; label: string }[]; numeric?: boolean; optional?: boolean }
  | { key: string; label: L; type: 'multi'; options: (d: EventDataset, lang: Lang) => { value: string; label: string }[] }
  | { key: string; label: L; type: 'list'; hint?: L }
  | { key: string; label: L; type: 'bool' }
  | { key: string; label: L; type: 'products' };

interface Def {
  title: L;
  singular: L;
  fields: Field[];
  columns: L[];
  row: (r: Rec, d: EventDataset, lang: Lang) => ReactNode[];
  search: (r: Rec) => string;
  empty: (d: EventDataset) => Rec;
  /** Name used to build an id for new records. */
  idSource: (r: Rec) => string;
  /** Other records that point at this one; deletion is blocked while any exist. */
  usedBy?: (id: string, d: EventDataset) => string[];
}

const loc = (v: unknown, lang: Lang) => ((v as Localized | undefined)?.[lang] || (v as Localized | undefined)?.en) ?? '';
const blankLoc = (): Localized => ({ en: '', ar: '' });
const hallOptions = (d: EventDataset, lang: Lang) => d.halls.map((h) => ({ value: h.id, label: `${h.name[lang]} — ${h.theme[lang]}` }));
const catOptions = (d: EventDataset, lang: Lang) => d.categories.map((c) => ({ value: c.id, label: c.name[lang] }));

const DEFS: Record<Kind, Def> = {
  exhibitors: {
    title: ['Exhibitors', 'العارضون'],
    singular: ['exhibitor', 'عارض'],
    fields: [
      { key: 'name', label: ['Company name', 'اسم الشركة'], type: 'text', required: true },
      { key: 'aliases', label: ['Other names / Arabic spelling', 'أسماء أخرى / التهجئة العربية'], type: 'list', hint: ['Comma-separated', 'مفصولة بفواصل'] },
      { key: 'hallId', label: ['Hall', 'القاعة'], type: 'select', options: hallOptions },
      { key: 'stand', label: ['Stand', 'الجناح'], type: 'text', required: true, hint: ['Format H2-15 (hall number + stand slot)', 'الصيغة H2-15 (رقم القاعة + رقم الجناح)'], dir: 'ltr' },
      { key: 'categoryIds', label: ['Categories', 'الفئات'], type: 'multi', options: catOptions },
      { key: 'country', label: ['Country', 'الدولة'], type: 'loc' },
      { key: 'description', label: ['Description', 'الوصف'], type: 'locArea', required: true },
      { key: 'products', label: ['Products', 'المنتجات'], type: 'products' },
      { key: 'tags', label: ['Search keywords', 'كلمات البحث'], type: 'list', hint: ['Comma-separated, English and Arabic', 'مفصولة بفواصل، بالعربية والإنجليزية'] },
      { key: 'website', label: ['Website', 'الموقع'], type: 'url', dir: 'ltr' },
      { key: 'brochureUrl', label: ['Brochure URL', 'رابط الكتيّب'], type: 'url', dir: 'ltr' },
      { key: 'enquiryEmail', label: ['Enquiry email', 'بريد الاستفسارات'], type: 'email', dir: 'ltr' },
      { key: 'featured', label: ['Featured exhibitor', 'عارض مميز'], type: 'bool' },
    ],
    columns: [['Company', 'الشركة'], ['Stand', 'الجناح'], ['Categories', 'الفئات']],
    row: (r, d, lang) => [
      <span dir="auto">{String(r.name)}</span>,
      <span className="font-mono" dir="ltr">{String(r.stand)}</span>,
      (r.categoryIds as string[]).map((id) => d.categories.find((c) => c.id === id)?.name[lang]).filter(Boolean).join(', '),
    ],
    search: (r) => `${r.name} ${r.stand} ${(r.aliases as string[]).join(' ')}`,
    empty: (d) => ({ id: '', name: '', aliases: [], stand: '', hallId: d.halls[0]?.id ?? '', categoryIds: [], country: blankLoc(), description: blankLoc(), products: [], tags: [] }),
    idSource: (r) => String(r.name),
  },
  speakers: {
    title: ['Speakers', 'المتحدثون'],
    singular: ['speaker', 'متحدث'],
    fields: [
      { key: 'name', label: ['Name (English)', 'الاسم (بالإنجليزية)'], type: 'text', required: true },
      { key: 'nameAr', label: ['Name (Arabic)', 'الاسم (بالعربية)'], type: 'text', required: true },
      { key: 'title', label: ['Job title', 'المسمى الوظيفي'], type: 'loc' },
      { key: 'organization', label: ['Organisation', 'الجهة'], type: 'text' },
      { key: 'bio', label: ['Short bio', 'نبذة'], type: 'locArea' },
      { key: 'topics', label: ['Topics', 'المواضيع'], type: 'multi', options: catOptions },
    ],
    columns: [['Name', 'الاسم'], ['Organisation', 'الجهة'], ['Sessions', 'الجلسات']],
    row: (r, d, lang) => [lang === 'ar' ? String(r.nameAr) : String(r.name), <span dir="auto">{String(r.organization)}</span>, d.sessions.filter((s) => s.speakerIds.includes(String(r.id))).length],
    search: (r) => `${r.name} ${r.nameAr} ${r.organization}`,
    empty: () => ({ id: '', name: '', nameAr: '', title: blankLoc(), organization: '', bio: blankLoc(), topics: [] }),
    idSource: (r) => String(r.name),
    usedBy: (id, d) => d.sessions.filter((s) => s.speakerIds.includes(id)).map((s) => s.title.en),
  },
  sessions: {
    title: ['Sessions', 'الجلسات'],
    singular: ['session', 'جلسة'],
    fields: [
      { key: 'title', label: ['Title', 'العنوان'], type: 'loc', required: true },
      { key: 'description', label: ['Description', 'الوصف'], type: 'locArea' },
      { key: 'dayIndex', label: ['Day', 'اليوم'], type: 'select', numeric: true, options: (d, lang) => d.info.days.map((x, i) => ({ value: String(i), label: `${x.label?.[lang] ?? `Day ${i + 1}`} · ${x.date}` })) },
      { key: 'start', label: ['Start (HH:MM)', 'البداية (HH:MM)'], type: 'time', required: true },
      { key: 'end', label: ['End (HH:MM)', 'النهاية (HH:MM)'], type: 'time', required: true },
      { key: 'stageId', label: ['Stage', 'المنصة'], type: 'select', options: (d, lang) => d.stages.map((s) => ({ value: s.id, label: s.name[lang] })) },
      {
        key: 'format',
        label: ['Format', 'النوع'],
        type: 'select',
        options: (_d, lang) =>
          (['keynote', 'panel', 'talk', 'workshop', 'demo'] as const).map((f) => ({
            value: f,
            label: lang === 'ar' ? { keynote: 'كلمة رئيسية', panel: 'حلقة نقاش', talk: 'محاضرة', workshop: 'ورشة عمل', demo: 'عرض مباشر' }[f] : f,
          })),
      },
      { key: 'speakerIds', label: ['Speakers', 'المتحدثون'], type: 'multi', options: (d, lang) => d.speakers.map((s) => ({ value: s.id, label: lang === 'ar' ? s.nameAr : s.name })) },
      { key: 'topics', label: ['Topics', 'المواضيع'], type: 'multi', options: catOptions },
    ],
    columns: [['Session', 'الجلسة'], ['When', 'الموعد'], ['Stage', 'المنصة']],
    row: (r, d, lang) => [
      loc(r.title, lang),
      <span dir="ltr">{`${d.info.days[Number(r.dayIndex)]?.label?.en ?? ''} ${r.start}–${r.end}`}</span>,
      d.stages.find((s) => s.id === r.stageId)?.name[lang] ?? '',
    ],
    search: (r) => `${loc(r.title, 'en')} ${loc(r.title, 'ar')}`,
    empty: (d) => ({ id: '', title: blankLoc(), description: blankLoc(), dayIndex: 0, start: '10:00', end: '10:45', stageId: d.stages[0]?.id ?? '', speakerIds: [], topics: [], format: 'talk' }),
    idSource: (r) => loc(r.title, 'en'),
  },
  faqs: {
    title: ['FAQs', 'الأسئلة الشائعة'],
    singular: ['FAQ', 'سؤال'],
    fields: [
      { key: 'question', label: ['Question', 'السؤال'], type: 'loc', required: true },
      { key: 'answer', label: ['Answer', 'الإجابة'], type: 'locArea', required: true },
      { key: 'keywords', label: ['Trigger keywords', 'كلمات التفعيل'], type: 'list', hint: ['Words visitors might use, English and Arabic', 'كلمات قد يستخدمها الزوار بالعربية والإنجليزية'] },
    ],
    columns: [['Question', 'السؤال'], ['Keywords', 'الكلمات']],
    row: (r, _d, lang) => [loc(r.question, lang), (r.keywords as string[]).slice(0, 4).join(', ')],
    search: (r) => `${loc(r.question, 'en')} ${loc(r.question, 'ar')} ${(r.keywords as string[]).join(' ')}`,
    empty: () => ({ id: '', question: blankLoc(), answer: blankLoc(), keywords: [] }),
    idSource: (r) => loc(r.question, 'en'),
  },
  announcements: {
    title: ['Announcements', 'الإعلانات'],
    singular: ['announcement', 'إعلان'],
    fields: [
      { key: 'title', label: ['Title', 'العنوان'], type: 'loc', required: true },
      { key: 'body', label: ['Message', 'النص'], type: 'locArea', required: true },
      {
        key: 'priority',
        label: ['Priority', 'الأولوية'],
        type: 'select',
        options: (_d, lang) => [
          { value: 'info', label: lang === 'ar' ? 'معلومة' : 'Information' },
          { value: 'important', label: lang === 'ar' ? 'مهم' : 'Important' },
        ],
      },
      { key: 'dayIndex', label: ['Day (optional)', 'اليوم (اختياري)'], type: 'select', numeric: true, optional: true, options: (d, lang) => d.info.days.map((x, i) => ({ value: String(i), label: x.label?.[lang] ?? `Day ${i + 1}` })) },
      { key: 'time', label: ['Time (optional, HH:MM)', 'الوقت (اختياري، HH:MM)'], type: 'time' },
    ],
    columns: [['Title', 'العنوان'], ['Priority', 'الأولوية']],
    row: (r, _d, lang) => [loc(r.title, lang), r.priority === 'important' ? (lang === 'ar' ? 'مهم' : 'Important') : lang === 'ar' ? 'معلومة' : 'Info'],
    search: (r) => `${loc(r.title, 'en')} ${loc(r.title, 'ar')}`,
    empty: () => ({ id: '', title: blankLoc(), body: blankLoc(), priority: 'info' }),
    idSource: (r) => loc(r.title, 'en'),
  },
};

function slug(text: string, taken: string[]): string {
  const base =
    text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'item';
  let id = base;
  for (let i = 2; taken.includes(id); i++) id = `${base}-${i}`;
  return id;
}

/** Trim every string in a record (recursively) before it is saved. */
function tidy(v: unknown): unknown {
  if (typeof v === 'string') return clean(v, 2000);
  if (Array.isArray(v)) return v.map(tidy).filter((x) => x !== '');
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).filter(([, x]) => x !== undefined).map(([k, x]) => [k, tidy(x)]));
  return v;
}

export default function Collections({ kind }: { kind: Kind }) {
  const { config, presetId, lang, tr } = useDashboard();
  const toast = useToast();
  const def = DEFS[kind];
  const data = config.data;
  const list = data[kind] as unknown as Rec[];
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<{ rec: Rec; isNew: boolean } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const shown = useMemo(() => {
    const n = normalize(query);
    return n ? list.filter((r) => normalize(def.search(r)).includes(n)) : list;
  }, [list, query, def]);

  const persist = (next: EventDataset): boolean => {
    const problems = validateDataset(next);
    if (problems.length) {
      setErrors(problems);
      return false;
    }
    configStore.saveDataset(presetId, next);
    return true;
  };

  const save = () => {
    if (!editing) return;
    const rec = tidy(editing.rec) as Rec;
    const missing = def.fields.filter((f) => 'required' in f && f.required).filter((f) => {
      const v = rec[f.key];
      return f.type === 'loc' || f.type === 'locArea' ? !(v as Localized | undefined)?.en || !(v as Localized | undefined)?.ar : !v;
    });
    if (missing.length) return setErrors(missing.map((f) => `${tr(f.label[0], f.label[1])}: ${tr('required (English and Arabic where shown)', 'مطلوب (بالعربية والإنجليزية حيث يظهر)')}`));
    if (kind === 'exhibitors') {
      rec.stand = String(rec.stand).toUpperCase();
      // Keep hall and stand consistent: the stand code decides the hall.
      const hall = data.halls.find((h) => h.number === Number(/^H(\d)-/.exec(String(rec.stand))?.[1]));
      if (hall) rec.hallId = hall.id;
    }
    if (editing.isNew) rec.id = slug(def.idSource(rec), list.map((r) => String(r.id)));
    const items = editing.isNew ? [...list, rec] : list.map((r) => (r.id === rec.id ? rec : r));
    if (persist({ ...data, [kind]: items })) {
      toast(tr('Saved — the assistant uses the new data immediately', 'تم الحفظ — يستخدم المساعد البيانات الجديدة فورًا'));
      setEditing(null);
      setErrors([]);
    }
  };

  const remove = (r: Rec) => {
    const refs = def.usedBy?.(String(r.id), data) ?? [];
    if (refs.length) return toast(tr(`Used by: ${refs.slice(0, 2).join(', ')}. Remove those links first.`, `مستخدم في: ${refs.slice(0, 2).join('، ')}. احذف هذه الروابط أولًا.`), 'error');
    if (!window.confirm(tr('Delete this record?', 'حذف هذا السجل؟'))) return;
    if (persist({ ...data, [kind]: list.filter((x) => x.id !== r.id) })) toast(tr('Deleted', 'تم الحذف'));
  };

  const set = (key: string, value: unknown) => setEditing((e) => (e ? { ...e, rec: { ...e.rec, [key]: value } } : e));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{tr(...def.title)}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {list.length} · {tr('Changes update the live assistant in this browser.', 'تنعكس التغييرات على المساعد فورًا في هذا المتصفح.')}
          </p>
        </div>
        <Button size="sm" icon={<Icon name="plus" size={15} />} onClick={() => (setErrors([]), setEditing({ rec: def.empty(data), isNew: true }))}>
          {tr(`Add ${def.singular[0]}`, `إضافة ${def.singular[1]}`)}
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Icon name="search" size={17} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <label htmlFor="col-search" className="sr-only">{tr('Search', 'بحث')}</label>
        <input id="col-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tr('Search…', 'بحث…')} className="h-11 w-full rounded-xl border border-white/10 bg-midnight-950/60 pe-3 ps-10 text-sm text-white placeholder:text-slate-500 focus:border-electric-400/60 focus:outline-none" />
      </div>

      <GlassCard className="overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-white/5 text-xs text-slate-400">
              <tr>
                {def.columns.map((c) => (
                  <th key={c[0]} className="px-4 py-3 text-start font-medium">{tr(...c)}</th>
                ))}
                <th className="px-4 py-3 text-end font-medium"><span className="sr-only">{tr('Actions', 'إجراءات')}</span></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={String(r.id)} className="border-t border-white/5 hover:bg-white/[0.03]">
                  {def.row(r, data, lang).map((cell, i) => (
                    <td key={i} className={`px-4 py-3 ${i === 0 ? 'font-medium text-white' : 'text-slate-300'}`}>{cell}</td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-2 text-end">
                    <button type="button" onClick={() => (setErrors([]), setEditing({ rec: structuredClone(r), isNew: false }))} className="inline-grid h-9 w-9 place-items-center rounded-lg text-slate-300 hover:bg-white/10" aria-label={tr('Edit', 'تعديل')}>
                      <Icon name="edit" size={16} />
                    </button>
                    <button type="button" onClick={() => remove(r)} className="inline-grid h-9 w-9 place-items-center rounded-lg text-rose-300 hover:bg-rose-500/10" aria-label={tr('Delete', 'حذف')}>
                      <Icon name="trash" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!shown.length && (
                <tr>
                  <td colSpan={def.columns.length + 1} className="px-4 py-10 text-center text-slate-500">{tr('Nothing found.', 'لا توجد نتائج.')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {editing && (
        <div className="fixed inset-0 z-[70] flex justify-end bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={tr('Edit record', 'تعديل السجل')} onKeyDown={(e) => e.key === 'Escape' && setEditing(null)}>
          <div className="glass-strong flex h-full w-full max-w-xl flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="text-lg font-semibold">{editing.isNew ? tr(`New ${def.singular[0]}`, `${def.singular[1]} جديد`) : tr(`Edit ${def.singular[0]}`, `تعديل ${def.singular[1]}`)}</h2>
              <button type="button" onClick={() => setEditing(null)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10" aria-label={tr('Close', 'إغلاق')}>
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {def.fields.map((f) => (
                <FieldEditor key={f.key} f={f} value={editing.rec[f.key]} onChange={(v) => set(f.key, v)} data={data} />
              ))}
            </div>
            <div className="border-t border-white/10 px-5 py-4">
              {errors.length > 0 && (
                <ul className="mb-3 max-h-28 list-disc space-y-1 overflow-y-auto ps-5 text-xs text-rose-300" role="alert">
                  {errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEditing(null)}>{tr('Cancel', 'إلغاء')}</Button>
                <Button onClick={save}>{tr('Save', 'حفظ')}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldEditor({ f, value, onChange, data }: { f: Field; value: unknown; onChange: (v: unknown) => void; data: EventDataset }) {
  const { lang, tr } = useDashboard();
  const label = tr(...f.label);
  switch (f.type) {
    case 'text':
    case 'time':
    case 'email':
    case 'url':
      return (
        <TextField
          label={label}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          type={f.type === 'time' ? 'text' : f.type}
          inputMode={f.type === 'time' ? 'numeric' : undefined}
          placeholder={f.type === 'time' ? '10:30' : undefined}
          dir={f.dir ?? (f.type === 'text' ? 'auto' : 'ltr')}
          hint={f.hint ? tr(...f.hint) : undefined}
          maxLength={f.type === 'url' ? 300 : 160}
        />
      );
    case 'loc':
    case 'locArea': {
      const v = (value as Localized) ?? blankLoc();
      const Comp = f.type === 'loc' ? TextField : TextArea;
      return (
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="mb-1.5 text-sm font-medium text-slate-200">{label}</legend>
          <Comp label="English" lang="en" dir="ltr" value={v.en} onChange={(e: { target: { value: string } }) => onChange({ ...v, en: e.target.value })} maxLength={f.type === 'loc' ? 200 : 1200} />
          <Comp label="العربية" lang="ar" dir="rtl" value={v.ar} onChange={(e: { target: { value: string } }) => onChange({ ...v, ar: e.target.value })} maxLength={f.type === 'loc' ? 200 : 1200} />
        </fieldset>
      );
    }
    case 'select':
      return (
        <SelectField label={label} value={value === undefined ? '' : String(value)} onChange={(e) => onChange(e.target.value === '' ? undefined : f.numeric ? Number(e.target.value) : e.target.value)}>
          {f.optional && <option value="">—</option>}
          {f.options(data, lang).map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </SelectField>
      );
    case 'multi': {
      const sel = new Set((value as string[]) ?? []);
      return (
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-slate-200">{label}</legend>
          <div className="flex flex-wrap gap-2">
            {f.options(data, lang).map((o) => (
              <label key={o.value} className={`cursor-pointer rounded-full px-3 py-1.5 text-xs ring-1 transition ${sel.has(o.value) ? 'bg-brand-primary/20 text-white ring-brand-primary/50' : 'text-slate-300 ring-white/15 hover:bg-white/5'}`}>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={sel.has(o.value)}
                  onChange={() => {
                    const next = new Set(sel);
                    if (next.has(o.value)) next.delete(o.value);
                    else next.add(o.value);
                    onChange([...next]);
                  }}
                />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>
      );
    }
    case 'list':
      return (
        <TextField
          label={label}
          dir="auto"
          value={((value as string[]) ?? []).join(', ')}
          onChange={(e) => onChange(e.target.value.split(/[,،]/).map((s) => s.trimStart()))}
          hint={f.hint ? tr(...f.hint) : undefined}
          maxLength={600}
        />
      );
    case 'bool':
      return (
        <label className="flex items-center gap-3 text-sm text-slate-200">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked || undefined)} className="h-4 w-4 accent-[rgb(var(--brand-primary))]" />
          {label}
        </label>
      );
    case 'products': {
      const items = (value as { name: Localized; description: Localized }[]) ?? [];
      const update = (i: number, k: 'name' | 'description', l: Lang, text: string) => onChange(items.map((p, j) => (j === i ? { ...p, [k]: { ...p[k], [l]: text } } : p)));
      return (
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-slate-200">{label}</legend>
          <div className="space-y-3">
            {items.map((p, i) => (
              <div key={i} className="grid gap-2 rounded-xl border border-white/10 p-3 sm:grid-cols-2">
                <TextField label={tr('Name (EN)', 'الاسم (EN)')} dir="ltr" value={p.name.en} onChange={(e) => update(i, 'name', 'en', e.target.value)} maxLength={120} />
                <TextField label={tr('Name (AR)', 'الاسم (AR)')} dir="rtl" value={p.name.ar} onChange={(e) => update(i, 'name', 'ar', e.target.value)} maxLength={120} />
                <TextField label={tr('Description (EN)', 'الوصف (EN)')} dir="ltr" value={p.description.en} onChange={(e) => update(i, 'description', 'en', e.target.value)} maxLength={300} />
                <TextField label={tr('Description (AR)', 'الوصف (AR)')} dir="rtl" value={p.description.ar} onChange={(e) => update(i, 'description', 'ar', e.target.value)} maxLength={300} />
                <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="justify-self-start text-xs text-rose-300 hover:underline">
                  {tr('Remove product', 'حذف المنتج')}
                </button>
              </div>
            ))}
            {items.length < 5 && (
              <Button variant="secondary" size="sm" icon={<Icon name="plus" size={14} />} onClick={() => onChange([...items, { name: blankLoc(), description: blankLoc() }])}>
                {tr('Add product', 'إضافة منتج')}
              </Button>
            )}
          </div>
        </fieldset>
      );
    }
  }
}
