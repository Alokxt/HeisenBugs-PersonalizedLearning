import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api';

export default function Onboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    goal: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password || !formData.goal) {
      setError("Please fill in all fields.");
      return;
    }
    if (formData.password !== formData.password2) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await registerUser(formData);
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
      }
      localStorage.setItem('user', JSON.stringify(response.user));
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.data?.errors 
        ? Object.values(err.data.errors).join(' ') 
        : err.data?.error || "Registration failed. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen w-full flex overflow-hidden antialiased selection:bg-primary selection:text-on-primary absolute top-0 left-0 z-50">
      {/* Left Split: Artistic Background (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 relative h-screen bg-surface-container-low" style={{backgroundImage: "url('/abstract-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center'}}>
        {/* Subtle gradient overlay to blend into the dark theme */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/90"></div>
        
        <div className="absolute top-margin-desktop left-margin-desktop z-10 flex flex-col justify-between h-[calc(100vh-96px)]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span>
            </div>
            <div className="max-w-md">
              <h2 className="font-headline-md text-headline-md mb-4 text-on-surface">Elite Personalized Learning</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Enter the simulation. Our neural architecture adapts to your exact cognitive patterns to generate optimal learning pathways.
              </p>
            </div>
        </div>
      </div>

      {/* Right Split: Minimalist Form */}
      <div className="w-full md:w-1/2 h-screen flex flex-col justify-center items-center p-margin-mobile md:p-margin-desktop relative bg-gradient-to-bl from-surface-container-highest/20 to-background overflow-hidden">
        {/* Ambient Background Glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        {/* Mobile Brand (Visible only when left split is hidden) */}
        <div className="md:hidden flex items-center gap-3 mb-8 relative z-10">
          <span className="material-symbols-outlined text-primary text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span>
        </div>

        {/* Glassmorphism Form Container */}
        <div className="w-full max-w-[480px] bg-surface/40 backdrop-blur-3xl border border-outline-variant/30 rounded-xl p-6 shadow-2xl shadow-primary/5 relative overflow-hidden group z-10">
          {/* Diagonal subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-50 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col gap-4">
            {/* Heading */}
            <div className="text-center md:text-left hidden md:block">
              <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-headline-md md:text-headline-md text-primary tracking-tight">Create Account</h1>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && <div className="text-error font-label-md text-label-md bg-error-container/20 p-3 rounded text-center border border-error-container">{error}</div>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username Input */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="username">Username</label>
                  <div className="relative group/input">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/input:text-primary transition-colors">person</span>
                    <input 
                      className="w-full bg-surface-container/50 text-on-surface border border-outline-variant rounded-DEFAULT pl-12 pr-4 py-2 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 placeholder:text-on-surface-variant/50" 
                      id="username" 
                      name="username" 
                      placeholder="Enter your username" 
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="email">Email</label>
                  <div className="relative group/input">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/input:text-primary transition-colors">mail</span>
                    <input 
                      className="w-full bg-surface-container/50 text-on-surface border border-outline-variant rounded-DEFAULT pl-12 pr-4 py-2 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 placeholder:text-on-surface-variant/50" 
                      id="email" 
                      name="email" 
                      placeholder="Enter your email" 
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password Input */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="password">Password</label>
                  <div className="relative group/input">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/input:text-primary transition-colors">lock</span>
                    <input 
                      className="w-full bg-surface-container/50 text-on-surface border border-outline-variant rounded-DEFAULT pl-12 pr-4 py-2 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 placeholder:text-on-surface-variant/50" 
                      id="password" 
                      name="password" 
                      placeholder="••••••••" 
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="password2">Confirm Password</label>
                  <div className="relative group/input">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/input:text-primary transition-colors">password</span>
                    <input 
                      className="w-full bg-surface-container/50 text-on-surface border border-outline-variant rounded-DEFAULT pl-12 pr-4 py-2 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 placeholder:text-on-surface-variant/50" 
                      id="password2" 
                      name="password2" 
                      placeholder="••••••••" 
                      type="password"
                      required
                      value={formData.password2}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Learning Goal Input */}
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="goal">Primary Learning Goal</label>
                <textarea 
                  className="w-full bg-surface-container/50 text-on-surface border border-outline-variant rounded-DEFAULT p-3 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 placeholder:text-on-surface-variant/50 resize-none" 
                  id="goal" 
                  name="goal" 
                  placeholder="e.g. Machine Learning, Web Dev" 
                  rows="2"
                  required
                  value={formData.goal}
                  onChange={handleChange}
                ></textarea>
              </div>

              {/* CTA Button */}
              <button className="mt-2 w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-label-md text-label-md py-3 rounded-DEFAULT shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:opacity-90 transition-all duration-300 relative overflow-hidden group/btn flex items-center justify-center gap-2" type="submit" disabled={loading}>
                <span className="relative z-10">{loading ? 'Processing...' : 'Generate My Path'}</span>
                <span className="material-symbols-outlined relative z-10 text-on-primary group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center pt-2 border-t border-outline-variant/30">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Already have an account? 
                <Link to="/login" className="font-label-md text-label-md text-secondary hover:text-secondary-container transition-colors ml-1">Log in</Link>
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
