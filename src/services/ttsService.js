class TtsService {
  constructor() {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.voices = [];
    this.frenchVoices = [];
    this.selectedVoiceURI = null;
    this.onBoundaryHandler = null;
    this.onEndHandler = null;
    this.isSpeaking = false;

    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  isSupported() {
    return !!this.synth;
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();

    // Filter and score French voices by quality
    const fr = this.voices.filter(v => v.lang.toLowerCase().startsWith('fr') || v.lang.toLowerCase() === 'fr_fr');

    // Score higher natural / neural / online / high quality voices
    fr.sort((a, b) => {
      const getScore = (v) => {
        const name = v.name.toLowerCase();
        let score = 0;
        if (name.includes('natural') || name.includes('naturel')) score += 100;
        if (name.includes('online') || name.includes('en ligne')) score += 80;
        if (name.includes('google')) score += 60;
        if (name.includes('premium') || name.includes('enhanced')) score += 50;
        if (name.includes('denise') || name.includes('henri') || name.includes('audrey') || name.includes('thomas')) score += 40;
        if (v.localService === false) score += 30; // Browser cloud natural voice
        return score;
      };
      return getScore(b) - getScore(a);
    });

    this.frenchVoices = fr;
  }

  getFrenchVoices() {
    if (this.frenchVoices.length === 0) {
      this.loadVoices();
    }
    return this.frenchVoices;
  }

  setVoice(voiceURI) {
    this.selectedVoiceURI = voiceURI;
  }

  setBoundaryHandler(handler) {
    this.onBoundaryHandler = handler;
  }

  setEndHandler(handler) {
    this.onEndHandler = handler;
  }

  // Pre-process text to remove headers, page numbers & prevent spelling of uppercase words
  cleanTextForSpeech(text) {
    if (!text) return '';
    let cleaned = text
      // Remove BeQ / Gutenberg headers
      .replace(/Les fables de Jean de La Fontaine BeQ \d+/gi, '')
      .replace(/La Bibliothèque électronique du Québec/gi, '')
      .replace(/Collection À tous les vents Volume \d+ : version \d+\.\d+ \d+/gi, '')
      // Remove bracketed numbers like [1], [p. 12]
      .replace(/\[\d+\]/g, '')
      // Remove multiple spaces and newlines
      .replace(/\s+/g, ' ')
      .trim();

    // Convert ALL-CAPS words (like IZAIA, LINA, CE1) to Titlecase/lowercase so Web Speech API doesn't spell them out
    cleaned = cleaned.replace(/\b[A-ZÀÂÉÈÊËÎÏÔÛÙY]{2,}\b/g, (match) => {
      return match.charAt(0) + match.slice(1).toLowerCase();
    });

    return cleaned;
  }

  speak(text, options = {}) {
    if (!this.synth) return;

    this.stop();

    const cleanedText = this.cleanTextForSpeech(text);
    if (!cleanedText) return;

    const rate = options.rate || 0.85;
    const pitch = options.pitch || 1.0;

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = 'fr-FR';

    // Pick user selected voice or best scored natural voice
    let voiceToUse = null;
    if (options.voiceURI) {
      voiceToUse = this.voices.find(v => v.voiceURI === options.voiceURI);
    } else if (this.selectedVoiceURI) {
      voiceToUse = this.voices.find(v => v.voiceURI === this.selectedVoiceURI);
    }

    if (!voiceToUse && this.frenchVoices.length > 0) {
      voiceToUse = this.frenchVoices[0];
    }

    if (voiceToUse) {
      utterance.voice = voiceToUse;
    }

    let hasNativeBoundary = false;

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        hasNativeBoundary = true;
        if (this.fallbackTimeout) {
          clearTimeout(this.fallbackTimeout);
          this.fallbackTimeout = null;
        }
        if (this.onBoundaryHandler) {
          this.onBoundaryHandler(event.charIndex, event.charLength || 0);
        }
      }
    };

    // Adaptive Proportional Fallback Engine (proportional to word character length)
    if (this.fallbackTimeout) clearTimeout(this.fallbackTimeout);
    const wordsList = cleanedText.split(/\s+/);
    let charAcc = 0;
    let wordIdx = 0;

    const scheduleNextWord = () => {
      if (!this.isSpeaking || wordIdx >= wordsList.length) return;
      if (hasNativeBoundary) return; // Native browser speech boundary is active, no fallback needed

      const currentWord = wordsList[wordIdx];
      if (this.onBoundaryHandler) {
        this.onBoundaryHandler(charAcc, currentWord.length);
      }

      charAcc += currentWord.length + 1;
      wordIdx++;

      if (wordIdx < wordsList.length && !hasNativeBoundary) {
        // Calculate exact word duration based on character count and speech rate
        const baseWpm = 135 * rate;
        const msPerChar = 60000 / (baseWpm * 5.5);
        const duration = Math.max(160, Math.round((currentWord.length + 1) * msPerChar));

        this.fallbackTimeout = setTimeout(scheduleNextWord, duration);
      }
    };

    // Start fallback after 250ms delay if no native boundary event arrived
    this.fallbackTimeout = setTimeout(() => {
      if (!hasNativeBoundary) {
        scheduleNextWord();
      }
    }, 250);

    utterance.onend = () => {
      if (this.fallbackTimeout) {
        clearTimeout(this.fallbackTimeout);
        this.fallbackTimeout = null;
      }
      this.isSpeaking = false;
      if (this.onEndHandler) {
        this.onEndHandler();
      }
    };

    utterance.onerror = (err) => {
      console.error('TTS Error:', err);
      if (this.fallbackTimeout) {
        clearTimeout(this.fallbackTimeout);
        this.fallbackTimeout = null;
      }
      this.isSpeaking = false;
      if (this.onEndHandler) {
        this.onEndHandler();
      }
    };

    this.isSpeaking = true;
    this.synth.speak(utterance);
  }

  stop() {
    if (this.fallbackTimeout) {
      clearTimeout(this.fallbackTimeout);
      this.fallbackTimeout = null;
    }
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }
}

export const ttsService = new TtsService();
