import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, Snail, FileText, Sparkles, Mic, Wand2, Sliders } from 'lucide-react';
import { ttsService } from '../services/ttsService';
import { soundEffectsService } from '../services/soundEffectsService';
import { renderColorizedText } from '../services/syllableService';
import { adaptGrammarForChild, formatChildName } from '../services/genderService';

export function AssistedReader({ profile, settings, customTexts }) {
  const childName = formatChildName(profile?.firstName || 'Izaia');
  const childGender = profile?.gender || 'auto';

  const rawStory1 = "Lina lit un mot sur le mur de la chambre. Le mot est beau et brille sous le soleil. Lina sourit car elle a réussi à déchiffrer toutes les lettres sans hésiter.";
  const story1Content = adaptGrammarForChild(rawStory1, childName, childGender);

  const SAMPLE_STORIES = [
    {
      id: 's1',
      title: `${childName} et le petit mot magique`,
      content: story1Content
    },
    {
      id: 's2',
      title: 'Le voyage du renard volant',
      content: 'Un petit renard roux saute par-dessus la rivière bleu clair. Il écoute le chant des oiseaux dans la grande forêt verte. Les papillons dansent autour de lui.'
    }
  ];

  const [currentText, setCurrentText] = useState(() => SAMPLE_STORIES[0].content);
  const [customInput, setCustomInput] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [highlightWordIndex, setHighlightWordIndex] = useState(-1);
  const [rulerTop, setRulerTop] = useState(100);

  // Advanced Voice Controls
  const [frenchVoices, setFrenchVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [pitch, setPitch] = useState(1.0);
  const [speechRate, setSpeechRate] = useState(0.85);

  const readerRef = useRef(null);

  const words = currentText.trim().split(/\s+/);

  useEffect(() => {
    // Load French voices
    const voices = ttsService.getFrenchVoices();
    setFrenchVoices(voices);
    if (voices.length > 0 && !selectedVoiceURI) {
      setSelectedVoiceURI(voices[0].voiceURI);
    }

    ttsService.setBoundaryHandler((charIndex) => {
      let charAcc = 0;
      for (let i = 0; i < words.length; i++) {
        const wordLen = words[i].length;
        if (charIndex >= charAcc && charIndex <= charAcc + wordLen + 2) {
          setHighlightWordIndex(i);
          setTimeout(() => {
            const activeEl = readerRef.current?.querySelector('.reader-word.highlighted');
            if (activeEl) {
              activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
            }
          }, 10);
          break;
        }
        charAcc += wordLen + 1;
      }
    });

    ttsService.setEndHandler(() => {
      setIsReading(false);
      setHighlightWordIndex(-1);
    });

    return () => {
      ttsService.stop();
    };
  }, [currentText]);

  const handleMouseMove = (e) => {
    if (readerRef.current && settings.showRuler) {
      const rect = readerRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      setRulerTop(Math.max(10, Math.min(rect.height - 40, relativeY - 20)));
    }
  };

  const startTTS = (slow = false) => {
    soundEffectsService.playClick();
    setIsReading(true);
    setHighlightWordIndex(-1);

    const actualRate = slow ? 0.55 : speechRate;
    ttsService.speak(currentText, {
      voiceURI: selectedVoiceURI,
      pitch: pitch,
      rate: actualRate
    });
  };

  const stopTTS = () => {
    ttsService.stop();
    setIsReading(false);
    setHighlightWordIndex(-1);
  };

  const handleCleanCurrentText = () => {
    const cleaned = ttsService.cleanTextForSpeech(currentText);
    setCurrentText(cleaned);
    soundEffectsService.playSuccess();
  };

  const handleApplyCustomText = () => {
    if (customInput.trim()) {
      const cleaned = ttsService.cleanTextForSpeech(customInput.trim());
      setCurrentText(cleaned);
      setCustomInput('');
      soundEffectsService.playSuccess();
    }
  };

  const colorized = renderColorizedText(currentText);

  const fontStyleClass = settings.fontFamily === 'OpenDyslexic' 
    ? 'var(--font-opendyslexic)' 
    : settings.fontFamily === 'Atkinson Hyperlegible' 
    ? 'var(--font-atkinson)' 
    : settings.fontFamily === 'Comic Neue' 
    ? 'var(--font-comic)' 
    : 'var(--font-lexend)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Main Bar */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={24} />
            <span>Lecteur Assisté Dyslexie Élite</span>
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Synthèse vocale HD, coloration syllabique et règle de lecture guidée.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {isReading && (
            <div className="audio-visualizer" title="Lecture en cours...">
              <div className="audio-bar" />
              <div className="audio-bar" />
              <div className="audio-bar" />
              <div className="audio-bar" />
              <div className="audio-bar" />
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={() => startTTS(false)}
            disabled={isReading}
          >
            <Volume2 size={18} />
            <span>Écouter</span>
          </button>

          <button
            className="btn btn-orange"
            onClick={() => startTTS(true)}
            disabled={isReading}
          >
            <Snail size={18} />
            <span>Lecture Lente</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={stopTTS}
            disabled={!isReading}
            style={{ color: 'var(--color-error)' }}
          >
            <Square size={18} />
            <span>Arrêter</span>
          </button>
        </div>
      </div>

      {/* Advanced Voice Selection & Tuning Panel */}
      <div className="card" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Voice Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: '240px', flex: 1 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mic size={14} color="var(--color-primary)" />
              <span>Choix de la Voix Française (HD / Naturelle)</span>
            </label>
            <select
              className="btn btn-secondary"
              value={selectedVoiceURI}
              onChange={(e) => {
                setSelectedVoiceURI(e.target.value);
                ttsService.setVoice(e.target.value);
              }}
              style={{ padding: '0.45rem 0.7rem', fontSize: '0.9rem', width: '100%' }}
            >
              {frenchVoices.map(v => {
                const isNatural = v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('online');
                return (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {isNatural ? '✨ ' : ''}{v.name} ({v.lang})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Voice Pitch (Hauteur) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: '150px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Hauteur Voix</span>
              <span>{pitch}</span>
            </label>
            <input
              type="range"
              min="0.6"
              max="1.4"
              step="0.1"
              className="range-slider"
              value={pitch}
              onChange={(e) => setPitch(Number(e.target.value))}
            />
          </div>

          {/* Voice Speed (Vitesse) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: '150px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Vitesse Diction</span>
              <span>{speechRate}x</span>
            </label>
            <input
              type="range"
              min="0.4"
              max="1.3"
              step="0.05"
              className="range-slider"
              value={speechRate}
              onChange={(e) => setSpeechRate(Number(e.target.value))}
            />
          </div>

          {/* Clean metadata button */}
          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '0.5rem 0.8rem', alignSelf: 'flex-end' }}
            onClick={handleCleanCurrentText}
            title="Supprimer automatiquement les entêtes de livre, numéros de pages et codes inutiles pour une diction fluide."
          >
            <Wand2 size={15} color="var(--color-primary)" />
            <span>Nettoyer le Texte</span>
          </button>
        </div>
      </div>

      {/* Preset / Custom Text Selector */}
      <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {SAMPLE_STORIES.map((s) => (
          <button
            key={s.id}
            className={`btn ${currentText === s.content ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}
            onClick={() => {
              stopTTS();
              setCurrentText(s.content);
            }}
          >
            📖 {s.title}
          </button>
        ))}

        {customTexts.map((ct) => (
          <button
            key={ct.id}
            className={`btn ${currentText === ct.content ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}
            onClick={() => {
              stopTTS();
              setCurrentText(ct.content);
            }}
          >
            ✏️ {ct.title}
          </button>
        ))}
      </div>

      {/* Interactive Dyslexia Reader Viewport */}
      <div
        ref={readerRef}
        onMouseMove={handleMouseMove}
        className={`dyslexia-reader-box theme-${settings.themePreset}`}
        style={{
          fontFamily: fontStyleClass,
          fontSize: `${settings.fontSize}px`,
          letterSpacing: `${settings.letterSpacing}px`,
          lineHeight: settings.lineSpacing,
          wordSpacing: `${settings.wordSpacing}px`,
          minHeight: '260px'
        }}
      >
        {/* Line Focus Guide / Reading Ruler */}
        {settings.showRuler && (
          <div className="reading-ruler" style={{ top: `${rulerTop}px` }} />
        )}

        {/* Syllable Colorized or Standard Render */}
        {settings.colorizeSyllables ? (
          <div>
            {(() => {
              let wIdx = 0;
              return colorized.map((item) => {
                if (item.type === 'space') return item.content;
                const isHighlighted = wIdx === highlightWordIndex;
                wIdx++;
                return (
                  <span
                    key={item.key}
                    className={`reader-word ${isHighlighted ? 'highlighted' : ''}`}
                    style={{ marginRight: `${settings.wordSpacing}px` }}
                    onClick={() => ttsService.speak(item.content, { voiceURI: selectedVoiceURI, pitch, rate: speechRate })}
                    title="Cliquer pour prononcer ce mot"
                  >
                    {item.syllables.map((syllable, sIdx) => (
                      <span key={sIdx} className={syllable.colorClass}>{syllable.text}</span>
                    ))}
                  </span>
                );
              });
            })()}
          </div>
        ) : (
          <div>
            {words.map((w, idx) => {
              const isHighlighted = idx === highlightWordIndex;
              return (
                <span
                  key={idx}
                  className={`reader-word ${isHighlighted ? 'highlighted' : ''}`}
                  onClick={() => ttsService.speak(w, { voiceURI: selectedVoiceURI, pitch, rate: speechRate })}
                  title="Cliquer pour prononcer ce mot"
                >
                  {w}{' '}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Import / Paste Custom Text Box */}
      <div className="card">
        <h4 style={{ marginBottom: '0.6rem', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={18} color="var(--color-primary)" />
          <span>Saisir un texte à lire avec les aides visuelles</span>
        </h4>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <textarea
            className="btn-secondary"
            style={{ flex: 1, padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid #CBD5E1', fontFamily: 'inherit', fontSize: '0.95rem', minHeight: '80px' }}
            placeholder="Colle ou tape ici un devoir d'école ou une histoire..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
          />
          <button
            className="btn btn-primary"
            style={{ alignSelf: 'flex-end' }}
            onClick={handleApplyCustomText}
            disabled={!customInput.trim()}
          >
            Appliquer au Lecteur
          </button>
        </div>
      </div>
    </div>
  );
}
