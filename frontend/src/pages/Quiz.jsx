import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateQuiz, completeSkill } from '../api';

export default function Quiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const skillName = queryParams.get('skill') || "General Concepts";
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    generateQuiz(skillName)
      .then(res => {
        if (res.success && res.content) {
          const qs = res.content.questions || (Array.isArray(res.content) ? res.content : null);
          if (qs) {
            setQuestions(qs);
          } else {
            setError("Failed to generate quiz.");
          }
        } else {
          setError("Failed to generate quiz.");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Error generating quiz.");
        setLoading(false);
      });
  }, [skillName]);

  const handleSelect = (idx) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: idx });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      let score = 0;
      questions.forEach((q, i) => {
        const selectedOptionText = q.options[selectedAnswers[i]];
        if (selectedOptionText === q.answer) score++;
      });
      const percentage = Math.round((score / questions.length) * 100);
      completeSkill(skillName, percentage).catch(err => console.error("Failed to save score:", err));
      
      setShowResults(true);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen font-headline-md text-on-surface">Generating Custom Quiz for {skillName}...</div>;
  if (error) return <div className="flex justify-center items-center h-screen font-headline-md text-error">{error}</div>;
  if (questions.length === 0) return <div className="flex justify-center items-center h-screen font-headline-md text-on-surface">No questions found.</div>;

  if (showResults) {
    let score = 0;
    questions.forEach((q, i) => {
      // Backend returns string answer. Let's compare options.
      const selectedOptionText = q.options[selectedAnswers[i]];
      if (selectedOptionText === q.answer) score++;
    });
    
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] relative">
        <div className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        
        <div className="glass-panel p-10 md:p-16 rounded-3xl max-w-xl w-full text-center border border-outline-variant/30 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          
          <h2 className="font-display-lg text-display-lg text-on-surface mb-8 tracking-tight">Assessment Complete</h2>
          
          <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
            {/* Custom SVG Progress Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-surface-container-high)" strokeWidth="8" className="text-surface-container-high" />
              <circle 
                cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" 
                className="text-primary transition-all duration-1000 ease-out"
                strokeDasharray={`${(percentage * 283) / 100} 283`}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-display-lg text-4xl text-on-surface">{score}/{questions.length}</span>
              <span className="font-mono-label text-primary">{percentage}%</span>
            </div>
          </div>
          
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-md mx-auto">
            {percentage >= 80 
              ? "Excellent work! Your neural pathways are fully optimized for this domain." 
              : "Good effort. The system will adapt your future path to reinforce these concepts."}
          </p>
          
          <button onClick={() => navigate('/roadmap')} className="aurora-btn w-full py-4 rounded-xl font-label-lg text-label-lg flex justify-center items-center gap-2">
            <span className="material-symbols-outlined">map</span> Return to Path
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progressPercent = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto py-8 relative">
      <div className="absolute top-[20%] right-[10%] w-[30vw] h-[30vw] bg-secondary/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      
      {/* Header / Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>quiz</span>
            Assessment: {skillName}
          </h2>
          <span className="font-mono-label text-mono-label text-outline uppercase tracking-widest">
            {currentQuestion + 1} / {questions.length}
          </span>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden border border-outline-variant/20">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-panel p-8 md:p-10 rounded-2xl border border-outline-variant/30 shadow-xl mb-6">
        <h3 className="font-display-sm text-display-sm text-on-surface mb-8 leading-snug">
          {question.question}
        </h3>
        
        <div className="flex flex-col gap-4">
          {question.options.map((opt, idx) => {
            const isSelected = selectedAnswers[currentQuestion] === idx;
            return (
              <div 
                key={idx} 
                onClick={() => handleSelect(idx)}
                className={`relative overflow-hidden flex items-center gap-4 p-5 rounded-xl cursor-pointer transition-all duration-300 border ${isSelected ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(208,188,255,0.15)]' : 'bg-surface-container/50 border-outline-variant/30 hover:bg-surface hover:border-outline-variant'}`}
              >
                {/* Custom Radio Button */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'border-primary' : 'border-outline-variant'}`}>
                  {isSelected && <div className="w-3 h-3 rounded-full bg-primary pulse-ring"></div>}
                </div>
                <span className={`font-body-lg text-body-lg transition-colors ${isSelected ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}>
                  {opt}
                </span>
                
                {/* Active highlight sheen */}
                {isSelected && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex justify-between items-center pt-4">
        <button 
          className="ghost-btn px-6 py-3 rounded-lg font-label-md text-label-md flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed" 
          onClick={handlePrev} 
          disabled={currentQuestion === 0}
        >
          <span className="material-symbols-outlined">arrow_back</span> Previous
        </button>
        <button 
          className="aurora-btn px-8 py-3 rounded-lg font-label-md text-label-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
          onClick={handleNext} 
          disabled={selectedAnswers[currentQuestion] === undefined}
        >
          {currentQuestion === questions.length - 1 ? 'Analyze Results' : 'Next'} <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}
