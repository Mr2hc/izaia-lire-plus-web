import React, { useState, useEffect } from 'react';
import { Volume2, CheckCircle2, XCircle, Sparkles, Award, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ttsService } from '../services/ttsService';
import { storageService } from '../services/storageService';
import { getDailyMission } from '../data/mockExercises';
import { adaptGrammarForChild, formatChildName, detectGender } from '../services/genderService';

export function ExercisePlayer({ profile, settings, onCompleteMission }) {
  const [exercises, setExercises] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime] = useState(Date.now());

  const childName = formatChildName(profile?.firstName || 'Izaia');
  const childGender = profile?.gender || 'auto';
  const isFem = detectGender(childName, childGender) === 'f';

  useEffect(() => {
    const list = getDailyMission(profile?.level || 'CE1', 5);
    setExercises(list);
  }, [profile]);

  if (exercises.length === 0) {
    return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>Chargement de la mission...</div>;
  }

  const currentEx = exercises[currentIndex];

  const adaptedStimulus = currentEx.stimulusText 
    ? adaptGrammarForChild(currentEx.stimulusText, childName, childGender)
    : '';

  const adaptedOptions = currentEx.options.map(opt => adaptGrammarForChild(opt, childName, childGender));
  const adaptedExpected = adaptGrammarForChild(currentEx.expectedAnswer, childName, childGender);

  const handleSelectAnswer = (option) => {
    if (selectedOption !== null) return; // Prevent double taps
    setSelectedOption(option);

    const correct = option === adaptedExpected;
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 1);
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
    }

    setTimeout(() => {
      if (currentIndex + 1 < exercises.length) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setIsFinished(true);
        storageService.addStars(10);
        confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 } });
      }
    }, 1200);
  };

  const playAudio = () => {
    ttsService.speak(currentEx.instruction + ' ' + (adaptedStimulus || ''));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      {!isFinished ? (
        <>
          {/* Mission Progress Header */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              <Sparkles size={20} />
              <span>Exercice {currentIndex + 1} / {exercises.length}</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#D97706', background: '#FEF3C7', padding: '0.3rem 0.8rem', borderRadius: '99px' }}>
              Score : {score} ⭐
            </div>
          </div>

          {/* Exercise Card */}
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.8rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', marginBottom: '1rem', fontWeight: 600 }}>
              {currentEx.instruction}
            </h3>

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
                {adaptedStimulus}
              </div>
            )}

            {/* Answer Options Grid */}
            <div className="answer-grid">
              {adaptedOptions.map((option) => {
                let statusClass = '';
                if (selectedOption !== null) {
                  if (option === adaptedExpected) statusClass = 'correct';
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
            Félicitations {childName} ! 🎉
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            Tu es {isFem ? 'une super lectrice' : 'un super lecteur'} ! Tu as terminé ta mission avec brio !
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
