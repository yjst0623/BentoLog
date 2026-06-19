import type { AppSettings } from '../types';

const KEY = 'bentolog_settings';
const defaults: AppSettings = { openaiKey: '', claudeKey: '' };

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
  } catch {
    return { ...defaults };
  }
}

export function saveSettings(s: AppSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}
