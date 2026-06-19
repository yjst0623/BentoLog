import { useState } from 'react';
import { loadSettings, saveSettings } from '../lib/settings';

export default function SettingsPage() {
  const [s, setS] = useState(loadSettings());
  const [showOAI, setShowOAI] = useState(false);
  const [showClaude, setShowClaude] = useState(false);
  const mask = (k: string) => k ? k.slice(0, 6) + '••••••••' + k.slice(-4) : '';

  const save = () => { saveSettings(s); alert('保存しました'); };

  return (
    <div className="page">
      <div className="header"><h1>⚙️ 設定</h1></div>
      <div className="card">
        <div className="card-title">🔑 APIキー設定（BYOK）</div>
        <div className="settings-note">APIキーはこのデバイスにのみ保存されます。</div>

        <div className="settings-label">OpenAI APIキー（写真AI解析用）</div>
        <div className="key-row">
          <input className="key-input" value={showOAI ? s.openaiKey : mask(s.openaiKey)}
            onChange={e => setS({ ...s, openaiKey: e.target.value })}
            placeholder="sk-..." type={showOAI ? 'text' : 'password'} />
          <button className="toggle-btn" onClick={() => setShowOAI(!showOAI)}>{showOAI ? '隠す' : '表示'}</button>
        </div>
        <div className="hint">取得: platform.openai.com → API Keys</div>

        <div className="settings-label">Claude APIキー（AI提案・レポート用）</div>
        <div className="key-row">
          <input className="key-input" value={showClaude ? s.claudeKey : mask(s.claudeKey)}
            onChange={e => setS({ ...s, claudeKey: e.target.value })}
            placeholder="sk-ant-..." type={showClaude ? 'text' : 'password'} />
          <button className="toggle-btn" onClick={() => setShowClaude(!showClaude)}>{showClaude ? '隠す' : '表示'}</button>
        </div>
        <div className="hint">取得: console.anthropic.com → API Keys</div>
      </div>

      <div className="card">
        <div className="card-title">💡 コストについて</div>
        <div className="info-box">
          このアプリはBYOK方式（自分のAPIキーを使用）です。<br /><br />
          目安（無料枠内）:<br />
          • 写真解析: 月150回程度（GPT-4o）<br />
          • 献立提案: 月数百回（Claude Sonnet）<br /><br />
          APIキーなしでも手動入力で記録できます。
        </div>
      </div>

      <div style={{ margin: '0 12px' }}>
        <button className="btn-primary" onClick={save}>保存する</button>
      </div>
    </div>
  );
}
