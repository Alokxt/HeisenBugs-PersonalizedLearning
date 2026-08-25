import { useState } from 'react';
import { mockLearningPath, mockUser, mockTracks } from '../mocks';
import { useNavigate } from 'react-router-dom';

export default function Roadmap() {
  const navigate = useNavigate();
  const track = mockTracks.find(t => t.id === mockUser.track_id);
  const [recalculating, setRecalculating] = useState(false);

  const handleAction = (action) => {
    setRecalculating(true);
    setTimeout(() => setRecalculating(false), 1500);
  };

  return (
    <div className="flex-col" style={{ display: 'flex', gap: '2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
      {recalculating && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(253, 251, 247, 0.7)', backdropFilter: 'blur(2px)', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h2>Recalculating Path...</h2>
        </div>
      )}

      <div>
        <h1 style={{ marginBottom: '0.5rem' }}>Your {track.name} Path</h1>
        <p>12 weeks • {mockUser.hours_per_week} hrs/week • {mockLearningPath.length} milestones</p>
      </div>

      <div className="flex-col" style={{ position: 'relative', paddingLeft: '3rem', display: 'flex', gap: '3rem' }}>
        {/* The continuous vertical line */}
        <div style={{ position: 'absolute', left: '15px', top: '20px', bottom: '0', width: '2px', background: 'var(--color-border)' }}></div>

        {mockLearningPath.map((item, index) => {
          const isCompleted = item.completed_at !== null;
          const isInProgress = !isCompleted && index === 1; // mock logic for demo

          return (
            <div key={item.id} className="flex relative" style={{ alignItems: 'flex-start' }}>
              
              {/* Timeline Node */}
              <div style={{
                position: 'absolute', left: '-3rem', top: '1rem', width: '32px', height: '32px', 
                background: isCompleted ? 'var(--color-primary)' : 'var(--color-bg)', 
                border: isCompleted ? 'none' : '2px solid var(--color-border)', 
                borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', zIndex: 2
              }}>
                {isCompleted && <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>✓</span>}
                {isInProgress && <span style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>▶</span>}
              </div>

              {/* Card */}
              <div className="card w-100" style={{ flexGrow: 1, border: isInProgress ? '1px solid var(--color-primary)' : '1px solid var(--color-border)', boxShadow: isInProgress ? '0 4px 12px rgba(59, 40, 204, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.02)' }}>
                <div className="flex justify-between" style={{ alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontFamily: 'var(--font-sans)', fontSize: '1.1rem' }}>{item.order_index}. {item.skill_name}</h3>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: 'var(--color-dark)' }}>{item.resource.title}</p>
                    <div className="flex" style={{ gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', color: 'var(--color-text-light)' }}>{item.resource.platform}</span>
                      <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', color: 'var(--color-text-light)' }}>{item.resource.learning_style}</span>
                    </div>
                  </div>
                  
                  <div className="flex-col" style={{ alignItems: 'flex-end', display: 'flex', gap: '1rem' }}>
                    {isCompleted && <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-text-light)' }}>Completed</span>}
                    {isInProgress && <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#FFFFFF', background: 'var(--color-primary)', padding: '0.3rem 0.8rem', borderRadius: '4px' }}>In Progress</span>}
                    {!isCompleted && !isInProgress && <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-text-light)' }}>Upcoming</span>}
                    
                    {isInProgress && (
                      <div className="flex mt-4" style={{ gap: '0.5rem' }}>
                        <button className="btn-outline btn" style={{ padding: '0.4rem 0.8rem', borderColor: '#EF4444', color: '#EF4444' }} onClick={() => handleAction('dislike')}>Dislike</button>
                        <button className="btn-outline btn" style={{ padding: '0.4rem 0.8rem' }} onClick={() => handleAction('skip')}>Skip</button>
                        <button className="btn" style={{ padding: '0.4rem 0.8rem' }} onClick={() => handleAction('start')}>Start</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
