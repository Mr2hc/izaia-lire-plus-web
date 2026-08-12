import React, { useState, useRef } from 'react';
import { Lock, Award, Clock, Activity, AlertTriangle, Plus, Trash2, BookOpen, Download, Upload, Key, Check, Search, FileText, Printer } from 'lucide-react';
import { storageService } from '../services/storageService';
import { soundEffectsService } from '../services/soundEffectsService';
import { generateClinicalPDFReport } from '../services/pdfReportService';

export function ParentDashboard({ profile, customTexts, setCustomTexts, onImportSuccess }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // PIN Changing State
  const [showPinChanger, setShowPinChanger] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinMessage, setPinMessage] = useState('');

  // Custom Text Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Devoir école');
  const [newContent, setNewContent] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const fileInputRef = useRef(null);

  const savedPin = profile?.parentPin || '1234';

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (pinInput === savedPin) {
      setIsAuthenticated(true);
      setPinError('');
      soundEffectsService.playSuccess();
    } else {
      setPinError('Code PIN incorrect. Réessayez.');
      soundEffectsService.playError();
    }
  };

  const handleUpdatePin = (e) => {
    e.preventDefault();
    if (newPin.length >= 4) {
      storageService.updateParentPin(newPin);
      setPinMessage('Code PIN mis à jour avec succès !');
      setNewPin('');
      setTimeout(() => setPinMessage(''), 3000);
    }
  };

  const handleAddText = (e) => {
    e.preventDefault();
    if (newTitle.trim() && newContent.trim()) {
      const updated = storageService.saveCustomText(newTitle.trim(), newContent.trim(), newCategory);
      setCustomTexts(updated);
      setNewTitle('');
      setNewContent('');
      soundEffectsService.playSuccess();
    }
  };

  const handleDeleteText = (id) => {
    const updated = storageService.deleteCustomText(id);
    setCustomTexts(updated);
  };

  // Export Data JSON
  const handleExportJSON = () => {
    const jsonStr = storageService.exportUserDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IZAIA_Bilan_${profile?.firstName || 'Eleve'}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    soundEffectsService.playSuccess();
  };

  // Import Data JSON
  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = storageService.importUserDataJSON(event.target.result);
      if (res.success) {
        alert('Données du dossier élève importées avec succès !');
        if (onImportSuccess) onImportSuccess();
      } else {
        alert('Échec de l\'importation : ' + res.error);
      }
    };
    reader.readAsText(file);
  };

  if (!isAuthenticated) {
    return (
      <div className="card" style={{ maxWidth: '460px', margin: '3rem auto', textAlign: 'center', padding: '2.5rem' }}>
        <div className="stat-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', margin: '0 auto 1.2rem' }}>
          <Lock size={28} />
        </div>

        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-primary-dark)', marginBottom: '0.4rem' }}>
          Espace Sécurisé Parent & Orthophoniste
        </h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Entrez le code PIN (PIN par défaut : <strong>1234</strong>)
        </p>

        <form onSubmit={handleVerifyPin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="password"
            maxLength={6}
            className="btn-secondary"
            style={{ width: '100%', textAlign: 'center', fontSize: '1.6rem', letterSpacing: '0.5em', padding: '0.8rem', borderRadius: 'var(--radius-md)' }}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="••••"
            autoFocus
          />

          {pinError && <p style={{ color: 'var(--color-error)', fontSize: '0.85rem', fontWeight: 600 }}>{pinError}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Accéder au Tableau de Bord
          </button>
        </form>
      </div>
    );
  }

  const frequentErrors = storageService.getFrequentErrors();
  const wpmHistory = storageService.getWpmHistory();
  const latestWpm = wpmHistory.length > 0 ? wpmHistory[wpmHistory.length - 1].wpm : 68;

  const filteredCustomTexts = customTexts.filter(t => 
    t.title.toLowerCase().includes(searchFilter.toLowerCase()) || 
    t.content.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Action Bar for Therapists & Parents */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(135deg, #EFF6FF, #EEF2FF)' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={22} />
            <span>Tableau de Bord Orthophonique & Parent</span>
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
            Suivi des bilans, exportation/importation des dossiers et gestion des textes d'école.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => generateClinicalPDFReport(profile, wpmStats, results, customTexts)} title="Télécharger le bilan clinique officiel imprimable au format PDF">
            <Printer size={16} /> Bilan PDF Imprimable
          </button>

          <button className="btn btn-secondary" onClick={handleExportJSON} title="Télécharger le dossier complet en JSON">
            <Download size={16} /> Exporter JSON
          </button>

          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} title="Importer un dossier élève JSON">
            <Upload size={16} /> Importer Dossier
          </button>
          <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportFile} />

          <button className="btn btn-secondary" onClick={() => setShowPinChanger(!showPinChanger)}>
            <Key size={16} /> PIN
          </button>
        </div>
      </div>

      {/* PIN Changer Modal / Collapsible */}
      {showPinChanger && (
        <div className="card" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
          <h4 style={{ color: '#B45309', marginBottom: '0.6rem' }}>Changer le Code PIN d'accès</h4>
          <form onSubmit={handleUpdatePin} style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <input
              type="password"
              maxLength={6}
              className="btn-secondary"
              placeholder="Nouveau PIN"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              style={{ width: '160px', textAlign: 'center', letterSpacing: '0.2em' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>Enregistrer</button>
            {pinMessage && <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.85rem' }}>{pinMessage}</span>}
          </form>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>
            <Activity size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Vitesse Actuelle (WPM)</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>{latestWpm} <span style={{ fontSize: '1rem' }}>WPM</span></h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-star-gold-light)', color: '#B45309' }}>
            <Award size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Étoiles de Réussite</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#B45309' }}>{profile?.stars || 18} ⭐</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-success-light)', color: '#065F46' }}>
            <Clock size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Temps Pratiqué Cumulé</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#065F46' }}>60 <span style={{ fontSize: '1rem' }}>min</span></h3>
          </div>
        </div>
      </div>

      {/* Errors Analysis & Add Custom Text */}
      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-error)' }}>
            <AlertTriangle size={20} />
            <span>Analyse Clinique des Confusions & Erreurs</span>
          </h3>

          {frequentErrors.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Aucune erreur récurrente détectée. La discrimination visuelle et phonologique est excellente !
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {frequentErrors.map(err => (
                <div key={err.tag} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 1rem', background: 'var(--color-error-light)', borderRadius: 'var(--radius-md)', color: '#991B1B', fontWeight: 600, fontSize: '0.9rem' }}>
                  <span>🏷️ {err.tag}</span>
                  <span>{err.count}x fois</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Custom Text / School Assignment */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-dark)' }}>
            <BookOpen size={20} />
            <span>Importer un Texte d'École ou Devoir</span>
          </h3>

          <form onSubmit={handleAddText} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.6rem' }}>
              <input
                type="text"
                className="btn-secondary"
                placeholder="Titre (ex: Leçon de géographie)"
                style={{ padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-md)' }}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
              <select
                className="btn-secondary"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                style={{ padding: '0.6rem' }}
              >
                <option value="Devoir école">Devoir école</option>
                <option value="Lecture plaisir">Lecture plaisir</option>
                <option value="Exercice orthophonie">Orthophonie</option>
              </select>
            </div>

            <textarea
              className="btn-secondary"
              placeholder="Copiez-collez ici le texte à lire avec les aides dyslexie..."
              style={{ padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-md)', minHeight: '80px', fontFamily: 'inherit' }}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              required
            />

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              <Plus size={18} /> Enregistrer dans la Bibliothèque
            </button>
          </form>
        </div>
      </div>

      {/* Custom Text Library */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText size={20} color="var(--color-primary)" />
            <span>Bibliothèque des Textes Importés ({customTexts.length})</span>
          </h3>

          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="btn-secondary"
              placeholder="Rechercher un texte..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{ paddingLeft: '2rem', width: '100%', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {filteredCustomTexts.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 1rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h4 style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{t.title}</h4>
                  <span style={{ fontSize: '0.75rem', background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                    {t.category || 'Général'}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '540px', marginTop: '0.2rem' }}>
                  {t.content}
                </p>
              </div>

              <button className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--color-error)' }} onClick={() => handleDeleteText(t.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
