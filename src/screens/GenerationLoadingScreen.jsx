import React, { useEffect, useState } from 'react';
import { generatePersona } from '../services/aiService';
import Button from '../components/ui/Button';

const GenerationLoadingScreen = ({ apiKey, config, onComplete, onCancel }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [persona, setPersona] = useState(null);

    useEffect(() => {
        let mounted = true;

        const startGeneration = async () => {
            try {
                const result = await generatePersona(config, apiKey);
                if (mounted) {
                    setPersona(result);
                    setLoading(false);
                }
            } catch (err) {
                if (mounted) {
                    setError(err.message || 'An error occurred during generation.');
                    setLoading(false);
                }
            }
        };

        startGeneration();

        return () => {
            mounted = false;
        };
    }, [apiKey, config]);

    if (loading) {
        return (
            <div className="card text-center animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
                <h2 className="mb-4">Generating Persona...</h2>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
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
                    Breathing life into your AI interviewee...
                </p>
                <style dangerouslySetInnerHTML={{
                    __html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="card text-center animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
                <h2 className="mb-4" style={{ color: '#ef4444' }}>Generation Failed</h2>
                <p className="mb-6">{error}</p>
                <Button onClick={onCancel} variant="secondary">Go Back</Button>
            </div>
        );
    }

    return (
        <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '700px' }}>
            <h2 className="mb-6 text-center">Meet Your Interviewee</h2>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem', flexDirection: 'column' }}>

                {/* Responsive layout: avatar top on mobile, side on desktop */}
                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '2rem', width: '100%' }}>
                    <div style={{ flex: '0 0 150px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                            width: '150px',
                            height: '150px',
                            borderRadius: 'var(--radius-xl)',
                            overflow: 'hidden',
                            backgroundColor: 'var(--bg-color)',
                            border: '1px solid var(--border-color)',
                            padding: '1rem'
                        }}>
                            <img src={persona.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <h3 className="mt-4" style={{ textAlign: 'center' }}>{persona.name}</h3>
                    </div>

                    <div style={{ flex: '1', minWidth: '250px' }}>
                        <div className="mb-4">
                            <h4 style={{ color: 'var(--text-light)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Backstory</h4>
                            <p>{persona.backstory}</p>
                        </div>

                        <div className="mb-4">
                            <h4 style={{ color: 'var(--text-light)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personality Profile</h4>
                            <p>{persona.personalityDescription}</p>
                        </div>

                        <div>
                            <h4 style={{ color: 'var(--text-light)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expected Behavior</h4>
                            <p><i>"{persona.interviewBehavior}"</i></p>
                        </div>
                    </div>
                </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <Button variant="secondary" onClick={onCancel}>Start Over</Button>
                <Button onClick={() => onComplete(persona)}>Begin Interview</Button>
            </div>
        </div>
    );
};

export default GenerationLoadingScreen;
