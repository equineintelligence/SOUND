// Resource Library: categories and helpers.

export const LIBRARY_BUCKET = 'library-files';

export const LIBRARY_CATEGORIES = [
  'Livery and stabling',
  'Sale and lease of horses',
  'Employment',
  'Workplace discipline and HR',
  'Health and safety',
  'Business admin',
  'Other',
];

export const LIBRARY_AUDIENCES = [
  { value: 'all', label: 'All paying members' },
  { value: 'business', label: 'Mainly for businesses' },
  { value: 'pro', label: 'Mainly for riders and owners' },
];

export const ACCEPTED_FILES =
  '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export function fileLabel(doc) {
  const name = doc?.file_name || doc?.file_uri || '';
  const ext = name.includes('.') ? name.split('.').pop().toUpperCase() : 'FILE';
  const size = Number(doc?.file_size) || 0;
  if (!size) return ext;
  const kb = size / 1024;
  return `${ext} · ${kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(kb))} KB`}`;
}
