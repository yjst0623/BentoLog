import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Lunch, Dish } from '../types';
import DishTag from '../components/DishTag';
import { saveLunch, normalizeDishName } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

const CATS = ['揚げ物', '卵料理', '野菜', '肉料理', '魚料理', 'その他'];

export default function AnalysisPage() {
  const { state } = useLocation() as { state: { lunch: Lunch; readonly: boolean } };
  const nav = useNavigate();
  const [lunch, setLunch] = useState<Lunch>(state.lunch);
  const [newDish, setNewDish] = useState('');
  const [cat, setCat] = useState('その他');
  const [saving, setSaving] = useState(false);
  const readonly = state.readonly;

  const addDish = () => {
    if (!newDish.trim()) return;
    const d: Dish = { id: uuidv4(), lunch_id: lunch.id, name: newDish.trim(), normalizedName: normalizeDishName(newDish.trim()), category: cat };
    setLunch({ ...lunch, dishes: [...lunch.dishes, d] });
    setNewDish('');
  };

  const save = async () => {
    if (lunch.dishes.length === 0) { alert('おかずを追加してください'); return; }
    setSaving(true);
    await saveLunch(lunch);
    setSaving(false);
    nav('/');
  };

  return (
    <div className="page">
      <div className="header"><h1>🍱 おかず入力</h1></div>

      <img src={lunch.photo} style={{ width: '100%', maxHeight: 240, objectFit: 'cover' }} alt="" />

      <div className="card">
        <div className="card-title">おかず一覧</div>
        <div className="dish-tags">
          {lunch.dishes.length === 0
            ? <span style={{ color: '#aaa', fontSize: 13 }}>おかずを追加してください</span>
            : lunch.dishes.map(d => (
                <DishTag key={d.id} name={d.name} category={d.category}
                  onRemove={readonly ? undefined : () => setLunch({ ...lunch, dishes: lunch.dishes.filter(x => x.id !== d.id) })} />
              ))
          }
        </div>
        {!readonly && (
          <>
            <div className="input-row">
              <input className="text-input" value={newDish} onChange={e => setNewDish(e.target.value)}
                placeholder="おかずを追加..." onKeyDown={e => e.key === 'Enter' && addDish()} />
              <button className="add-btn" onClick={addDish}>追加</button>
            </div>
            <div className="cat-chips">
              {CATS.map(c => <button key={c} className={`cat-chip${cat === c ? ' active' : ''}`} onClick={() => setCat(c)}>{c}</button>)}
            </div>
          </>
        )}
      </div>

      {!readonly && (
        <div style={{ margin: '0 12px 12px' }}>
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving ? '保存中...' : '💾 保存する'}
          </button>
        </div>
      )}
    </div>
  );
}
