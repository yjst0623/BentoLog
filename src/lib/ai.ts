import type { Dish } from '../types';
import { normalizeDishName } from './db';
import { v4 as uuidv4 } from 'uuid';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function analyzePhoto(
  base64: string,
  geminiKey: string,
  lunchId: string
): Promise<{ dishes: Dish[]; colorScore: number; nutritionScore: number; aiComment: string }> {
  const imageData = base64.replace(/^data:image\/\w+;base64,/, '');

  const response = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inline_data: { mime_type: 'image/jpeg', data: imageData } },
          { text: `このお弁当の写真を分析してください。以下のJSON形式のみで回答してください。

{"dishes":[{"name":"おかず名","category":"揚げ物/卵料理/野菜/肉料理/魚料理/その他"}],"colorScore":0〜100,"nutritionScore":0〜100,"comment":"50字以内"}` },
        ],
      }],
    }),
  });
  if (!response.ok) throw new Error(`Gemini エラー: ${await response.text()}`);
  const data = await response.json();
  const content: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  let parsed: any;
  try { parsed = JSON.parse(content); }
  catch { const m = content.match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); else throw new Error('AI応答の解析失敗'); }

  return {
    dishes: (parsed.dishes ?? []).map((d: any): Dish => ({
      id: uuidv4(), lunch_id: lunchId, name: d.name,
      normalizedName: normalizeDishName(d.name), category: d.category ?? 'その他',
    })),
    colorScore: Math.min(100, Math.max(0, parsed.colorScore ?? 50)),
    nutritionScore: Math.min(100, Math.max(0, parsed.nutritionScore ?? 50)),
    aiComment: parsed.comment ?? '',
  };
}

export async function chatWithClaude(
  messages: { role: 'user' | 'assistant'; content: string }[],
  geminiKey: string,
  system: string
): Promise<string> {
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const response = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents,
    }),
  });
  if (!response.ok) throw new Error(`AI提案エラー: ${await response.text()}`);
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}
