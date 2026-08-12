import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Star, ChevronRight, RotateCcw, Trophy } from 'lucide-react';
import { SYLLABLE_SNAP_LEVELS } from '../../data/gameData';
import { soundEffectsService } from '../../services/soundEffectsService';
import confetti from 'canvas-confetti';

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function SyllableSnap({ onComplete, settings }) {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const [choices, setChoices] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [fastCount, setFastCount] = useState(0);

  const currentRound = selectedLevel ? selectedLevel.rounds[roundIndex] : null;

  const buildChoices = useCallback((round) => {
    const all = [round.target, ...round.distractors.slice(0, 3)];
    return shuffleArray(all);
  }, []);

  useEffect(() => {
    if (currentRound) {
      setChoices(buildChoices(currentRound));
      setFeedback(null);
      setStartTime(Date.now());
    }
  }, [roundIndex, selectedLevel]);

  const handleAnswer = (choice) => {
    if (feedback) return;
    const elapsed = (Date.now() - startTime) / 1000;
    const isCorrect = choice === currentRound.target;

    if (isCorrect) {
      soundEffectsService.playSuccess();
      setFeedback('correct');
      setScore(s => s + (streak >= 2 ? 2 : 1));
      setStreak(s => s + 1);
      if (elapsed < 2) setFastCount(f => f + 1);

      setTimeout(() => {
        const nextIdx = roundIndex + 1;
        if (nextIdx >= selectedLevel.rounds.length) {
          setGameOver(true);
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          onComplete && onComplete({ score: score + (streak >= 2 ? 2 : 1), fastCount, level: selectedLevel.id });
        } else {
          setRoundIndex(nextIdx);
        }
      }, 900);
    } else {
      soundEffectsService.playError();
      setFeedback('wrong');
      setStreak(0);
      setTimeout(() => {
        setFeedback(null);
        setChoices(buildChoices(currentRound));
      }, 900);
    }
  };

  const resetGame = () => {
    setSelectedLevel(null);
    setRoundIndex(0);
    setScore(0);
    setStreak(0);
    setFeedback(null);
    setGameOver(false);
    setFastCount(0);
  };

  // ── Level Select ──
  if (!selectedLevel) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '3.5rem', lineHeight: 1 }}>🔤</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--color-primary-dark)', marginTop: '0.5rem' }}>
            Syllabe Snap
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
            Appuie sur la bonne syllabe du mot affiché ! Plus vite = plus de points !
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: '1rem' }}>
          {SYLLABLE_SNAP_LEVELS.map(level => (
            <button
              key={level.id}
              className="card card-hover"
              style={{ border: `2px solid ${level.color}30`, cursor: 'pointer', textAlign: 'center', background: 'white' }}
              onClick={() => { setSelectedLevel(level); setRoundIndex(0); setScore(0); setStreak(0); setGameOver(false); }}
            >
              <div style={{ fontSize: '2.5rem' }}>{level.emoji}</div>
              <div style={{ fontWeight: 700, color: level.color, marginTop: '0.5rem', fontFamily: 'var(--font-heading)' }}>{level.label}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.3rem' }}>
                {level.rounds.length} rondes
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Game Over Screen ──
  if (gameOver) {
    const perfect = score >= selectedLevel.rounds.length * 2;
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '4rem' }}>{perfect ? '🏆' : '⭐'}</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--color-primary-dark)', marginTop: '0.5rem' }}>
          {perfect ? 'Parfait ! Bravo !' : 'Bien joué !'}
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '1.5rem 0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>{score}</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Points</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#F59E0B' }}>{fastCount}</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Réponses rapides ⚡</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => { setRoundIndex(0); setScore(0); setStreak(0); setGameOver(false); setFeedback(null); setFastCount(0); }}>
            <RotateCcw size={18} /> Rejouer ce niveau
          </button>
          <button className="btn btn-secondary" onClick={resetGame}>
            Changer de niveau
          </button>
        </div>
      </div>
    );
  }

  // ── Active Game ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Progress Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={resetGame}>
          ← Niveaux
        </button>
        <div style={{ flex: 1, height: '10px', background: '#E2E8F0', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '99px',
            background: `linear-gradient(90deg, ${selectedLevel.color}, ${selectedLevel.color}99)`,
            width: `${((roundIndex) / selectedLevel.rounds.length) * 100}%`,
            transition: 'width 0.4s ease'
          }} />
        </div>
        <span style={{ fontWeight: 700, color: selectedLevel.color, minWidth: '90px', textAlign: 'right' }}>
          {roundIndex + 1} / {selectedLevel.rounds.length}
        </span>
      </div>

      {/* Score & Streak */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FEF3C7', padding: '0.4rem 0.8rem', borderRadius: '99px', border: '1px solid #FDE68A' }}>
          <Star size={18} color="#D97706" fill="#D97706" />
          <span style={{ fontWeight: 700, color: '#B45309' }}>{score} pts</span>
        </div>
        {streak >= 2 && (
          <div style={{ background: '#FFF7ED', padding: '0.4rem 0.8rem', borderRadius: '99px', border: '1px solid #FED7AA', fontWeight: 700, color: '#EA580C', fontSize: '0.9rem' }}>
            🔥 Combo ×{streak}
          </div>
        )}
      </div>

      {/* Word Display */}
      <div style={{
        textAlign: 'center',
        padding: '2.5rem 1.5rem',
        background: `${selectedLevel.color}10`,
        border: `2px solid ${selectedLevel.color}30`,
        borderRadius: 'var(--radius-lg)'
      }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Quel est la syllabe surlignée ?
        </p>
        <div style={{
          fontFamily: settings?.fontFamily === 'OpenDyslexic' ? 'var(--font-opendyslexic)' : settings?.fontFamily === 'Atkinson Hyperlegible' ? 'var(--font-atkinson)' : 'var(--font-lexend)',
          fontSize: `${Math.max(28, settings?.fontSize || 24)}px`,
          fontWeight: 800,
          letterSpacing: '4px',
          color: selectedLevel.color,
        }}>
          {currentRound.word}
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '0.6rem' }}>
          Touche la première syllabe du mot !
        </p>
      </div>

      {/* Answer Choices */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        {choices.map((choice, idx) => {
          const isTarget = choice === currentRound.target;
          let cardStyle = {};
          if (feedback === 'correct' && isTarget) {
            cardStyle = { background: 'var(--color-success-light)', borderColor: 'var(--color-success)', color: '#065F46' };
          } else if (feedback === 'wrong' && isTarget) {
            cardStyle = { background: 'var(--color-success-light)', borderColor: 'var(--color-success)' };
          } else if (feedback === 'wrong' && !isTarget) {
            cardStyle = { opacity: 0.5 };
          }

          return (
            <button
              key={idx}
              className="answer-card"
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                letterSpacing: '2px',
                fontFamily: settings?.fontFamily === 'OpenDyslexic' ? 'var(--font-opendyslexic)' : 'var(--font-lexend)',
                ...cardStyle
              }}
              onClick={() => handleAnswer(choice)}
              disabled={!!feedback}
            >
              {feedback === 'correct' && isTarget ? <CheckCircle size={20} color="var(--color-success)" /> : null}
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
}
