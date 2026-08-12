import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { RHYTHM_LEVELS } from '../../data/gameData';
import { soundEffectsService } from '../../services/soundEffectsService';
import confetti from 'canvas-confetti';

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function RhythmReader({ onComplete, settings }) {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [seqIndex, setSeqIndex] = useState(0);
  const [phase, setPhase] = useState('memorize'); // 'memorize' | 'recall'
  const [showWords, setShowWords] = useState(true);
  const [shuffled, setShuffled] = useState([]);
  const [selected, setSelected] = useState([]);
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [memorizeTimer, setMemorizeTimer] = useState(3);
  const timerRef = useRef(null);

  const currentSeq = selectedLevel ? selectedLevel.sequences[seqIndex] : null;

  // Countdown during memorize phase
  useEffect(() => {
    if (phase === 'memorize' && currentSeq) {
      setMemorizeTimer(3);
      setShowWords(true);
      timerRef.current = setInterval(() => {
        setMemorizeTimer(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setShowWords(false);
            setPhase('recall');
            setShuffled(shuffleArray(currentSeq.words));
            setSelected([]);
            setFeedback(null);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, seqIndex, selectedLevel]);

  const handleSelectWord = (word, idx) => {
    if (feedback) return;
    const newSelected = [...selected, word];
    setSelected(newSelected);

    if (newSelected.length === currentSeq.words.length) {
      const isCorrect = newSelected.join('|') === currentSeq.words.join('|');
      if (isCorrect) {
        soundEffectsService.playSuccess();
        setFeedback('correct');
        setScore(s => s + 3);
        setTimeout(() => {
          const next = seqIndex + 1;
          if (next >= selectedLevel.sequences.length) {
            setGameOver(true);
            confetti({ particleCount: 130, spread: 90, origin: { y: 0.6 } });
            onComplete && onComplete({ score: score + 3, level: selectedLevel.id });
          } else {
            setSeqIndex(next);
            setPhase('memorize');
          }
        }, 900);
      } else {
        soundEffectsService.playError();
        setFeedback('wrong');
        setTimeout(() => {
          setSelected([]);
          setFeedback(null);
          setShuffled(shuffleArray(currentSeq.words));
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    setSelectedLevel(null);
    setSeqIndex(0);
    setPhase('memorize');
    setShowWords(true);
    setSelected([]);
    setFeedback(null);
    setScore(0);
    setGameOver(false);
    clearInterval(timerRef.current);
  };

  // ── Level Select ──
  if (!selectedLevel) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '3.5rem' }}>🎵</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--color-primary-dark)', marginTop: '0.5rem' }}>
            Rythme de Lecture
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
            Mémorise l'ordre des mots, puis retrouve-les dans le bon ordre !
          </p>
        </div>
        <div className="grid-3">
          {RHYTHM_LEVELS.map(level => (
            <button
              key={level.id}
              className="card card-hover"
              style={{ border: `2px solid ${level.color}30`, cursor: 'pointer', textAlign: 'center', background: 'white' }}
              onClick={() => { setSelectedLevel(level); setSeqIndex(0); setScore(0); setGameOver(false); setPhase('memorize'); setShowWords(true); }}
            >
              <div style={{ fontSize: '2.5rem' }}>{level.emoji}</div>
              <div style={{ fontWeight: 700, color: level.color, marginTop: '0.5rem', fontFamily: 'var(--font-heading)' }}>{level.label}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.3rem' }}>
                {level.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Game Over ──
  if (gameOver) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '4rem' }}>🥁</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--color-primary-dark)', marginTop: '0.5rem' }}>
          Excellent rythme !
        </h2>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: selectedLevel.color, margin: '1rem 0' }}>
          {score} points
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => { setSeqIndex(0); setScore(0); setGameOver(false); setPhase('memorize'); setShowWords(true); setFeedback(null); setSelected([]); }}>
            <RotateCcw size={18} /> Rejouer
          </button>
          <button className="btn btn-secondary" onClick={resetGame}>Changer de mode</button>
        </div>
      </div>
    );
  }

  const fontFamily = settings?.fontFamily === 'OpenDyslexic'
    ? 'var(--font-opendyslexic)'
    : settings?.fontFamily === 'Atkinson Hyperlegible'
    ? 'var(--font-atkinson)'
    : 'var(--font-lexend)';

  const usedWords = new Set(selected);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={resetGame}>← Modes</button>
        <div style={{ flex: 1, height: '10px', background: '#E2E8F0', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '99px',
            background: `linear-gradient(90deg, ${selectedLevel.color}, ${selectedLevel.color}99)`,
            width: `${(seqIndex / selectedLevel.sequences.length) * 100}%`,
            transition: 'width 0.4s ease'
          }} />
        </div>
        <span style={{ fontWeight: 700, color: selectedLevel.color, minWidth: '90px', textAlign: 'right' }}>
          {seqIndex + 1} / {selectedLevel.sequences.length}
        </span>
      </div>

      {/* Phase: Memorize */}
      {phase === 'memorize' && (
        <div style={{
          textAlign: 'center',
          padding: '2.5rem 1.5rem',
          background: `${selectedLevel.color}10`,
          border: `2px solid ${selectedLevel.color}40`,
          borderRadius: 'var(--radius-lg)',
          animation: 'fadeIn 0.4s ease'
        }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8rem' }}>
            👀 Mémorise l'ordre ! ({memorizeTimer}s)
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1rem' }}>
            {currentSeq.words.map((w, i) => (
              <span key={i} style={{
                fontFamily,
                fontSize: `${Math.max(20, settings?.fontSize || 18)}px`,
                fontWeight: 700,
                padding: '0.6rem 1.2rem',
                borderRadius: 'var(--radius-md)',
                background: selectedLevel.color,
                color: 'white',
                letterSpacing: `${settings?.letterSpacing || 1}px`,
                animation: `fadeIn ${0.1 + i * 0.15}s ease`
              }}>
                {w}
              </span>
            ))}
          </div>
          <div style={{ fontSize: '1.8rem', marginTop: '0.5rem' }}>{currentSeq.hint}</div>
          <div style={{
            width: `${(memorizeTimer / 3) * 100}%`,
            height: '4px',
            background: selectedLevel.color,
            borderRadius: '99px',
            margin: '1rem auto 0',
            maxWidth: '200px',
            transition: 'width 1s linear'
          }} />
        </div>
      )}

      {/* Phase: Recall */}
      {phase === 'recall' && (
        <>
          <div style={{
            padding: '1.5rem',
            border: `2px dashed ${selectedLevel.color}50`,
            borderRadius: 'var(--radius-lg)',
            minHeight: '80px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.8rem',
            alignItems: 'center',
            background: feedback === 'correct' ? 'var(--color-success-light)' : feedback === 'wrong' ? 'var(--color-error-light)' : `${selectedLevel.color}05`
          }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 600, width: '100%', marginBottom: '0.2rem' }}>
              {feedback === 'correct' ? '✅ Parfait ! Bien mémorisé !' : feedback === 'wrong' ? '❌ Pas tout à fait, réessaie !' : '👆 Clique sur les mots dans le bon ordre :'}
            </p>
            {selected.map((w, i) => (
              <span key={i} style={{
                fontFamily,
                fontSize: `${Math.max(18, settings?.fontSize || 16)}px`,
                fontWeight: 700,
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: feedback === 'correct' ? 'var(--color-success)' : feedback === 'wrong' ? 'var(--color-error)' : selectedLevel.color,
                color: 'white',
              }}>
                {w}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center' }}>
            {shuffled.map((w, idx) => {
              const isUsed = usedWords.has(w) && selected.indexOf(w) !== -1;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectWord(w, idx)}
                  disabled={!!feedback || isUsed}
                  style={{
                    fontFamily,
                    fontSize: `${Math.max(18, settings?.fontSize || 16)}px`,
                    fontWeight: 700,
                    padding: '0.7rem 1.4rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${selectedLevel.color}`,
                    background: isUsed ? '#E2E8F0' : 'white',
                    color: isUsed ? '#94A3B8' : selectedLevel.color,
                    cursor: isUsed || feedback ? 'not-allowed' : 'pointer',
                    opacity: isUsed ? 0.5 : 1,
                    transition: 'all 0.15s ease',
                    letterSpacing: `${settings?.letterSpacing || 1}px`,
                  }}
                >
                  {w}
                </button>
              );
            })}
          </div>

          <div style={{ textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Score : <strong style={{ color: selectedLevel.color }}>{score} pts</strong>
          </div>
        </>
      )}
    </div>
  );
}
