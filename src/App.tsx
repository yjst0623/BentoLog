import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CameraPage from './pages/CameraPage';
import AnalysisPage from './pages/AnalysisPage';
import HistoryPage from './pages/HistoryPage';
import SuggestionPage from './pages/SuggestionPage';
import SettingsPage from './pages/SettingsPage';

const TABS = [
  { path: '/', label: 'ホーム', icon: '🏠' },
  { path: '/history', label: '履歴', icon: '📅' },
  { path: '/suggestion', label: 'AI提案', icon: '💡' },
  { path: '/settings', label: '設定', icon: '⚙️' },
];

function TabBar() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const active = TABS.find(t => t.path === pathname)?.path ?? '/';
  return (
    <nav className="tab-bar">
      {TABS.map(t => (
        <button key={t.path} className={`tab-item${active === t.path ? ' active' : ''}`} onClick={() => nav(t.path)}>
          <span className="tab-icon">{t.icon}</span>{t.label}
        </button>
      ))}
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/BentoLog">
      <Routes>
        <Route path="/" element={<><HomePage /><TabBar /></>} />
        <Route path="/camera" element={<><CameraPage /><TabBar /></>} />
        <Route path="/analysis" element={<><AnalysisPage /><TabBar /></>} />
        <Route path="/history" element={<><HistoryPage /><TabBar /></>} />
        <Route path="/suggestion" element={<><SuggestionPage /><TabBar /></>} />
        <Route path="/settings" element={<><SettingsPage /><TabBar /></>} />
      </Routes>
    </BrowserRouter>
  );
}
