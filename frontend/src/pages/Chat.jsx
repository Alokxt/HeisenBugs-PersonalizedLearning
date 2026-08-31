import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendChatMessage } from '../api';

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([{ sender: 'assistant', text: 'Hello! I am your learning assistant. How can I help you with your path today?' }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    const newMsg = { sender: 'user', text: userMsg };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    setLoading(true);
    
    try {
      const response = await sendChatMessage(userMsg);
      setMessages(prev => [...prev, { sender: 'assistant', text: response.reply || "Done!" }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { sender: 'assistant', text: "Sorry, I ran into an error connecting to the neural network." }]);
    }
    setLoading(false);
  };

  const handleQuickAction = (text) => {
    setInput(text);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto relative pb-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 z-10">
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface mb-1 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span>
            Assistant
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Your personalized learning companion</p>
        </div>
        <button 
          onClick={() => navigate('/roadmap')}
          className="ghost-btn px-4 py-2 rounded-lg font-label-md text-label-md flex items-center gap-2"
        >
          <span className="material-symbols-outlined">map</span>
          Back to Path
        </button>
      </div>

      {/* Chat Container */}
      <div className="glass-panel rounded-2xl flex-grow flex flex-col overflow-hidden border border-outline-variant/30 shadow-2xl relative z-10">
        
        {/* Messages Area */}
        <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-4 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-2 ${msg.sender === 'user' ? 'border-primary bg-primary/20' : 'border-secondary bg-secondary/20 shadow-[0_0_15px_rgba(76,215,246,0.2)]'}`}>
                  {msg.sender === 'user' ? (
                    <span className="material-symbols-outlined text-primary text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>person</span>
                  ) : (
                    <span className="material-symbols-outlined text-secondary text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span>
                  )}
                </div>
                
                {/* Bubble */}
                <div className={`p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-primary text-on-primary rounded-tr-sm' : 'bg-surface-container text-on-surface rounded-tl-sm border border-outline-variant/30'}`}>
                  <p className="font-body-md text-body-md leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
             <div className="flex w-full justify-start">
               <div className="flex gap-4 max-w-[80%] flex-row">
                 <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-secondary bg-secondary/20 pulse-ring">
                   <span className="material-symbols-outlined text-secondary text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span>
                 </div>
                 <div className="p-4 rounded-2xl bg-surface-container text-on-surface rounded-tl-sm border border-outline-variant/30 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-secondary animate-bounce"></div>
                   <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{animationDelay: '0.2s'}}></div>
                   <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{animationDelay: '0.4s'}}></div>
                 </div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-surface-container-low/80 backdrop-blur-md border-t border-outline-variant/30">
          {/* Quick Actions */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2 custom-scrollbar hide-scrollbar">
            <button onClick={() => handleQuickAction("Explain this concept like I'm 5:")} className="flex-shrink-0 px-3 py-1.5 rounded-full bg-surface border border-outline-variant text-on-surface-variant font-mono-label text-[11px] hover:text-primary hover:border-primary transition-colors">Explain like I'm 5</button>
            <button onClick={() => handleQuickAction("I'm stuck on my current module:")} className="flex-shrink-0 px-3 py-1.5 rounded-full bg-surface border border-outline-variant text-on-surface-variant font-mono-label text-[11px] hover:text-primary hover:border-primary transition-colors">I'm stuck</button>
            <button onClick={() => handleQuickAction("Can you quiz me on this topic?")} className="flex-shrink-0 px-3 py-1.5 rounded-full bg-surface border border-outline-variant text-on-surface-variant font-mono-label text-[11px] hover:text-primary hover:border-primary transition-colors">Quiz me</button>
          </div>
          
          <div className="relative group">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
              placeholder="Ask anything..." 
              className="w-full bg-surface text-on-surface border border-outline-variant/50 rounded-xl pl-4 pr-14 py-4 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 shadow-inner"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center bg-primary text-on-primary hover:bg-primary-container hover:text-primary disabled:opacity-50 disabled:hover:bg-primary disabled:hover:text-on-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>send</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Background ambient light */}
      <div className="absolute top-[20%] left-[10%] w-[30vw] h-[30vw] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
    </div>
  );
}
