import React from 'react';
import { Type, Eye, Palette, Space, Volume2, VolumeX } from 'lucide-react';
import { soundEffectsService } from '../services/soundEffectsService';

export function DyslexiaControls({ settings, updateSettings, onClose }) {
  const fonts = [
    { name: 'Lexend', label: 'Lexend (Recommandé)' },
    { name: 'OpenDyslexic', label: 'OpenDyslexic' },
    { name: 'Atkinson Hyperlegible', label: 'Atkinson Hyperlegible' },
    { name: 'Comic Neue', label: 'Comic Neue' },
    { name: 'Inter', label: 'Inter' }
  ];

  const themePresets = [
    { id: 'white', bg: '#FFFFFF', name: 'Blanc' },
    { id: 'cream', bg: '#FFFDF5', name: 'Crème / Sépia' },
    { id: 'blue', bg: '#F0F7FF', name: 'Bleu Doux' },
    { id: 'dark', bg: '#1E293B', name: 'Sombre / Contraste' }
  ];

  const toggleAudioSounds = () => {
    const newState = soundEffectsService.toggleSound();
    updateSettings({ soundEffects: newState });
  };

  return (
    <div className="accessibility-bar">
      <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', paddingBottom: '0.5rem', borderBottom: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--color-primary-dark)', fontSize: '0.95rem' }}>
          <Sliders size={18} />
          <span>Réglages & Confort Dyslexie</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '0.2rem 0.5rem', fontSize: '1.1rem', fontWeight: 700 }}
            title="Fermer le panneau"
          >
            ✕
          </button>
        )}
      </div>

      <div className="accessibility-grid">
        {/* Police */}
        <div className="control-group">
          <label className="control-label">
            <span><Type size={14} /> Police Adaptée</span>
          </label>
          <select
            className="btn btn-secondary"
            value={settings.fontFamily}
            onChange={(e) => updateSettings({ fontFamily: e.target.value })}
            style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.9rem' }}
          >
            {fonts.map(f => (
              <option key={f.name} value={f.name}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Taille Texte */}
        <div className="control-group">
          <label className="control-label">
            <span>Taille Texte</span>
            <span>{settings.fontSize}px</span>
          </label>
          <input
            type="range"
            min="18"
            max="36"
            step="1"
            className="range-slider"
            value={settings.fontSize}
            onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
          />
        </div>

        {/* Espacement Lettres */}
        <div className="control-group">
          <label className="control-label">
            <span>Espacement Lettres</span>
            <span>{settings.letterSpacing}px</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="3.5"
            step="0.1"
            className="range-slider"
            value={settings.letterSpacing}
            onChange={(e) => updateSettings({ letterSpacing: Number(e.target.value) })}
          />
        </div>

        {/* Interlignage */}
        <div className="control-group">
          <label className="control-label">
            <span><Space size={14} /> Interlignage</span>
            <span>{settings.lineSpacing}</span>
          </label>
          <input
            type="range"
            min="1.2"
            max="2.5"
            step="0.1"
            className="range-slider"
            value={settings.lineSpacing}
            onChange={(e) => updateSettings({ lineSpacing: Number(e.target.value) })}
          />
        </div>

        {/* Thème de fond */}
        <div className="control-group">
          <label className="control-label">
            <span><Palette size={14} /> Thème de fond</span>
          </label>
          <div className="theme-presets">
            {themePresets.map(preset => (
              <button
                key={preset.id}
                className={`theme-swatch ${settings.themePreset === preset.id ? 'active' : ''}`}
                style={{ backgroundColor: preset.bg }}
                title={preset.name}
                onClick={() => updateSettings({ themePreset: preset.id })}
              />
            ))}
          </div>
        </div>

        {/* Options visuelles & Son */}
        <div className="control-group">
          <label className="control-label">
            <span><Eye size={14} /> Aides & Sons</span>
          </label>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              className={`btn ${settings.showRuler ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
              onClick={() => updateSettings({ showRuler: !settings.showRuler })}
              title="Afficher/Masquer la règle de suivi"
            >
              📏 Règle
            </button>
            <button
              className={`btn ${settings.colorizeSyllables ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
              onClick={() => updateSettings({ colorizeSyllables: !settings.colorizeSyllables })}
              title="Coloration dynamique des syllabes"
            >
              🎨 Syllabes
            </button>
            <button
              className={`btn ${settings.soundEffects ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
              onClick={toggleAudioSounds}
              title="Effets sonores synthétisés"
            >
              {settings.soundEffects ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
