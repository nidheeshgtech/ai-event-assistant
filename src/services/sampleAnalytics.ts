import type { EventDataset } from '@/types/event';

/**
 * Clearly labelled SAMPLE analytics for the demo dashboard. Deterministic per dataset so the
 * numbers don't jump between visits. Real figures would come from the backend question log.
 */
export interface SampleAnalytics {
  conversations: number;
  questions: number;
  answerRate: number;
  arabicShare: number;
  daily: { day: string; questions: number; conversations: number }[];
  hourly: { hour: string; questions: number }[];
  modes: { name: string; value: number }[];
  topics: { name: string; value: number }[];
  popular: { q: string; count: number }[];
  unanswered: { q: string; count: number }[];
}

function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function sampleAnalytics(data: EventDataset): SampleAnalytics {
  const r = rng(data.id);
  const scale = 0.6 + data.exhibitors.length / 40;
  const daily = data.info.days.map((d, i) => {
    const conversations = Math.round((1400 + r() * 700) * scale * (i === data.info.days.length - 1 ? 0.75 : 1));
    return { day: d.label?.en ?? `Day ${i + 1}`, conversations, questions: Math.round(conversations * (2.6 + r() * 0.8)) };
  });
  const questions = daily.reduce((a, d) => a + d.questions, 0);
  const conversations = daily.reduce((a, d) => a + d.conversations, 0);
  const curve = [0.35, 0.8, 1, 0.95, 1.15, 0.9, 0.85, 0.7, 0.5, 0.3];
  const hourly = curve.map((c, i) => ({ hour: `${String(10 + i).padStart(2, '0')}:00`, questions: Math.round((questions / data.info.days.length / 8) * c * (0.9 + r() * 0.2)) }));

  const cats = data.categories.slice(0, 6).map((c) => ({ name: c.name.en, value: Math.round(200 + r() * 900) })).sort((a, b) => b.value - a.value);
  const firstHall = data.halls[2] ?? data.halls[0];
  const ex = data.exhibitors[0];
  const popular = [
    'Where are the restrooms?',
    `Where is ${firstHall?.name.en ?? 'Hall 1'}?`,
    'What time does the exhibition close?',
    'What events are happening today?',
    `Where is ${ex?.name ?? 'stand H1-01'}?`,
    'Is parking free?',
    'Where is the prayer room?',
    'Recommend sessions about artificial intelligence',
  ].map((q, i) => ({ q, count: Math.round((620 - i * 62) * scale * (0.85 + r() * 0.3)) }));
  const unanswered = [
    'Is there a shuttle to the metro after 9pm?',
    'Can I buy exhibitor passes on site?',
    'Which stands give free samples?',
    'Is there a kids’ area?',
    'What is the Wi-Fi speed in Hall 4?',
  ].map((q, i) => ({ q, count: Math.round((48 - i * 7) * scale * (0.8 + r() * 0.4)) }));
  const answered = questions - unanswered.reduce((a, u) => a + u.count, 0) * 6;

  return {
    conversations,
    questions,
    answerRate: Math.min(0.97, answered / questions),
    arabicShare: 0.34 + r() * 0.12,
    daily,
    hourly,
    modes: [
      { name: 'Visitor', value: Math.round(questions * 0.62) },
      { name: 'Exhibitor', value: Math.round(questions * 0.27) },
      { name: 'Organizer', value: Math.round(questions * 0.11) },
    ],
    topics: cats,
    popular,
    unanswered,
  };
}
