import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Lunch } from '../types';

interface BentoSchema extends DBSchema {
  lunches: { key: string; value: Lunch; indexes: { date: string } };
}

let db: IDBPDatabase<BentoSchema>;

async function getDB() {
  if (!db) {
    db = await openDB<BentoSchema>('bentolog', 1, {
      upgrade(database) {
        const store = database.createObjectStore('lunches', { keyPath: 'id' });
        store.createIndex('date', 'date');
      },
    });
  }
  return db;
}

export async function saveLunch(lunch: Lunch) {
  const db = await getDB();
  await db.put('lunches', lunch);
}

export async function getLunchByDate(date: string): Promise<Lunch | undefined> {
  const db = await getDB();
  const all = await db.getAllFromIndex('lunches', 'date', date);
  return all[0];
}

export async function getAllLunches(): Promise<Lunch[]> {
  const db = await getDB();
  const all = await db.getAll('lunches');
  return all.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getRecentLunches(limit = 5): Promise<Lunch[]> {
  const all = await getAllLunches();
  return all.slice(0, limit);
}

export async function searchLunches(keyword: string): Promise<Lunch[]> {
  const all = await getAllLunches();
  const kw = normalizeDishName(keyword).toLowerCase();
  return all.filter((l) =>
    l.dishes.some(
      (d) =>
        d.normalizedName.includes(kw) ||
        d.name.includes(keyword) ||
        d.category.includes(keyword)
    )
  );
}

export async function getDishStats() {
  const all = await getAllLunches();
  const map = new Map<string, { name: string; count: number; finished: number }>();
  for (const l of all) {
    for (const d of l.dishes) {
      const key = d.normalizedName;
      const cur = map.get(key) ?? { name: d.name, count: 0, finished: 0 };
      cur.count++;
      if (l.childRating?.rating === 'finished') cur.finished++;
      map.set(key, cur);
    }
  }
  return Array.from(map.values())
    .map((v) => ({ ...v, finishRate: v.count > 0 ? Math.round((v.finished / v.count) * 100) : 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

export function normalizeDishName(name: string): string {
  return name
    .toLowerCase()
    .replace(/唐揚げ|から揚げ|唐あげ|からあげ/g, 'からあげ')
    .replace(/卵焼き|たまご焼き|玉子焼き/g, 'たまごやき')
    .replace(/ウインナー|ウィンナー|ウイナー/g, 'ウインナー')
    .replace(/ハンバーグ|ハンバーク/g, 'ハンバーグ')
    .trim();
}
