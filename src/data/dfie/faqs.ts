import type { Faq } from '@/types/event';

/** DEMO CONTENT — fictional visitor FAQs, consistent with base.ts facilities. */
export const DFIE_FAQS: Faq[] = [
  {
    id: 'registration-badge',
    question: { en: 'How do I register and collect my badge?', ar: 'كيف أسجّل وأستلم بطاقة الدخول؟' },
    answer: {
      en: 'Register online before you arrive, then show your registration QR code at the counters beside Gate A to print your badge. Keep the badge visible in the halls.',
      ar: 'سجّل عبر الإنترنت قبل وصولك، ثم أبرز رمز QR الخاص بتسجيلك في مكاتب التسجيل بجوار البوابة A لطباعة بطاقتك. يُرجى إبقاء البطاقة ظاهرة داخل القاعات.',
    },
    keywords: ['register', 'registration', 'badge', 'sign up', 'pass', 'تسجيل', 'التسجيل', 'بطاقة', 'بطاقة الدخول', 'باج'],
  },
  {
    id: 'ticket-price',
    question: { en: 'Is there an entry fee?', ar: 'هل توجد رسوم دخول؟' },
    answer: {
      en: 'Entry is free for registered trade visitors. There are no paid tickets.',
      ar: 'الدخول مجاني للزوار التجاريين المسجلين، ولا توجد تذاكر مدفوعة.',
    },
    keywords: ['ticket', 'tickets', 'price', 'fee', 'cost', 'free', 'pay', 'entry fee', 'تذكرة', 'تذاكر', 'سعر', 'رسوم', 'مجاني', 'تكلفة'],
  },
  {
    id: 'minimum-age',
    question: { en: 'Can children attend?', ar: 'هل يمكن للأطفال الحضور؟' },
    answer: {
      en: 'This is a trade event for visitors aged 16 and over. Children under 16 may enter only when accompanied by a registered adult, who must stay with them at all times.',
      ar: 'هذه فعالية تجارية للزوار الذين تبلغ أعمارهم 16 عاماً فأكثر. يُسمح بدخول من هم دون 16 عاماً فقط برفقة شخص بالغ مسجّل يبقى معهم طوال الوقت.',
    },
    keywords: ['children', 'kids', 'child', 'age', 'minimum age', 'family', 'under 16', 'أطفال', 'الأطفال', 'طفل', 'العمر', 'السن', 'عائلة'],
  },
  {
    id: 'dress-code',
    question: { en: 'Is there a dress code?', ar: 'هل يوجد قواعد للباس؟' },
    answer: {
      en: 'Business or smart-casual clothing is recommended. Please dress respectfully, in line with local customs. Comfortable shoes are a good idea.',
      ar: 'يُنصح بارتداء ملابس رسمية أو أنيقة غير رسمية، مع مراعاة الاحتشام والعادات المحلية. ويُفضّل ارتداء أحذية مريحة.',
    },
    keywords: ['dress code', 'dress', 'clothes', 'clothing', 'wear', 'attire', 'لباس', 'ملابس', 'الزي', 'ارتداء'],
  },
  {
    id: 're-entry',
    question: { en: 'Can I leave and come back in?', ar: 'هل يمكنني الخروج ثم العودة؟' },
    answer: {
      en: 'Yes. Re-entry is allowed on the same day and on later days, as long as you keep your badge.',
      ar: 'نعم، يُسمح بإعادة الدخول في اليوم نفسه وفي الأيام التالية ما دمت تحتفظ ببطاقتك.',
    },
    keywords: ['re-entry', 'reentry', 'come back', 'leave', 'return', 'go out', 'إعادة الدخول', 'الخروج', 'العودة', 'أخرج'],
  },
  {
    id: 'lost-found',
    question: { en: 'Where is lost and found?', ar: 'أين المفقودات؟' },
    answer: {
      en: 'Lost and found is at the Visitor Information Desk in the centre of the concourse.',
      ar: 'تُحفظ المفقودات في مكتب معلومات الزوار وسط الممر المركزي.',
    },
    keywords: ['lost', 'found', 'lost and found', 'lost property', 'missing', 'forgot', 'مفقودات', 'المفقودات', 'فقدت', 'ضاع', 'نسيت'],
  },
  {
    id: 'wifi',
    question: { en: 'Is there Wi-Fi?', ar: 'هل تتوفر شبكة واي فاي؟' },
    answer: {
      en: 'Yes. Free Wi-Fi is available in all halls and the concourse: network "DFIE-Guest", no password. Accept the terms on the welcome page.',
      ar: 'نعم، تتوفر شبكة واي فاي مجانية في جميع القاعات والممر المركزي باسم "DFIE-Guest" وبدون كلمة مرور، مع قبول الشروط في صفحة الترحيب.',
    },
    keywords: ['wifi', 'wi-fi', 'internet', 'wireless', 'password', 'network', 'واي فاي', 'انترنت', 'الإنترنت', 'شبكة', 'كلمة المرور'],
  },
  {
    id: 'parking',
    question: { en: 'Where can I park?', ar: 'أين يمكنني ركن سيارتي؟' },
    answer: {
      en: 'Use visitor car park P1 outside Gate A. Parking is free for visitors with an event badge (demo information).',
      ar: 'استخدم موقف سيارات الزوار P1 خارج البوابة A. المواقف مجانية للزوار الذين يحملون بطاقة المعرض (معلومات تجريبية).',
    },
    keywords: ['parking', 'park', 'car park', 'car', 'valet', 'موقف', 'مواقف', 'ركن', 'السيارة', 'مواقف السيارات'],
  },
  {
    id: 'public-transport',
    question: { en: 'How do I get there by public transport?', ar: 'كيف أصل باستخدام المواصلات العامة؟' },
    answer: {
      en: 'A free metro shuttle bus runs every 20 minutes from 09:30 until 30 minutes after the halls close, stopping outside Gate A. Taxis and ride-hailing pick up outside Gate B.',
      ar: 'تعمل حافلة مترو مجانية كل 20 دقيقة من الساعة 09:30 حتى ثلاثين دقيقة بعد إغلاق القاعات، وتتوقف خارج البوابة A. أما سيارات الأجرة وخدمات النقل الذكي فنقطة انطلاقها خارج البوابة B.',
    },
    keywords: ['metro', 'shuttle', 'bus', 'public transport', 'taxi', 'uber', 'transport', 'get there', 'how to reach', 'مترو', 'حافلة', 'المواصلات', 'تاكسي', 'سيارة أجرة', 'كيف أصل'],
  },
  {
    id: 'accessibility',
    question: { en: 'Is the venue accessible?', ar: 'هل المكان مهيأ لأصحاب الهمم؟' },
    answer: {
      en: 'Yes. All halls are step-free. An accessible restroom is next to the Information Desk, and wheelchairs can be borrowed from the desk.',
      ar: 'نعم، جميع القاعات بدون درجات. وتوجد دورة مياه مهيأة لأصحاب الهمم بجوار مكتب المعلومات، ويمكن استعارة الكراسي المتحركة من المكتب.',
    },
    keywords: ['accessible', 'accessibility', 'wheelchair', 'disabled', 'disability', 'step-free', 'أصحاب الهمم', 'كرسي متحرك', 'إعاقة', 'ذوي الإعاقة'],
  },
  {
    id: 'photography',
    question: { en: 'Can I take photos?', ar: 'هل يُسمح بالتصوير؟' },
    answer: {
      en: 'Personal photography is allowed in public areas. Please ask exhibitors before photographing their stands or products, and do not photograph other visitors without permission.',
      ar: 'يُسمح بالتصوير الشخصي في المناطق العامة. يُرجى استئذان العارضين قبل تصوير أجنحتهم أو منتجاتهم، وعدم تصوير الزوار الآخرين دون إذنهم.',
    },
    keywords: ['photo', 'photos', 'photography', 'camera', 'pictures', 'video', 'filming', 'تصوير', 'صور', 'كاميرا', 'فيديو'],
  },
  {
    id: 'food',
    question: { en: 'Where can I get food and drinks?', ar: 'أين أجد الطعام والمشروبات؟' },
    answer: {
      en: 'The Food Court is on the concourse outside Hall 3, close to Gate A, open from 09:30 until the halls close. Café Lumen is on the concourse outside Hall 2, near Gate B.',
      ar: 'تقع ساحة المطاعم في الممر المركزي خارج القاعة 3 بالقرب من البوابة A، وتفتح من الساعة 09:30 حتى إغلاق القاعات. ويقع مقهى لومن في الممر المركزي خارج القاعة 2 بالقرب من البوابة B.',
    },
    keywords: ['food', 'eat', 'lunch', 'drink', 'drinks', 'coffee', 'cafe', 'restaurant', 'hungry', 'طعام', 'أكل', 'غداء', 'مشروبات', 'قهوة', 'مقهى', 'مطعم'],
  },
  {
    id: 'brochures-enquiries',
    question: { en: 'How do I get an exhibitor’s brochure or contact them?', ar: 'كيف أحصل على كتيّب العارض أو أتواصل معه؟' },
    answer: {
      en: 'Ask me about any exhibitor and I will show their stand, brochure link and enquiry email. You can also visit their stand during opening hours.',
      ar: 'اسألني عن أي عارض وسأعرض لك جناحه ورابط كتيّبه وبريد الاستفسارات الخاص به. ويمكنك أيضاً زيارة جناحه خلال ساعات العمل.',
    },
    keywords: ['brochure', 'brochures', 'catalogue', 'contact exhibitor', 'enquiry', 'inquiry', 'leaflet', 'كتيب', 'كتيّب', 'بروشور', 'كتالوج', 'التواصل مع العارض', 'استفسار'],
  },
  {
    id: 'contact-organizer',
    question: { en: 'How do I contact the organiser?', ar: 'كيف أتواصل مع الجهة المنظمة؟' },
    answer: {
      en: 'Visit the Visitor Information Desk in the centre of the concourse, email visitors@dfie-demo.example or call +971 4 000 0000 (demo).',
      ar: 'تفضّل بزيارة مكتب معلومات الزوار وسط الممر المركزي، أو راسلنا على visitors@dfie-demo.example، أو اتصل على الرقم ‎+971 4 000 0000 (تجريبي).',
    },
    keywords: ['contact', 'organiser', 'organizer', 'help', 'support', 'email', 'phone', 'call', 'complaint', 'تواصل', 'المنظم', 'الجهة المنظمة', 'مساعدة', 'دعم', 'اتصال', 'شكوى'],
  },
];
