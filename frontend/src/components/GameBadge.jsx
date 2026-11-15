import React from 'react';

/**
 * GameBadge – displays a game's official name with brand-appropriate styling.
 * Uses brand colors without depending on external image URLs.
 */

const GAME_CONFIG = {
  valorant: {
    display: 'VALORANT',
    short: 'VAL',
    bg: 'bg-red-600',
    text: 'text-white',
    border: 'border-red-700',
    lightBg: 'bg-red-50',
    lightText: 'text-red-700',
    lightBorder: 'border-red-200',
    emoji: '⚡',
  },
  'counter-strike': {
    display: 'CS2',
    short: 'CS2',
    bg: 'bg-orange-500',
    text: 'text-white',
    border: 'border-orange-600',
    lightBg: 'bg-orange-50',
    lightText: 'text-orange-700',
    lightBorder: 'border-orange-200',
    emoji: '💣',
  },
  cs2: {
    display: 'CS2',
    short: 'CS2',
    bg: 'bg-orange-500',
    text: 'text-white',
    border: 'border-orange-600',
    lightBg: 'bg-orange-50',
    lightText: 'text-orange-700',
    lightBorder: 'border-orange-200',
    emoji: '💣',
  },
  'dota 2': {
    display: 'DOTA 2',
    short: 'D2',
    bg: 'bg-rose-800',
    text: 'text-white',
    border: 'border-rose-900',
    lightBg: 'bg-rose-50',
    lightText: 'text-rose-800',
    lightBorder: 'border-rose-200',
    emoji: '⚔️',
  },
  dota: {
    display: 'DOTA 2',
    short: 'D2',
    bg: 'bg-rose-800',
    text: 'text-white',
    border: 'border-rose-900',
    lightBg: 'bg-rose-50',
    lightText: 'text-rose-800',
    lightBorder: 'border-rose-200',
    emoji: '⚔️',
  },
  'ea sports fc': {
    display: 'EA SPORTS FC',
    short: 'EA FC',
    bg: 'bg-violet-700',
    text: 'text-white',
    border: 'border-violet-800',
    lightBg: 'bg-violet-50',
    lightText: 'text-violet-700',
    lightBorder: 'border-violet-200',
    emoji: '⚽',
  },
  fifa: {
    display: 'EA SPORTS FC',
    short: 'EA FC',
    bg: 'bg-violet-700',
    text: 'text-white',
    border: 'border-violet-800',
    lightBg: 'bg-violet-50',
    lightText: 'text-violet-700',
    lightBorder: 'border-violet-200',
    emoji: '⚽',
  },
  'mobile legends': {
    display: 'Mobile Legends',
    short: 'MLBB',
    bg: 'bg-blue-600',
    text: 'text-white',
    border: 'border-blue-700',
    lightBg: 'bg-blue-50',
    lightText: 'text-blue-700',
    lightBorder: 'border-blue-200',
    emoji: '🗡️',
  },
  'pubg mobile': {
    display: 'PUBG Mobile',
    short: 'PUBG',
    bg: 'bg-amber-600',
    text: 'text-white',
    border: 'border-amber-700',
    lightBg: 'bg-amber-50',
    lightText: 'text-amber-700',
    lightBorder: 'border-amber-200',
    emoji: '🎯',
  },
};

const DEFAULT_CONFIG = {
  display: null,
  short: null,
  bg: 'bg-slate-500',
  text: 'text-white',
  border: 'border-slate-600',
  lightBg: 'bg-slate-50',
  lightText: 'text-slate-700',
  lightBorder: 'border-slate-200',
  emoji: '🎮',
};

const getConfig = (game) => {
  if (!game) return DEFAULT_CONFIG;
  const key = game.toLowerCase().trim();
  return GAME_CONFIG[key] || Object.entries(GAME_CONFIG).find(([k]) => key.includes(k))?.[1] || DEFAULT_CONFIG;
};

/**
 * GameBadge component
 * variant: 'solid' | 'light' | 'pill'
 * size: 'sm' | 'md' | 'lg'
 */
const GameBadge = ({ game, variant = 'light', size = 'md', showEmoji = false, className = '' }) => {
  const cfg = getConfig(game);
  const displayName = cfg.display || game || 'Unknown';

  const sizeClasses = {
    sm:  'text-[10px] px-2 py-0.5',
    md:  'text-xs px-2.5 py-1',
    lg:  'text-sm px-3 py-1.5',
  };

  const variantClasses = {
    solid: `${cfg.bg} ${cfg.text} border ${cfg.border}`,
    light: `${cfg.lightBg} ${cfg.lightText} border ${cfg.lightBorder}`,
    pill:  `${cfg.lightBg} ${cfg.lightText} border ${cfg.lightBorder} rounded-full`,
  };

  return (
    <span className={`inline-flex items-center gap-1 font-bold uppercase tracking-wide rounded-md ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {showEmoji && <span>{cfg.emoji}</span>}
      <span>{displayName}</span>
    </span>
  );
};

export { GameBadge, getConfig as getGameConfig };
export default GameBadge;
