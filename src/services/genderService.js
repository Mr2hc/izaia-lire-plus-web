/**
 * genderService.js — Moteur de détection du genre et d'adaptation grammaticale
 * pour les prénoms d'enfants (Féminin / Masculin).
 */

const FEMININE_NAMES = new Set([
  'lina', 'izaia', 'izaya', 'léa', 'lea', 'emma', 'chloé', 'chloe', 'sarah', 'sara',
  'manon', 'jade', 'inès', 'ines', 'camille', 'lola', 'zoé', 'zoe', 'eva', 'rose',
  'alice', 'juliette', 'lou', 'mia', 'louna', 'romane', 'lucie', 'charlotte', 'agathe',
  'clara', 'margarita', 'sophie', 'marie', 'elena', 'victoria', 'anaba'
]);

const MASCULINE_NAMES = new Set([
  'léo', 'leo', 'gabriel', 'raphaël', 'raphael', 'hugo', 'lucas', 'arthur', 'jules',
  'adam', 'maël', 'mael', 'louis', 'liam', 'ethan', 'paul', 'nathan', 'tom', 'théo', 'theo',
  'noah', 'mathis', 'antoine', 'maxence', 'victor', 'sacha', 'enzo', 'brice', 'eric',
  'roland', 'alexandre', 'clement', 'clément', 'thomas', 'samuel', 'david', 'yannis', 'yanis'
]);

export function detectGender(firstName, explicitGender = null) {
  if (explicitGender === 'f' || explicitGender === 'm') {
    return explicitGender;
  }
  if (!firstName) return 'f';
  const clean = firstName.trim().toLowerCase();

  if (MASCULINE_NAMES.has(clean)) return 'm';
  if (FEMININE_NAMES.has(clean)) return 'f';

  // Heuristique prénom français : terminaison a, ine, ette, elle -> Féminin
  if (clean.endsWith('a') || clean.endsWith('ine') || clean.endsWith('ette') || clean.endsWith('elle')) {
    return 'f';
  }
  // Terminaison o, os, is, an, en, el, os, ik -> Masculin
  if (clean.endsWith('o') || clean.endsWith('an') || clean.endsWith('en') || clean.endsWith('el') || clean.endsWith('is')) {
    return 'm';
  }
  return 'f';
}

export function formatChildName(name) {
  if (!name) return 'Izaia';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

export function adaptGrammarForChild(text, childName = 'Izaia', explicitGender = null) {
  if (!text) return '';
  const name = formatChildName(childName);
  const gender = detectGender(name, explicitGender);
  const isFem = gender === 'f';

  let adapted = text.replace(/\bLina\b/gi, name);

  if (isFem) {
    adapted = adapted
      .replace(/\bun garçon\b/gi, 'une fille')
      .replace(/\ble garçon\b/gi, 'la fille')
      .replace(/\bil\b/g, 'elle')
      .replace(/\bIl\b/g, 'Elle')
      .replace(/\bseul\b/gi, 'seule')
      .replace(/\bcontent\b/gi, 'contente')
      .replace(/\bcurieux\b/gi, 'curieuse')
      .replace(/\bheureux\b/gi, 'heureuse')
      .replace(/\bprêt\b/gi, 'prête')
      .replace(/\bchampion\b/gi, 'championne')
      .replace(/\blecteur\b/gi, 'lectrice');
  } else {
    adapted = adapted
      .replace(/\bune fille\b/gi, 'un garçon')
      .replace(/\bla fille\b/gi, 'le garçon')
      .replace(/\belle\b/g, 'il')
      .replace(/\bElle\b/g, 'Il')
      .replace(/\bseule\b/gi, 'seul')
      .replace(/\bcontente\b/gi, 'content')
      .replace(/\bcurieuse\b/gi, 'curieux')
      .replace(/\bheureuse\b/gi, 'heureux')
      .replace(/\bprête\b/gi, 'prêt')
      .replace(/\bchampionne\b/gi, 'champion')
      .replace(/\blectrice\b/gi, 'lecteur');
  }

  return adapted;
}
