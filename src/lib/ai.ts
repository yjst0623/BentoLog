import type { Dish } from '../types';
import { normalizeDishName } from './db';
import { v4 as uuidv4 } from 'uuid';

export async function analyzePhoto(
  base64: string,
  openaiKey: string,
  lunchId: string
): Promise<{ dishes: Dish[]; colorScore: number; nutritionScore: number; aiComment: string }> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: base64, detail: 'low' } },
          { type: 'text', text: `このお弁当の写真を分析してください。以下のJSON形式のみで回答してください。

{"dishes":[{"name":"おかず名","category":"揚げ物/卵料理/野菜/肉料理/魚料理/その他"}],"colorScore":0〜100,"nutritionScore":0〜100,"comment":"50字以内"}` },
        ],
      }],
    }),
  });
  if (!response.ok) throw new Error(`GPT-4o エラー: ${await response.text()}`);
  const data = await response.json();
  const content: string = data.choices?.[0]?.message?.content ?? '';
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
  claudeKey: string,
  system: string
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': claudeKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 600, system, messages }),
  });
  if (!response.ok) throw new Error(`Claude エラー: ${await response.text()}`);
  const data = await response.json();
  return data.content?.[0]?.text ?? '';
}
