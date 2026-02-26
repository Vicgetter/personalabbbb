import React, { useEffect, useState } from 'react';
import { generateInterviewFeedback } from '../services/aiService';
import Button from '../components/ui/Button';

const SummaryScreen = ({ apiKey, transcript, onRestart, onNewPersona }) => {
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState(null);
    const [error, setError] = useState(null);
    const [view, setView] = useState('feedback'); // 'feedback' or 'transcript'
    const [retryCount, setRetryCount] = useState(0);

    const fetchFeedback = async () => {
        setLoading(true);
        setError(null);
        // Don't analyze if there wasn't a real conversation
        if (transcript.length <= 2) {
            setError("Interview was too short to generate meaningful feedback.");
            setLoading(false);
            return;
        }

        try {
            const result = await generateInterviewFeedback(transcript, apiKey);
            setFeedback(result);
            setLoading(false);
        } catch (err) {
            setError(err.message || 'Failed to analyze the interview.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, [apiKey, transcript, retryCount]);

    if (loading) {
        return (
            <div className="card text-center animate-fade-in" style={{ width: '100%', maxWidth: '600px' }}>
                <h2 className="mb-4">Analyzing Interview...</h2>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
                    <div className="spinner" style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid var(--border-color)',
                        borderTop: '4px solid var(--primary)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                </div>
                <p style={{ color: 'var(--text-light)' }}>
                    Reviewing your questions, follow-ups, and the depth of the conversation...
                </p>
                <style dangerouslySetInnerHTML={{
                    __html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}} />
            </div>
        );
    }

    const renderFeedbackTab = () => {
        if (error) {
            return (
                <div className="text-center" style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
                    <Button onClick={() => setRetryCount(prev => prev + 1)}>Retry Evaluation</Button>
                </div>
            );
        }

        if (!feedback) return null;

        return (
            <div className="animate-fade-in">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

                    {/* Scores */}
                    <div style={{ backgroundColor: 'var(--bg-color)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                        <h3 className="mb-4" style={{ fontSize: '1.1rem' }}>Overall Evaluation</h3>

                        <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Open-ended Questions:</span>
                            <strong style={{ color: 'var(--primary)' }}>{feedback.feedback.openEndedScore}/10</strong>
                        </div>
                        <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Follow-up Quality:</span>
                            <strong style={{ color: 'var(--primary)' }}>{feedback.feedback.followUpScore}/10</strong>
                        </div>
                        <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Interview Depth:</span>
                            <strong style={{ color: 'var(--primary)' }}>{feedback.feedback.depthScore}/10</strong>
                        </div>
                    </div>

                    {/* Feedback Notes */}
                    <div style={{ backgroundColor: 'var(--bg-color)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                        <div className="mb-4">
                            <h4 style={{ color: '#10B981', marginBottom: '0.25rem' }}>Strengths</h4>
                            <p style={{ fontSize: '0.9rem' }}>{feedback.feedback.strengths}</p>
                        </div>
                        <div>
                            <h4 style={{ color: '#F59E0B', marginBottom: '0.25rem' }}>Areas for Improvement</h4>
                            <p style={{ fontSize: '0.9rem' }}>{feedback.feedback.areasForImprovement}</p>
                        </div>
                    </div>

                </div>

                <div className="mb-6">
                    <h3 className="mb-4" style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Key Themes Discovered</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {feedback.themes.map((theme, i) => (
                            <span key={i} style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem' }}>
                                {theme}
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="mb-4" style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Notable Quotes</h3>
                    {feedback.quotes.map((q, i) => (
                        <blockquote key={i} style={{ borderLeft: '4px solid var(--secondary)', margin: '0 0 1rem 0', padding: '0.5rem 1rem', backgroundColor: 'var(--bg-color)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
                            <p style={{ fontStyle: 'italic', marginBottom: '0.5rem' }}>"{q.text}"</p>
                            <footer style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Prompted by: {q.context}</footer>
                        </blockquote>
                    ))}
                </div>
            </div>
        );
    };

    const renderTranscriptTab = () => (
        <div className="animate-fade-in" style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-lg)', maxHeight: '60vh', overflowY: 'auto' }}>
            {transcript.map((msg, i) => (
                <div key={i} className="mb-4">
                    <strong style={{ color: msg.role === 'model' ? 'var(--secondary)' : 'var(--primary)' }}>
                        {msg.role === 'model' ? 'Interviewee' : 'You'}:
                    </strong>
                    <div style={{ marginTop: '0.25rem', paddingLeft: '1rem' }}>
                        {msg.text}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '900px' }}>
            <h2 className="mb-6 text-center">Interview Summary</h2>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                <button
                    onClick={() => setView('feedback')}
                    style={{
                        flex: 1,
                        padding: '1rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: view === 'feedback' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: view === 'feedback' ? 'var(--primary)' : 'var(--text-light)',
                        fontWeight: view === 'feedback' ? 600 : 400,
                        fontSize: '1rem'
                    }}
                >
                    AI Evaluation
                </button>
                <button
                    onClick={() => setView('transcript')}
                    style={{
                        flex: 1,
                        padding: '1rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: view === 'transcript' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: view === 'transcript' ? 'var(--primary)' : 'var(--text-light)',
                        fontWeight: view === 'transcript' ? 600 : 400,
                        fontSize: '1rem'
                    }}
                >
                    Full Transcript
                </button>
            </div>

            {view === 'feedback' ? renderFeedbackTab() : renderTranscriptTab()}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                <Button variant="secondary" onClick={onRestart}>Return to Start</Button>
                <Button onClick={onNewPersona}>Create New Persona</Button>
            </div>
        </div>
    );
};

export default SummaryScreen;
