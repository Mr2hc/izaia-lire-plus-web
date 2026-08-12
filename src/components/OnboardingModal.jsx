import React, { useState } from 'react';
import { User, Sparkles, Check } from 'lucide-react';
import { storageService } from '../services/storageService';

export function OnboardingModal({ isOpen, onClose, onSaveProfile }) {
  const [name, setName] = useState('Lina');
  const [age, setAge] = useState(7);
  const [level, setLevel] = useState('CE1');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      const profile = storageService.saveProfile({
        firstName: name.trim(),
        age: Number(age),
        level
      });
      onSaveProfile(profile);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div className="stat-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', margin: '0 auto 0.8rem' }}>
            <Sparkles size={32} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--color-primary-dark)' }}>
            Bienvenue sur IZAIA Lire+ !
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Configurez le profil de votre enfant pour adapter les exercices.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label className="control-label" style={{ marginBottom: '0.4rem' }}>Prénom de l'enfant</label>
            <input
              type="text"
              className="btn-secondary"
              style={{ width: '100%', padding: '0.7rem 1rem', fontSize: '1rem', borderRadius: 'var(--radius-md)' }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex : Lina"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="control-label" style={{ marginBottom: '0.4rem' }}>Âge</label>
              <select
                className="btn-secondary"
                style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)' }}
                value={age}
                onChange={(e) => setAge(e.target.value)}
              >
                {[6, 7, 8, 9, 10, 11].map(a => (
                  <option key={a} value={a}>{a} ans</option>
                ))}
              </select>
            </div>

            <div>
              <label className="control-label" style={{ marginBottom: '0.4rem' }}>Niveau Scolaire</label>
              <select
                className="btn-secondary"
                style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)' }}
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                {['CP', 'CE1', 'CE2', 'CM1', 'CM2'].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.8rem' }}>
            Commencer l'Aventure <Check size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
