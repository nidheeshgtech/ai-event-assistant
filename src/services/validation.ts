import type { Lang } from '@/types/event';

export type FieldErrors<T> = Partial<Record<keyof T | string, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Trim and strip control characters. React escapes output; this keeps stored data tidy. */
export function clean(value: string, max = 500): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
}

export function isEmail(value: string): boolean {
  return EMAIL.test(clean(value, 254));
}

export interface DemoRequest {
  name: string;
  email: string;
  company: string;
  phone: string;
  role: string;
  eventType: string;
  languages: string;
  message: string;
}

const MSG = {
  name: ['Please enter your name.', 'يرجى إدخال اسمك.'],
  email: ['Please enter a valid email address.', 'يرجى إدخال بريد إلكتروني صحيح.'],
  company: ['Please enter your company.', 'يرجى إدخال اسم الشركة.'],
  phone: ['Use digits, spaces and + only.', 'استخدم الأرقام والمسافات و+ فقط.'],
  role: ['Choose your role.', 'اختر دورك.'],
  eventType: ['Choose an event type.', 'اختر نوع الفعالية.'],
  message: ['Keep the message under 1000 characters.', 'يجب ألا تتجاوز الرسالة 1000 حرف.'],
} as const;

export function validateDemoRequest(input: DemoRequest, lang: Lang): FieldErrors<DemoRequest> {
  const m = (k: keyof typeof MSG) => MSG[k][lang === 'ar' ? 1 : 0];
  const e: FieldErrors<DemoRequest> = {};
  if (clean(input.name).length < 2) e.name = m('name');
  if (!isEmail(input.email)) e.email = m('email');
  if (clean(input.company).length < 2) e.company = m('company');
  if (input.phone && !/^[+()\d\s-]{7,20}$/.test(input.phone.trim())) e.phone = m('phone');
  if (!input.role) e.role = m('role');
  if (!input.eventType) e.eventType = m('eventType');
  if (input.message.length > 1000) e.message = m('message');
  return e;
}
