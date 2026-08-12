class TtsService {
  constructor() {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis : null;
    this.voices = [];
    this.frenchVoices = [];
    this.selectedVoiceURI = null;
    this.onBoundaryHandler = null;
    this.onEndHandler = null;
    this.isSpeaking = false;
    this._timers = [];
    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  isSupported() { return !!this.synth; }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    const fr = this.voices.filter(v =>
      v.lang.toLowerCase().startsWith('fr') || v.lang.toLowerCase() === 'fr_fr'
    );
    fr.sort((a, b) => {
      const score = (v) => {
        const n = v.name.toLowerCase();
        let s = 0;
        if (n.includes('natural') || n.includes('naturel')) s += 100;
        if (n.includes('online') || n.includes('en ligne'))  s += 80;
        if (n.includes('google'))                             s += 60;
        if (n.includes('premium') || n.includes('enhanced')) s += 50;
        if (n.includes('denise') || n.includes('thomas') ||
            n.includes('henri') || n.includes('audrey'))    s += 40;
        if (v.localService === false)                        s += 30;
        return s;
      };
      return score(b) - score(a);
    });
    this.frenchVoices = fr;
  }

  getFrenchVoices() {
    if (this.frenchVoices.length === 0) this.loadVoices();
    return this.frenchVoices;
  }

  setVoice(voiceURI) { this.selectedVoiceURI = voiceURI; }
  setBoundaryHandler(handler) { this.onBoundaryHandler = handler; }
  setEndHandler(handler) { this.onEndHandler = handler; }

  _clearTimers() {
    this._timers.forEach(id => clearTimeout(id));
    this._timers = [];
  }

  cleanTextForSpeech(text) {
    if (!text) return '';
    let t = text
      .replace(/Les fables de Jean de La Fontaine BeQ \d+/gi, '')
      .replace(/\[\d+\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    // Eviter l'epellation des mots en majuscules (IZAIA => Izaia)
    t = t.replace(/\b[A-Z]{2,}\b/g, m => m.charAt(0) + m.slice(1).toLowerCase());
    return t;
  }

  speak(text, options = {}) {
    if (!this.synth) return;
    this.stop();
    const cleanedText = this.cleanTextForSpeech(text);
    if (!cleanedText) return;

    const rate  = options.rate  || 0.85;
    const pitch = options.pitch || 1.0;

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang  = 'fr-FR';
    utterance.rate  = rate;
    utterance.pitch = pitch;

    let voiceToUse = null;
    if (options.voiceURI) {
      voiceToUse = this.voices.find(v => v.voiceURI === options.voiceURI);
    } else if (this.selectedVoiceURI) {
      voiceToUse = this.voices.find(v => v.voiceURI === this.selectedVoiceURI);
    }
    if (!voiceToUse && this.frenchVoices.length > 0) voiceToUse = this.frenchVoices[0];
    if (voiceToUse) utterance.voice = voiceToUse;

    // Les voix cloud Google emettent onboundary AVANT que l'audio soit entendu
    // (latence reseau de 200-400ms) -> on les ignore et on utilise nos propres timers
    const isCloudVoice = voiceToUse ? (voiceToUse.localService === false) : false;

    const wordsList = cleanedText.split(/\s+/);
    const avgLen    = wordsList.reduce((s, w) => s + w.length, 0) / (wordsList.length || 1);

    // Calibrage du WPM reel (voix Google cloud lisent ~18% plus vite que 'rate')
    const wpmBase      = isCloudVoice ? 158 : 128;
    const effectiveWpm = wpmBase * rate;
    const msPerWord    = 60000 / effectiveWpm;

    // Duree de chaque mot proportionnelle a sa longueur (mots longs = plus de temps)
    const wordDurations = wordsList.map(w => {
      const ratio = (w.length + 0.5) / (avgLen + 0.5);
      return Math.max(100, Math.round(msPerWord * ratio));
    });

    let useNativeBoundary = false;

    utterance.onboundary = (event) => {
      if (event.name !== 'word') return;
      // Voix locale : les onboundary sont fiables et synchrones
      if (!isCloudVoice) {
        useNativeBoundary = true;
        this._clearTimers();
        if (this.onBoundaryHandler) {
          this.onBoundaryHandler(event.charIndex, event.charLength || 0);
        }
      }
      // Voix cloud : on ignore onboundary (en avance sur l'audio reel)
    };

    // Planification du surlignage mot par mot avec delai initial calibre
    let charAcc = 0;
    let delay   = isCloudVoice ? 220 : 150;

    wordsList.forEach((word, i) => {
      const ci  = charAcc;
      const len = word.length;
      const id = setTimeout(() => {
        if (!this.isSpeaking) return;
        if (!useNativeBoundary && this.onBoundaryHandler) {
          this.onBoundaryHandler(ci, len);
        }
      }, delay);
      this._timers.push(id);
      delay   += wordDurations[i];
      charAcc += word.length + 1;
    });

    utterance.onend = () => {
      this._clearTimers();
      this.isSpeaking = false;
      if (this.onEndHandler) this.onEndHandler();
    };

    utterance.onerror = (err) => {
      if (err.error === 'interrupted') return;
      console.warn('TTS error:', err.error);
      this._clearTimers();
      this.isSpeaking = false;
      if (this.onEndHandler) this.onEndHandler();
    };

    this.isSpeaking = true;
    this.synth.speak(utterance);
  }

  stop() {
    this._clearTimers();
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }
}

export const ttsService = new TtsService();
