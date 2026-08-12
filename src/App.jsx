import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DyslexiaControls } from './components/DyslexiaControls';
import { AssistedReader } from './components/AssistedReader';
import { VocalReader } from './components/VocalReader';
import { SpeedReader } from './components/SpeedReader';
import { ExercisePlayer } from './components/ExercisePlayer';
import { ParentDashboard } from './components/ParentDashboard';
import { GamesHub } from './components/GamesHub';
import { OnboardingModal } from './components/OnboardingModal';
import { storageService } from './services/storageService';
import { soundEffectsService } from './services/soundEffectsService';

export default function App() {
  const [activeTab, setActiveTab] = useState('mission'); // 'mission' | 'reader' | 'vocal' | 'speed' | 'games' | 'parent'
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(storageService.getSettings());
  const [customTexts, setCustomTexts] = useState([]);
  const [showAccessibility, setShowAccessibility] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasCustomProfile = !!localStorage.getItem('izaia_child_profile');
    const loadedProfile = storageService.getProfile();
    setProfile(loadedProfile);

    if (!hasCustomProfile) {
      setShowOnboarding(true);
    }

    const loadedCustomTexts = storageService.getCustomTexts();
    setCustomTexts(loadedCustomTexts);

    soundEffectsService.enabled = settings.soundEffects !== false;
  }, []);

  const updateSettings = (newPartialSettings) => {
    const updated = { ...settings, ...newPartialSettings };
    setSettings(updated);
    storageService.saveSettings(updated);
    if (newPartialSettings.soundEffects !== undefined) {
      soundEffectsService.enabled = newPartialSettings.soundEffects;
    }
  };

  const handleCompleteMission = () => {
    setActiveTab('reader');
    setProfile(storageService.getProfile());
  };

  const handleImportSuccess = () => {
    setProfile(storageService.getProfile());
    setSettings(storageService.getSettings());
    setCustomTexts(storageService.getCustomTexts());
  };

  return (
    <div className="app-container">
      {/* Desktop Ready Status Banner */}
      <div className="desktop-banner">
        <span>💻 IZAIA Lire+ Élite • Mode Web & Bureau Prêt (PWA / Electron)</span>
        <span>Version Clinique 1.0.0</span>
      </div>

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        toggleAccessibility={() => setShowAccessibility(!showAccessibility)}
        openPinModal={() => setActiveTab('parent')}
        onEditProfile={() => setShowOnboarding(true)}
      />

      {/* Accessibility Control Drawer */}
      {showAccessibility && (
        <DyslexiaControls
          settings={settings}
          updateSettings={updateSettings}
        />
      )}

      {/* Main View Area */}
      <main className="main-content">
        {activeTab === 'mission' && (
          <ExercisePlayer
            profile={profile}
            settings={settings}
            onCompleteMission={handleCompleteMission}
          />
        )}

        {activeTab === 'reader' && (
          <AssistedReader
            profile={profile}
            settings={settings}
            customTexts={customTexts}
          />
        )}

        {activeTab === 'vocal' && (
          <VocalReader
            profile={profile}
            settings={settings}
            onStarsUpdate={() => setProfile(storageService.getProfile())}
          />
        )}

        {activeTab === 'speed' && (
          <SpeedReader
            profile={profile}
            settings={settings}
            onCompleteTest={() => setProfile(storageService.getProfile())}
          />
        )}

        {activeTab === 'games' && (
          <GamesHub
            profile={profile}
            settings={settings}
            onStarsUpdate={() => setProfile(storageService.getProfile())}
          />
        )}

        {activeTab === 'parent' && (
          <ParentDashboard
            profile={profile}
            customTexts={customTexts}
            setCustomTexts={setCustomTexts}
            onImportSuccess={handleImportSuccess}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>IZAIA Lire+ Élite &copy; 2026 - Suite éducative d'élite pour rééducation dyslexique & vitesse de lecture.</p>
        <p style={{ marginTop: '0.4rem', fontSize: '0.75rem' }}>Conçu pour une utilisation sur Web, PWA et application de bureau autonome.</p>
      </footer>

      {/* Onboarding / Profile Edit Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onSaveProfile={(p) => setProfile(p)}
        currentProfile={profile}
      />
    </div>
  );
}
