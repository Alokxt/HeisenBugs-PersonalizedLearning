import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRoadmap, sendChatMessage } from '../api';

export default function Roadmap() {
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    fetchRoadmap()
      .then(data => {
        setRoadmap(data.roadmap);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleAction = async (action, skillName) => {
    setRecalculating(true);
    try {
      if (action === 'skip' || action === 'dislike') {
        const response = await sendChatMessage(`Please ${action} the skill: ${skillName}`);
        setRoadmap(response.roadmap);
      } else if (action === 'start') {
        navigate('/chat');
      }
    } catch (e) {
      console.error(e);
    }
    setRecalculating(false);
  };

  if (loading) return <div className="text-on-surface font-headline-md flex justify-center items-center h-screen">Loading...</div>;
  if (!roadmap) return <div className="text-error font-headline-md flex justify-center items-center h-screen">Error loading roadmap.</div>;

  const firstIncompleteIndex = roadmap.findIndex(item => !item.completed);

  return (
    <div className="relative pb-32">
      {recalculating && (
        <div className="absolute inset-0 bg-surface/50 backdrop-blur-sm z-50 flex justify-center items-center rounded-xl">
          <h2 className="font-headline-md text-on-surface animate-pulse">Recalculating Path...</h2>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface mb-2">My Learning Path</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">{roadmap.length} milestones ahead on your personalized journey.</p>
        </div>
        <button className="ghost-btn font-label-md text-label-md text-on-surface px-6 py-3 rounded-lg flex items-center gap-2">
          <span className="material-symbols-outlined">refresh</span>
          Regenerate Path
        </button>
      </div>

      {/* Tech Tree Container */}
      <div className="relative max-w-4xl mx-auto mt-16">
        {/* SVG Connecting Lines */}
        <svg className="absolute top-0 left-8 md:left-1/2 md:-ml-[1px] w-full h-[calc(100%-100px)] -z-10 overflow-visible pointer-events-none" preserveAspectRatio="none">
          {roadmap.map((item, index) => {
             if (index === roadmap.length - 1) return null;
             const isCompleted = item.completed;
             const isNextCompleted = roadmap[index+1].completed;
             const isInProgress = index === firstIncompleteIndex;
             
             let strokeColor = "#494454";
             let strokeDash = "4";
             let className = "";
             
             if (isCompleted && isNextCompleted) {
                strokeColor = "#d0bcff";
                strokeDash = "0";
             } else if (isCompleted && !isNextCompleted) {
                strokeColor = "#4cd7f6";
                strokeDash = "8";
                className = "dash-line";
             }

             return (
               <g key={`line-${index}`}>
                 <line className={`md:hidden ${className}`} stroke={strokeColor} strokeDasharray={strokeDash} strokeWidth="2" x1="0" x2="0" y1={(index * 200) + 50} y2={((index + 1) * 200) + 50}></line>
                 <line className={`hidden md:block ${className}`} stroke={strokeColor} strokeDasharray={strokeDash} strokeWidth="2" x1="0" x2="0" y1={(index * 200) + 50} y2={((index + 1) * 200) + 50}></line>
               </g>
             );
          })}
        </svg>

        <div className="flex flex-col gap-16 md:gap-[136px]">
          {roadmap.map((item, index) => {
            const isCompleted = item.completed;
            const isInProgress = index === firstIncompleteIndex;
            const isLocked = !isCompleted && !isInProgress;
            
            // Alternate sides for desktop
            const isEven = index % 2 === 0;
            const flexDirection = isEven ? "md:flex-row" : "md:flex-row-reverse";
            const paddingClass = isEven ? "md:pr-16" : "md:pl-16";

            return (
              <div key={item.skill_id} className={`relative flex items-start md:items-center ${flexDirection} group ${isLocked ? 'opacity-60 hover:opacity-100 transition-opacity duration-300' : ''}`}>
                
                {/* Timeline Indicator */}
                {isCompleted && (
                  <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center w-16 h-16 bg-surface z-10 rounded-full border-2 border-primary shadow-[0_0_15px_rgba(208,188,255,0.3)]">
                    <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                  </div>
                )}
                {isInProgress && (
                  <div className="absolute left-0 md:left-[50%] transform md:-translate-x-1/2 flex items-center justify-center w-16 h-16 bg-surface z-10 rounded-full border-2 border-secondary pulse-ring shadow-[0_0_20px_rgba(76,215,246,0.4)]">
                    <span className="material-symbols-outlined text-secondary">trending_up</span>
                  </div>
                )}
                {isLocked && (
                  <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-surface-container-high z-10 rounded-full border border-outline-variant">
                    <span className="material-symbols-outlined text-outline-variant">lock</span>
                  </div>
                )}

                {/* Card Layout */}
                <div className={`ml-24 md:ml-0 md:w-1/2 w-full ${paddingClass}`}>
                  <div className={`glass-panel p-6 rounded-xl relative overflow-visible z-20 ${isCompleted ? 'border border-primary/30 transition-all duration-300 hover:border-primary/60' : isInProgress ? 'border-t border-l border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' : 'border border-outline-variant'}`}>
                    
                    {/* Shine/Glow effects */}
                    {isCompleted && (
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl"></div>
                    )}
                    {isInProgress && (
                      <div className="absolute -inset-1 bg-secondary/20 rounded-xl blur-lg -z-10"></div>
                    )}

                    <div className="flex justify-between items-start mb-4">
                      {isCompleted && <span className="font-mono-label text-mono-label text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Mastered</span>}
                      {isInProgress && <span className="font-mono-label text-mono-label text-secondary uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-full">In Progress</span>}
                      {isLocked && <span className="font-mono-label text-mono-label text-outline uppercase tracking-widest">Locked</span>}
                      
                      <span className={`material-symbols-outlined ${isCompleted ? 'text-on-surface-variant' : isInProgress ? 'text-secondary' : 'text-outline-variant'}`}>
                        {isCompleted ? 'account_tree' : isInProgress ? 'route' : 'mediation'}
                      </span>
                    </div>

                    <h3 className={`font-headline-sm text-headline-sm mb-2 ${isLocked ? 'text-outline' : 'text-on-surface'}`}>{index + 1}. {item.skill}</h3>
                    <p className={`font-body-md text-body-md mb-6 ${isLocked ? 'text-outline-variant' : 'text-on-surface-variant'}`}>{item.resource}</p>

                    <div className="flex flex-wrap gap-4 items-center">
                      {isCompleted && (
                        <button className="text-secondary hover:text-secondary-fixed transition-colors font-label-md text-label-md flex items-center gap-1">
                          <span className="material-symbols-outlined text-[18px]">play_circle</span> Review
                        </button>
                      )}
                      
                      {isInProgress && (
                        <>
                          <button onClick={() => handleAction('start')} className="aurora-btn px-5 py-2 rounded-lg font-label-md text-label-md flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">task_alt</span> Start Module
                          </button>
                          {item.resource_url && (
                             <a href={item.resource_url} target="_blank" rel="noreferrer" className="text-on-surface hover:text-primary transition-colors font-label-md text-label-md flex items-center gap-1">
                               <span className="material-symbols-outlined text-[18px]">ondemand_video</span> View Resource
                             </a>
                          )}
                          <div className="flex gap-2 ml-auto mt-4 w-full justify-end md:w-auto md:mt-0">
                            <button onClick={() => handleAction('dislike', item.skill)} className="text-error hover:text-error-container transition-colors font-label-md text-label-md">Dislike</button>
                            <button onClick={() => handleAction('skip', item.skill)} className="text-outline hover:text-on-surface transition-colors font-label-md text-label-md">Skip</button>
                          </div>
                        </>
                      )}

                      {isLocked && index > 0 && (
                        <div className="text-mono-label font-mono-label text-outline-variant flex items-center gap-2 mt-[-8px]">
                            <span className="material-symbols-outlined text-[16px]">info</span>
                            Requires: {roadmap[index-1].skill}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
