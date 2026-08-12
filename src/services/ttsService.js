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

  // Pre-process text to remove Gutenberg/BeQ headers, ISBNs, page numbers & code artifacts
  cleanTextForSpeech(text) {
    if (!text) return '';
    return text
      // Remove BeQ / Gutenberg headers
      .replace(/Les fables de Jean de La Fontaine BeQ \d+/gi, '')
      .replace(/La Bibliothèque électronique du Québec/gi, '')
      .replace(/Collection À tous les vents Volume \d+ : version \d+\.\d+ \d+/gi, '')
      // Remove bracketed numbers like [1], [p. 12]
      .replace(/\[\d+\]/g, '')
      // Remove multiple spaces and newlines
      .replace(/\s+/g, ' ')
      .trim();
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

    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onboundary = (event) => {
      if (this.fallbackTimer) {
        clearInterval(this.fallbackTimer);
        this.fallbackTimer = null;
      }
      if (event.name === 'word' && this.onBoundaryHandler) {
        this.onBoundaryHandler(event.charIndex, event.charLength);
      }
    };

    // Fallback timer for online browser voices that don't emit boundary events
    if (this.fallbackTimer) clearInterval(this.fallbackTimer);
    let charAcc = 0;
    const wordsList = cleanedText.split(/\s+/);
    let wordIdx = 0;
    const intervalMs = Math.max(180, (60000 / 150) / rate); // ~150 WPM default adjusted by rate

    this.fallbackTimer = setInterval(() => {
      if (!this.isSpeaking || wordIdx >= wordsList.length) {
        clearInterval(this.fallbackTimer);
        this.fallbackTimer = null;
        return;
      }
      if (this.onBoundaryHandler) {
        this.onBoundaryHandler(charAcc, wordsList[wordIdx].length);
      }
      charAcc += wordsList[wordIdx].length + 1;
      wordIdx++;
    }, intervalMs);

    utterance.onend = () => {
      if (this.fallbackTimer) {
        clearInterval(this.fallbackTimer);
        this.fallbackTimer = null;
      }
      this.isSpeaking = false;
      if (this.onEndHandler) {
        this.onEndHandler();
      }
    };

    utterance.onerror = (err) => {
      console.error('TTS Error:', err);
      if (this.fallbackTimer) {
        clearInterval(this.fallbackTimer);
        this.fallbackTimer = null;
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
    if (this.fallbackTimer) {
      clearInterval(this.fallbackTimer);
      this.fallbackTimer = null;
    }
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }
}

export const ttsService = new TtsService();
