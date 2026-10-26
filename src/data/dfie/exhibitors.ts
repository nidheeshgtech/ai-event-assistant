import type { Exhibitor, Localized } from '@/types/event';

/** DEMO CONTENT — every company below is fictional. */

const UAE: Localized = { en: 'United Arab Emirates', ar: 'الإمارات العربية المتحدة' };
const KSA: Localized = { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية' };
const GERMANY: Localized = { en: 'Germany', ar: 'ألمانيا' };
const JAPAN: Localized = { en: 'Japan', ar: 'اليابان' };
const KOREA: Localized = { en: 'South Korea', ar: 'كوريا الجنوبية' };
const INDIA: Localized = { en: 'India', ar: 'الهند' };
const UK: Localized = { en: 'United Kingdom', ar: 'المملكة المتحدة' };
const JORDAN: Localized = { en: 'Jordan', ar: 'الأردن' };
const NETHERLANDS: Localized = { en: 'Netherlands', ar: 'هولندا' };
const SINGAPORE: Localized = { en: 'Singapore', ar: 'سنغافورة' };
const EGYPT: Localized = { en: 'Egypt', ar: 'مصر' };
const SPAIN: Localized = { en: 'Spain', ar: 'إسبانيا' };
const AUSTRALIA: Localized = { en: 'Australia', ar: 'أستراليا' };
const BAHRAIN: Localized = { en: 'Bahrain', ar: 'البحرين' };

const links = (slug: string) => ({
  website: `https://${slug}.example`,
  brochureUrl: `https://${slug}.example/brochure.pdf`,
  enquiryEmail: `hello@${slug}.example`,
});

export const DFIE_EXHIBITORS: Exhibitor[] = [
  // ── Hall 1 · AI, Data & Cybersecurity ──────────────────────────────
  {
    id: 'neuralsand-ai',
    name: 'NeuralSand AI',
    aliases: ['نيورال ساند', 'نيورال ساند للذكاء الاصطناعي', 'neuralsand'],
    stand: 'H1-02',
    hallId: 'H1',
    categoryIds: ['ai'],
    country: UAE,
    description: {
      en: 'Builds Arabic-first enterprise AI: large language models, assistants and document intelligence for government and business.',
      ar: 'تطوّر حلول ذكاء اصطناعي للمؤسسات تضع اللغة العربية أولاً، من نماذج لغوية كبيرة ومساعدات ذكية إلى تحليل المستندات للجهات الحكومية والشركات.',
    },
    products: [
      {
        name: { en: 'Sahra LLM', ar: 'نموذج صحراء اللغوي' },
        description: {
          en: 'A bilingual Arabic–English language model that can be hosted privately inside an organisation.',
          ar: 'نموذج لغوي ثنائي اللغة (عربي وإنجليزي) يمكن استضافته داخل بنية المؤسسة بشكل خاص.',
        },
      },
      {
        name: { en: 'DocuMind', ar: 'دوكيومايند' },
        description: {
          en: 'Reads scanned Arabic and English documents and extracts structured data.',
          ar: 'يقرأ المستندات الممسوحة ضوئياً بالعربية والإنجليزية ويستخرج منها بيانات منظمة.',
        },
      },
    ],
    tags: ['llm', 'language model', 'generative ai', 'chatbot', 'document ai', 'ocr', 'نموذج لغوي', 'مساعد ذكي', 'الذكاء الاصطناعي التوليدي'],
    ...links('neuralsand'),
    featured: true,
  },
  {
    id: 'qamar-analytics',
    name: 'Qamar Analytics',
    aliases: ['قمر للتحليلات', 'قمر', 'qamar'],
    stand: 'H1-05',
    hallId: 'H1',
    categoryIds: ['data', 'ai'],
    country: KSA,
    description: {
      en: 'Turns retail and government data into forecasts and dashboards using machine learning.',
      ar: 'تحوّل بيانات قطاع التجزئة والجهات الحكومية إلى توقعات ولوحات معلومات باستخدام تعلم الآلة.',
    },
    products: [
      {
        name: { en: 'Qamar Forecast', ar: 'قمر للتنبؤ' },
        description: {
          en: 'Demand forecasting for retail chains and supply planners.',
          ar: 'التنبؤ بالطلب لسلاسل التجزئة ومخططي سلاسل الإمداد.',
        },
      },
      {
        name: { en: 'Insight Studio', ar: 'استوديو الرؤى' },
        description: {
          en: 'Self-service analytics dashboards with Arabic interface.',
          ar: 'لوحات تحليلات ذاتية الخدمة بواجهة عربية.',
        },
      },
    ],
    tags: ['analytics', 'forecasting', 'business intelligence', 'dashboards', 'تحليلات', 'تنبؤ', 'لوحات معلومات', 'ذكاء الأعمال'],
    ...links('qamar-analytics'),
  },
  {
    id: 'cipherdune-security',
    name: 'CipherDune Security',
    aliases: ['سايفر ديون', 'سايفرديون للأمن', 'cipherdune'],
    stand: 'H1-07',
    hallId: 'H1',
    categoryIds: ['cybersecurity'],
    country: UAE,
    description: {
      en: 'Managed cybersecurity and threat detection for banks, airports and critical infrastructure.',
      ar: 'خدمات أمن سيبراني مُدارة ورصد للتهديدات للبنوك والمطارات والبنية التحتية الحيوية.',
    },
    products: [
      {
        name: { en: 'DuneSOC', ar: 'مركز ديون للعمليات الأمنية' },
        description: {
          en: 'A 24/7 managed security operations centre service.',
          ar: 'خدمة مركز عمليات أمنية مُدار على مدار الساعة.',
        },
      },
      {
        name: { en: 'ZeroGate', ar: 'زيرو غيت' },
        description: {
          en: 'Zero-trust access control for remote staff and contractors.',
          ar: 'نظام تحكم في الوصول بمبدأ انعدام الثقة للموظفين والمقاولين عن بُعد.',
        },
      },
    ],
    tags: ['soc', 'threat detection', 'zero trust', 'firewall', 'penetration testing', 'رصد التهديدات', 'مركز العمليات الأمنية', 'حماية الشبكات'],
    ...links('cipherdune'),
    featured: true,
  },
  {
    id: 'orbitstack-cloud',
    name: 'OrbitStack Cloud',
    aliases: ['أوربت ستاك', 'أوربت ستاك كلاود', 'orbitstack'],
    stand: 'H1-09',
    hallId: 'H1',
    categoryIds: ['data'],
    country: INDIA,
    description: {
      en: 'Sovereign cloud and edge computing platforms for regulated industries in the Middle East and South Asia.',
      ar: 'منصات حوسبة سحابية سيادية وحوسبة طرفية للقطاعات الخاضعة للتنظيم في الشرق الأوسط وجنوب آسيا.',
    },
    products: [
      {
        name: { en: 'OrbitStack Sovereign Cloud', ar: 'سحابة أوربت ستاك السيادية' },
        description: {
          en: 'Cloud infrastructure with in-country data residency.',
          ar: 'بنية سحابية تحفظ البيانات داخل حدود الدولة.',
        },
      },
      {
        name: { en: 'EdgeNode', ar: 'إيدج نود' },
        description: {
          en: 'Compact edge servers for factories, stores and stadiums.',
          ar: 'خوادم طرفية مدمجة للمصانع والمتاجر والملاعب.',
        },
      },
    ],
    tags: ['cloud hosting', 'edge computing', 'data centre', 'sovereign cloud', 'servers', 'استضافة سحابية', 'مراكز البيانات', 'الحوسبة الطرفية', 'خوادم'],
    ...links('orbitstack'),
  },
  {
    id: 'lumora-vision',
    name: 'Lumora Vision',
    aliases: ['لومورا فيجن', 'لومورا'],
    stand: 'H1-11',
    hallId: 'H1',
    categoryIds: ['ai'],
    country: JAPAN,
    description: {
      en: 'Computer vision software that counts, inspects and recognises objects from ordinary cameras.',
      ar: 'برمجيات رؤية حاسوبية تعدّ الأجسام وتفحصها وتتعرف عليها باستخدام الكاميرات العادية.',
    },
    products: [
      {
        name: { en: 'Lumora Inspect', ar: 'لومورا للفحص' },
        description: {
          en: 'Automated visual quality inspection for production lines.',
          ar: 'فحص بصري آلي للجودة على خطوط الإنتاج.',
        },
      },
      {
        name: { en: 'Crowd Lens', ar: 'كراود لنز' },
        description: {
          en: 'Privacy-preserving footfall and queue analytics for venues.',
          ar: 'تحليل أعداد الزوار والطوابير في المرافق مع الحفاظ على الخصوصية.',
        },
      },
    ],
    tags: ['computer vision', 'image recognition', 'cameras', 'quality inspection', 'footfall', 'رؤية حاسوبية', 'التعرف على الصور', 'كاميرات', 'فحص الجودة'],
    ...links('lumora-vision'),
  },
  {
    id: 'sentinel-grid-labs',
    name: 'Sentinel Grid Labs',
    aliases: ['سنتينل غريد', 'سنتينل غريد لابس', 'sentinel grid'],
    stand: 'H1-13',
    hallId: 'H1',
    categoryIds: ['cybersecurity', 'ai'],
    country: UK,
    description: {
      en: 'Uses AI to detect fraud and cyber attacks in real time across networks and payment systems.',
      ar: 'تستخدم الذكاء الاصطناعي لكشف الاحتيال والهجمات السيبرانية لحظياً عبر الشبكات وأنظمة الدفع.',
    },
    products: [
      {
        name: { en: 'Sentinel Detect', ar: 'سنتينل ديتكت' },
        description: {
          en: 'Machine-learning anomaly detection for network traffic.',
          ar: 'كشف الأنماط غير الطبيعية في حركة الشبكة باستخدام تعلم الآلة.',
        },
      },
    ],
    tags: ['fraud detection', 'anomaly detection', 'ai security', 'network security', 'كشف الاحتيال', 'أمن الشبكات', 'هجمات سيبرانية'],
    ...links('sentinel-grid'),
  },
  {
    id: 'datapalm-systems',
    name: 'DataPalm Systems',
    aliases: ['داتا بالم', 'داتابالم للأنظمة', 'datapalm'],
    stand: 'H1-16',
    hallId: 'H1',
    categoryIds: ['data'],
    country: UAE,
    description: {
      en: 'Data integration and governance tools that connect legacy systems to modern analytics.',
      ar: 'أدوات لتكامل البيانات وحوكمتها تربط الأنظمة القديمة بمنصات التحليل الحديثة.',
    },
    products: [
      {
        name: { en: 'PalmBridge', ar: 'بالم بريدج' },
        description: {
          en: 'Connectors that sync ERP, CRM and spreadsheet data into one warehouse.',
          ar: 'موصلات تزامن بيانات أنظمة تخطيط الموارد وإدارة العملاء والجداول في مستودع واحد.',
        },
      },
      {
        name: { en: 'Govern360', ar: 'حوكمة 360' },
        description: {
          en: 'Data catalogue and access policies for compliance teams.',
          ar: 'فهرس للبيانات وسياسات وصول لفرق الامتثال.',
        },
      },
    ],
    tags: ['data integration', 'data governance', 'etl', 'data warehouse', 'erp', 'تكامل البيانات', 'حوكمة البيانات', 'مستودع البيانات'],
    ...links('datapalm'),
  },
  {
    id: 'kalimat-language-tech',
    name: 'Kalimat Language Technologies',
    aliases: ['كلمات', 'كلمات لتقنيات اللغة', 'kalimat'],
    stand: 'H1-18',
    hallId: 'H1',
    categoryIds: ['ai'],
    country: JORDAN,
    description: {
      en: 'Arabic speech recognition, dialect-aware translation and voice assistants for customer service.',
      ar: 'تقنيات التعرف على الكلام العربي والترجمة التي تراعي اللهجات والمساعدات الصوتية لخدمة العملاء.',
    },
    products: [
      {
        name: { en: 'Lahja Speech', ar: 'لهجة للتعرف على الكلام' },
        description: {
          en: 'Speech-to-text for Gulf, Levantine and Egyptian Arabic.',
          ar: 'تحويل الكلام إلى نص باللهجات الخليجية والشامية والمصرية.',
        },
      },
      {
        name: { en: 'Kalimat Voice Agent', ar: 'وكيل كلمات الصوتي' },
        description: {
          en: 'An Arabic voice assistant for call centres.',
          ar: 'مساعد صوتي باللغة العربية لمراكز الاتصال.',
        },
      },
    ],
    tags: ['nlp', 'speech recognition', 'translation', 'voice assistant', 'arabic nlp', 'معالجة اللغة', 'التعرف على الكلام', 'ترجمة', 'مساعد صوتي'],
    ...links('kalimat'),
  },

  // ── Hall 2 · Robotics & Automation ─────────────────────────────────
  {
    id: 'ironfalcon-robotics',
    name: 'IronFalcon Robotics',
    aliases: ['آيرون فالكون', 'الصقر الحديدي للروبوتات', 'ironfalcon'],
    stand: 'H2-03',
    hallId: 'H2',
    categoryIds: ['robotics', 'automation'],
    country: GERMANY,
    description: {
      en: 'Industrial robot arms and turnkey welding and assembly cells for automotive and metal fabrication.',
      ar: 'أذرع روبوتية صناعية وخلايا لحام وتجميع متكاملة لقطاعي السيارات وتشكيل المعادن.',
    },
    products: [
      {
        name: { en: 'Falcon R6 robot arm', ar: 'الذراع الروبوتية فالكون R6' },
        description: {
          en: 'Six-axis industrial arm with a 20 kg payload.',
          ar: 'ذراع صناعية بست محاور وحمولة تصل إلى 20 كغ.',
        },
      },
      {
        name: { en: 'WeldCell Pro', ar: 'خلية اللحام برو' },
        description: {
          en: 'A ready-to-install robotic welding cell.',
          ar: 'خلية لحام روبوتية جاهزة للتركيب.',
        },
      },
    ],
    tags: ['robot arm', 'industrial robot', 'welding', 'assembly', 'manufacturing', 'ذراع روبوتية', 'روبوت صناعي', 'لحام', 'تجميع', 'تصنيع'],
    ...links('ironfalcon'),
    featured: true,
  },
  {
    id: 'sahm-drone-systems',
    name: 'Sahm Drone Systems',
    aliases: ['سهم', 'سهم لأنظمة الطائرات المسيرة', 'sahm'],
    stand: 'H2-05',
    hallId: 'H2',
    categoryIds: ['drones'],
    country: UAE,
    description: {
      en: 'Inspection and survey drones for oil and gas, solar farms and construction sites.',
      ar: 'طائرات مسيّرة للفحص والمسح في قطاع النفط والغاز ومحطات الطاقة الشمسية ومواقع البناء.',
    },
    products: [
      {
        name: { en: 'Sahm Surveyor', ar: 'سهم للمسح' },
        description: {
          en: 'Mapping drone with thermal and LiDAR payloads.',
          ar: 'طائرة مسيّرة لرسم الخرائط مزودة بكاميرا حرارية ومستشعر ليدار.',
        },
      },
    ],
    tags: ['drone inspection', 'survey', 'mapping', 'lidar', 'thermal', 'uav', 'فحص بالطائرات', 'مسح', 'خرائط', 'تصوير حراري'],
    ...links('sahm-drones'),
  },
  {
    id: 'kinetiq-automation',
    name: 'Kinetiq Automation',
    aliases: ['كينيتيك', 'كينيتيك للأتمتة', 'kinetiq'],
    stand: 'H2-08',
    hallId: 'H2',
    categoryIds: ['automation'],
    country: GERMANY,
    description: {
      en: 'Factory automation: PLC controllers, SCADA software and conveyor systems for food, pharma and logistics plants.',
      ar: 'أتمتة المصانع: وحدات تحكم منطقية قابلة للبرمجة وبرمجيات سكادا وأنظمة نقل للمصانع الغذائية والدوائية ومراكز الخدمات اللوجستية.',
    },
    products: [
      {
        name: { en: 'Kinetiq K-Control PLC', ar: 'وحدة التحكم كينيتيك K-Control' },
        description: {
          en: 'Modular programmable logic controllers.',
          ar: 'وحدات تحكم منطقية معيارية قابلة للبرمجة.',
        },
      },
      {
        name: { en: 'PlantView SCADA', ar: 'بلانت فيو سكادا' },
        description: {
          en: 'Monitoring and control software for whole production sites.',
          ar: 'برنامج مراقبة وتحكم لمواقع الإنتاج بالكامل.',
        },
      },
      {
        name: { en: 'FlexLine conveyors', ar: 'سيور فلكس لاين' },
        description: {
          en: 'Configurable conveyor and sorting modules.',
          ar: 'وحدات نقل وفرز قابلة للتهيئة.',
        },
      },
    ],
    tags: ['plc', 'scada', 'conveyor', 'factory automation', 'industrial control', 'sorting', 'تحكم صناعي', 'سيور ناقلة', 'فرز', 'أتمتة المصانع'],
    ...links('kinetiq'),
  },
  {
    id: 'hanaro-cobotics',
    name: 'Hanaro Cobotics',
    aliases: ['هانارو', 'هانارو للروبوتات التعاونية', 'hanaro'],
    stand: 'H2-10',
    hallId: 'H2',
    categoryIds: ['robotics', 'automation'],
    country: KOREA,
    description: {
      en: 'Collaborative robots (cobots) that work safely beside people for packing, machine tending and lab work.',
      ar: 'روبوتات تعاونية تعمل بأمان إلى جانب البشر في التعبئة وتشغيل الآلات وأعمال المختبرات.',
    },
    products: [
      {
        name: { en: 'Hanaro C5 cobot', ar: 'الروبوت التعاوني هانارو C5' },
        description: {
          en: 'Lightweight cobot with no-code programming by hand guiding.',
          ar: 'روبوت تعاوني خفيف يُبرمج دون كتابة أكواد عبر توجيهه باليد.',
        },
      },
      {
        name: { en: 'PackMate kit', ar: 'مجموعة باك ميت' },
        description: {
          en: 'Ready-made palletising and packing application.',
          ar: 'تطبيق جاهز للتعبئة ورصّ المنصات.',
        },
      },
    ],
    tags: ['cobot', 'collaborative robot', 'palletising', 'packing', 'machine tending', 'روبوت تعاوني', 'تعبئة', 'تغليف'],
    ...links('hanaro-cobotics'),
  },
  {
    id: 'mizan-factory-ai',
    name: 'Mizan Factory AI',
    aliases: ['ميزان', 'ميزان لذكاء المصانع', 'mizan'],
    stand: 'H2-12',
    hallId: 'H2',
    categoryIds: ['ai', 'automation'],
    country: KSA,
    description: {
      en: 'AI for industrial plants: predictive maintenance, energy optimisation and production scheduling.',
      ar: 'ذكاء اصطناعي للمنشآت الصناعية: الصيانة التنبؤية وتحسين استهلاك الطاقة وجدولة الإنتاج.',
    },
    products: [
      {
        name: { en: 'Mizan Predict', ar: 'ميزان للتنبؤ' },
        description: {
          en: 'Predicts equipment failures from vibration and sensor data.',
          ar: 'يتنبأ بأعطال المعدات من بيانات الاهتزاز والمستشعرات.',
        },
      },
      {
        name: { en: 'Mizan Scheduler', ar: 'ميزان للجدولة' },
        description: {
          en: 'Optimises production plans automatically.',
          ar: 'يحسّن خطط الإنتاج تلقائياً.',
        },
      },
    ],
    tags: ['predictive maintenance', 'industrial ai', 'iiot', 'sensors', 'energy optimisation', 'صيانة تنبؤية', 'مستشعرات', 'إنترنت الأشياء الصناعي'],
    ...links('mizan-ai'),
  },
  {
    id: 'kaizora-robotics',
    name: 'Kaizora Robotics',
    aliases: ['كايزورا', 'كايزورا للروبوتات', 'kaizora'],
    stand: 'H2-15',
    hallId: 'H2',
    categoryIds: ['robotics', 'automation', 'ai'],
    country: JAPAN,
    description: {
      en: 'AI vision-guided picking robots and complete warehouse automation for e-commerce and retail distribution.',
      ar: 'روبوتات انتقاء موجّهة بالرؤية الذكية وحلول أتمتة متكاملة للمستودعات في التجارة الإلكترونية وتوزيع التجزئة.',
    },
    products: [
      {
        name: { en: 'KaiPick', ar: 'كاي بيك' },
        description: {
          en: 'A picking robot that recognises thousands of item types with AI vision.',
          ar: 'روبوت انتقاء يتعرّف على آلاف أنواع المنتجات بالرؤية الذكية.',
        },
      },
      {
        name: { en: 'KaiFlow AMR', ar: 'روبوت كاي فلو المتنقل' },
        description: {
          en: 'Autonomous mobile robots that move shelves and totes around a warehouse.',
          ar: 'روبوتات متنقلة ذاتية الحركة تنقل الرفوف والصناديق داخل المستودع.',
        },
      },
      {
        name: { en: 'Warehouse Orchestrator', ar: 'منسّق المستودعات' },
        description: {
          en: 'Software that coordinates robots, conveyors and staff.',
          ar: 'برنامج ينسق عمل الروبوتات والسيور الناقلة والعاملين.',
        },
      },
    ],
    tags: ['warehouse automation', 'picking robot', 'amr', 'mobile robot', 'ai vision', 'logistics', 'أتمتة المستودعات', 'روبوت انتقاء', 'روبوت متنقل', 'رؤية ذكية', 'لوجستيات'],
    ...links('kaizora'),
    featured: true,
  },
  {
    id: 'flowcell-automation',
    name: 'FlowCell Process Automation',
    aliases: ['فلو سيل', 'فلوسيل لأتمتة العمليات', 'flowcell'],
    stand: 'H2-17',
    hallId: 'H2',
    categoryIds: ['automation'],
    country: INDIA,
    description: {
      en: 'Business process automation and software robots (RPA) that handle invoices, onboarding and reporting.',
      ar: 'أتمتة العمليات الإدارية وبرمجيات الروبوتات التي تتولى معالجة الفواتير وتسجيل العملاء وإعداد التقارير.',
    },
    products: [
      {
        name: { en: 'FlowCell Bots', ar: 'روبوتات فلو سيل البرمجية' },
        description: {
          en: 'Software robots that automate repetitive back-office tasks.',
          ar: 'روبوتات برمجية تؤتمت المهام المكتبية المتكررة.',
        },
      },
      {
        name: { en: 'InvoiceFlow', ar: 'إنفويس فلو' },
        description: {
          en: 'Reads and approves supplier invoices automatically.',
          ar: 'يقرأ فواتير الموردين ويعتمدها تلقائياً.',
        },
      },
    ],
    tags: ['rpa', 'process automation', 'workflow', 'back office', 'invoices', 'software robots', 'أتمتة العمليات', 'سير العمل', 'فواتير'],
    ...links('flowcell'),
  },
  {
    id: 'rafiq-service-robotics',
    name: 'Rafiq Service Robotics',
    aliases: ['رفيق', 'رفيق لروبوتات الخدمة', 'rafiq'],
    stand: 'H2-19',
    hallId: 'H2',
    categoryIds: ['robotics'],
    country: UAE,
    description: {
      en: 'Service robots for hotels, malls and hospitals: reception, delivery and guided tours in Arabic and English.',
      ar: 'روبوتات خدمة للفنادق ومراكز التسوق والمستشفيات للاستقبال والتوصيل والجولات الإرشادية بالعربية والإنجليزية.',
    },
    products: [
      {
        name: { en: 'Rafiq Concierge', ar: 'رفيق للاستقبال' },
        description: {
          en: 'A bilingual reception robot that greets and guides visitors.',
          ar: 'روبوت استقبال ثنائي اللغة يرحّب بالزوار ويرشدهم.',
        },
      },
      {
        name: { en: 'Rafiq Courier', ar: 'رفيق للتوصيل' },
        description: {
          en: 'Indoor delivery robot for room service and hospital supplies.',
          ar: 'روبوت توصيل داخلي لخدمة الغرف ولوازم المستشفيات.',
        },
      },
    ],
    tags: ['service robot', 'reception robot', 'delivery robot', 'humanoid', 'hospitality', 'روبوت خدمة', 'روبوت استقبال', 'روبوت توصيل', 'ضيافة'],
    ...links('rafiq-robotics'),
  },

  // ── Hall 3 · Smart Cities & Mobility ───────────────────────────────
  {
    id: 'madinatwin',
    name: 'MadinaTwin',
    aliases: ['مدينة توين', 'التوأم الرقمي للمدينة', 'madina twin'],
    stand: 'H3-02',
    hallId: 'H3',
    categoryIds: ['smartcity', 'data'],
    country: UAE,
    description: {
      en: 'Digital twins of districts and buildings that let planners simulate traffic, energy use and crowd flow.',
      ar: 'توائم رقمية للأحياء والمباني تتيح للمخططين محاكاة حركة المرور واستهلاك الطاقة وتدفق الحشود.',
    },
    products: [
      {
        name: { en: 'Twin City Platform', ar: 'منصة المدينة التوأم' },
        description: {
          en: '3D city model linked to live sensor data.',
          ar: 'نموذج ثلاثي الأبعاد للمدينة مرتبط ببيانات المستشعرات الحية.',
        },
      },
    ],
    tags: ['digital twin', 'urban planning', 'simulation', '3d model', 'iot', 'توأم رقمي', 'تخطيط عمراني', 'محاكاة'],
    ...links('madinatwin'),
    featured: true,
  },
  {
    id: 'voltway-mobility',
    name: 'Voltway Mobility',
    aliases: ['فولت واي', 'فولتواي للتنقل', 'voltway'],
    stand: 'H3-04',
    hallId: 'H3',
    categoryIds: ['mobility'],
    country: NETHERLANDS,
    description: {
      en: 'Fast chargers and charging-network software for electric vehicle fleets and public car parks.',
      ar: 'شواحن سريعة وبرمجيات لإدارة شبكات الشحن لأساطيل السيارات الكهربائية والمواقف العامة.',
    },
    products: [
      {
        name: { en: 'Voltway 180 kW charger', ar: 'شاحن فولت واي 180 كيلوواط' },
        description: {
          en: 'DC fast charger for cars and vans.',
          ar: 'شاحن سريع بالتيار المستمر للسيارات والشاحنات الخفيفة.',
        },
      },
      {
        name: { en: 'ChargeOS', ar: 'تشارج أو إس' },
        description: {
          en: 'Software to manage, bill and balance charging networks.',
          ar: 'برنامج لإدارة شبكات الشحن وفوترتها وموازنة أحمالها.',
        },
      },
    ],
    tags: ['ev charging', 'electric vehicle', 'charger', 'fleet', 'شحن السيارات الكهربائية', 'شاحن', 'أساطيل'],
    ...links('voltway'),
  },
  {
    id: 'darb-autonomous',
    name: 'Darb Autonomous',
    aliases: ['درب', 'درب للقيادة الذاتية', 'darb'],
    stand: 'H3-07',
    hallId: 'H3',
    categoryIds: ['mobility', 'ai'],
    country: UAE,
    description: {
      en: 'Self-driving shuttles and the AI driving software behind them, built for campuses, airports and new districts.',
      ar: 'حافلات صغيرة ذاتية القيادة وبرمجيات القيادة بالذكاء الاصطناعي التي تشغّلها، مصممة للحرم الجامعية والمطارات والأحياء الجديدة.',
    },
    products: [
      {
        name: { en: 'Darb Shuttle', ar: 'حافلة درب' },
        description: {
          en: 'A 12-seat electric autonomous shuttle.',
          ar: 'حافلة كهربائية ذاتية القيادة تتسع لاثني عشر راكباً.',
        },
      },
      {
        name: { en: 'Darb Drive', ar: 'درب درايف' },
        description: {
          en: 'AI perception and driving stack for partner vehicles.',
          ar: 'منظومة إدراك وقيادة بالذكاء الاصطناعي لمركبات الشركاء.',
        },
      },
    ],
    tags: ['autonomous vehicle', 'self-driving', 'shuttle', 'driverless', 'مركبة ذاتية القيادة', 'حافلة', 'بدون سائق'],
    ...links('darb-autonomous'),
  },
  {
    id: 'nakhla-smart-infrastructure',
    name: 'Nakhla Smart Infrastructure',
    aliases: ['نخلة', 'نخلة للبنية التحتية الذكية', 'nakhla'],
    stand: 'H3-10',
    hallId: 'H3',
    categoryIds: ['smartcity'],
    country: KSA,
    description: {
      en: 'Connected street lighting, environmental sensors and IoT networks for municipalities.',
      ar: 'إنارة شوارع متصلة ومستشعرات بيئية وشبكات إنترنت الأشياء للبلديات.',
    },
    products: [
      {
        name: { en: 'Nakhla SmartPole', ar: 'العمود الذكي من نخلة' },
        description: {
          en: 'Street light with air-quality sensors, Wi-Fi and CCTV mounts.',
          ar: 'عمود إنارة مزوّد بمستشعرات جودة الهواء وشبكة واي فاي ونقاط لتثبيت الكاميرات.',
        },
      },
      {
        name: { en: 'CityMesh', ar: 'سيتي ميش' },
        description: {
          en: 'Low-power IoT network for city sensors.',
          ar: 'شبكة إنترنت أشياء منخفضة الطاقة لمستشعرات المدينة.',
        },
      },
    ],
    tags: ['smart lighting', 'street lights', 'sensors', 'air quality', 'iot network', 'إنارة ذكية', 'مستشعرات', 'جودة الهواء', 'بلديات'],
    ...links('nakhla'),
  },
  {
    id: 'aerovia-logistics',
    name: 'Aerovia Logistics',
    aliases: ['أيروفيا', 'أيروفيا للخدمات اللوجستية', 'aerovia'],
    stand: 'H3-12',
    hallId: 'H3',
    categoryIds: ['mobility', 'drones'],
    country: SINGAPORE,
    description: {
      en: 'Drone delivery networks for medical supplies and urgent parcels in dense cities.',
      ar: 'شبكات توصيل بالطائرات المسيّرة للإمدادات الطبية والطرود العاجلة في المدن المزدحمة.',
    },
    products: [
      {
        name: { en: 'Aerovia Hopper', ar: 'أيروفيا هوبر' },
        description: {
          en: 'Delivery drone carrying up to 3 kg.',
          ar: 'طائرة توصيل مسيّرة تحمل حتى 3 كغ.',
        },
      },
      {
        name: { en: 'SkyDock', ar: 'سكاي دوك' },
        description: {
          en: 'Rooftop landing and charging station.',
          ar: 'محطة هبوط وشحن على أسطح المباني.',
        },
      },
    ],
    tags: ['drone delivery', 'last mile', 'parcels', 'medical delivery', 'توصيل بالطائرات', 'الميل الأخير', 'طرود'],
    ...links('aerovia'),
  },
  {
    id: 'mawqif-smart-parking',
    name: 'Mawqif Smart Parking',
    aliases: ['موقف', 'موقف للمواقف الذكية', 'mawqif'],
    stand: 'H3-15',
    hallId: 'H3',
    categoryIds: ['smartcity', 'mobility'],
    country: EGYPT,
    description: {
      en: 'Parking sensors, guidance signs and a mobile app that shows free spaces and takes payment.',
      ar: 'مستشعرات للمواقف ولوحات إرشادية وتطبيق جوال يعرض المواقف الشاغرة ويتيح الدفع.',
    },
    products: [
      {
        name: { en: 'Mawqif Sensor', ar: 'مستشعر موقف' },
        description: {
          en: 'In-ground bay occupancy sensor.',
          ar: 'مستشعر أرضي لرصد إشغال المواقف.',
        },
      },
      {
        name: { en: 'Mawqif App', ar: 'تطبيق موقف' },
        description: {
          en: 'Find, reserve and pay for parking.',
          ar: 'ابحث عن موقف واحجزه وادفع رسومه.',
        },
      },
    ],
    tags: ['parking', 'smart parking', 'occupancy sensor', 'parking app', 'مواقف', 'مواقف ذكية', 'تطبيق مواقف'],
    ...links('mawqif'),
  },
  {
    id: 'transitra-systems',
    name: 'Transitra Systems',
    aliases: ['ترانزيترا', 'ترانزيترا للأنظمة', 'transitra'],
    stand: 'H3-18',
    hallId: 'H3',
    categoryIds: ['mobility', 'data'],
    country: SPAIN,
    description: {
      en: 'Ticketing and ridership analytics for bus, tram and metro operators.',
      ar: 'أنظمة تذاكر وتحليلات لأعداد الركاب لمشغلي الحافلات والترام والمترو.',
    },
    products: [
      {
        name: { en: 'TapGo ticketing', ar: 'نظام التذاكر تاب جو' },
        description: {
          en: 'Contactless card and phone ticketing.',
          ar: 'تذاكر بالبطاقة اللاتلامسية والهاتف.',
        },
      },
      {
        name: { en: 'Ridership Insight', ar: 'رايدرشيب إنسايت' },
        description: {
          en: 'Passenger-flow analytics for planning routes and timetables.',
          ar: 'تحليلات لتدفق الركاب تساعد في تخطيط الخطوط والجداول.',
        },
      },
    ],
    tags: ['public transport', 'ticketing', 'transit', 'bus', 'ridership', 'النقل العام', 'تذاكر', 'حافلات', 'ركاب'],
    ...links('transitra'),
  },

  // ── Hall 4 · Sustainability, Health & Startups ─────────────────────
  {
    id: 'shamsgrid-energy',
    name: 'ShamsGrid Energy',
    aliases: ['شمس غريد', 'شمس غريد للطاقة', 'shamsgrid'],
    stand: 'H4-01',
    hallId: 'H4',
    categoryIds: ['cleantech'],
    country: UAE,
    description: {
      en: 'Solar panels, battery storage and energy management for buildings and industrial sites in hot climates.',
      ar: 'ألواح شمسية وبطاريات تخزين وأنظمة لإدارة الطاقة في المباني والمواقع الصناعية بالمناخات الحارة.',
    },
    products: [
      {
        name: { en: 'DesertPanel', ar: 'لوح الصحراء' },
        description: {
          en: 'Heat- and dust-tolerant solar modules.',
          ar: 'وحدات شمسية تتحمل الحرارة والغبار.',
        },
      },
      {
        name: { en: 'ShamsStore', ar: 'شمس ستور' },
        description: {
          en: 'Battery storage for day–night solar use.',
          ar: 'بطاريات تخزين لاستخدام الطاقة الشمسية ليلاً ونهاراً.',
        },
      },
    ],
    tags: ['solar panels', 'battery storage', 'renewable energy', 'energy management', 'ألواح شمسية', 'تخزين الطاقة', 'بطاريات', 'طاقة متجددة'],
    ...links('shamsgrid'),
    featured: true,
  },
  {
    id: 'aquavera',
    name: 'AquaVera Atmospheric Water',
    aliases: ['أكوافيرا', 'أكوافيرا للمياه', 'aquavera'],
    stand: 'H4-04',
    hallId: 'H4',
    categoryIds: ['cleantech'],
    country: AUSTRALIA,
    description: {
      en: 'Solar-powered units that harvest drinking water from humid air.',
      ar: 'وحدات تعمل بالطاقة الشمسية تستخلص مياه الشرب من رطوبة الهواء.',
    },
    products: [
      {
        name: { en: 'AquaVera Tower', ar: 'برج أكوافيرا' },
        description: {
          en: 'Produces up to 500 litres of drinking water a day.',
          ar: 'ينتج ما يصل إلى 500 لتر من مياه الشرب يومياً.',
        },
      },
    ],
    tags: ['water', 'water harvesting', 'drinking water', 'humidity', 'مياه', 'مياه الشرب', 'استخلاص المياه', 'رطوبة'],
    ...links('aquavera'),
  },
  {
    id: 'shifa-health-ai',
    name: 'Shifa Health AI',
    aliases: ['شفاء', 'شفاء للذكاء الصحي', 'shifa'],
    stand: 'H4-06',
    hallId: 'H4',
    categoryIds: ['healthtech', 'ai'],
    country: UAE,
    description: {
      en: 'AI tools that help clinics triage patients and read medical images faster, always with a doctor in the loop.',
      ar: 'أدوات ذكاء اصطناعي تساعد العيادات على فرز المرضى وقراءة الصور الطبية بسرعة أكبر، مع بقاء القرار للطبيب دائماً.',
    },
    products: [
      {
        name: { en: 'Shifa Triage', ar: 'شفاء للفرز' },
        description: {
          en: 'Symptom intake and triage assistant in Arabic and English.',
          ar: 'مساعد لتسجيل الأعراض وفرز الحالات بالعربية والإنجليزية.',
        },
      },
      {
        name: { en: 'Shifa Scan', ar: 'شفاء سكان' },
        description: {
          en: 'Flags findings on chest X-rays for radiologist review.',
          ar: 'يرصد الملاحظات في صور الأشعة السينية للصدر لمراجعتها من قِبل أخصائي الأشعة.',
        },
      },
    ],
    tags: ['medical ai', 'triage', 'radiology', 'x-ray', 'clinic', 'ذكاء اصطناعي طبي', 'فرز المرضى', 'أشعة', 'عيادات'],
    ...links('shifa-ai'),
  },
  {
    id: 'nabd-wearables',
    name: 'Nabd Wearables',
    aliases: ['نبض', 'نبض للأجهزة القابلة للارتداء', 'nabd'],
    stand: 'H4-09',
    hallId: 'H4',
    categoryIds: ['healthtech', 'startups'],
    country: KSA,
    description: {
      en: 'A startup making heat-stress and heart-rate wearables for outdoor workers.',
      ar: 'شركة ناشئة تصنع أجهزة قابلة للارتداء لرصد الإجهاد الحراري ونبض القلب للعاملين في الأماكن المكشوفة.',
    },
    products: [
      {
        name: { en: 'Nabd Band', ar: 'سوار نبض' },
        description: {
          en: 'Wristband that alerts supervisors to heat stress.',
          ar: 'سوار ينبّه المشرفين عند تعرض العامل للإجهاد الحراري.',
        },
      },
    ],
    tags: ['wearable', 'heart rate', 'heat stress', 'worker safety', 'جهاز قابل للارتداء', 'نبض القلب', 'الإجهاد الحراري', 'سلامة العمال'],
    ...links('nabd'),
  },
  {
    id: 'rasid-pay',
    name: 'Rasid Pay',
    aliases: ['رصيد', 'رصيد للمدفوعات', 'rasid'],
    stand: 'H4-11',
    hallId: 'H4',
    categoryIds: ['fintech'],
    country: UAE,
    description: {
      en: 'Payment terminals and QR payments for retailers, events and small businesses.',
      ar: 'أجهزة دفع ومدفوعات عبر رمز QR لتجار التجزئة والفعاليات والشركات الصغيرة.',
    },
    products: [
      {
        name: { en: 'Rasid Tap', ar: 'رصيد تاب' },
        description: {
          en: 'Turns any phone into a contactless card terminal.',
          ar: 'يحوّل أي هاتف إلى جهاز لقبول البطاقات اللاتلامسية.',
        },
      },
      {
        name: { en: 'Rasid QR', ar: 'رصيد QR' },
        description: {
          en: 'QR-code payments with instant settlement.',
          ar: 'مدفوعات عبر رمز QR مع تسوية فورية.',
        },
      },
    ],
    tags: ['payments', 'pos', 'qr payment', 'contactless', 'card terminal', 'مدفوعات', 'نقاط البيع', 'دفع لاتلامسي'],
    ...links('rasid-pay'),
  },
  {
    id: 'carbonleaf',
    name: 'Carbonleaf',
    aliases: ['كاربون ليف', 'كربون ليف'],
    stand: 'H4-14',
    hallId: 'H4',
    categoryIds: ['cleantech', 'startups'],
    country: INDIA,
    description: {
      en: 'A startup whose software measures and reports a company’s carbon footprint from its existing invoices and meter data.',
      ar: 'شركة ناشئة يقيس برنامجها البصمة الكربونية للشركات ويُعدّ تقاريرها انطلاقاً من فواتيرها وبيانات العدادات الحالية.',
    },
    products: [
      {
        name: { en: 'Carbonleaf Ledger', ar: 'سجل كاربون ليف' },
        description: {
          en: 'Automated emissions accounting and ESG reports.',
          ar: 'محاسبة آلية للانبعاثات وتقارير الحوكمة البيئية والاجتماعية.',
        },
      },
    ],
    tags: ['carbon footprint', 'esg', 'emissions', 'sustainability reporting', 'البصمة الكربونية', 'الانبعاثات', 'تقارير الاستدامة'],
    ...links('carbonleaf'),
  },
  {
    id: 'wasl-chain',
    name: 'Wasl Chain',
    aliases: ['وصل', 'وصل تشين', 'wasl'],
    stand: 'H4-17',
    hallId: 'H4',
    categoryIds: ['fintech', 'startups'],
    country: BAHRAIN,
    description: {
      en: 'A blockchain startup that digitises trade documents such as invoices and bills of lading for faster trade finance.',
      ar: 'شركة ناشئة تعتمد تقنية البلوك تشين لرقمنة المستندات التجارية مثل الفواتير وبوالص الشحن لتسريع تمويل التجارة.',
    },
    products: [
      {
        name: { en: 'Wasl TradeDocs', ar: 'وصل للمستندات التجارية' },
        description: {
          en: 'Shared, tamper-proof records for importers, banks and shipping lines.',
          ar: 'سجلات مشتركة غير قابلة للتلاعب للمستوردين والبنوك وشركات الشحن.',
        },
      },
    ],
    tags: ['blockchain', 'trade finance', 'bill of lading', 'digital documents', 'بلوك تشين', 'تمويل التجارة', 'بوليصة الشحن', 'مستندات رقمية'],
    ...links('wasl-chain'),
  },
];
