import { useState } from 'react';
import { mockChatHistory } from '../mocks';
import { useNavigate } from 'react-router-dom';

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(mockChatHistory);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { sender: 'user', text: input };
    setMessages([...messages, newMsg]);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'assistant', text: "That's a great question! Based on your goal, I'm recommending this to help you bridge your specific knowledge gap." }]);
    }, 1000);
  };

  return (
    <div className="card flex flex-col" style={{ height: '70vh', maxWidth: '800px', margin: '0 auto' }}>
      <div className="flex justify-between mb-4" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Learning Assistant</h2>
        <button className="btn-outline btn" onClick={() => navigate('/roadmap')}>Back to Path</button>
      </div>

      <div className="flex flex-col" style={{ flexGrow: 1, overflowY: 'auto', gap: '1rem', padding: '1rem', background: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
        {messages.map((msg, idx) => (
          <div key={idx} className="flex" style={{ justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              background: msg.sender === 'user' ? 'var(--color-primary)' : 'var(--color-surface)',
              color: msg.sender === 'user' ? '#FFFFFF' : 'var(--color-dark)',
              padding: '1rem', borderRadius: '8px', maxWidth: '75%',
              border: msg.sender === 'assistant' ? '1px solid var(--color-border)' : 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
              <strong style={{ fontSize: '0.85rem', color: msg.sender === 'user' ? 'rgba(255,255,255,0.8)' : 'var(--color-primary)' }}>{msg.sender === 'user' ? 'You' : 'HeisenBugs AI'}</strong>
              <p style={{ margin: '0.25rem 0 0 0', color: 'inherit' }}>{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex mt-4" style={{ gap: '1rem' }}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask why a resource was recommended..." 
          style={{ flexGrow: 1, padding: '0.8rem 1rem', borderRadius: '6px', border: '1px solid var(--color-border)', outline: 'none' }} 
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="btn" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
