import React, { useState, useEffect, useRef } from 'react';
import { generateChatResponse } from '../services/aiService';
import Button from '../components/ui/Button';

const InterviewScreen = ({ apiKey, persona, config, onEndInterview }) => {
    const [messages, setMessages] = useState([
        { role: 'model', text: `Hi there. I'm ${persona.name}. Thanks for having me today.` }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [timeLeft, setTimeLeft] = useState(config.timer * 60);

    const chatEndRef = useRef(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Timer logic
    useEffect(() => {
        if (timeLeft <= 0) {
            handleEndInterview();
            return;
        }
        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = input.trim();
        setInput('');

        // Add user message to UI immediately
        const newHistory = [...messages, { role: 'user', text: userMsg }];
        setMessages(newHistory);
        setIsTyping(true);

        try {
            // Exclude the very last user message from history for the API call, pass it as userInput instead
            const apiHistory = newHistory.slice(0, -1);
            const responseText = await generateChatResponse(apiHistory, userMsg, persona, config, apiKey);

            setMessages(prev => [...prev, { role: 'model', text: responseText }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'model', text: `[System Error: ${err.message}]` }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleEndInterview = () => {
        // Pass full transcript to the summary screen
        onEndInterview(messages);
    };

    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const progressPercentage = ((config.timer * 60 - timeLeft) / (config.timer * 60)) * 100;

    return (
        <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', height: '85vh', padding: '1rem' }}>

            {/* Header Panel */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={persona.avatarUrl} alt="Avatar" style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--bg-color)' }} />
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{persona.name}</h3>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-light)' }}>Interview in progress</p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: timeLeft <= 60 ? '#ef4444' : 'var(--text-dark)' }}>
                            {formatTime(timeLeft)}
                        </div>
                        <div style={{ width: '100px', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${progressPercentage}%`, height: '100%', backgroundColor: timeLeft <= 60 ? '#ef4444' : 'var(--primary)', transition: 'width 1s linear' }} />
                        </div>
                    </div>
                    <Button variant="danger" onClick={handleEndInterview} style={{ padding: '0.5rem 1rem' }}>
                        End Interview
                    </Button>
                </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        {msg.role === 'model' && (
                            <img src={persona.avatarUrl} alt="Model" style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '8px', marginTop: 'auto' }} />
                        )}
                        <div style={{
                            maxWidth: '70%',
                            padding: '1rem',
                            borderRadius: 'var(--radius-lg)',
                            backgroundColor: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-color)',
                            color: msg.role === 'user' ? 'white' : 'var(--text-dark)',
                            borderBottomLeftRadius: msg.role === 'model' ? 0 : 'var(--radius-lg)',
                            borderBottomRightRadius: msg.role === 'user' ? 0 : 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <img src={persona.avatarUrl} alt="Model" style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '8px', marginTop: 'auto' }} />
                        <div style={{
                            padding: '1rem',
                            borderRadius: 'var(--radius-lg)',
                            backgroundColor: 'var(--bg-color)',
                            borderBottomLeftRadius: 0,
                            display: 'flex',
                            gap: '4px',
                            alignItems: 'center'
                        }}>
                            <span className="dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-light)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }}></span>
                            <span className="dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-light)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }}></span>
                            <span className="dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-light)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }}></span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
                <style dangerouslySetInnerHTML={{
                    __html: `
          @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
        `}} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isTyping ? "Waiting for response..." : "Type your interview question..."}
                    disabled={isTyping}
                    style={{
                        flex: 1,
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        outline: 'none',
                        fontSize: '1rem',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
                <Button type="submit" disabled={!input.trim() || isTyping} style={{ padding: '0 2rem' }}>
                    Send
                </Button>
            </form>
        </div>
    );
};

export default InterviewScreen;
