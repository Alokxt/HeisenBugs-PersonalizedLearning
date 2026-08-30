import { mockUser, mockTracks } from '../mocks';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const track = mockTracks.find(t => t.id === mockUser.track_id);

  // Calculate overall progress based on skills
  const totalScore = mockUser.skills_progress.reduce((acc, curr) => acc + curr.score, 0);
  const overallProgress = Math.round(totalScore / mockUser.skills_progress.length);

  return (
    <div className="flex-col" style={{ display: 'flex', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div>
        <h1 style={{ marginBottom: '0.5rem' }}>Good morning, {mockUser.name}.</h1>
        <p>You're {overallProgress}% closer to your {track.name} goal.</p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <section className="card flex flex-col justify-between" style={{ minHeight: '250px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Next Step</span>
            <h2 style={{ marginTop: '0.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-sans)' }}>Intro to Scikit-Learn</h2>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>Recommended because you've completed Statistics. This module connects foundational probabilities to machine learning models.</p>
          </div>
          <div className="flex mt-4" style={{ gap: '1rem' }}>
            <button className="btn" onClick={() => navigate('/roadmap')}>Start Module →</button>
            <button className="btn-outline btn" style={{ border: 'none', color: 'var(--color-text-light)', padding: 0 }} onClick={() => navigate('/chat')}>Why this?</button>
          </div>
        </section>

        <section className="card flex flex-col" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '250px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>Current Progress</span>
          <div className="progress-ring" style={{ background: `conic-gradient(var(--color-primary) ${overallProgress}%, var(--color-border) 0)` }}>
            <span>{overallProgress}%</span>
          </div>
          <p style={{ marginTop: '1.5rem', marginBottom: 0, fontSize: '0.9rem' }}>{track.name} Track</p>
        </section>
      </div>

      <section>
        <div className="flex justify-between mb-4">
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skill Development</span>
        </div>
        <div className="card grid" style={{ gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {mockUser.skills_progress.map(skill => (
            <div key={skill.skill_name} className="flex-col">
              <div className="flex justify-between" style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--color-dark)' }}>{skill.skill_name}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{skill.score}/100</span>
              </div>
              <div style={{ background: 'var(--color-border)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ background: 'var(--color-primary)', height: '100%', width: `${skill.score}%`, transition: 'width 1s ease-in-out' }}></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
