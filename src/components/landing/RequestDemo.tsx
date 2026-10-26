import { useState, type FormEvent } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { emailLead } from '@/services/leads';
import { clean, validateDemoRequest, type DemoRequest, type FieldErrors } from '@/services/validation';
import { Button } from '../ui/Button';
import { SelectField, TextArea, TextField } from '../ui/Field';
import { Icon } from '../ui/Icon';
import { GlassCard } from '../ui/Misc';

const EMPTY: DemoRequest = { name: '', email: '', company: '', phone: '', role: '', eventType: '', languages: 'English + Arabic', message: '' };

const ROLES: [string, string, string][] = [
  ['organizer', 'Event organiser', 'منظم فعاليات'],
  ['agency', 'Event / marketing agency', 'وكالة فعاليات أو تسويق'],
  ['exhibitor', 'Exhibitor or brand', 'عارض أو علامة تجارية'],
  ['venue', 'Venue operator', 'مشغّل مكان'],
];

const TYPES: [string, string, string][] = [
  ['exhibition', 'Exhibition / trade show', 'معرض تجاري'],
  ['conference', 'Conference / summit', 'مؤتمر أو قمة'],
  ['festival', 'Festival / public event', 'مهرجان أو فعالية عامة'],
  ['corporate', 'Corporate event', 'فعالية مؤسسية'],
];

export function RequestDemo() {
  const { lang } = useLang();
  const ar = lang === 'ar';
  const [form, setForm] = useState<DemoRequest>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors<DemoRequest>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [trap, setTrap] = useState('');

  const set = (key: keyof DemoRequest) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (trap) return; // honeypot: bots fill hidden fields
    const found = validateDemoRequest(form, lang);
    setErrors(found);
    if (Object.keys(found).length) return;
    setStatus('sending');
    const role = ROLES.find((r) => r[0] === form.role)?.[1] ?? form.role;
    const type = TYPES.find((r) => r[0] === form.eventType)?.[1] ?? form.eventType;
    try {
      await emailLead(`AI Event Assistant demo request — ${clean(form.company, 120)}`, clean(form.email, 254).toLowerCase(), {
        Product: 'AI Event Assistant',
        Name: clean(form.name, 120),
        Email: clean(form.email, 254).toLowerCase(),
        Company: clean(form.company, 120),
        Phone: clean(form.phone, 20) || '—',
        Role: role,
        'Event type': type,
        Languages: form.languages,
        Message: clean(form.message, 1000) || '—',
      });
      setStatus('sent');
      setForm(EMPTY);
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="request-demo" className="section scroll-mt-24 py-24">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <div data-reveal>
          <p className="eyebrow">{ar ? 'اطلب عرضًا توضيحيًا' : 'Request a demo'}</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">{ar ? 'شاهده مع بيانات فعاليتك' : 'See it running on your event’s data'}</h2>
          <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
            {ar
              ? 'أرسل لنا تفاصيل فعاليتك وسنجهّز عرضًا بهويتك يضم العارضين والبرنامج والخريطة بالعربية والإنجليزية.'
              : 'Tell us about your event and we’ll prepare a branded walkthrough with your exhibitors, programme and floorplan — in English and Arabic.'}
          </p>
          <ul className="mt-8 space-y-4 text-sm text-slate-300">
            {(ar
              ? ['عرض مباشر بهوية عميلك وألوانه', 'استيراد العارضين والجلسات من جداولك الحالية', 'خطة نشر عبر رمز QR والموقع وأجهزة الاستعلام']
              : ['A live demo in your client’s branding', 'Exhibitors and sessions imported from your existing spreadsheets', 'Rollout plan for QR codes, website widget and kiosks']
            ).map((x) => (
              <li key={x} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold-400/20 text-gold-300">
                  <Icon name="check" size={12} strokeWidth={3} />
                </span>
                {x}
              </li>
            ))}
          </ul>
        </div>

        <GlassCard data-reveal className="p-6 sm:p-8">
          {status === 'sent' ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center" role="status">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30">
                <Icon name="check" size={30} strokeWidth={2.5} />
              </span>
              <h3 className="mt-6 text-2xl font-semibold">{ar ? 'تم استلام طلبك' : 'Request received'}</h3>
              <p className="mt-2 max-w-sm text-sm text-slate-400">{ar ? 'شكرًا لك، سنتواصل معك قريبًا لترتيب العرض.' : 'Thanks — we’ll be in touch shortly to arrange your demo.'}</p>
              <Button variant="secondary" className="mt-8" onClick={() => setStatus('idle')}>
                {ar ? 'إرسال طلب آخر' : 'Send another'}
              </Button>
            </div>
          ) : (
            <form noValidate onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
              <TextField label={ar ? 'الاسم الكامل' : 'Full name'} autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} maxLength={120} required />
              <TextField label={ar ? 'البريد الإلكتروني للعمل' : 'Work email'} type="email" dir="ltr" autoComplete="email" inputMode="email" value={form.email} onChange={set('email')} error={errors.email} maxLength={254} required />
              <TextField label={ar ? 'الشركة' : 'Company'} autoComplete="organization" value={form.company} onChange={set('company')} error={errors.company} maxLength={120} required />
              <TextField label={ar ? 'الهاتف (اختياري)' : 'Phone (optional)'} type="tel" dir="ltr" autoComplete="tel" inputMode="tel" value={form.phone} onChange={set('phone')} error={errors.phone} maxLength={20} placeholder="+971" />
              <SelectField label={ar ? 'دورك' : 'Your role'} value={form.role} onChange={set('role')} error={errors.role} required>
                <option value="">{ar ? 'اختر' : 'Select'}</option>
                {ROLES.map(([v, en, a]) => (
                  <option key={v} value={v}>{ar ? a : en}</option>
                ))}
              </SelectField>
              <SelectField label={ar ? 'نوع الفعالية' : 'Event type'} value={form.eventType} onChange={set('eventType')} error={errors.eventType} required>
                <option value="">{ar ? 'اختر' : 'Select'}</option>
                {TYPES.map(([v, en, a]) => (
                  <option key={v} value={v}>{ar ? a : en}</option>
                ))}
              </SelectField>
              <SelectField label={ar ? 'لغات المساعد' : 'Assistant languages'} value={form.languages} onChange={set('languages')} wrapperClassName="sm:col-span-2">
                <option value="English + Arabic">{ar ? 'العربية والإنجليزية' : 'English + Arabic'}</option>
                <option value="English only">{ar ? 'الإنجليزية فقط' : 'English only'}</option>
                <option value="Arabic only">{ar ? 'العربية فقط' : 'Arabic only'}</option>
              </SelectField>
              <TextArea
                label={ar ? 'حدثنا عن الفعالية (اختياري)' : 'Tell us about the event (optional)'}
                value={form.message}
                onChange={set('message')}
                error={errors.message}
                maxLength={1000}
                wrapperClassName="sm:col-span-2"
                placeholder={ar ? 'التواريخ، المكان، عدد العارضين والزوار…' : 'Dates, venue, number of exhibitors and visitors…'}
              />
              <div className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0" aria-hidden="true">
                <label>
                  Leave this empty
                  <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
                </label>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" size="lg" className="w-full" disabled={status === 'sending'}>
                  {status === 'sending' ? (ar ? 'جارٍ الإرسال…' : 'Sending…') : ar ? 'اطلب عرضًا' : 'Request a demo'}
                </Button>
                {status === 'error' && (
                  <p className="mt-3 text-center text-sm text-rose-300" role="alert">
                    {ar ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'Something went wrong. Please try again.'}
                  </p>
                )}
                <p className="mt-3 text-center text-xs text-slate-500">
                  {ar ? 'نستخدم بياناتك فقط للرد على هذا الطلب.' : 'We only use your details to respond to this request.'}
                </p>
              </div>
            </form>
          )}
        </GlassCard>
      </div>
    </section>
  );
}
