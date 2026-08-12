// ============================================================
// gameData.js — Données des 3 jeux éducatifs IZAIA Lire+
// ============================================================

// ─── 1. SYLLABE SNAP ─────────────────────────────────────────
// L'enfant voit un mot et doit taper sur la syllabe cible affichée
export const SYLLABLE_SNAP_LEVELS = [
  {
    id: 'level_1',
    label: 'Niveau 1 — Syllabes Simples',
    emoji: '🐱',
    color: '#3B82F6',
    rounds: [
      { word: 'MA-MA-N', target: 'MA', distractors: ['MO', 'ME', 'MI'] },
      { word: 'PA-PA', target: 'PA', distractors: ['PO', 'PI', 'PU'] },
      { word: 'SO-LEIL', target: 'SO', distractors: ['SA', 'SI', 'SE'] },
      { word: 'GA-TEAU', target: 'GA', distractors: ['GO', 'GU', 'GI'] },
      { word: 'RA-DIS', target: 'RA', distractors: ['RO', 'RE', 'RU'] },
      { word: 'LU-NE', target: 'LU', distractors: ['LA', 'LO', 'LE'] },
    ]
  },
  {
    id: 'level_2',
    label: 'Niveau 2 — Confusions b/d et p/q',
    emoji: '🦁',
    color: '#F97316',
    rounds: [
      { word: 'BA-NAL', target: 'BA', distractors: ['DA', 'PA', 'BU'] },
      { word: 'BON-BON', target: 'BON', distractors: ['DON', 'PON', 'SON'] },
      { word: 'DU-PLE', target: 'DU', distractors: ['BU', 'PU', 'DI'] },
      { word: 'PI-LON', target: 'PI', distractors: ['BI', 'DI', 'PO'] },
      { word: 'BOU-LET', target: 'BOU', distractors: ['DOU', 'POU', 'PU'] },
      { word: 'PE-TIT', target: 'PE', distractors: ['BE', 'DE', 'PI'] },
    ]
  },
  {
    id: 'level_3',
    label: 'Niveau 3 — Syllabes Complexes',
    emoji: '🦅',
    color: '#8B5CF6',
    rounds: [
      { word: 'CHOU-FLEUR', target: 'CHOU', distractors: ['CHAT', 'CHON', 'CHAI'] },
      { word: 'TRAIN-BLAN', target: 'TRAIN', distractors: ['TRON', 'TRIN', 'TRAN'] },
      { word: 'PLUIE-TORT', target: 'PLUIE', distractors: ['PLUME', 'PLUME', 'PLAIE'] },
      { word: 'DROIT-UNE', target: 'DROIT', distractors: ['DROS', 'DROI', 'DRAIS'] },
      { word: 'FEUIL-LE', target: 'FEUIL', distractors: ['FEUILLE', 'FEULE', 'FLEUR'] },
      { word: 'OEUF-BLANC', target: 'OEUF', distractors: ['EUX', 'OEIL', 'COEUR'] },
    ]
  }
];

// ─── 2. MOT-IMAGE MATCH ──────────────────────────────────────
// L'enfant associe un mot écrit à son image emoji
export const WORD_IMAGE_LEVELS = [
  {
    id: 'wi_1',
    label: 'Famille & Maison',
    emoji: '🏠',
    color: '#10B981',
    pairs: [
      { word: 'CHAT', image: '🐱', distractors: ['🐶', '🐸', '🐰', '🦊'] },
      { word: 'CHIEN', image: '🐶', distractors: ['🐱', '🐸', '🐰', '🦊'] },
      { word: 'MAISON', image: '🏠', distractors: ['🏫', '⛺', '🏰', '🏢'] },
      { word: 'SOLEIL', image: '☀️', distractors: ['🌙', '⭐', '🌧️', '❄️'] },
      { word: 'POMME', image: '🍎', distractors: ['🍊', '🍋', '🍇', '🍓'] },
      { word: 'VOITURE', image: '🚗', distractors: ['🚌', '🚂', '✈️', '🚲'] },
      { word: 'ARBRE', image: '🌳', distractors: ['🌺', '🍄', '🌵', '🌻'] },
      { word: 'LIVRE', image: '📚', distractors: ['✏️', '🖊️', '📝', '🎨'] },
    ]
  },
  {
    id: 'wi_2',
    label: 'Nature & Animaux',
    emoji: '🌿',
    color: '#059669',
    pairs: [
      { word: 'LION', image: '🦁', distractors: ['🐘', '🦒', '🦓', '🐆'] },
      { word: 'ÉLÉPHANT', image: '🐘', distractors: ['🦁', '🦒', '🦓', '🦔'] },
      { word: 'PAPILLON', image: '🦋', distractors: ['🐝', '🐛', '🐞', '🐜'] },
      { word: 'GIRAFE', image: '🦒', distractors: ['🦁', '🐘', '🦓', '🐒'] },
      { word: 'FLEUR', image: '🌸', distractors: ['🌿', '🍀', '🌵', '🌻'] },
      { word: 'MONTAGNE', image: '🏔️', distractors: ['🌊', '🏜️', '🌾', '🌲'] },
    ]
  },
  {
    id: 'wi_3',
    label: 'École & Apprentissage',
    emoji: '🎒',
    color: '#6366F1',
    pairs: [
      { word: 'CRAYON', image: '✏️', distractors: ['🖊️', '📏', '📐', '✂️'] },
      { word: 'RÈGLE', image: '📏', distractors: ['✏️', '📐', '✂️', '🖊️'] },
      { word: 'CAHIER', image: '📓', distractors: ['📚', '📒', '📝', '📌'] },
      { word: 'SAC', image: '🎒', distractors: ['👜', '💼', '🛍️', '🧳'] },
      { word: 'GLOBE', image: '🌍', distractors: ['🌙', '⭐', '🌞', '🌈'] },
      { word: 'DIPLÔME', image: '🎓', distractors: ['🏆', '🥇', '⭐', '🌟'] },
    ]
  }
];

// ─── 3. RYTHME DE LECTURE ────────────────────────────────────
// L'enfant doit mémoriser et reconstituer l'ordre de mots/phrases
export const RHYTHM_LEVELS = [
  {
    id: 'rh_1',
    label: 'Rythme des Mots',
    emoji: '🎵',
    color: '#EC4899',
    description: 'Mémorise les mots dans l\'ordre et retrouve-les !',
    sequences: [
      { words: ['chat', 'soleil', 'lune'], hint: '🐱 ☀️ 🌙' },
      { words: ['maison', 'jardin', 'fleur'], hint: '🏠 🌿 🌸' },
      { words: ['école', 'livre', 'crayon'], hint: '🏫 📚 ✏️' },
      { words: ['nuage', 'pluie', 'arc-en-ciel'], hint: '☁️ 🌧️ 🌈' },
      { words: ['train', 'gare', 'voyage'], hint: '🚂 🏚️ 🧳' },
    ]
  },
  {
    id: 'rh_2',
    label: 'Rythme des Phrases',
    emoji: '🎶',
    color: '#F59E0B',
    description: 'Remets les mots dans le bon ordre pour former une phrase !',
    sequences: [
      { words: ['Le', 'chat', 'dort', 'bien'], hint: '💤' },
      { words: ['Il', 'fait', 'beau', 'aujourd\'hui'], hint: '☀️' },
      { words: ['J\'aime', 'lire', 'des', 'histoires'], hint: '📚' },
      { words: ['Les', 'oiseaux', 'chantent', 'le', 'matin'], hint: '🐦' },
      { words: ['Ma', 'maman', 'fait', 'un', 'gâteau'], hint: '🎂' },
    ]
  },
  {
    id: 'rh_3',
    label: 'Rythme Syllabique',
    emoji: '🥁',
    color: '#EF4444',
    description: 'Clique sur les syllabes dans le bon ordre !',
    sequences: [
      { words: ['pa', 'pi', 'lon'], hint: '🦋 pa-pi-lon' },
      { words: ['ma', 'ri', 'on', 'nette'], hint: '🎭 ma-ri-on-nette' },
      { words: ['é', 'lé', 'phant'], hint: '🐘 é-lé-phant' },
      { words: ['ca', 'rotte'], hint: '🥕 ca-rotte' },
      { words: ['bi', 'cy', 'clette'], hint: '🚲 bi-cy-clette' },
    ]
  }
];

// ─── SYSTÈME DE RÉCOMPENSES ──────────────────────────────────
export const BADGES = [
  { id: 'first_game', emoji: '🌟', label: 'Premier Jeu !', condition: 'Terminer un premier jeu', color: '#F59E0B' },
  { id: 'syllable_master', emoji: '🔤', label: 'Maître des Syllabes', condition: '5 rondes parfaites en Syllabe Snap', color: '#3B82F6' },
  { id: 'word_wizard', emoji: '🧙', label: 'Magicien des Mots', condition: 'Compléter Mot-Image niveau 2', color: '#10B981' },
  { id: 'rhythm_king', emoji: '🥁', label: 'Roi du Rythme', condition: 'Score parfait en Rythme', color: '#EC4899' },
  { id: 'speed_demon', emoji: '⚡', label: 'Éclair de Vitesse', condition: 'Répondre en moins de 2s', color: '#F97316' },
  { id: 'no_mistake', emoji: '💎', label: 'Sans Faute !', condition: '0 erreur sur toute une session', color: '#8B5CF6' },
  { id: 'champion', emoji: '🏆', label: 'Champion IZAIA', condition: 'Obtenir les 5 autres badges', color: '#D97706' },
];
