import React, { useState, useEffect } from 'react';
import { Trophy, Star, Gamepad2, RotateCcw, ChevronRight, Lock } from 'lucide-react';
import { SyllableSnap } from './games/SyllableSnap';
import { WordImageMatch } from './games/WordImageMatch';
import { RhythmReader } from './games/RhythmReader';
import { BADGES } from '../data/gameData';
import { storageService } from '../services/storageService';
import { soundEffectsService } from '../services/soundEffectsService';
import confetti from 'canvas-confetti';

const GAMES = [
  {
    id: 'syllable',
    title: 'Syllabe Snap',
    subtitle: 'Reconnais la bonne syllabe !',
    emoji: '🔤',
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
    tags: ['Dyslexie', 'Syllabes', 'Vitesse'],
    description: 'Identifie la première syllabe d\'un mot parmi plusieurs propositions. Enchaîne les bonnes réponses pour déclencher des combos !',
    component: SyllableSnap,
  },
  {
    id: 'word-image',
    title: 'Mot-Image Match',
    subtitle: 'Associe chaque mot à son image !',
    emoji: '🖼️',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
    tags: ['Vocabulaire', 'Association', 'Mémoire'],
    description: 'Relie un mot écrit à la bonne image parmi 4 choix. Plus tu évites les erreurs, plus tu gagnes de points !',
    component: WordImageMatch,
  },
  {
    id: 'rhythm',
    title: 'Rythme de Lecture',
    subtitle: 'Mémorise et reconstitue l\'ordre !',
    emoji: '🎵',
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #EC4899, #BE185D)',
    tags: ['Mémoire', 'Rythme', 'Ordre'],
    description: 'Mémorise une séquence de mots affichée brièvement, puis remets-les dans le bon ordre. Entraîne ta mémoire de travail !',
    component: RhythmReader,
  },
];

function BadgeCard({ badge, unlocked }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.8rem',
      padding: '0.8rem 1rem',
      borderRadius: 'var(--radius-md)',
      background: unlocked ? `${badge.color}15` : '#F8FAFC',
      border: `1px solid ${unlocked ? badge.color + '40' : '#E2E8F0'}`,
      opacity: unlocked ? 1 : 0.55,
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        fontSize: '1.8rem', lineHeight: 1,
        filter: unlocked ? 'none' : 'grayscale(1)',
        transition: 'filter 0.3s ease'
      }}>
        {unlocked ? badge.emoji : '🔒'}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: unlocked ? badge.color : 'var(--color-text-muted)' }}>
          {badge.label}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
          {badge.condition}
        </div>
      </div>
      {unlocked && (
        <div style={{ marginLeft: 'auto' }}>
          <div style={{ background: badge.color, color: 'white', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem' }}>
            ✓ Obtenu
          </div>
        </div>
      )}
    </div>
  );
}

export function GamesHub({ profile, settings, onStarsUpdate }) {
  const [activeGame, setActiveGame] = useState(null);
  const [gameScores, setGameScores] = useState({});
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [totalGameStars, setTotalGameStars] = useState(0);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(null);

  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = () => {
    const scores = storageService.getGameScores();
    const badges = storageService.getUnlockedBadges();
    setGameScores(scores);
    setUnlockedBadges(badges);

    const total = Object.values(scores).reduce((sum, s) => sum + (s.stars || 0), 0);
    setTotalGameStars(total);
  };

  const handleGameComplete = (gameId, result) => {
    soundEffectsService.playSuccess();

    const pointsEarned = result?.score || 0;
    const starsEarned = pointsEarned >= 12 ? 3 : pointsEarned >= 6 ? 2 : 1;

    // Save scores
    const prevScores = storageService.getGameScores();
    const prevBest = prevScores[gameId]?.best || 0;
    const updatedScores = {
      ...prevScores,
      [gameId]: {
        best: Math.max(prevBest, pointsEarned),
        stars: Math.max(prevScores[gameId]?.stars || 0, starsEarned),
        plays: (prevScores[gameId]?.plays || 0) + 1,
        lastPlayed: new Date().toISOString(),
      }
    };
    storageService.saveGameScores(updatedScores);

    // Stars to profile
    storageService.addStars(starsEarned);
    onStarsUpdate && onStarsUpdate();

    // Badge evaluation
    const plays = Object.keys(updatedScores).length;
    const allPlayed = GAMES.every(g => updatedScores[g.id]);
    const prevBadges = storageService.getUnlockedBadges();
    const newBadges = [...prevBadges];
    let newBadgeUnlocked = null;

    if (plays >= 1 && !newBadges.includes('first_game')) {
      newBadges.push('first_game');
      newBadgeUnlocked = BADGES.find(b => b.id === 'first_game');
    }
    if (gameId === 'syllable' && result?.fastCount >= 3 && !newBadges.includes('speed_demon')) {
      newBadges.push('speed_demon');
      newBadgeUnlocked = BADGES.find(b => b.id === 'speed_demon');
    }
    if (gameId === 'syllable' && starsEarned === 3 && !newBadges.includes('syllable_master')) {
      newBadges.push('syllable_master');
      newBadgeUnlocked = BADGES.find(b => b.id === 'syllable_master');
    }
    if (gameId === 'word-image' && starsEarned >= 2 && !newBadges.includes('word_wizard')) {
      newBadges.push('word_wizard');
      newBadgeUnlocked = BADGES.find(b => b.id === 'word_wizard');
    }
    if (gameId === 'rhythm' && starsEarned === 3 && !newBadges.includes('rhythm_king')) {
      newBadges.push('rhythm_king');
      newBadgeUnlocked = BADGES.find(b => b.id === 'rhythm_king');
    }
    if (pointsEarned > 0 && result?.mistakes === 0 && !newBadges.includes('no_mistake')) {
      newBadges.push('no_mistake');
      newBadgeUnlocked = BADGES.find(b => b.id === 'no_mistake');
    }
    const mainBadgeIds = ['syllable_master', 'word_wizard', 'rhythm_king', 'speed_demon', 'no_mistake'];
    if (mainBadgeIds.every(id => newBadges.includes(id)) && !newBadges.includes('champion')) {
      newBadges.push('champion');
      newBadgeUnlocked = BADGES.find(b => b.id === 'champion');
    }

    storageService.saveUnlockedBadges(newBadges);
    setUnlockedBadges(newBadges);
    setGameScores(updatedScores);
    const newTotal = Object.values(updatedScores).reduce((s, v) => s + (v.stars || 0), 0);
    setTotalGameStars(newTotal);

    if (newBadgeUnlocked) {
      setShowBadgeUnlock(newBadgeUnlocked);
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 }, colors: [newBadgeUnlocked.color, '#fff', '#FFD700'] });
      setTimeout(() => setShowBadgeUnlock(null), 3500);
    }

    setActiveGame(null);
  };

  // ── Active game view ──
  if (activeGame) {
    const game = GAMES.find(g => g.id === activeGame);
    const GameComponent = game.component;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Active game header */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: `${game.color}10`, border: `1px solid ${game.color}30` }}>
          <div style={{ fontSize: '2rem' }}>{game.emoji}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: game.color }}>{game.title}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{game.subtitle}</p>
          </div>
          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
            onClick={() => setActiveGame(null)}
          >
            ← Retour aux Jeux
          </button>
        </div>

        {/* Game content card */}
        <div className="card">
          <GameComponent
            settings={settings}
            onComplete={(result) => handleGameComplete(activeGame, result)}
          />
        </div>
      </div>
    );
  }

  // ── Hub view ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Badge Unlock Toast */}
      {showBadgeUnlock && (
        <div style={{
          position: 'fixed', top: '5rem', left: '50%', transform: 'translateX(-50%)',
          background: 'white', borderRadius: 'var(--radius-lg)',
          padding: '1.2rem 2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          zIndex: 200, display: 'flex', alignItems: 'center', gap: '1rem',
          border: `2px solid ${showBadgeUnlock.color}`,
          animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <div style={{ fontSize: '2.5rem' }}>{showBadgeUnlock.emoji}</div>
          <div>
            <div style={{ fontWeight: 800, color: showBadgeUnlock.color, fontFamily: 'var(--font-heading)' }}>
              🎉 Badge débloqué !
            </div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{showBadgeUnlock.label}</div>
          </div>
        </div>
      )}

      {/* Hub Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1E1B4B, #312E81, #4C1D95)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 12px 32px rgba(79, 70, 229, 0.35)'
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Gamepad2 size={28} />
            <span>Jeux Éducatifs</span>
          </h1>
          <p style={{ color: '#C4B5FD', marginTop: '0.4rem', fontSize: '0.95rem' }}>
            3 jeux spécialement conçus pour renforcer tes compétences en lecture.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>⭐ {totalGameStars}</div>
            <div style={{ color: '#C4B5FD', fontSize: '0.8rem' }}>Étoiles Jeux</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>🏅 {unlockedBadges.length}/{BADGES.length}</div>
            <div style={{ color: '#C4B5FD', fontSize: '0.8rem' }}>Badges</div>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--color-text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Choisir un jeu
        </h2>
        <div className="grid-3">
          {GAMES.map(game => {
            const scoreData = gameScores[game.id];
            const stars = scoreData?.stars || 0;
            const plays = scoreData?.plays || 0;
            return (
              <div key={game.id} className="card card-hover" style={{ border: `1px solid ${game.color}20`, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setActiveGame(game.id)}>
                {/* Game card top */}
                <div style={{
                  background: game.gradient,
                  margin: '-1.5rem -1.5rem 1.2rem',
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ fontSize: '2.8rem', lineHeight: 1 }}>{game.emoji}</div>
                  <div style={{ display: 'flex', gap: '0.2rem' }}>
                    {[1, 2, 3].map(i => (
                      <Star key={i} size={18} color={i <= stars ? '#FDE047' : '#ffffff60'} fill={i <= stars ? '#FDE047' : 'none'} />
                    ))}
                  </div>
                </div>

                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: game.color, marginBottom: '0.4rem' }}>
                  {game.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '0.8rem' }}>
                  {game.description}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {game.tags.map(tag => (
                    <span key={tag} style={{
                      background: `${game.color}15`, color: game.color,
                      borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700,
                      padding: '0.2rem 0.6rem', border: `1px solid ${game.color}30`
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Play button row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {plays > 0 ? `${plays} partie${plays > 1 ? 's' : ''} jouée${plays > 1 ? 's' : ''}` : 'Pas encore joué'}
                  </span>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    fontWeight: 700, color: game.color, fontSize: '0.9rem'
                  }}>
                    Jouer <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges Panel */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
          <Trophy size={22} color="var(--color-star-gold)" />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: 'var(--color-primary-dark)' }}>
            Mes Badges & Récompenses
          </h2>
          <span style={{ marginLeft: 'auto', background: 'var(--color-star-gold-light)', color: '#B45309', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 700, padding: '0.2rem 0.7rem', border: '1px solid #FDE68A' }}>
            {unlockedBadges.length} / {BADGES.length}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.8rem' }}>
          {BADGES.map(badge => (
            <BadgeCard key={badge.id} badge={badge} unlocked={unlockedBadges.includes(badge.id)} />
          ))}
        </div>
      </div>

      {/* Game Leaderboard mini */}
      {Object.keys(gameScores).length > 0 && (
        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: 'var(--color-primary-dark)', marginBottom: '1rem' }}>
            📊 Mes Meilleurs Scores
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {GAMES.map(game => {
              const data = gameScores[game.id];
              if (!data) return null;
              return (
                <div key={game.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1rem', background: `${game.color}08`, borderRadius: 'var(--radius-md)', border: `1px solid ${game.color}20` }}>
                  <span style={{ fontSize: '1.5rem' }}>{game.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: game.color, fontSize: '0.9rem' }}>{game.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{data.plays} parties</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: game.color }}>{data.best} pts</div>
                    <div style={{ display: 'flex', gap: '0.2rem', justifyContent: 'flex-end' }}>
                      {[1, 2, 3].map(i => (
                        <Star key={i} size={14} color={i <= data.stars ? '#F59E0B' : '#CBD5E1'} fill={i <= data.stars ? '#F59E0B' : 'none'} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
