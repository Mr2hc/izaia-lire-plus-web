import React, { useState, useEffect } from 'react';
import { Volume2, CheckCircle2, XCircle, Sparkles, Award, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ttsService } from '../services/ttsService';
import { storageService } from '../services/storageService';
import { getDailyMission } from '../data/mockExercises';

export function ExercisePlayer({ profile, settings, onCompleteMission }) {
  const [exercises, setExercises] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const list = getDailyMission(profile?.level || 'CE1', 5);
    setExercises(list);
  }, [profile]);

  if (exercises.length === 0) {
    return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>Chargement de la mission...</div>;
  }

  const currentEx = exercises[currentIndex];

  const handleSelectAnswer = (option) => {
    if (selectedOption !== null) return; // Prevent double taps

    const correct = option === currentEx.expectedAnswer;
    setSelectedOption(option);
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 1);
    }

    storageService.saveResult({
      exerciseId: currentEx.id,
      givenAnswer: option,
      expectedAnswer: currentEx.expectedAnswer,
      isCorrect: correct,
      errorTags: correct ? [] : currentEx.errorTags
    });

    // Auto advance after short delay
    setTimeout(() => {
      if (currentIndex < exercises.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        // Mission finished
        setIsFinished(true);
        const earnedStars = score + (correct ? 1 : 0) >= 4 ? 3 : 2;
        storageService.addStars(earnedStars);
        storageService.addBadge('Explorateur des Sons');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    }, 1100);
  };

  const playAudio = () => {
    if (currentEx.stimulusText) {
      ttsService.speak(currentEx.stimulusText);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {!isFinished ? (
        <>
          {/* Progress Header */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              <Sparkles size={20} />
              <span>Exercice {currentIndex + 1} / {exercises.length}</span>
            </div>

            <div style={{ background: 'var(--color-primary-light)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 700, color: 'var(--color-primary-dark)', fontSize: '0.9rem' }}>
              Score : {score} ⭐
            </div>
          </div>

          {/* Exercise Card */}
          <div
            className={`dyslexia-reader-box theme-${settings.themePreset}`}
            style={{
              fontFamily: settings.fontFamily === 'OpenDyslexic' ? 'var(--font-opendyslexic)' : 'var(--font-lexend)',
              fontSize: `${settings.fontSize}px`,
              letterSpacing: `${settings.letterSpacing}px`,
              lineHeight: settings.lineSpacing,
              padding: '2.5rem 2rem',
              textAlign: 'center'
            }}
          >
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              {currentEx.instruction}
            </p>

            {/* Audio Stimulus Trigger for Listening Exercises */}
            {currentEx.category === 'listening' && (
              <div style={{ margin: '1.5rem 0' }}>
                <button
                  className="btn btn-primary"
                  style={{ borderRadius: '50%', width: '90px', height: '90px', padding: 0 }}
                  onClick={playAudio}
                >
                  <Volume2 size={40} />
                </button>
                <p style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Appuie pour écouter la consigne sonore
                </p>
              </div>
            )}

            {/* Reading Stimulus for Reading Exercises */}
            {currentEx.category === 'reading' && (
              <div style={{ margin: '1.5rem 0', fontSize: `${settings.fontSize * 1.5}px`, fontWeight: 800, color: 'var(--color-primary-dark)', background: 'rgba(59, 130, 246, 0.08)', padding: '1.2rem', borderRadius: 'var(--radius-md)' }}>
                {currentEx.stimulusText}
              </div>
            )}

            {/* Answer Options Grid */}
            <div className="answer-grid">
              {currentEx.options.map((option) => {
                let statusClass = '';
                if (selectedOption !== null) {
                  if (option === currentEx.expectedAnswer) statusClass = 'correct';
                  else if (option === selectedOption) statusClass = 'incorrect';
                }

                return (
                  <button
                    key={option}
                    className={`answer-card ${statusClass}`}
                    onClick={() => handleSelectAnswer(option)}
                    disabled={selectedOption !== null}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* MISSION COMPLETE REWARD SCREEN */
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <Award size={64} color="var(--color-star-gold)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
            Félicitations {profile?.firstName || 'Lina'} ! 🎉
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            Tu as terminé ta mission du jour avec brio !
          </p>

          <div style={{ display: 'inline-flex', gap: '0.5rem', fontSize: '2.5rem', marginBottom: '2rem' }}>
            ⭐⭐⭐
          </div>

          <div>
            <button className="btn btn-primary" onClick={onCompleteMission}>
              Continuer vers le Lecteur Assisté <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
