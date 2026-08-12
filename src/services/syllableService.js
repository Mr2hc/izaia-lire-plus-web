/**
 * Moteur de segmentation et coloration syllabique avancée pour le français (Dyslexie)
 */

const VOWELS = ['a', 'e', 'i', 'o', 'u', 'y', 'é', 'è', 'ê', 'ë', 'à', 'â', 'î', 'ï', 'ô', 'û', 'ù'];

export function splitIntoSyllables(word) {
  if (!word || word.length <= 3) return [word];

  const lower = word.toLowerCase();
  const syllables = [];
  let current = '';

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const isVowel = VOWELS.includes(lower[i]);
    current += char;

    if (isVowel) {
      const nextChar = lower[i + 1];
      const nextNextChar = lower[i + 2];

      if (nextChar && !VOWELS.includes(nextChar)) {
        if (nextNextChar && !VOWELS.includes(nextNextChar)) {
          current += word[i + 1];
          i++;
        }
      }
      syllables.push(current);
      current = '';
    }
  }

  if (current) {
    if (syllables.length > 0) {
      syllables[syllables.length - 1] += current;
    } else {
      syllables.push(current);
    }
  }

  return syllables.length > 0 ? syllables : [word];
}

export function renderColorizedText(text, mode = 'tri') {
  if (!text) return [];

  const words = text.split(/(\s+)/);
  const colorCount = mode === 'dual' ? 2 : 3;

  return words.map((chunk, idx) => {
    if (/^\s+$/.test(chunk)) {
      return { type: 'space', content: chunk, key: idx };
    }
    const syllables = splitIntoSyllables(chunk);
    return {
      type: 'word',
      content: chunk,
      syllables: syllables.map((s, sIdx) => ({
        text: s,
        colorClass: `syllable-${(sIdx % colorCount) + 1}`
      })),
      key: idx
    };
  });
}
