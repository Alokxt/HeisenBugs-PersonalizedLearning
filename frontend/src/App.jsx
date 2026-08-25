import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import Chat from './pages/Chat';
import './App.css';

function Navigation() {
  const location = useLocation();
  if (location.pathname === '/onboarding' || location.pathname === '/') return null;

  return (
    <aside className="sidebar">
      <h2>Lumina<br/><span style={{fontSize: '0.6rem', color: 'var(--color-text-light)', fontFamily: 'var(--font-sans)', letterSpacing: '0.1em'}}>AI LEARNING</span></h2>
      <div className="sidebar-nav">
        <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
          <span>Dashboard</span>
        </Link>
        <Link to="/roadmap" className={`nav-item ${location.pathname === '/roadmap' ? 'active' : ''}`}>
          <span>My Path</span>
        </Link>
        <Link to="/chat" className={`nav-item ${location.pathname === '/chat' ? 'active' : ''}`}>
          <span>Assistant</span>
        </Link>
      </div>
    </aside>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container" style={{ display: 'grid', gridTemplateColumns: window.location.pathname === '/onboarding' || window.location.pathname === '/' ? '1fr' : '260px 1fr' }}>
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
