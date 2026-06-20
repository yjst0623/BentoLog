import { useEffect, useRef, useState } from 'react';
import { chatWithClaude } from '../lib/ai';
import { loadSettings } from '../lib/settings';
import { getAllLunches, getDishStats } from '../lib/db';
import type { ChatMessage } from '../types';

const QUICK = ['明日のお弁当考えて', '卵焼き以外で', '10分以内で作れるもの', '野菜を増やしたい'];

export default function SuggestionPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [system, setSystem] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const [lunches, stats] = await Promise.all([getAllLunches(), getDishStats()]);
      const recent = lunches.slice(0, 14).flatMap(l => l.dishes.map(d => d.name)).filter((v, i, a) => a.indexOf(v) === i).slice(0, 20);
      const top = stats.slice(0, 5).map(s => `${s.name}（${s.count}回）`).join('、');
      setSystem(`あなたは子供のお弁当の献立を提案するアシスタントです。日本語で実用的な提案をしてください。\n\n【過去14日間のおかず】\n${recent.join('、') || 'データなし'}\n\n【よく使うおかず】\n${top || 'データなし'}\n\nおかず候補3つと選んだ理由を200字以内で回答してください。`);
      setMessages([{ role: 'assistant', content: 'こんにちは！明日のお弁当の献立を提案します。\n「明日のお弁当考えて」「卵焼き以外で」など気軽に話しかけてください😊' }]);
    })();
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    const settings = loadSettings();
    if (!settings.openaiKey) { alert('設定画面でOpenAI APIキーを入力してください。'); return; }
    const newMsgs: ChatMessage[] = [...messages, { role: 'user', content: msg }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);
    try {
      const reply = await chatWithClaude(newMsgs, settings.openaiKey, system);
      setMessages([...newMsgs, { role: 'assistant', content: reply }]);
    } catch (e: any) { alert(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="chat-page">
      <div className="header"><h1>💡 AI献立提案</h1></div>
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role === 'user' ? 'user' : 'ai'}`}>
            {m.role === 'assistant' && <div className="ai-label">🤖 AI</div>}
            <p>{m.content}</p>
          </div>
        ))}
        {loading && <div className="bubble ai"><p>考え中...</p></div>}
        <div ref={bottomRef} />
      </div>
      {messages.length <= 1 && (
        <div className="quick-chips">
          {QUICK.map(q => <button key={q} className="quick-chip" onClick={() => send(q)}>{q}</button>)}
        </div>
      )}
      <div className="chat-input-bar">
        <input className="chat-input" value={input} onChange={e => setInput(e.target.value)}
          placeholder="メッセージを入力..." onKeyDown={e => e.key === 'Enter' && send()} />
        <button className="send-btn" onClick={() => send()} disabled={!input.trim() || loading}>▲</button>
      </div>
    </div>
  );
}
