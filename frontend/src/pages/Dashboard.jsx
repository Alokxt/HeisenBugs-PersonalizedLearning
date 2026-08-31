import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProgress, fetchRoadmap } from '../api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchProgress(), fetchRoadmap()])
      .then(([progressData, roadmapData]) => {
        setData(progressData);
        setRoadmap(roadmapData.roadmap);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!data) return <div className="text-error text-center mt-10">Error loading dashboard.</div>;

  const { track, name, progress } = data;
  
  const totalScore = progress.reduce((acc, curr) => acc + curr.proficiency, 0);
  const overallProgress = progress.length ? Math.round(totalScore / progress.length) : 0;
  
  const nextStep = roadmap?.find(item => !item.completed) || roadmap?.[0];

  return (
    <div className="max-w-container-max mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface tracking-tight mb-2">
            Good morning, <span className="text-gradient">{name}</span>
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Your neural pathways are primed. Ready to expand your domain?</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/profile')} className="ghost-btn px-6 py-3 rounded-full font-label-md text-label-md flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">tune</span>
            Update Preferences
          </button>
          <button onClick={() => navigate('/quiz')} className="aurora-btn px-6 py-3 rounded-full font-label-md text-label-md font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">psychology</span>
            Take Skill Assessment
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Progress Visualization */}
        <div className="md:col-span-8 glass-panel rounded-[2rem] p-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Mastery Trajectory</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{track} Path</p>
            </div>
            <div className="glass-panel px-4 py-1.5 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-mono-label text-mono-label text-secondary">ON TRACK</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12 relative z-10">
            {/* Circular Progress */}
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" r="45" stroke="rgba(255,255,255,0.05)" strokeWidth="8"></circle>
                <circle 
                  className="drop-shadow-[0_0_8px_rgba(208,188,255,0.5)] transition-all duration-1000 ease-out" 
                  cx="50" cy="50" fill="none" r="45" stroke="url(#progress-gradient)" 
                  strokeDasharray="283" 
                  strokeDashoffset={283 - (283 * overallProgress) / 100} 
                  strokeWidth="8"
                ></circle>
                <defs>
                  <linearGradient id="progress-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#d0bcff"></stop>
                    <stop offset="100%" stopColor="#03b5d3"></stop>
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-headline-md text-headline-md text-on-surface">{overallProgress}%</span>
                <span className="font-mono-label text-mono-label text-on-surface-variant">closer</span>
              </div>
            </div>

            <div className="flex-1">
              <p className="font-body-lg text-body-lg text-on-surface mb-4">
                You are <strong className="text-primary">{overallProgress}% closer to your goal</strong> of {track} proficiency. Consistent engagement detected.
              </p>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="glass-panel rounded-xl p-4 text-center">
                  <span className="block font-mono-label text-mono-label text-outline mb-1">XP EARNED</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">{totalScore * 10}</span>
                </div>
                <div className="glass-panel rounded-xl p-4 text-center">
                  <span className="block font-mono-label text-mono-label text-outline mb-1">STREAK</span>
                  <span className="font-headline-sm text-headline-sm text-secondary">3 Days</span>
                </div>
                <div className="glass-panel rounded-xl p-4 text-center">
                  <span className="block font-mono-label text-mono-label text-outline mb-1">MODULES</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">{progress.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Up Card */}
        <div className="md:col-span-4 glass-panel rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-primary/20 blur-[50px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-tertiary">rocket_launch</span>
              <span className="font-mono-label text-mono-label text-tertiary tracking-widest uppercase">Next Up</span>
            </div>
            
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3 leading-tight">
              {nextStep?.skill || 'All done!'}
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              {nextStep?.resource || 'You have completed your path.'}
            </p>
            
            {nextStep && (
              <div className="flex items-center gap-2 mb-8">
                <span className="material-symbols-outlined text-outline text-[16px]">schedule</span>
                <span className="font-mono-label text-mono-label text-outline">Est. 45 mins</span>
              </div>
            )}
          </div>

          <button 
            onClick={() => navigate('/roadmap')}
            className="w-full py-4 rounded-xl aurora-btn font-label-md text-label-md font-bold shadow-[0_0_30px_rgba(208,188,255,0.15)] flex justify-center items-center gap-2 relative z-10"
          >
            {nextStep ? 'Start Learning' : 'View Path'}
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>

        {/* Skill Development List */}
        <div className="md:col-span-12 glass-panel rounded-[2rem] p-8 mt-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">history</span>
              Skill Development
            </h3>
            <button className="text-primary hover:text-secondary font-label-md text-label-md transition-colors">View All</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {progress.map(skill => (
              <div key={skill.skill_id} className="flex flex-col p-4 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5 cursor-pointer">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-label-md text-label-md text-on-surface truncate">{skill.name}</h4>
                  <span className="font-mono-label text-mono-label text-on-surface-variant whitespace-nowrap ml-2">{skill.proficiency}/100</span>
                </div>
                <div className="w-full bg-outline-variant/30 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-1000 ease-out" 
                    style={{ width: `${skill.proficiency}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
