import { differenceInYears, format, isValid, parseISO } from 'date-fns';

export const CARE_TYPES = [
  'Vet',
  'Physio',
  'Farrier',
  'Dentist',
  'Chiropractor',
  'Bodywork',
  'Other',
];

export const RIDE_TYPES = ['Ride', 'Lesson', 'Show', 'Clinic', 'Other'];

export const HORSE_SEXES = ['Mare', 'Gelding', 'Stallion', 'Filly', 'Colt'];

export const todayKey = () => format(new Date(), 'yyyy-MM-dd');

export const fieldClass =
  'h-11 w-full rounded-xl border border-input bg-white px-3 text-[14px] text-ink placeholder:text-ink-soft/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function horseAge(horse) {
  if (!horse) return null;
  if (horse.date_of_birth) {
    const born = parseISO(horse.date_of_birth);
    if (isValid(born)) return differenceInYears(new Date(), born);
  }
  return horse.age || null;
}

export function ageLabel(horse) {
  const age = horseAge(horse);
  if (age === null) return null;
  return `${age} ${age === 1 ? 'year' : 'years'}`;
}

export function dayLabel(value) {
  if (!value) return '';
  const day = parseISO(value);
  if (!isValid(day)) return value;
  return value === todayKey() ? 'Today' : format(day, 'EEE d MMM');
}

export function dayParts(value) {
  const day = value ? parseISO(value) : null;
  if (!day || !isValid(day)) return { weekday: '', number: '' };
  return { weekday: format(day, 'MMM'), number: format(day, 'd') };
}

export function isUpcoming(item) {
  return Boolean(item?.date) && item.date >= todayKey();
}

export function splitTimeline(items) {
  const sorted = [...items].sort((a, b) =>
    `${a.date || ''} ${a.time || '00:00'}`.localeCompare(`${b.date || ''} ${b.time || '00:00'}`)
  );
  return {
    upcoming: sorted.filter(isUpcoming),
    past: sorted.filter((item) => !isUpcoming(item)).reverse(),
  };
}

export function initials(name) {
  return (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}