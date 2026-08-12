import React, { useState, useEffect } from 'react';
import { BookOpen, Zap, Award, Lock, Sliders, Sparkles, Gamepad2, Mic, Cloud, CloudOff, User, Edit3 } from 'lucide-react';
import { cloudSyncService } from '../services/cloudSyncService';

export function Navbar({ activeTab, setActiveTab, profile, toggleAccessibility, openPinModal, onEditProfile }) {
  const [cloudState, setCloudState] = useState({
    isOnline: cloudSyncService.isOnline,
    syncStatus: cloudSyncService.syncStatus
  });

  useEffect(() => {
    const unsubscribe = cloudSyncService.subscribe((state) => {
      setCloudState(state);
    });
    return unsubscribe;
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-content">
        <div className="brand-logo" onClick={() => setActiveTab('mission')}>
          <span>IZAIA Lire+</span>
          <span className="brand-badge">ÉLITE</span>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-button ${activeTab === 'mission' ? 'active' : ''}`}
            onClick={() => setActiveTab('mission')}
          >
            <Sparkles size={18} />
            <span>Mission du Jour</span>
          </button>

          <button
            className={`nav-button ${activeTab === 'reader' ? 'active' : ''}`}
            onClick={() => setActiveTab('reader')}
          >
            <BookOpen size={18} />
            <span>Lecteur Assisté</span>
          </button>

          <button
            className={`nav-button ${activeTab === 'vocal' ? 'active' : ''}`}
            onClick={() => setActiveTab('vocal')}
            style={activeTab === 'vocal' ? {} : { color: '#059669' }}
          >
            <Mic size={18} />
            <span>Voix Haute</span>
          </button>

          <button
            className={`nav-button ${activeTab === 'speed' ? 'active' : ''}`}
            onClick={() => setActiveTab('speed')}
          >
            <Zap size={18} />
            <span>Vitesse & Pacer</span>
          </button>

          <button
            className={`nav-button ${activeTab === 'games' ? 'active' : ''}`}
            onClick={() => setActiveTab('games')}
            style={activeTab === 'games' ? {} : { color: '#7C3AED' }}
          >
            <Gamepad2 size={18} />
            <span>Jeux Éducatifs</span>
          </button>

          <button
            className={`nav-button ${activeTab === 'parent' ? 'active' : ''}`}
            onClick={openPinModal}
          >
            <Lock size={18} />
            <span>Espace Parent</span>
          </button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {/* Child Profile Button / Edit Name */}
          <button
            className="btn btn-secondary"
            onClick={onEditProfile}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.88rem', gap: '0.4rem', background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}
            title="Cliquez pour changer le prénom de l'enfant"
          >
            <User size={16} />
            <span style={{ fontWeight: 700 }}>{profile?.firstName || 'Élève'}</span>
            <Edit3 size={14} style={{ opacity: 0.7 }} />
          </button>

          {/* Cloud Sync Status Indicator */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: cloudState.isOnline ? '#10B981' : '#64748B', fontWeight: 600, background: '#F8FAFC', padding: '0.35rem 0.7rem', borderRadius: '99px', border: '1px solid #E2E8F0' }}
            title={cloudState.isOnline ? 'Synchronisation Cloud Active' : 'Mode Hors-Ligne (Stockage Local)'}
          >
            {cloudState.isOnline ? <Cloud size={15} color="#10B981" /> : <CloudOff size={15} color="#64748B" />}
            <span>{cloudState.isOnline ? 'Cloud Sync' : 'Hors-Ligne'}</span>
          </div>

          <div className="stars-chip">
            <Award size={18} color="#D97706" />
            <span>{profile?.stars || 0} ⭐</span>
          </div>

          <button
            className="btn btn-secondary"
            style={{ padding: '0.5rem 0.8rem', borderRadius: '50%' }}
            onClick={toggleAccessibility}
            title="Ajustements Dyslexie (Police, taille, couleurs, règle)"
          >
            <Sliders size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
