export const HORSE_LIMITS = { free: 1, pro: 5, admin: Infinity };

export const PLAN_LABELS = { free: 'Free', pro: 'Pro', admin: 'Admin' };

export function horseLimit(plan) {
  return HORSE_LIMITS[plan] ?? HORSE_LIMITS.free;
}

export const REQUEST_TYPES = [
  { key: 'pro', label: 'Pro membership', blurb: 'Up to 5 horses and the full Learn library.' },
  {
    key: 'business',
    label: 'Business membership',
    blurb: 'Create or claim a business profile and reply to reviews.',
  },
];

export const REQUEST_STATUS = {
  submitted: 'Submitted',
  invoiced: 'Invoiced',
  paid: 'Paid',
  approved: 'Active',
  declined: 'Declined',
};

export function invoiceNumber() {
  const now = new Date();
  const stamp = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INV-${stamp}-${suffix}`;
}

export function invoiceDueDate(days = 14) {
  const due = new Date();
  due.setDate(due.getDate() + days);
  return due.toISOString().slice(0, 10);
}

export function money(amount) {
  return `R${Number(amount || 0).toFixed(2)}`;
}

export function planSummary(plan) {
  const limit = horseLimit(plan);
  if (!Number.isFinite(limit)) return 'Everything, with no horse limit';
  return `${limit} ${limit === 1 ? 'horse' : 'horses'}`;
}