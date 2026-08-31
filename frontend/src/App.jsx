import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Quiz from './pages/Quiz';
import SkillGraph from './pages/SkillGraph';
import './App.css';

function Layout({ children }) {
  const location = useLocation();
  const hideSidebar = location.pathname === '/onboarding' || location.pathname === '/' || location.pathname === '/login';

  return (
    <div className="flex h-screen overflow-hidden">
      {!hideSidebar && (
        <nav className="hidden md:flex flex-col h-screen w-64 left-0 top-0 fixed z-50 bg-surface/80 dark:bg-surface/80 backdrop-blur-xl border-r border-white/10 shadow-2xl shadow-primary/20 py-8">
          <div className="px-6 mb-12 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
              <img alt="User Profile Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZxzww77F0q-70KzzYAf5JqVz3SMlUKv4KtgijThPCy-0bsm8yqmpk38L14g1ajRy_G-bpeFK9uVAsQ-gIvNGz05wLWuS8CuRclc4omIJSPmHOR0jWLwVu_9shPj3Z0hgtUlcx5WHS-ZE91pWHjlklno93ylbo8h0CSbXRgtBueD0p6O63-VvyMmZj2j7wgHYr24FW8qx7RodUrDONgp7ZnGv3Pq9egXcS5P-4NAZ7xgRdzWwPZtSv4Q"/>
            </div>
            <div>
            </div>
          </div>
          <ul className="flex flex-col gap-2 flex-grow">
            <li>
              <Link to="/dashboard" className={`flex items-center gap-4 px-6 py-3 transition-colors ${location.pathname === '/dashboard' ? 'text-primary bg-primary/10 rounded-r-full border-r-4 border-primary transition-all duration-300 scale-95' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'}`}>
                <span className="material-symbols-outlined" style={{fontVariationSettings: location.pathname === '/dashboard' ? "'FILL' 1" : "'FILL' 0"}}>dashboard</span>
                <span className="font-label-md text-label-md">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/roadmap" className={`flex items-center gap-4 px-6 py-3 transition-colors ${location.pathname === '/roadmap' ? 'text-primary bg-primary/10 rounded-r-full border-r-4 border-primary transition-all duration-300 scale-95' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'}`}>
                <span className="material-symbols-outlined" style={{fontVariationSettings: location.pathname === '/roadmap' ? "'FILL' 1" : "'FILL' 0"}}>auto_stories</span>
                <span className="font-label-md text-label-md">My Path</span>
              </Link>
            </li>
            <li>
              <Link to="/skill-graph" className={`flex items-center gap-4 px-6 py-3 transition-colors ${location.pathname === '/skill-graph' ? 'text-primary bg-primary/10 rounded-r-full border-r-4 border-primary transition-all duration-300 scale-95' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'}`}>
                <span className="material-symbols-outlined" style={{fontVariationSettings: location.pathname === '/skill-graph' ? "'FILL' 1" : "'FILL' 0"}}>hub</span>
                <span className="font-label-md text-label-md">Skill Graph</span>
              </Link>
            </li>
            <li>
              <Link to="/chat" className={`flex items-center gap-4 px-6 py-3 transition-colors ${location.pathname === '/chat' ? 'text-primary bg-primary/10 rounded-r-full border-r-4 border-primary transition-all duration-300 scale-95' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'}`}>
                <span className="material-symbols-outlined" style={{fontVariationSettings: location.pathname === '/chat' ? "'FILL' 1" : "'FILL' 0"}}>smart_toy</span>
                <span className="font-label-md text-label-md">Assistant</span>
              </Link>
            </li>
            <li>
              <Link to="/profile" className={`flex items-center gap-4 px-6 py-3 transition-colors ${location.pathname === '/profile' ? 'text-primary bg-primary/10 rounded-r-full border-r-4 border-primary transition-all duration-300 scale-95' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'}`}>
                <span className="material-symbols-outlined" style={{fontVariationSettings: location.pathname === '/profile' ? "'FILL' 1" : "'FILL' 0"}}>account_circle</span>
                <span className="font-label-md text-label-md">Profile</span>
              </Link>
            </li>
          </ul>
        </nav>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto ${!hideSidebar ? 'md:ml-64' : ''}`}>
        {!hideSidebar && (
          <header className="sticky top-0 z-40 w-full flex justify-between items-center px-gutter py-4 backdrop-blur-md bg-surface/30 dark:bg-surface/30">
            <div className="md:hidden flex items-center gap-3">
            </div>
            <div className="hidden md:block">
              {/* Desktop breadcrumb or contextual title could go here */}
            </div>
            <div className="flex items-center gap-4 text-on-surface-variant">
              <button className="hover:text-primary transition-colors hover:opacity-80 duration-200"><span className="material-symbols-outlined">search</span></button>
              <button className="hover:text-primary transition-colors hover:opacity-80 duration-200"><span className="material-symbols-outlined">notifications</span></button>
              <button className="hover:text-primary transition-colors hover:opacity-80 duration-200"><span className="material-symbols-outlined">settings</span></button>
            </div>
          </header>
        )}

        <div className={!hideSidebar ? "p-margin-mobile md:p-margin-desktop min-h-screen" : "min-h-screen"}>
          {children}
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      {!hideSidebar && (
        <nav className="md:hidden fixed bottom-0 w-full z-50 glass-panel border-t-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] bg-surface/90 backdrop-blur-xl">
          <ul className="flex justify-around items-center py-3 px-2">
            <li>
              <Link to="/dashboard" className={`flex flex-col items-center gap-1 p-2 ${location.pathname === '/dashboard' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
                <div className={location.pathname === '/dashboard' ? 'bg-primary/20 px-4 py-1 rounded-full mb-1' : ''}>
                  <span className="material-symbols-outlined" style={{fontVariationSettings: location.pathname === '/dashboard' ? "'FILL' 1" : "'FILL' 0"}}>dashboard</span>
                </div>
                <span className={`font-mono-label text-[10px] ${location.pathname === '/dashboard' ? 'font-bold' : ''}`}>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/roadmap" className={`flex flex-col items-center gap-1 p-2 ${location.pathname === '/roadmap' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
                <div className={location.pathname === '/roadmap' ? 'bg-primary/20 px-4 py-1 rounded-full mb-1' : ''}>
                  <span className="material-symbols-outlined" style={{fontVariationSettings: location.pathname === '/roadmap' ? "'FILL' 1" : "'FILL' 0"}}>auto_stories</span>
                </div>
                <span className={`font-mono-label text-[10px] ${location.pathname === '/roadmap' ? 'font-bold' : ''}`}>Path</span>
              </Link>
            </li>
            <li>
              <Link to="/skill-graph" className={`flex flex-col items-center gap-1 p-2 ${location.pathname === '/skill-graph' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
                <div className={location.pathname === '/skill-graph' ? 'bg-primary/20 px-4 py-1 rounded-full mb-1' : ''}>
                  <span className="material-symbols-outlined" style={{fontVariationSettings: location.pathname === '/skill-graph' ? "'FILL' 1" : "'FILL' 0"}}>hub</span>
                </div>
                <span className={`font-mono-label text-[10px] ${location.pathname === '/skill-graph' ? 'font-bold' : ''}`}>Graph</span>
              </Link>
            </li>
            <li>
              <Link to="/profile" className={`flex flex-col items-center gap-1 p-2 ${location.pathname === '/profile' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
                <div className={location.pathname === '/profile' ? 'bg-primary/20 px-4 py-1 rounded-full mb-1' : ''}>
                  <span className="material-symbols-outlined" style={{fontVariationSettings: location.pathname === '/profile' ? "'FILL' 1" : "'FILL' 0"}}>account_circle</span>
                </div>
                <span className={`font-mono-label text-[10px] ${location.pathname === '/profile' ? 'font-bold' : ''}`}>Profile</span>
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/skill-graph" element={<SkillGraph />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/quiz" element={<Quiz />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
