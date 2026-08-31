import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProfile, updateProfile } from '../api';

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [profile, setProfile] = useState({
    username: 'carlos_ai',
    email: 'carlos@example.com',
    goal: 'I want to become a full-stack developer focusing on React and Node.js',
    hours_per_week: 10,
    preferred_style: 'Interactive'
  });

  useEffect(() => {
    fetchProfile()
      .then(data => {
        if (!data.error) {
          setProfile(prev => ({
            ...prev,
            username: data.username,
            email: data.email,
            goal: data.goal || prev.goal,
            hours_per_week: data.hours_per_week || prev.hours_per_week,
            preferred_style: data.preferred_style || prev.preferred_style
          }));
        }
      })
      .catch(err => console.error("Failed to load profile", err));
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await updateProfile(profile);
      if (res.success) {
        setSaved(true);
        window.scrollTo({top: 0, behavior: 'smooth'});
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 p-margin-mobile md:p-margin-desktop max-w-container-max mx-auto w-full">
      <div className="mb-12">
        <h2 className="font-display-lg text-display-lg text-on-surface tracking-tight mb-2">My Profile &amp; Settings</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Manage your identity and configure your elite learning experience.</p>
      </div>
      
      {/* Success Banner */}
      {saved && (
        <div className="mb-8 glass-panel border-primary/50 bg-primary/10 rounded-xl p-4 flex items-center justify-between" id="success-banner">
          <div className="flex items-center gap-3 text-primary">
            <span className="material-symbols-outlined">check_circle</span>
            <span className="font-label-md text-label-md">Settings saved successfully.</span>
          </div>
          <button className="text-on-surface-variant hover:text-primary transition-colors" onClick={() => setSaved(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* Form Layout using Bento Grid concept */}
      <form className="grid grid-cols-1 lg:grid-cols-12 gap-8" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        
        {/* Left Column: Profile Info */}
        <div className="lg:col-span-5 space-y-8">
          <div className="glass-panel glass-panel-glow rounded-2xl p-8 relative overflow-hidden group">
            {/* Subtle background glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>
            
            <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6 relative z-10">
              <div className="w-20 h-20 rounded-full bg-surface-container-high border-2 border-primary/30 overflow-hidden relative">
                <img alt="User Avatar Large" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVdrqtIBRhca66TEUtTu7PYxOFhbIFxHbTaxiKiZwR2n9mZoA9WtmbEYD8FX5E96QZIdflP8nZNpPKyadnhGvjsmYuoUX-heUaUINuOVwP8srIoN5wLn46xajzwwKLSZzH1j1jL8CDovLarDr3472_8TTHMA9UV8ZVEG-I-Sn0drT4dY5z9mu7maONo4vo1mQqzO0qtKl4NXiH-DGUN3InFLPVj5JnPQHnftP8Fcqw4JyWy-p_si-RJQ"/>
                <button className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity" type="button">
                  <span className="material-symbols-outlined text-white">edit</span>
                </button>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Profile Info</h3>
                <p className="font-mono-label text-mono-label text-on-surface-variant mt-1">Identity &amp; Credentials</p>
              </div>
            </div>
            
            <div className="space-y-6 relative z-10">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Username</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
                  <input 
                    className="w-full bg-surface-container-highest border border-transparent rounded-xl py-3 pl-12 pr-4 text-on-surface-variant cursor-not-allowed opacity-70" 
                    type="text" 
                    name="username"
                    value={profile.username} 
                    readOnly 
                  />
                </div>
                <p className="font-mono-label text-mono-label text-outline mt-2">Username cannot be changed.</p>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">mail</span>
                  <input 
                    className="w-full input-glass rounded-xl py-3 pl-12 pr-4 text-on-surface" 
                    type="email" 
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column: Learning Configuration */}
        <div className="lg:col-span-7 space-y-8">
          <div className="glass-panel glass-panel-glow rounded-2xl p-8 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6 relative z-10">
              <span className="material-symbols-outlined text-secondary text-3xl">psychology</span>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Learning Configuration</h3>
                <p className="font-mono-label text-mono-label text-on-surface-variant mt-1">AI Adaptation Parameters</p>
              </div>
            </div>
            
            <div className="space-y-6 relative z-10">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Learning Goal</label>
                <textarea 
                  className="w-full input-glass rounded-xl p-4 text-on-surface resize-none" 
                  rows="4"
                  name="goal"
                  value={profile.goal}
                  onChange={handleChange}
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Hours available per week</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">schedule</span>
                    <input 
                      className="w-full input-glass rounded-xl py-3 pl-12 pr-4 text-on-surface" 
                      type="number" 
                      min="1" 
                      max="168"
                      name="hours_per_week"
                      value={profile.hours_per_week}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Preferred Learning Style</label>
                  <div className="relative">
                    <select 
                      className="w-full input-glass rounded-xl py-3 pl-4 pr-10 text-on-surface appearance-none"
                      name="preferred_style"
                      value={profile.preferred_style}
                      onChange={handleChange}
                    >
                      <option className="bg-surface-container-high text-on-surface" value="Interactive">Interactive (Coding, Quizzes)</option>
                      <option className="bg-surface-container-high text-on-surface" value="Video">Video Tutorials</option>
                      <option className="bg-surface-container-high text-on-surface" value="Text">Text & Documentation</option>
                      <option className="bg-surface-container-high text-on-surface" value="Mixed">Mixed Media</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Form Actions inside the card for neatness */}
            <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-end gap-4 relative z-10">
              <button 
                type="button"
                className="ghost-btn font-label-md text-label-md rounded-full py-3 px-6"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSave}
                className="aurora-btn font-label-md text-label-md rounded-full py-3 px-8 font-semibold"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
