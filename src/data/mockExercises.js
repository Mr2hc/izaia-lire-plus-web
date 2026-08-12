export const EXERCISES = [
  // J'ÉCOUTE - Discrimination Phonologique (Niveau 1)
  {
    id: 'listen_syllable_ba_pa_001',
    category: 'listening',
    level: 1,
    instruction: 'Écoute bien et choisis la syllabe que tu entends.',
    stimulusText: 'ba',
    options: ['ba', 'pa', 'da', 'ta'],
    expectedAnswer: 'ba',
    targetSkill: 'phonological_discrimination',
    errorTags: ['confusion_b_p', 'confusion_b_d']
  },
  {
    id: 'listen_syllable_pa_ba_002',
    category: 'listening',
    level: 1,
    instruction: 'Écoute et trouve la bonne syllabe.',
    stimulusText: 'pa',
    options: ['pa', 'ba', 'ta', 'da'],
    expectedAnswer: 'pa',
    targetSkill: 'phonological_discrimination',
    errorTags: ['confusion_p_b', 'confusion_p_t']
  },
  {
    id: 'listen_rime_an_003',
    category: 'listening',
    level: 1,
    instruction: 'Écoute le mot et choisis celui qui rime.',
    stimulusText: 'ballon',
    options: ['mouton', 'lapin', 'maison', 'camion'],
    expectedAnswer: 'mouton',
    targetSkill: 'rhyme_recognition',
    errorTags: ['confusion_rime_fausse']
  },
  {
    id: 'listen_syllable_fo_to_004',
    category: 'listening',
    level: 1,
    instruction: 'Quelle syllabe entends-tu ?',
    stimulusText: 'fo',
    options: ['fo', 'to', 'po', 'bo'],
    expectedAnswer: 'fo',
    targetSkill: 'phonological_discrimination',
    errorTags: ['confusion_f_t', 'confusion_f_p']
  },
  {
    id: 'listen_syllable_ch_j_006',
    category: 'listening',
    level: 2,
    instruction: 'Écoute et choisis le son que tu entends.',
    stimulusText: 'ch',
    options: ['ch', 'j', 's', 'g'],
    expectedAnswer: 'ch',
    targetSkill: 'phonological_discrimination',
    errorTags: ['confusion_ch_j', 'confusion_ch_s']
  },
  {
    id: 'listen_comptage_syllabes_007',
    category: 'listening',
    level: 2,
    instruction: 'Combien de syllabes entends-tu dans ce mot ?',
    stimulusText: 'cahier',
    options: ['2', '1', '3', '4'],
    expectedAnswer: '2',
    targetSkill: 'syllable_counting',
    errorTags: ['erreur_comptage_syllabes']
  },

  // JE LIS - Déchiffrage & Compréhension (Niveau 1 à 3)
  {
    id: 'read_syllable_ma_008',
    category: 'reading',
    level: 1,
    instruction: 'Lis la syllabe et choisis la bonne.',
    stimulusText: 'ma',
    options: ['ma', 'mo', 'me', 'mi'],
    expectedAnswer: 'ma',
    targetSkill: 'syllable_decoding',
    errorTags: ['confusion_voyelle']
  },
  {
    id: 'read_syllable_ri_009',
    category: 'reading',
    level: 1,
    instruction: 'Quelle syllabe est écrite ?',
    stimulusText: 'ri',
    options: ['ri', 'ra', 'ru', 're'],
    expectedAnswer: 'ri',
    targetSkill: 'syllable_decoding',
    errorTags: ['confusion_voyelle_i_a_u_e']
  },
  {
    id: 'read_word_lapin_010',
    category: 'reading',
    level: 1,
    instruction: 'Lis le mot et choisis le bon mot identique.',
    stimulusText: 'lapin',
    options: ['lapin', 'papillon', 'lampe', 'lampion'],
    expectedAnswer: 'lapin',
    targetSkill: 'word_recognition',
    errorTags: ['confusion_la_pa', 'confusion_mot_visuel']
  },
  {
    id: 'read_word_maison_012',
    category: 'reading',
    level: 1,
    instruction: 'Lis le mot et choisis la bonne réponse.',
    stimulusText: 'maison',
    options: ['maison', 'mouton', 'maçon', 'mission'],
    expectedAnswer: 'maison',
    targetSkill: 'word_recognition',
    errorTags: ['confusion_maison_mouton']
  },
  {
    id: 'read_word_diff_oignon_013',
    category: 'reading',
    level: 2,
    instruction: 'Quel mot est écrit ?',
    stimulusText: 'oignon',
    options: ['oignon', 'oncle', 'orange', 'oracle'],
    expectedAnswer: 'oignon',
    targetSkill: 'irregular_word_reading',
    errorTags: ['confusion_oi_on', 'confusion_silent_letters']
  },
  {
    id: 'read_phrase_courte_014',
    category: 'reading',
    level: 2,
    instruction: 'Lis la phrase et choisis ce qu\'elle veut dire.',
    stimulusText: 'Lina lit un mot.',
    options: [
      'Une fille lit.',
      'Un garçon court.',
      'Un chien dort.',
      'Une fille chante.'
    ],
    expectedAnswer: 'Une fille lit.',
    targetSkill: 'sentence_comprehension',
    errorTags: ['erreur_comprehension_phrase']
  },
  {
    id: 'read_word_homophone_015',
    category: 'reading',
    level: 3,
    instruction: 'Lequel veut dire "un petit cours d\'eau" ?',
    stimulusText: 'ru / rue',
    options: ['ru', 'rue'],
    expectedAnswer: 'ru',
    targetSkill: 'homophone_distinction',
    errorTags: ['confusion_homophones_ru_rue']
  },

  // VITESSE & STROBOSCOPIE (Niveau 2 à 4)
  {
    id: 'speed_flash_001',
    category: 'speed',
    level: 2,
    instruction: 'Lis rapidement le mot qui a flashé à l\'écran.',
    stimulusText: 'chocolat',
    options: ['chocolat', 'chocolatin', 'chocotte', 'chocolaterie'],
    expectedAnswer: 'chocolat',
    targetSkill: 'rapid_visual_recognition',
    errorTags: ['déchiffrage_lent']
  },
  {
    id: 'speed_flash_002',
    category: 'speed',
    level: 3,
    instruction: 'Quel mot est apparu en un éclair ?',
    stimulusText: 'ordinateur',
    options: ['ordinateur', 'ordinaire', 'ordonnance', 'ordonner'],
    expectedAnswer: 'ordinateur',
    targetSkill: 'rapid_visual_recognition',
    errorTags: ['voie_adressage_deficiente']
  }
];

export function getDailyMission(level = 'CE1', count = 5) {
  const numericLevel = level === 'CP' ? 1 : level === 'CE1' ? 2 : level === 'CE2' ? 3 : level === 'CM1' ? 4 : 5;
  const filtered = EXERCISES.filter(e => e.level <= numericLevel);
  if (filtered.length <= count) return filtered;
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
