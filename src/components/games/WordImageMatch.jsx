import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, CheckCircle } from 'lucide-react';
import { WORD_IMAGE_LEVELS } from '../../data/gameData';
import { soundEffectsService } from '../../services/soundEffectsService';
import confetti from 'canvas-confetti';

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function WordImageMatch({ onComplete, settings }) {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [pairIndex, setPairIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [choices, setChoices] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [wrongChoices, setWrongChoices] = useState([]);
  const [correctTotal, setCorrectTotal] = useState(0);

  const currentPair = selectedLevel ? selectedLevel.pairs[pairIndex] : null;

  const buildChoices = useCallback((pair) => {
    const distractorPool = pair.distractors.slice(0, 3);
    return shuffleArray([pair.image, ...distractorPool]);
  }, []);

  useEffect(() => {
    if (currentPair) {
      setChoices(buildChoices(currentPair));
      setFeedback(null);
      setWrongChoices([]);
    }
  }, [pairIndex, selectedLevel]);

  const handleAnswer = (choice) => {
    if (feedback === 'correct') return;
    const isCorrect = choice === currentPair.image;

    if (isCorrect) {
      soundEffectsService.playSuccess();
      setFeedback('correct');
      setScore(s => s + Math.max(1, 3 - wrongChoices.length));
      setCorrectTotal(c => c + 1);

      setTimeout(() => {
        const next = pairIndex + 1;
        if (next >= selectedLevel.pairs.length) {
          setGameOver(true);
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          onComplete && onComplete({ score, level: selectedLevel.id });
        } else {
          setPairIndex(next);
        }
      }, 800);
    } else {
      soundEffectsService.playError();
      setWrongChoices(prev => [...prev, choice]);
    }
  };

  const resetGame = () => {
    setSelectedLevel(null);
    setPairIndex(0);
    setScore(0);
    setFeedback(null);
    setGameOver(false);
    setCorrectTotal(0);
  };

  // ── Level Select ──
  if (!selectedLevel) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '3.5rem' }}>🖼️</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--color-primary-dark)', marginTop: '0.5rem' }}>
            Mot-Image Match
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
            Associe chaque mot à la bonne image ! Plus tu es précis, plus tu marques de points.
          </p>
        </div>
        <div className="grid-3">
          {WORD_IMAGE_LEVELS.map(level => (
            <button
              key={level.id}
              className="card card-hover"
              style={{ border: `2px solid ${level.color}30`, cursor: 'pointer', textAlign: 'center', background: 'white' }}
              onClick={() => { setSelectedLevel(level); setPairIndex(0); setScore(0); setGameOver(false); }}
            >
              <div style={{ fontSize: '2.5rem' }}>{level.emoji}</div>
              <div style={{ fontWeight: 700, color: level.color, marginTop: '0.5rem', fontFamily: 'var(--font-heading)' }}>{level.label}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.3rem' }}>
                {level.pairs.length} associations
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Game Over Screen ──
  if (gameOver) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '4rem' }}>🌟</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--color-primary-dark)', marginTop: '0.5rem' }}>
          Félicitations !
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '1.5rem 0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: selectedLevel.color }}>{score}</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Points totaux</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-success)' }}>{correctTotal}/{selectedLevel.pairs.length}</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Bonne réponse</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => { setPairIndex(0); setScore(0); setGameOver(false); setCorrectTotal(0); }}>
            <RotateCcw size={18} /> Rejouer
          </button>
          <button className="btn btn-secondary" onClick={resetGame}>Changer de thème</button>
        </div>
      </div>
    );
  }

  // ── Active Game ──
  const fontFamily = settings?.fontFamily === 'OpenDyslexic'
    ? 'var(--font-opendyslexic)'
    : settings?.fontFamily === 'Atkinson Hyperlegible'
    ? 'var(--font-atkinson)'
    : 'var(--font-lexend)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={resetGame}>← Thèmes</button>
        <div style={{ flex: 1, height: '10px', background: '#E2E8F0', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '99px',
            background: `linear-gradient(90deg, ${selectedLevel.color}, ${selectedLevel.color}99)`,
            width: `${(pairIndex / selectedLevel.pairs.length) * 100}%`,
            transition: 'width 0.4s ease'
          }} />
        </div>
        <span style={{ fontWeight: 700, color: selectedLevel.color, minWidth: '90px', textAlign: 'right' }}>
          {pairIndex + 1} / {selectedLevel.pairs.length}
        </span>
      </div>

      {/* Word to match */}
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        background: `${selectedLevel.color}10`,
        border: `2px solid ${selectedLevel.color}30`,
        borderRadius: 'var(--radius-lg)'
      }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
          Trouve l'image qui correspond à ce mot :
        </p>
        <div style={{
          fontFamily,
          fontSize: `${Math.max(26, settings?.fontSize || 22)}px`,
          fontWeight: 800,
          letterSpacing: `${settings?.letterSpacing || 2}px`,
          color: selectedLevel.color,
        }}>
          {currentPair.word}
        </div>
        {wrongChoices.length > 0 && (
          <p style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            ❌ {wrongChoices.length} mauvaise{wrongChoices.length > 1 ? 's' : ''} tentative{wrongChoices.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Image Choices Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        {choices.map((img, idx) => {
          const isCorrect = img === currentPair.image;
          const isWrong = wrongChoices.includes(img);
          const isConfirmed = feedback === 'correct' && isCorrect;

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(img)}
              disabled={isWrong || feedback === 'correct'}
              style={{
                padding: '1.5rem',
                fontSize: '3.2rem',
                borderRadius: 'var(--radius-lg)',
                border: isConfirmed
                  ? '3px solid var(--color-success)'
                  : isWrong
                  ? '3px solid var(--color-error)'
                  : '2px solid #E2E8F0',
                background: isConfirmed
                  ? 'var(--color-success-light)'
                  : isWrong
                  ? 'var(--color-error-light)'
                  : 'white',
                cursor: isWrong || feedback === 'correct' ? 'not-allowed' : 'pointer',
                opacity: isWrong ? 0.4 : 1,
                transition: 'all 0.2s ease',
                transform: isWrong ? 'scale(0.95)' : 'scale(1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: isConfirmed ? '0 0 0 3px #10B98133' : 'var(--shadow-sm)'
              }}
            >
              <span>{img}</span>
              {isConfirmed && <CheckCircle size={20} color="var(--color-success)" />}
            </button>
          );
        })}
      </div>

      {/* Score display */}
      <div style={{ textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
        Score actuel : <strong style={{ color: selectedLevel.color }}>{score} pts</strong>
      </div>
    </div>
  );
}
