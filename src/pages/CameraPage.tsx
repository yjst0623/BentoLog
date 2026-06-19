import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzePhoto } from '../lib/ai';
import { loadSettings } from '../lib/settings';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

export default function CameraPage() {
  const nav = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!photoUrl) return;
    const settings = loadSettings();
    if (!settings.openaiKey) {
      if (confirm('OpenAI APIキーが未設定です。手動入力しますか？')) goManual();
      return;
    }
    setLoading(true);
    setError('');
    try {
      const lunchId = uuidv4();
      const result = await analyzePhoto(photoUrl, settings.openaiKey, lunchId);
      nav('/analysis', {
        state: {
          lunch: { id: lunchId, date: format(new Date(), 'yyyy-MM-dd'), photo: photoUrl, ...result },
          readonly: false,
        },
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const goManual = () => {
    if (!photoUrl) return;
    nav('/analysis', {
      state: {
        lunch: { id: uuidv4(), date: format(new Date(), 'yyyy-MM-dd'), photo: photoUrl, dishes: [], colorScore: 0, nutritionScore: 0, aiComment: '' },
        readonly: false,
      },
    });
  };

  return (
    <div className="page">
      <div className="header"><h1>📷 写真を撮る</h1></div>
      <div className="camera-page">
        {photoUrl ? (
          <>
            <img src={photoUrl} className="photo-preview" alt="プレビュー" />
            {error && <div style={{ color: '#E53935', fontSize: 13, textAlign: 'center' }}>{error}<br />手動入力に切り替えてください</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              <button className="btn-primary" onClick={analyze} disabled={loading}>
                {loading ? '🤖 AI解析中...' : '🤖 AI解析する'}
              </button>
              <button className="btn-secondary" onClick={goManual}>手動でおかずを入力</button>
              <button className="btn-secondary" onClick={() => { setPhotoUrl(null); setError(''); }}>撮り直す</button>
            </div>
          </>
        ) : (
          <>
            <span className="emoji">🍱</span>
            <h2>お弁当の写真を選んでください</h2>
            <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={onFile} style={{ display: 'none' }} />
            <button className="btn-primary" onClick={() => inputRef.current?.click()}>📷 カメラで撮影</button>
            <input
              type="file" accept="image/*" onChange={onFile}
              style={{ display: 'none' }} id="gallery-input"
            />
            <button className="btn-secondary" onClick={() => document.getElementById('gallery-input')?.click()}>
              🖼 ライブラリから選ぶ
            </button>
          </>
        )}
      </div>
    </div>
  );
}
