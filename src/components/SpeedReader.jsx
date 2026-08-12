import React, { useState, useEffect } from 'react';
import { Zap, Play, Pause, RotateCcw, Eye, Clock, CheckCircle, XCircle, TrendingUp, Layers } from 'lucide-react';
import { storageService } from '../services/storageService';
import { soundEffectsService } from '../services/soundEffectsService';
import { adaptGrammarForChild, formatChildName } from '../services/genderService';

const TACHISTOSCOPE_BANKS = {
  confusions: [
    { word: 'balle', options: ['balle', 'dalle', 'palle', 'talle'] },
    { word: 'drapeau', options: ['drapeau', 'brapeau', 'prapeau', 'trapeau'] },
    { word: 'château', options: ['château', 'jâteau', 'gâteau', 'sâteau'] },
    { word: 'panier', options: ['panier', 'banier', 'danier', 'tanier'] }
  ],
  syllables: [
    { word: 'bou', options: ['bou', 'bon', 'boi', 'bau'] },
    { word: 'cha', options: ['cha', 'ja', 'ca', 'sa'] },
    { word: 'pro', options: ['pro', 'por', 'pra', 'pre'] },
    { word: 'tri', options: ['tri', 'tir', 'tra', 'tru'] }
  ],
  complex: [
    { word: 'pharmacie', options: ['pharmacie', 'farmacie', 'pharmasie', 'pharamcie'] },
    { word: 'ordinateur', options: ['ordinateur', 'ordinaire', 'ordonnance', 'ordonner'] },
    { word: 'escargot', options: ['escargot', 'escalier', 'escabot', 'carotte'] },
    { word: 'chocolat', options: ['chocolat', 'chocolatin', 'chocotte', 'chocolaterie'] }
  ]
};

export function SpeedReader({ profile, settings, onCompleteTest }) {
  const childName = formatChildName(profile?.firstName || 'Izaia');
  const childGender = profile?.gender || 'auto';

  const rawSpeedText = "Lina aime lire tous les jours. Elle découvre des mots magiques et des histoires passionnantes. Avec un entraînement quotidien, la lecture devient de plus en plus fluide, rapide et amusante. Chaque phrase lue est une belle victoire pour son esprit curieux.";
  const SPEED_TEXT = adaptGrammarForChild(rawSpeedText, childName, childGender);

  const [activeSubTab, setActiveSubTab] = useState('pacer'); // 'pacer' | 'tachistoscope'
  
  // WPM Pacer state
  const [wpm, setWpm] = useState(120);
  const [chunkSize, setChunkSize] = useState(1); // 1, 2, or 3 words at once
  const [speedRamp, setSpeedRamp] = useState(false); // Progressive WPM acceleration
  const [pacerRunning, setPacerRunning] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);

  // Split text into chunks according to chunkSize
  const allWords = SPEED_TEXT.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < allWords.length; i += chunkSize) {
    chunks.push(allWords.slice(i, i + chunkSize).join(' '));
  }

  // Tachistoscope state
  const [tachCategory, setTachCategory] = useState('confusions');
  const [flashIndex, setFlashIndex] = useState(0);
  const [flashDurationMs, setFlashDurationMs] = useState(250); // 250ms fine timing
  const [isFlashing, setIsFlashing] = useState(false);
  const [hasFlashed, setHasFlashed] = useState(false);
  const [flashFeedback, setFlashFeedback] = useState(null);

  const activeBank = TACHISTOSCOPE_BANKS[tachCategory] || TACHISTOSCOPE_BANKS.confusions;

  // Pacer Loop with optional Speed Ramp
  useEffect(() => {
    let interval = null;
    if (pacerRunning) {
      const currentWpm = speedRamp ? wpm + Math.floor(currentChunkIndex * 2.5) : wpm;
      const intervalMs = (60 / currentWpm) * 1000 * chunkSize;

      interval = setInterval(() => {
        setCurrentChunkIndex((prev) => {
          if (prev >= chunks.length - 1) {
            setPacerRunning(false);
            soundEffectsService.playSuccess();
            storageService.saveWpmRecord(wpm);
            if (onCompleteTest) onCompleteTest(wpm);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    }
    return () => clearInterval(interval);
  }, [pacerRunning, wpm, chunkSize, speedRamp, currentChunkIndex, chunks.length]);

  // Flash trigger
  const triggerFlash = () => {
    soundEffectsService.playClick();
    setIsFlashing(true);
    setHasFlashed(false);
    setFlashFeedback(null);
    setTimeout(() => {
      setIsFlashing(false);
      setHasFlashed(true);
    }, flashDurationMs);
  };

  const handleFlashAnswer = (option) => {
    const currentTarget = activeBank[flashIndex].word;
    const isCorrect = option === currentTarget;

    if (isCorrect) {
      soundEffectsService.playSuccess();
    } else {
      soundEffectsService.playError();
    }

    setFlashFeedback(isCorrect ? 'correct' : 'incorrect');

    setTimeout(() => {
      if (flashIndex < activeBank.length - 1) {
        setFlashIndex((prev) => prev + 1);
        setHasFlashed(false);
        setFlashFeedback(null);
      } else {
        storageService.addStars(5);
        storageService.addBadge('Champion du Flash Visuel');
      }
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Sub-tab selection */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-accent-orange)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={24} />
            <span>Suite d'Optimisation de la Vitesse de Lecture</span>
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Entraînement stroboscopique par Chunks & Tachistoscope clinique à fixation rapide.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            className={`btn ${activeSubTab === 'pacer' ? 'btn-orange' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('pacer')}
          >
            ⚡ Lecteur Pacer & Chunks (WPM)
          </button>
          <button
            className={`btn ${activeSubTab === 'tachistoscope' ? 'btn-orange' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('tachistoscope')}
          >
            👁️ Tachistoscope Flash
          </button>
        </div>
      </div>

      {/* MODE 1: WPM PACER & CHUNKING */}
      {activeSubTab === 'pacer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.2rem' }}>
            {/* WPM Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '240px' }}>
              <Clock size={22} color="var(--color-accent-orange)" />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem' }}>
                  <span>Vitesse Cadencée</span>
                  <span style={{ color: 'var(--color-accent-orange)', fontSize: '1.05rem' }}>{wpm} WPM</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="10"
                  className="range-slider"
                  value={wpm}
                  onChange={(e) => setWpm(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Chunk Size Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Layers size={16} /> Block :
              </span>
              {[1, 2, 3].map(size => (
                <button
                  key={size}
                  className={`btn ${chunkSize === size ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  onClick={() => {
                    setChunkSize(size);
                    setCurrentChunkIndex(0);
                  }}
                >
                  {size} mot{size > 1 ? 's' : ''}
                </button>
              ))}
            </div>

            {/* Speed Ramp Toggle */}
            <button
              className={`btn ${speedRamp ? 'btn-orange' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
              onClick={() => setSpeedRamp(!speedRamp)}
              title="Accélération progressive automatique du WPM"
            >
              <TrendingUp size={16} /> Rampe WPM {speedRamp ? 'Activée' : 'Désactivée'}
            </button>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                className="btn btn-orange"
                onClick={() => setPacerRunning(!pacerRunning)}
              >
                {pacerRunning ? <Pause size={18} /> : <Play size={18} />}
                <span>{pacerRunning ? 'Pause' : 'Démarrer'}</span>
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => {
                  setPacerRunning(false);
                  setCurrentChunkIndex(0);
                }}
              >
                <RotateCcw size={18} />
                <span>Réinitialiser</span>
              </button>
            </div>
          </div>

          {/* Flash Display Box */}
          <div
            className={`dyslexia-reader-box theme-${settings.themePreset}`}
            style={{
              fontFamily: settings.fontFamily === 'OpenDyslexic' ? 'var(--font-opendyslexic)' : settings.fontFamily === 'Atkinson Hyperlegible' ? 'var(--font-atkinson)' : 'var(--font-lexend)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '220px',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
              Block {currentChunkIndex + 1} / {chunks.length} {speedRamp ? `(Accélération en cours)` : ''}
            </span>

            <div
              style={{
                fontSize: `${settings.fontSize * 1.6}px`,
                fontWeight: 800,
                letterSpacing: `${settings.letterSpacing}px`,
                color: 'var(--color-primary-dark)',
                padding: '1.5rem 3rem',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {chunks[currentChunkIndex]}
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: TACHISTOSCOPE FLASH */}
      {activeSubTab === 'tachistoscope' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            {/* Category Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Eye size={22} color="var(--color-primary)" />
              <select
                className="btn btn-secondary"
                value={tachCategory}
                onChange={(e) => {
                  setTachCategory(e.target.value);
                  setFlashIndex(0);
                  setHasFlashed(false);
                }}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
              >
                <option value="confusions">Confusions visuelles (b/d, p/q)</option>
                <option value="syllables">Syllabes courantes</option>
                <option value="complex">Mots complexes & irréguliers</option>
              </select>
            </div>

            {/* Fine Duration Selector */}
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Exposition :</span>
              {[100, 250, 400, 600, 1000].map((duration) => (
                <button
                  key={duration}
                  className={`btn ${flashDurationMs === duration ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                  onClick={() => setFlashDurationMs(duration)}
                >
                  {duration}ms
                </button>
              ))}
            </div>
          </div>

          <div
            className={`dyslexia-reader-box theme-${settings.themePreset}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '240px'
            }}
          >
            {!hasFlashed && !isFlashing && (
              <button className="btn btn-orange" onClick={triggerFlash}>
                ⚡ Déclencher le Flash ! ({activeBank[flashIndex].word.length} lettres)
              </button>
            )}

            {isFlashing && (
              <div style={{ fontSize: '3.2rem', fontWeight: 800, color: 'var(--color-primary-dark)', animation: 'popIn 0.08s ease-out' }}>
                {activeBank[flashIndex].word}
              </div>
            )}

            {hasFlashed && (
              <div style={{ width: '100%', maxWidth: '500px' }}>
                <p style={{ textAlign: 'center', marginBottom: '1.2rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  Quel mot est apparu pendant {flashDurationMs}ms ?
                </p>

                <div className="answer-grid">
                  {activeBank[flashIndex].options.map((opt) => (
                    <button
                      key={opt}
                      className="answer-card"
                      onClick={() => handleFlashAnswer(opt)}
                      disabled={flashFeedback !== null}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {flashFeedback === 'correct' && (
                  <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--color-success)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                    <CheckCircle size={20} /> Excellent ! Fixation visuelle parfaite !
                  </div>
                )}

                {flashFeedback === 'incorrect' && (
                  <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--color-error)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                    <XCircle size={20} /> Oups ! Concentre-toi sur le prochain mot.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
