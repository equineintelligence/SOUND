import { DRAFT_KEY } from '@/lib/sound';

export const readDraft = () => {
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY)) || {};
  } catch (err) {
    return {};
  }
};

export const writeDraft = (patch) => {
  const next = { ...readDraft(), ...patch };
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
  return next;
};

export const clearDraft = () => {
  sessionStorage.removeItem(DRAFT_KEY);
};