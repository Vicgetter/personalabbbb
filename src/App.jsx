import { useState } from 'react'
import PersonaCreationScreen from './screens/PersonaCreationScreen'
import GenerationLoadingScreen from './screens/GenerationLoadingScreen'
import InterviewScreen from './screens/InterviewScreen'
import SummaryScreen from './screens/SummaryScreen'
import './App.css'

function App() {
  const [currentScreen, setCurrentScreen] = useState('start')
  const [apiKey, setApiKey] = useState('')
  const [personaConfig, setPersonaConfig] = useState(null)
  const [generatedPersona, setGeneratedPersona] = useState(null)
  const [transcript, setTranscript] = useState([])

  return (
    <div className="app-container">
      <header style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 700 }}>PersonaLab</h1>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>
            AI Interview Simulator
          </div>
        </div>
      </header>

      <main className="main-content">
        {currentScreen === 'start' && (
          <div className="card animate-fade-in" style={{ maxWidth: '500px', width: '100%' }}>
            <h2 className="mb-4 text-center">Welcome to PersonaLab</h2>
            <p className="mb-6 text-center" style={{ color: 'var(--text-light)' }}>
              Practice qualitative interviewing skills with AI-generated personas.
            </p>

            <div className="mb-4">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Gemini API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  outline: 'none',
                  fontSize: '1rem'
                }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
                Your key is stored locally in your browser session.
              </p>
            </div>

            <button
              onClick={() => setCurrentScreen('creation')}
              disabled={!apiKey.trim()}
              style={{
                width: '100%',
                padding: '0.875rem',
                backgroundColor: apiKey.trim() ? 'var(--primary)' : 'var(--border-color)',
                color: apiKey.trim() ? 'white' : 'var(--text-light)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: apiKey.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              Start Game
            </button>
          </div>
        )}

        {currentScreen === 'creation' && (
          <PersonaCreationScreen
            onBack={() => setCurrentScreen('start')}
            onGenerate={(config) => {
              setPersonaConfig(config);
              setCurrentScreen('loading');
            }}
          />
        )}

        {currentScreen === 'loading' && (
          <GenerationLoadingScreen
            apiKey={apiKey}
            config={personaConfig}
            onCancel={() => setCurrentScreen('creation')}
            onComplete={(persona) => {
              setGeneratedPersona(persona);
              setCurrentScreen('interview');
            }}
          />
        )}

        {currentScreen === 'interview' && (
          <InterviewScreen
            apiKey={apiKey}
            persona={generatedPersona}
            config={personaConfig}
            onEndInterview={(finalMessages) => {
              setTranscript(finalMessages);
              setCurrentScreen('summary');
            }}
          />
        )}

        {currentScreen === 'summary' && (
          <SummaryScreen
            apiKey={apiKey}
            transcript={transcript}
            onRestart={() => {
              setPersonaConfig(null);
              setGeneratedPersona(null);
              setTranscript([]);
              setCurrentScreen('start');
            }}
            onNewPersona={() => setCurrentScreen('creation')}
          />
        )}
      </main>
    </div>
  )
}

export default App
