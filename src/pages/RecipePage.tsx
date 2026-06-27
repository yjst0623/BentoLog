import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getAllRecipes, saveRecipe, deleteRecipe } from '../lib/db';
import type { Recipe } from '../types';

const CATEGORIES = ['肉料理', '魚料理', '卵料理', '野菜', '揚げ物', 'その他'];

export default function RecipePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('その他');
  const [memo, setMemo] = useState('');

  const load = async () => setRecipes(await getAllRecipes());
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!name.trim()) return;
    await saveRecipe({ id: uuidv4(), name: name.trim(), category, memo, createdAt: new Date().toISOString() });
    setName(''); setCategory('その他'); setMemo(''); setShowForm(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('このレシピを削除しますか？')) return;
    await deleteRecipe(id);
    load();
  };

  return (
    <div className="page">
      <div className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1>📖 レシピメモ</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', padding: '0 8px' }}>＋</button>
      </div>

      {showForm && (
        <div className="card">
          <div className="card-title">レシピを追加</div>
          <div className="settings-label">料理名</div>
          <input className="key-input" style={{ width: '100%', boxSizing: 'border-box' }}
            value={name} onChange={e => setName(e.target.value)} placeholder="例：豚の生姜焼き" />
          <div className="settings-label" style={{ marginTop: 10 }}>カテゴリ</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                style={{ padding: '4px 10px', borderRadius: 14, border: '1.5px solid', fontSize: 13, cursor: 'pointer',
                  background: category === c ? '#1A3A5C' : '#fff',
                  color: category === c ? '#fff' : '#1A3A5C',
                  borderColor: '#1A3A5C' }}>
                {c}
              </button>
            ))}
          </div>
          <div className="settings-label">メモ（材料・作り方など）</div>
          <textarea value={memo} onChange={e => setMemo(e.target.value)}
            placeholder="例：豚バラ200g、生姜1片、醤油大2、みりん大2…"
            style={{ width: '100%', boxSizing: 'border-box', minHeight: 80, padding: 8, borderRadius: 8,
              border: '1.5px solid #ccc', fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="btn-primary" onClick={add} style={{ flex: 1 }}>保存する</button>
            <button className="btn-secondary" onClick={() => setShowForm(false)} style={{ flex: 1 }}>キャンセル</button>
          </div>
        </div>
      )}

      {recipes.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <div>好評だったレシピを保存しましょう</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>右上の ＋ から追加できます</div>
        </div>
      )}

      <div style={{ padding: '0 12px 80px' }}>
        {recipes.map(r => (
          <div key={r.id} className="card" style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{r.name}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{r.category}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18, color: '#aaa' }}>{expanded === r.id ? '▲' : '▼'}</span>
                <button onClick={e => { e.stopPropagation(); remove(r.id); }}
                  style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#ccc', padding: 4 }}>🗑</button>
              </div>
            </div>
            {expanded === r.id && r.memo && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #eee',
                fontSize: 14, whiteSpace: 'pre-wrap', color: '#444', lineHeight: 1.6 }}>
                {r.memo}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
