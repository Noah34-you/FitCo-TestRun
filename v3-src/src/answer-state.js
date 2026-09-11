import { QUESTIONS } from './engine.js';

export function completeAnswers(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return QUESTIONS.every(q => {
    const answer = value[q.key];
    const valid = v => q.options.some(option => option.v === v);
    if (!q.multi) return valid(answer);
    return Array.isArray(answer) && answer.length > 0 && answer.length <= q.multi
      && new Set(answer).size === answer.length && answer.every(valid)
      && (!answer.includes('usuallyFine') || answer.length === 1);
  });
}

export function readSavedAnswers() {
  try {
    const value = JSON.parse(localStorage.getItem('fitco_v3_answers') || '{}');
    return completeAnswers(value) ? value : {};
  } catch { return {}; }
}

export function saveLocally(key, value) {
  try { localStorage.setItem(key, value); return true; }
  catch { return false; }
}
