export const BUSINESS_TYPES = [
  'Yards and livery',
  'Riding school',
  'Coaches and trainers',
  'Farriers',
  'Vets',
  'Saddle fitting',
  'Equine therapy',
  'Tack and feed',
  'Transport',
];

export const DISCOVER_CATEGORIES = [
  'All',
  'Yards and livery',
  'Coaches',
  'Farriers',
  'Vets',
  'Tack and feed',
  'Transport',
];

export const TOPICS = [
  { value: 'service_quality', label: 'Quality of the service' },
  { value: 'horse_care', label: 'How my horse was cared for' },
  { value: 'facilities_safety', label: 'Facilities and safety' },
  { value: 'communication', label: 'Communication and professionalism' },
  { value: 'pricing', label: 'Pricing and billing' },
];

export const REFERRAL_TOPICS = [
  { value: 'theft_fraud', label: 'Something was stolen, or I was defrauded' },
  { value: 'neglect', label: 'A horse is being neglected or mistreated' },
];

export const TOPIC_LABELS = [...TOPICS, ...REFERRAL_TOPICS].reduce((acc, t) => {
  acc[t.value] = t.label;
  return acc;
}, {});

export const CRITERIA = [
  { key: 'overall_rating', label: 'Overall' },
  { key: 'criterion_horse_care', label: 'Horse care' },
  { key: 'criterion_communication', label: 'Communication' },
  { key: 'criterion_value', label: 'Value' },
  { key: 'criterion_facilities', label: 'Facilities' },
];

export const CRITERION_BARS = [
  { key: 'rating_horse_care', label: 'Horse care' },
  { key: 'rating_communication', label: 'Communication' },
  { key: 'rating_value', label: 'Value' },
  { key: 'rating_professionalism', label: 'Professionalism' },
  { key: 'rating_facilities', label: 'Facilities' },
];

export const FLAG_REASONS = [
  'About a private individual',
  'Includes personal details',
  'Abusive or hateful language',
  'Not a genuine customer',
];

export const SERVICES = [
  'Full livery',
  'Part livery',
  'DIY livery',
  'Schooling',
  'Riding lessons',
  'Show preparation',
  'Trimming and shoeing',
  'Saddle fitting',
  'Physiotherapy',
  'Veterinary care',
  'Transport',
  'Tack and feed sales',
];

const SERIOUS_WORDS = [
  'thief', 'thieves', 'theft', 'stole', 'stolen', 'fraud', 'fraudulent', 'defrauded',
  'abuse', 'abused', 'abusive', 'cruelty', 'cruel', 'neglect', 'neglected',
];

const PROTECTED_GROUNDS = [
  'race', 'racist', 'racism', 'religion', 'religious', 'gender', 'sexist',
  'nationality', 'foreigner', 'sexual orientation', 'gay', 'lesbian', 'disability', 'disabled',
];

export function screenText(text) {
  const lower = (text || '').toLowerCase();
  const notes = [];
  SERIOUS_WORDS.forEach((w) => {
    if (lower.includes(w)) notes.push(`Possible serious allegation: "${w}"`);
  });
  PROTECTED_GROUNDS.forEach((w) => {
    if (lower.includes(w)) notes.push(`Possible protected ground reference: "${w}"`);
  });
  return { senior: notes.length > 0, notes };
}

export function displayName(user) {
  const full = (user && user.full_name ? user.full_name : '').trim();
  if (!full) return 'Sound rider';
  const parts = full.split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}`;
}

export function matchBusinesses(list, query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return list || [];
  const tokens = q.split(/\s+/).filter(Boolean);
  return (list || [])
    .map((b) => {
      const hay = `${b.name || ''} ${b.area || ''} ${(b.type || []).join(' ')}`.toLowerCase();
      const score = tokens.reduce((acc, t) => acc + (hay.includes(t) ? 1 : 0), 0);
      return { b, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.b);
}

export const ROSETTE_TONES = {
  blue: { disc: '#1D4E8F', tail: '#14375F' },
  red: { disc: '#A3252C', tail: '#7A1B20' },
  yellow: { disc: '#C79A1E', tail: '#9A7614' },
  green: { disc: '#1E4D3A', tail: '#A8692A' },
};

/** Show-ring tiers: over 4.5 blue, over 4 red, over 3.5 yellow, otherwise brand green. */
export function rosetteTone(rating) {
  const value = Number(rating) || 0;
  if (value > 4.5) return 'blue';
  if (value > 4) return 'red';
  if (value > 3.5) return 'yellow';
  return 'green';
}

export function initials(name) {
  return (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export const monthOptions = () => {
  const out = [];
  const now = new Date();
  for (let i = 0; i < 24; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleString('en-ZA', { month: 'long', year: 'numeric' }),
    });
  }
  return out;
};

export const DRAFT_KEY = 'sound.reviewDraft';