import { useState } from 'react';
import { loadSettings, saveSettings } from '../lib/settings';

export default function SettingsPage() {
  const [s, setS] = useState(loadSettings());
  const [show, setShow] = useState(false);
  const mask = (k: string) => k ? k.slice(0, 6) + '••••••••' + k.slice(-4) : '';

  const save = () => { saveSettings(s); alert('保存しました'); };

  return (
    <div className="page">
      <div className="header"><h1>⚙️ 設定</h1></div>
      <div className="card">
        <div className="card-title">🔑 APIキー設定</div>
        <div className="settings-note">APIキーはこのデバイスにのみ保存されます。</div>

        <div className="settings-label">Gemini APIキー</div>
        <div className="key-row">
          <input className="key-input" value={show ? s.geminiKey : mask(s.geminiKey)}
            onChange={e => setS({ ...s, geminiKey: e.target.value })}
            placeholder="AIza..." type={show ? 'text' : 'password'} />
          <button className="toggle-btn" onClick={() => setShow(!show)}>{show ? '隠す' : '表示'}</button>
        </div>
        <div className="hint">取得: aistudio.google.com → Get API key（無料）</div>
        <div className="hint" style={{ marginTop: 8, color: '#888' }}>写真のAI解析・献立提案に使用します</div>
      </div>

      <div className="card">
        <div className="card-title">💡 コストについて</div>
        <div className="info-box">
          Gemini APIは無料枠が大きく、通常の使用では<br />
          ほぼ無料で利用できます。<br /><br />
          無料枠の目安（Gemini 2.0 Flash）:<br />
          • 写真解析: 月1500回まで無料<br />
          • 献立提案: 月1500回まで無料<br /><br />
          APIキーなしでも手動入力で記録できます。
        </div>
      </div>

      <div style={{ margin: '0 12px' }}>
        <button className="btn-primary" onClick={save}>保存する</button>
      </div>
    </div>
  );
}
