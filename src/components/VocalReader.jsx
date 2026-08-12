import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Award, RotateCcw, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { vocalRecognitionService } from '../services/vocalRecognitionService';
import { soundEffectsService } from '../services/soundEffectsService';
import { storageService } from '../services/storageService';
import { ttsService } from '../services/ttsService';
import confetti from 'canvas-confetti';

const VOCAL_PRACTICE_TEXTS = [
  {
    id: 'vp1',
    title: 'Le petit lapin blanc',
    level: 'CP / CE1',
    text: 'Le petit lapin blanc saute dans le grand jardin. Il mange une bonne carotte orange sous le beau soleil.'
  },
  {
    id: 'vp2',
    title: 'Le voyage du renard',
    level: 'CE1 / CE2',
    text: 'Un renard roux marche doucement près de la rivière. Les petits oiseaux chantent haut dans les grands arbres verts.'
  },
  {
    id: 'vp3',
    title: 'Lina et l\'étoile magique',
    level: 'CE2 / CM1',
    text: 'Lina regarde le ciel bleu la nuit. Une brillante étoile brille dans le ciel et lui apporte un grand sourire.'
  }
];

export function VocalReader({ settings, onStarsUpdate }) {
  const [selectedText, setSelectedText] = useState(VOCAL_PRACTICE_TEXTS[0]);
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [recognizedWords, setRecognizedWords] = useState(new Set());
  const [isFinished, setIsFinished] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [accuracyScore, setAccuracyScore] = useState(0);

  const targetWords = selectedText.text.split(/\s+/).map(w => w.replace(/[.,!?;:]/g, ''));
  const cleanTargetWordsLower = targetWords.map(w => w.toLowerCase());

  useEffect(() => {
    return () => {
      vocalRecognitionService.stop();
    };
  }, []);

  const handleStartListening = () => {
    setErrorMessage(null);
    setSpokenTranscript('');
    setRecognizedWords(new Set());
    setIsFinished(false);

    if (!vocalRecognitionService.isSupported()) {
      setErrorMessage('La reconnaissance vocale n\'est pas disponible sur ce navigateur. Veuillez utiliser Chrome, Edge ou la version de bureau.');
      return;
    }

    soundEffectsService.playClick();

    const success = vocalRecognitionService.start(
      (transcript) => {
        setSpokenTranscript(transcript);
        const spokenArray = transcript.split(/\s+/);
        const matched = new Set();

        cleanTargetWordsLower.forEach((targetW, idx) => {
          if (spokenArray.some(sW => sW.includes(targetW) || targetW.includes(sW))) {
            matched.add(idx);
          }
        });

        setRecognizedWords(matched);

        if (matched.size >= cleanTargetWordsLower.length * 0.85) {
          handleFinishReading(matched.size);
        }
      },
      (err) => {
        setIsListening(false);
        if (err !== 'no-speech') {
          setErrorMessage(`Erreur micro : ${err}`);
        }
      },
      () => {
        setIsListening(false);
      }
    );

    if (success) {
      setIsListening(true);
    }
  };

  const handleStopListening = () => {
    vocalRecognitionService.stop();
    setIsListening(false);
    handleFinishReading(recognizedWords.size);
  };

  const handleFinishReading = (matchedCount) => {
    vocalRecognitionService.stop();
    setIsListening(false);
    setIsFinished(true);

    const accuracy = Math.round((matchedCount / cleanTargetWordsLower.length) * 100);
    setAccuracyScore(accuracy);

    const starsEarned = accuracy >= 80 ? 3 : accuracy >= 50 ? 2 : 1;
    storageService.addStars(starsEarned);
    onStarsUpdate && onStarsUpdate();

    if (accuracy >= 60) {
      soundEffectsService.playSuccess();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } else {
      soundEffectsService.playError();
    }
  };

  const listenModelPronunciation = () => {
    ttsService.speak(selectedText.text);
  };

  const fontFamily = settings?.fontFamily === 'OpenDyslexic'
    ? 'var(--font-opendyslexic)'
    : settings?.fontFamily === 'Atkinson Hyperlegible'
    ? 'var(--font-atkinson)'
    : 'var(--font-lexend)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header card */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Mic size={24} color="var(--color-primary)" />
            <span>Lecture à Voix Haute (Micro)</span>
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Lit le texte au micro. Les mots prononcés correctement s'illuminent en vert !
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="btn btn-secondary" onClick={listenModelPronunciation}>
            <Volume2 size={18} /> Modèle Vocal
          </button>

          {!isListening ? (
            <button className="btn btn-primary" onClick={handleStartListening}>
              <Mic size={18} /> Démarrer le Micro
            </button>
          ) : (
            <button className="btn btn-danger" onClick={handleStopListening}>
              <MicOff size={18} /> Arrêter
            </button>
          )}
        </div>
      </div>

      {/* Text selector buttons */}
      <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
        {VOCAL_PRACTICE_TEXTS.map(t => (
          <button
            key={t.id}
            className={`btn ${selectedText.id === t.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}
            onClick={() => {
              vocalRecognitionService.stop();
              setIsListening(false);
              setSelectedText(t);
              setRecognizedWords(new Set());
              setSpokenTranscript('');
              setIsFinished(false);
            }}
          >
            📖 {t.title} ({t.level})
          </button>
        ))}
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div style={{ background: 'var(--color-error-light)', border: '1px solid var(--color-error)', padding: '1rem', borderRadius: 'var(--radius-md)', color: '#991B1B', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Active listening status pulse */}
      {isListening && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '0.8rem', borderRadius: 'var(--radius-md)', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
          <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#EF4444', borderRadius: '50%', animation: 'pulse-glow 1s infinite' }} />
          <span>Microphone actif — Lis le texte ci-dessous à haute voix...</span>
        </div>
      )}

      {/* Interactive text display */}
      <div className={`dyslexia-reader-box theme-${settings?.themePreset || 'cream'}`} style={{
        fontFamily,
        fontSize: `${settings?.fontSize || 22}px`,
        letterSpacing: `${settings?.letterSpacing || 1.2}px`,
        lineHeight: settings?.lineSpacing || 1.6,
        minHeight: '200px'
      }}>
        {targetWords.map((word, idx) => {
          const isMatched = recognizedWords.has(idx);
          return (
            <span
              key={idx}
              style={{
                display: 'inline-block',
                marginRight: '0.4em',
                padding: '0.1rem 0.3rem',
                borderRadius: '4px',
                background: isMatched ? '#DCFCE7' : 'transparent',
                color: isMatched ? '#15803D' : 'inherit',
                fontWeight: isMatched ? 700 : 400,
                borderBottom: isMatched ? '2px solid #16A34A' : 'none',
                transition: 'all 0.25s ease'
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Live transcript feed */}
      {spokenTranscript && (
        <div className="card" style={{ background: '#F8FAFC' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Transcription en direct :
          </div>
          <p style={{ fontStyle: 'italic', color: 'var(--color-text-main)' }}>
            "{spokenTranscript}"
          </p>
        </div>
      )}

      {/* Finished Summary Results Modal/Card */}
      {isFinished && (
        <div className="card" style={{ border: '2px solid var(--color-primary)', textAlign: 'center', padding: '2rem', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ fontSize: '3rem' }}>{accuracyScore >= 80 ? '🌟' : '👍'}</div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--color-primary-dark)', marginTop: '0.5rem' }}>
            Précision de lecture : {accuracyScore}%
          </h3>
          <p style={{ color: 'var(--color-text-muted)', margin: '0.5rem 0 1.5rem' }}>
            {recognizedWords.size} mots reconnus sur {targetWords.length} mots au total.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={handleStartListening}>
              <RotateCcw size={18} /> Répéter le texte
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
