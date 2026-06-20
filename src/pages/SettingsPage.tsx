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

        <div className="settings-label">OpenAI APIキー</div>
        <div className="key-row">
          <input className="key-input" value={show ? s.openaiKey : mask(s.openaiKey)}
            onChange={e => setS({ ...s, openaiKey: e.target.value })}
            placeholder="sk-..." type={show ? 'text' : 'password'} />
          <button className="toggle-btn" onClick={() => setShow(!show)}>{show ? '隠す' : '表示'}</button>
        </div>
        <div className="hint">取得: platform.openai.com → API Keys</div>
        <div className="hint" style={{ marginTop: 8, color: '#888' }}>写真のAI解析・献立提案に使用します</div>
      </div>

      <div className="card">
        <div className="card-title">💡 コストについて</div>
        <div className="info-box">
          このアプリはBYOK方式（自分のAPIキーを使用）です。<br /><br />
          目安（無料枠内）:<br />
          • 写真解析: 月150回程度（GPT-4o）<br />
          • 献立提案: 月数百回（GPT-4o mini）<br /><br />
          APIキーなしでも手動入力で記録できます。
        </div>
      </div>

      <div style={{ margin: '0 12px' }}>
        <button className="btn-primary" onClick={save}>保存する</button>
      </div>
    </div>
  );
}
