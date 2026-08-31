import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../api';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await apiCall('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      localStorage.setItem('token', data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen w-full flex overflow-hidden antialiased selection:bg-primary selection:text-on-primary absolute top-0 left-0 z-50">
      {/* Left Split: Artistic Background (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 relative h-screen bg-surface-container-low" style={{backgroundImage: "url('/abstract-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center'}}>
        {/* Subtle gradient overlay to blend into the dark theme */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/90"></div>
        
        {/* Brand identity in the corner */}
        <div className="absolute top-margin-desktop left-margin-desktop z-10 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span>
        </div>
      </div>

      {/* Right Split: Minimalist Form */}
      <div className="w-full md:w-1/2 h-screen flex flex-col justify-center items-center p-margin-mobile md:p-margin-desktop relative bg-gradient-to-bl from-surface-container-highest/20 to-background">
        {/* Ambient Background Glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        {/* Mobile Brand (Visible only when left split is hidden) */}
        <div className="md:hidden flex items-center gap-3 mb-8 relative z-10">
          <span className="material-symbols-outlined text-primary text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span>
        </div>

        {/* Glassmorphism Form Container */}
        <div className="w-full max-w-[440px] bg-surface/40 backdrop-blur-3xl border border-outline-variant/30 rounded-xl p-8 shadow-2xl shadow-primary/5 relative overflow-hidden group z-10">
          {/* Diagonal subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-50 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col gap-8">
            {/* Heading */}
            <div className="text-center md:text-left">
              <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary tracking-tight">Welcome Back</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">Access your elite learning command center.</p>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && <div className="text-error font-label-md text-label-md bg-error-container/20 p-3 rounded text-center border border-error-container">{error}</div>}
              
              {/* Username Input */}
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="username">Username</label>
                <div className="relative group/input">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/input:text-primary transition-colors">person</span>
                  <input 
                    className="w-full bg-surface-container/50 text-on-surface border border-outline-variant rounded-DEFAULT pl-12 pr-4 py-3 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 placeholder:text-on-surface-variant/50" 
                    id="username" 
                    placeholder="Enter your username" 
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="password">Password</label>
                  <a className="font-label-md text-label-md text-secondary hover:text-secondary-container transition-colors" href="#">Forgot?</a>
                </div>
                <div className="relative group/input">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/input:text-primary transition-colors">lock</span>
                  <input 
                    className="w-full bg-surface-container/50 text-on-surface border border-outline-variant rounded-DEFAULT pl-12 pr-4 py-3 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 placeholder:text-on-surface-variant/50" 
                    id="password" 
                    placeholder="••••••••" 
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none" type="button">
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                </div>
              </div>

              {/* CTA Button */}
              <button className="mt-4 w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-label-md text-label-md py-4 rounded-DEFAULT shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:opacity-90 transition-all duration-300 relative overflow-hidden group/btn flex items-center justify-center gap-2" type="submit">
                <span className="relative z-10">Log In</span>
                <span className="material-symbols-outlined relative z-10 text-on-primary group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              </button>
            </form>

            {/* Signup Link */}
            <div className="text-center pt-2 border-t border-outline-variant/30">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Don't have an account? 
                <a className="font-label-md text-label-md text-secondary hover:text-secondary-container transition-colors ml-1" href="#">Sign up</a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="absolute bottom-margin-mobile md:bottom-margin-desktop flex gap-6 text-on-surface-variant/60 z-10">
          <a className="font-mono-label text-mono-label hover:text-on-surface transition-colors" href="#">Privacy Policy</a>
          <a className="font-mono-label text-mono-label hover:text-on-surface transition-colors" href="#">Terms of Service</a>
        </div>
      </div>
    </div>
  );
}
