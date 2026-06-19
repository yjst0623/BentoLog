import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllLunches, searchLunches } from '../lib/db';
import type { Lunch } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function HistoryPage() {
  const nav = useNavigate();
  const [lunches, setLunches] = useState<Lunch[]>([]);
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Lunch[] | null>(null);

  useEffect(() => { getAllLunches().then(setLunches); }, []);

  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const startPad = getDay(startOfMonth(month));
  const recordDates = new Set(lunches.map(l => l.date));
  const today = format(new Date(), 'yyyy-MM-dd');

  const onSearch = async (text: string) => {
    setSearch(text);
    if (!text.trim()) { setResults(null); return; }
    setResults(await searchLunches(text.trim()));
  };

  const display = results ?? (selected ? lunches.filter(l => l.date === selected) : lunches);

  return (
    <div className="page">
      <div className="header"><h1>📅 履歴</h1></div>

      {/* カレンダー */}
      <div className="card" style={{ padding: '12px 8px' }}>
        <div className="cal-nav">
          <button onClick={() => setMonth(m => subMonths(m, 1))}>‹</button>
          <h3>{format(month, 'yyyy年M月')}</h3>
          <button onClick={() => setMonth(m => addMonths(m, 1))}>›</button>
        </div>
        <div className="cal-header">
          {['日','月','火','水','木','金','土'].map(d => <div key={d} className="cal-day-name">{d}</div>)}
        </div>
        <div className="calendar-grid">
          {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map(day => {
            const ds = format(day, 'yyyy-MM-dd');
            const cls = ['cal-day', ds === today ? 'today' : '', ds === selected ? 'selected' : '', recordDates.has(ds) ? 'has-record' : ''].filter(Boolean).join(' ');
            return <div key={ds} className={cls} onClick={() => { setSelected(s => s === ds ? null : ds); setSearch(''); setResults(null); }}>{day.getDate()}</div>;
          })}
        </div>
      </div>

      {/* 検索 */}
      <div className="search-wrap">
        <input className="search-input" value={search} onChange={e => onSearch(e.target.value)} placeholder="おかず名で検索（唐揚げ など）" />
      </div>

      <div className="result-label">
        {search ? `「${search}」の検索結果: ${display.length}件` : selected ? format(new Date(selected), 'M月d日（E）', { locale: ja }) : `全履歴 ${display.length}件`}
      </div>

      <div style={{ padding: '0 12px' }}>
        {display.length === 0
          ? <div className="empty">記録がありません</div>
          : display.map(l => (
              <div key={l.id} className="recent-item" onClick={() => nav('/analysis', { state: { lunch: l, readonly: true } })}>
                <img src={l.photo} alt="" />
                <div className="recent-info">
                  <div className="recent-date">{format(new Date(l.date), 'M月d日（E）', { locale: ja })}</div>
                  <div className="recent-dishes">{l.dishes.map(d => d.name).join('・')}</div>
                  <div className="recent-score">彩り {l.colorScore}点 / 栄養 {l.nutritionScore}点</div>
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );
}
