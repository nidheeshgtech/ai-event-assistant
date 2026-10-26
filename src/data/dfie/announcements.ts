import type { Announcement } from '@/types/event';

/** DEMO CONTENT — fictional organiser announcements. */
export const DFIE_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'healthcare-keynote-time',
    title: { en: 'Day 2 healthcare keynote starts at 10:30', ar: 'الكلمة الرئيسية حول الرعاية الصحية في اليوم الثاني تبدأ الساعة 10:30' },
    body: {
      en: '“AI in Healthcare — From Triage to Treatment” has moved from 10:00 to 10:30 on the Future Stage in Hall 1.',
      ar: 'نُقل موعد كلمة "الذكاء الاصطناعي في الرعاية الصحية — من الفرز إلى العلاج" من الساعة 10:00 إلى 10:30 على منصة المستقبل في القاعة 1.',
    },
    priority: 'important',
    dayIndex: 1,
    time: '10:30',
  },
  {
    id: 'day3-early-close',
    title: { en: 'Day 3 closes early at 17:00', ar: 'إغلاق مبكر في اليوم الثالث الساعة 17:00' },
    body: {
      en: 'On the final day the halls close at 17:00 instead of 19:00. The Startup Pitch Final ends at 16:30.',
      ar: 'في اليوم الأخير تُغلق القاعات الساعة 17:00 بدلاً من 19:00، وينتهي نهائي مسابقة الشركات الناشئة الساعة 16:30.',
    },
    priority: 'important',
    dayIndex: 2,
    time: '17:00',
  },
  {
    id: 'shuttle-bus',
    title: { en: 'Free shuttle bus every 20 minutes', ar: 'حافلة نقل مجانية كل 20 دقيقة' },
    body: {
      en: 'The free metro shuttle runs every 20 minutes from 09:30 until 30 minutes after the halls close. It stops outside Gate A.',
      ar: 'تعمل حافلة المترو المجانية كل 20 دقيقة من الساعة 09:30 حتى ثلاثين دقيقة بعد إغلاق القاعات، وتتوقف خارج البوابة A.',
    },
    priority: 'info',
  },
  {
    id: 'pitch-final',
    title: { en: 'Startup Pitch Final — Day 3 at 15:30', ar: 'نهائي عروض الشركات الناشئة — اليوم الثالث الساعة 15:30' },
    body: {
      en: 'Five finalists pitch on the Startup Stage in Hall 4, followed by the awards. Seating is first come, first served.',
      ar: 'يقدّم خمسة متأهلين عروضهم على منصة الشركات الناشئة في القاعة 4، يليها توزيع الجوائز. الجلوس حسب أسبقية الحضور.',
    },
    priority: 'info',
    dayIndex: 2,
    time: '15:30',
  },
  {
    id: 'lost-found',
    title: { en: 'Lost & found at the Information Desk', ar: 'المفقودات في مكتب معلومات الزوار' },
    body: {
      en: 'Lost something? Items handed in are kept at the Visitor Information Desk in the centre of the concourse.',
      ar: 'هل فقدت شيئاً؟ تُحفظ المفقودات التي يتم تسليمها في مكتب معلومات الزوار وسط الممر المركزي.',
    },
    priority: 'info',
  },
  {
    id: 'prayer-times',
    title: { en: 'Prayer rooms open throughout the day', ar: 'المصليات مفتوحة طوال اليوم' },
    body: {
      en: 'Men’s and women’s prayer rooms with ablution areas are on the concourse, east of the Information Desk. Prayer times are shown on the concourse screens.',
      ar: 'تقع مصليات الرجال والنساء مع أماكن الوضوء في الممر المركزي شرق مكتب المعلومات، وتُعرض مواعيد الصلاة على شاشات الممر.',
    },
    priority: 'info',
  },
];
