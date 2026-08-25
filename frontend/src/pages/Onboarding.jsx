import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockTracks } from '../mocks';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  return (
    <div className="card flex flex-col" style={{ maxWidth: '600px', margin: '10vh auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Welcome to HeisenBugs!</h1>
      <p>Let's personalize your learning journey.</p>

      {step === 1 && (
        <div className="grid mt-4">
          <label className="flex-col" style={{ display: 'flex' }}>
            <strong>What is your learning goal?</strong>
            <input type="text" placeholder="e.g. Become an ML Engineer" className="btn-outline" style={{ padding: '0.8rem', borderRadius: '8px', marginTop: '0.5rem', border: '1px solid var(--color-dark)' }} />
          </label>
          <label className="flex-col" style={{ display: 'flex' }}>
            <strong>Choose a Track</strong>
            <select className="btn-outline" style={{ padding: '0.8rem', borderRadius: '8px', marginTop: '0.5rem', border: '1px solid var(--color-dark)' }}>
              {mockTracks.map(track => (
                <option key={track.id} value={track.id}>{track.name}</option>
              ))}
            </select>
          </label>
          <button className="btn mt-4" onClick={() => setStep(2)}>Next</button>
        </div>
      )}

      {step === 2 && (
        <div className="grid mt-4">
          <label className="flex-col" style={{ display: 'flex' }}>
            <strong>Preferred Learning Style</strong>
            <select className="btn-outline" style={{ padding: '0.8rem', borderRadius: '8px', marginTop: '0.5rem', border: '1px solid var(--color-dark)' }}>
              <option>Video Tutorials</option>
              <option>Reading / Documentation</option>
              <option>Interactive Coding</option>
            </select>
          </label>
          <label className="flex-col" style={{ display: 'flex' }}>
            <strong>Hours available per week</strong>
            <input type="number" defaultValue={10} className="btn-outline" style={{ padding: '0.8rem', borderRadius: '8px', marginTop: '0.5rem', border: '1px solid var(--color-dark)' }} />
          </label>
          <div className="flex justify-between mt-4">
            <button className="btn-outline btn" onClick={() => setStep(1)}>Back</button>
            <button className="btn" onClick={() => navigate('/dashboard')}>Generate My Path</button>
          </div>
        </div>
      )}
    </div>
  );
}
