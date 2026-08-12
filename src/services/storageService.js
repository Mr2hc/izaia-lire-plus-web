const KEYS = {
  PROFILE: 'izaia_child_profile',
  RESULTS: 'izaia_exercise_results',
  WPM_STATS: 'izaia_wpm_stats',
  CUSTOM_TEXTS: 'izaia_custom_texts',
  SETTINGS: 'izaia_accessibility_settings',
  GAME_SCORES: 'izaia_game_scores',
  GAME_BADGES: 'izaia_game_badges'
};

const DEFAULT_PROFILE = {
  firstName: 'Lina',
  age: 7,
  level: 'CE1',
  sessionDuration: 10,
  stars: 18,
  badges: ['Débutant Curieux', 'Explorateur des Sons', 'Champion du Flash'],
  parentPin: '1234'
};

const DEFAULT_SETTINGS = {
  fontFamily: 'Lexend', // 'Lexend', 'OpenDyslexic', 'Atkinson Hyperlegible', 'Comic Neue', 'Inter'
  fontSize: 22,
  letterSpacing: 1.2,
  lineSpacing: 1.6,
  wordSpacing: 4.0,
  paragraphSpacing: 1.5,
  themePreset: 'cream', // white, cream, blue, dark
  highContrast: false,
  showRuler: false,
  colorizeSyllables: false,
  soundEffects: true
};

const DEFAULT_CUSTOM_TEXTS = [
  {
    id: 'text_1',
    title: 'Le chat et le petit souriceau',
    category: 'Lecture plaisir',
    content: 'Lina observe le chat gris dans le jardin. Le petit chat saute doucement au-dessus de l\'herbe verte. Il cherche son jouet préféré.'
  },
  {
    id: 'text_2',
    title: 'La promenade dans la forêt',
    category: 'Devoir école',
    content: 'Aujourd\'hui, nous nous promenons sous les grands arbres. Les feuilles dorées tombent doucement avec le vent d\'automne.'
  }
];

class StorageService {
  getProfile() {
    const raw = localStorage.getItem(KEYS.PROFILE);
    return raw ? JSON.parse(raw) : DEFAULT_PROFILE;
  }

  saveProfile(profile) {
    const current = this.getProfile();
    const updated = { ...current, ...profile };
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(updated));
    return updated;
  }

  updateParentPin(newPin) {
    const profile = this.getProfile();
    profile.parentPin = newPin;
    this.saveProfile(profile);
    return newPin;
  }

  addStars(count) {
    const profile = this.getProfile();
    profile.stars = (profile.stars || 0) + count;
    this.saveProfile(profile);
    return profile.stars;
  }

  addBadge(badgeName) {
    const profile = this.getProfile();
    if (!profile.badges) profile.badges = [];
    if (!profile.badges.includes(badgeName)) {
      profile.badges.push(badgeName);
      this.saveProfile(profile);
    }
  }

  getSettings() {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
  }

  saveSettings(settings) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  }

  getAllResults() {
    const raw = localStorage.getItem(KEYS.RESULTS);
    return raw ? JSON.parse(raw) : [];
  }

  saveResult(result) {
    const results = this.getAllResults();
    results.push({ ...result, timestamp: new Date().toISOString() });
    localStorage.setItem(KEYS.RESULTS, JSON.stringify(results));
  }

  getFrequentErrors() {
    const results = this.getAllResults();
    const counts = {};
    results.forEach(r => {
      if (!r.isCorrect && r.errorTags) {
        r.errorTags.forEach(tag => {
          counts[tag] = (counts[tag] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }

  getWpmHistory() {
    const raw = localStorage.getItem(KEYS.WPM_STATS);
    return raw ? JSON.parse(raw) : [
      { date: 'S1', wpm: 45 },
      { date: 'S2', wpm: 52 },
      { date: 'S3', wpm: 60 },
      { date: 'S4', wpm: 68 },
      { date: 'S5', wpm: 75 }
    ];
  }

  saveWpmRecord(wpm) {
    const history = this.getWpmHistory();
    const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    history.push({ date: today, wpm });
    localStorage.setItem(KEYS.WPM_STATS, JSON.stringify(history.slice(-12))); // keep last 12
  }

  getCustomTexts() {
    const raw = localStorage.getItem(KEYS.CUSTOM_TEXTS);
    return raw ? JSON.parse(raw) : DEFAULT_CUSTOM_TEXTS;
  }

  saveCustomText(title, content, category = 'Devoir') {
    const texts = this.getCustomTexts();
    const newText = { id: `text_${Date.now()}`, title, content, category };
    texts.unshift(newText);
    localStorage.setItem(KEYS.CUSTOM_TEXTS, JSON.stringify(texts));
    return texts;
  }

  deleteCustomText(id) {
    const texts = this.getCustomTexts().filter(t => t.id !== id);
    localStorage.setItem(KEYS.CUSTOM_TEXTS, JSON.stringify(texts));
    return texts;
  }

  // --- Clinical Export & Import for Speech Therapists / Parents ---
  exportUserDataJSON() {
    const bundle = {
      app: 'IZAIA_Lire_Plus_Elite',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      settings: this.getSettings(),
      results: this.getAllResults(),
      wpmHistory: this.getWpmHistory(),
      customTexts: this.getCustomTexts()
    };
    return JSON.stringify(bundle, null, 2);
  }

  importUserDataJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profile) localStorage.setItem(KEYS.PROFILE, JSON.stringify(parsed.profile));
      if (parsed.settings) localStorage.setItem(KEYS.SETTINGS, JSON.stringify(parsed.settings));
      if (parsed.results) localStorage.setItem(KEYS.RESULTS, JSON.stringify(parsed.results));
      if (parsed.wpmHistory) localStorage.setItem(KEYS.WPM_STATS, JSON.stringify(parsed.wpmHistory));
      if (parsed.customTexts) localStorage.setItem(KEYS.CUSTOM_TEXTS, JSON.stringify(parsed.customTexts));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // ─── Game Scores & Badges ──────────────────────────────────
  getGameScores() {
    const raw = localStorage.getItem(KEYS.GAME_SCORES);
    return raw ? JSON.parse(raw) : {};
  }

  saveGameScores(scores) {
    localStorage.setItem(KEYS.GAME_SCORES, JSON.stringify(scores));
  }

  getUnlockedBadges() {
    const raw = localStorage.getItem(KEYS.GAME_BADGES);
    return raw ? JSON.parse(raw) : [];
  }

  saveUnlockedBadges(badges) {
    localStorage.setItem(KEYS.GAME_BADGES, JSON.stringify(badges));
  }

  addStars(count) {
    const profile = this.getProfile();
    profile.stars = (profile.stars || 0) + count;
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    return profile.stars;
  }
}

export const storageService = new StorageService();
