import { useEffect, useState } from 'react';
import { getAllRecipes } from '../lib/db';
import type { Recipe, WeeklyPlan, PlanDish } from '../types';
import { format, startOfWeek, addDays } from 'date-fns';
import { ja } from 'date-fns/locale';

const STORAGE_KEY = 'bentolog_weekly_plan';

function getWeekStart(offset = 0): string {
  const d = startOfWeek(addDays(new Date(), offset * 7), { weekStartsOn: 1 });
  return format(d, 'yyyy-MM-dd');
}

function loadPlan(weekStart: string): WeeklyPlan {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const all: WeeklyPlan[] = JSON.parse(raw);
      return all.find(p => p.weekStart === weekStart) ?? { weekStart, days: {} };
    }
  } catch {}
  return { weekStart, days: {} };
}

function savePlan(plan: WeeklyPlan) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: WeeklyPlan[] = raw ? JSON.parse(raw) : [];
    const idx = all.findIndex(p => p.weekStart === plan.weekStart);
    if (idx >= 0) all[idx] = plan; else all.push(plan);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

export default function PlanPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [plan, setPlan] = useState<WeeklyPlan>({ weekStart: getWeekStart(0), days: {} });
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [showList, setShowList] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const weekStart = getWeekStart(weekOffset);
  const days = Array.from({ length: 5 }, (_, i) => format(addDays(new Date(weekStart), i), 'yyyy-MM-dd'));

  useEffect(() => {
    setPlan(loadPlan(weekStart));
    getAllRecipes().then(setRecipes);
    setShowList(false);
  }, [weekOffset]);

  const addDish = (date: string) => {
    const trimmed = input.trim();
    if (!trimmed && !selectedRecipeId) return;
    const recipe = recipes.find(r => r.id === selectedRecipeId);
    const dish: PlanDish = { name: recipe ? recipe.name : trimmed, recipeId: recipe?.id };
    const updated: WeeklyPlan = {
      ...plan,
      days: { ...plan.days, [date]: [...(plan.days[date] ?? []), dish] },
    };
    savePlan(updated);
    setPlan(updated);
    setInput(''); setSelectedRecipeId(''); setEditingDay(null);
  };

  const removeDish = (date: string, idx: number) => {
    const updated: WeeklyPlan = {
      ...plan,
      days: { ...plan.days, [date]: plan.days[date].filter((_, i) => i !== idx) },
    };
    savePlan(updated); setPlan(updated);
  };

  const allIngredients: string[] = [];
  for (const date of days) {
    for (const dish of plan.days[date] ?? []) {
      const recipe = recipes.find(r => r.id === dish.recipeId);
      if (recipe?.ingredients) {
        recipe.ingredients.split('\n').filter(l => l.trim()).forEach(l => {
          if (!allIngredients.includes(l.trim())) allIngredients.push(l.trim());
        });
      }
    }
  }

  const toggleCheck = (item: string) => {
    const next = new Set(checked);
    next.has(item) ? next.delete(item) : next.add(item);
    setChecked(next);
  };

  return (
    <div className="page">
      <div className="header">
        <h1>📋 週間計画</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
          <button onClick={() => setWeekOffset(w => w - 1)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>‹</button>
          <span style={{ fontSize: 13, color: '#ccc' }}>
            {format(new Date(weekStart), 'M/d', { locale: ja })}〜
            {format(addDays(new Date(weekStart), 4), 'M/d（E）', { locale: ja })}
          </span>
          <button onClick={() => setWeekOffset(w => w + 1)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>›</button>
        </div>
      </div>

      <div style={{ padding: '0 12px' }}>
        {days.map(date => (
          <div key={date} className="card" style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                {format(new Date(date), 'M月d日（E）', { locale: ja })}
              </div>
              <button onClick={() => { setEditingDay(editingDay === date ? null : date); setInput(''); setSelectedRecipeId(''); }}
                style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#1A3A5C' }}>＋</button>
            </div>

            {(plan.days[date] ?? []).length === 0 && editingDay !== date && (
              <div style={{ fontSize: 13, color: '#bbb' }}>未定</div>
            )}

            {(plan.days[date] ?? []).map((dish, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ fontSize: 14 }}>{dish.name}{dish.recipeId && <span style={{ fontSize: 11, color: '#4CAF50', marginLeft: 4 }}>📖</span>}</span>
                <button onClick={() => removeDish(date, idx)}
                  style={{ background: 'none', border: 'none', color: '#ccc', fontSize: 16, cursor: 'pointer' }}>✕</button>
              </div>
            ))}

            {editingDay === date && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <select value={selectedRecipeId} onChange={e => { setSelectedRecipeId(e.target.value); setInput(''); }}
                  style={{ padding: '6px 8px', borderRadius: 8, border: '1.5px solid #ccc', fontSize: 14, background: '#fff' }}>
                  <option value="">📖 レシピから選ぶ…</option>
                  {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                {!selectedRecipeId && (
                  <input value={input} onChange={e => setInput(e.target.value)}
                    placeholder="または料理名を入力"
                    style={{ padding: '6px 8px', borderRadius: 8, border: '1.5px solid #ccc', fontSize: 14 }}
                    onKeyDown={e => e.key === 'Enter' && addDish(date)} />
                )}
                <button className="btn-primary" onClick={() => addDish(date)} style={{ padding: '6px 0' }}>追加</button>
              </div>
            )}
          </div>
        ))}

        <button className="btn-primary" onClick={() => { setShowList(!showList); setChecked(new Set()); }}
          style={{ margin: '4px 0 16px' }}>
          🛒 食材リストを{showList ? '閉じる' : '表示'}
        </button>

        {showList && (
          <div className="card" style={{ marginBottom: 80 }}>
            <div className="card-title">🛒 今週の買い物リスト</div>
            {allIngredients.length === 0 ? (
              <div style={{ color: '#999', fontSize: 14 }}>レシピから選んだおかずの食材が表示されます</div>
            ) : (
              allIngredients.map(item => (
                <div key={item} onClick={() => toggleCheck(item)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                    borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}>
                  <div style={{ width: 22, height: 22, borderRadius: 4, border: '2px solid',
                    borderColor: checked.has(item) ? '#4CAF50' : '#ccc',
                    background: checked.has(item) ? '#4CAF50' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {checked.has(item) && <span style={{ color: '#fff', fontSize: 14 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 15, textDecoration: checked.has(item) ? 'line-through' : 'none',
                    color: checked.has(item) ? '#aaa' : '#333' }}>{item}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
