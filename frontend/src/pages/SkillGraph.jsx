import { useState, useEffect } from 'react';
import { fetchSkillGraph } from '../api';

export default function SkillGraph() {
  const [filter, setFilter] = useState('all');
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSkillGraph()
      .then(data => {
        const mappedSkills = (data.skills || []).map(s => {
          let status = 'locked';
          if (s.mastered) status = 'mastered';
          else if (s.prerequisites_met) status = 'available';
          
          return {
            ...s,
            skill: s.name,
            status: status
          };
        });
        setSkills(mappedSkills);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load skill graph.");
        setLoading(false);
      });
  }, []);
  const filteredSkills = skills.filter(s => filter === 'all' || s.status === filter);

  if (loading) return <div className="flex justify-center items-center h-screen font-headline-md text-on-surface">Loading Graph...</div>;
  if (error) return <div className="flex justify-center items-center h-screen font-headline-md text-error">{error}</div>;

  const getStatusColor = (status) => {
    switch (status) {
      case 'mastered': 
        return { icon: 'workspace_premium', iconColor: 'text-primary', bgClass: 'bg-primary/5', borderClass: 'border-primary/30 shadow-[0_0_15px_rgba(208,188,255,0.1)]', tagClass: 'bg-primary/10 text-primary' };
      case 'available': 
        return { icon: 'add_circle', iconColor: 'text-secondary', bgClass: 'bg-surface', borderClass: 'border-secondary/40 shadow-[0_4px_20px_rgba(0,0,0,0.2)]', tagClass: 'bg-secondary/10 text-secondary' };
      case 'locked': 
        return { icon: 'lock', iconColor: 'text-outline-variant', bgClass: 'bg-surface-container-low opacity-60', borderClass: 'border-outline-variant/30', tagClass: 'bg-surface-container-high text-outline' };
      default: 
        return { icon: 'help', iconColor: 'text-outline', bgClass: 'bg-surface', borderClass: 'border-outline-variant', tagClass: 'bg-surface text-on-surface' };
    }
  };

  return (
    <div className="relative pb-16">
      {/* Background ambient light */}
      <div className="absolute top-[10%] right-[10%] w-[40vw] h-[40vw] bg-secondary/10 rounded-full blur-[150px] pointer-events-none -z-10"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface mb-2 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>hub</span>
            Skill Graph
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            A complete map of your knowledge architecture and unlockable dependencies.
          </p>
        </div>
        
        {/* Filter Controls */}
        <div className="flex flex-wrap bg-surface-container/50 p-1 rounded-full border border-outline-variant/30 backdrop-blur-md">
          {['all', 'mastered', 'available', 'locked'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full font-label-md text-label-md capitalize transition-all duration-300 ${filter === f ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {filteredSkills.map((skill, index) => {
          const { icon, iconColor, bgClass, borderClass, tagClass } = getStatusColor(skill.status);
          
          return (
            <div 
              key={skill.skill_id} 
              className={`glass-panel p-6 rounded-2xl flex flex-col gap-4 border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${bgClass} ${borderClass} group relative overflow-hidden`}
              style={{ animation: `fadeIn 0.5s ease-out forwards ${index * 0.05}s`, opacity: 0 }}
            >
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              <div className="flex justify-between items-start">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-surface border border-outline-variant/30 ${skill.status === 'available' ? 'pulse-ring' : ''}`}>
                  <span className={`material-symbols-outlined ${iconColor}`} style={{fontVariationSettings: "'FILL' 1"}}>{icon}</span>
                </div>
                <span className={`font-mono-label text-[10px] uppercase tracking-widest px-3 py-1 rounded-full ${tagClass} border border-current/20`}>
                  {skill.status}
                </span>
              </div>
              
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2 leading-tight">{skill.skill}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 leading-relaxed">
                  {skill.description || "Core engineering concept"}
                </p>
              </div>
              
              {/* Prerequisites */}
              <div className="mt-auto pt-4 border-t border-outline-variant/30">
                <span className="font-mono-label text-[11px] text-outline-variant uppercase tracking-wider block mb-3 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">account_tree</span> Requires:
                </span>
                
                {skill.prerequisites && skill.prerequisites.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skill.prerequisites.map((req, i) => (
                      <span key={i} className="font-mono-label text-[10px] px-3 py-1.5 bg-surface-container border border-outline-variant/50 rounded-md text-on-surface-variant flex items-center gap-1">
                        {req}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="font-mono-label text-[11px] text-primary/80 italic">None (Root Node)</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredSkills.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-6xl mb-4 opacity-50">search_off</span>
          <p className="font-body-lg text-body-lg">No skills found matching this filter.</p>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
