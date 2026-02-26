import React, { useState } from 'react';
import Input from '../components/ui/Input';
import Slider from '../components/ui/Slider';
import Select from '../components/ui/Select';
import TagSelector from '../components/ui/TagSelector';
import Button from '../components/ui/Button';

const TRAIT_OPTIONS = [
    { value: 'shy', label: 'Shy' },
    { value: 'outgoing', label: 'Outgoing' },
    { value: 'skeptical', label: 'Skeptical' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'nervous', label: 'Nervous' },
    { value: 'confident', label: 'Confident' },
    { value: 'sarcastic', label: 'Sarcastic' },
    { value: 'curious', label: 'Curious' },
];

const GENDER_OPTIONS = [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

const PersonaCreationScreen = ({ onGenerate, onBack }) => {
    const [formData, setFormData] = useState({
        age: 30,
        gender: '',
        occupation: '',
        traits: [],
        background: '',
        topic: '',
        timer: 5,
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerate = (e) => {
        e.preventDefault();
        if (formData.traits.length === 0) {
            alert("Please select at least one personality trait.");
            return;
        }
        onGenerate(formData);
    };

    return (
        <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>Create Interviewee</h2>
                <Button variant="secondary" onClick={onBack} style={{ padding: '0.5rem 1rem' }}>Back</Button>
            </div>

            <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
                Define the characteristics of your AI persona. The more details you provide, the more realistic the interview will be.
            </p>

            <form onSubmit={handleGenerate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <Slider
                            label="Age"
                            min={18}
                            max={80}
                            value={formData.age}
                            onChange={(e) => handleChange('age', parseInt(e.target.value))}
                        />
                    </div>
                    <div>
                        <Select
                            label="Gender"
                            value={formData.gender}
                            onChange={(e) => handleChange('gender', e.target.value)}
                            options={GENDER_OPTIONS}
                            required
                        />
                    </div>
                </div>

                <Input
                    label="Occupation"
                    placeholder="e.g. Software Engineer, Teacher, Retired"
                    value={formData.occupation}
                    onChange={(e) => handleChange('occupation', e.target.value)}
                    required
                />

                <TagSelector
                    label="Personality Traits"
                    options={TRAIT_OPTIONS}
                    selected={formData.traits}
                    onChange={(newTraits) => handleChange('traits', newTraits)}
                />

                <div className="mb-4">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                        Background Description (Optional)
                    </label>
                    <textarea
                        value={formData.background}
                        onChange={(e) => handleChange('background', e.target.value)}
                        placeholder="Any specific backstory or details? e.g. Has a pet dog, recently moved to a new city..."
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                            outline: 'none',
                            fontSize: '1rem',
                            minHeight: '100px',
                            fontFamily: 'inherit',
                            resize: 'vertical',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                    />
                </div>

                <Input
                    label="Topic of Interview (Optional)"
                    placeholder="e.g. Their experience using smart home devices"
                    value={formData.topic}
                    onChange={(e) => handleChange('topic', e.target.value)}
                />

                <Slider
                    label="Interview Timer (Minutes)"
                    min={1}
                    max={15}
                    value={formData.timer}
                    onChange={(e) => handleChange('timer', parseInt(e.target.value))}
                />

                <div className="mt-6">
                    <Button type="submit" fullWidth disabled={!formData.occupation || !formData.gender || formData.traits.length === 0}>
                        Generate Persona
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default PersonaCreationScreen;
