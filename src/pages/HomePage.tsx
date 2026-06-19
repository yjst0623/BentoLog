import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLunchByDate, getRecentLunches } from '../lib/db';
import type { Lunch } from '../types';
import ScoreBar from '../components/ScoreBar';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const today = format(new Date(), 'yyyy-MM-dd');

export default function HomePage() {
  const nav = useNavigate();
  const [todayLunch, setTodayLunch] = useState<Lunch | undefined>();
  const [recent, setRecent] = useState<Lunch[]>([]);

  useEffect(() => {
    getLunchByDate(today).then(setTodayLunch);
    getRecentLunches(6).then((r) => setRecent(r.filter((l) => l.date !== today)));
  }, []);

  return (
    <div className="page">
      <div className="header">
        <h1>🍱 BentoLog</h1>
        <div className="date">{format(new Date(), 'M月d日（E）', { locale: ja })}</div>
      </div>

      <div className="card">
        <div className="card-title">今日のお弁当</div>
        {todayLunch ? (
          <div onClick={() => nav('/analysis', { state: { lunch: todayLunch, readonly: true } })} style={{ cursor: 'pointer' }}>
            <img src={todayLunch.photo} style={{ width: '100%', borderRadius: 8, marginBottom: 10 }} alt="今日のお弁当" />
            <div style={{ fontSize: 13, color: '#555', marginBottom: 8 }}>{todayLunch.dishes.map(d => d.name).join('・')}</div>
            <ScoreBar label="彩り" score={todayLunch.colorScore} color="#FF6B6B" />
            <ScoreBar label="栄養" score={todayLunch.nutritionScore} color="#4CAF50" />
            {todayLunch.aiComment && <div className="ai-comment">💬 {todayLunch.aiComment}</div>}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ color: '#888', marginBottom: 16 }}>まだ今日のお弁当が記録されていません</div>
            <button className="btn-primary" onClick={() => nav('/camera')}>📷 写真を撮る</button>
          </div>
        )}
      </div>

      <div className="action-row">
        <button className="action-btn" onClick={() => nav('/camera')}>
          <span className="icon">📷</span><span className="label">写真を撮る</span>
        </button>
        <button className="action-btn" onClick={() => nav('/suggestion')}>
          <span className="icon">💡</span><span className="label">明日の提案</span>
        </button>
        <button className="action-btn" onClick={() => nav('/history')}>
          <span className="icon">📅</span><span className="label">履歴を見る</span>
        </button>
      </div>

      {recent.length > 0 && (
        <div className="card">
          <div className="card-title">最近の記録</div>
          {recent.map((l) => (
            <div key={l.id} className="recent-item" onClick={() => nav('/analysis', { state: { lunch: l, readonly: true } })}>
              <img src={l.photo} alt="" />
              <div className="recent-info">
                <div className="recent-date">{format(new Date(l.date), 'M月d日（E）', { locale: ja })}</div>
                <div className="recent-dishes">{l.dishes.map(d => d.name).join('・')}</div>
                <div className="recent-score">彩り {l.colorScore}点 / 栄養 {l.nutritionScore}点</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
