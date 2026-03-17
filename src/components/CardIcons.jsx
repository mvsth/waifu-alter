import React from 'react';

const ICONS = [
  { key: 'tags', match: (c) => c.tags?.includes('wympienianie'),  icon: '🔃', title: 'Wymiana' },
  { key: 'tags', match: (c) => c.tags?.includes('ulubione'),      icon: '💗', title: 'Ulubione' },
  { key: 'tags', match: (c) => c.tags?.includes('rezerwacja'),    icon: '📝', title: 'Rezerwacja' },
  { key: 'tags', match: (c) => c.tags?.includes('galeria'),       icon: '📌', title: 'Galeria' },
  { key: 'isUnique',         match: (c) => c.isUnique,            icon: '💠', title: 'Unikalna' },
  { key: 'isUltimate',       match: (c) => c.isUltimate,          icon: '🎖️', title: 'Ultimate' },
  { key: 'hasCustomImage',   match: (c) => c.hasCustomImage,      icon: '🖼️', title: 'Własny obrazek' },
  { key: 'hasCustomBorder',  match: (c) => c.hasCustomBorder,     icon: '✂️', title: 'Własna ramka' },
  { key: 'affection',        match: (c) => c.affection?.startsWith('Pogarda'), icon: '💔', title: 'Pogarda' },
  { key: 'isTradable',       match: (c) => c.isTradable === false, icon: '⛔', title: 'Niewymieniana' },
  { key: 'isCursed',         match: (c) => c.isCursed,            icon: '💀', title: 'Przeklęta' },
  { key: 'isInCage',         match: (c) => c.isInCage,            icon: '🔒', title: 'W klatce' },
  { key: 'isActive',         match: (c) => c.isActive,            icon: '☑️', title: 'W talii' },
  { key: 'valueHigh',        match: (c) => c.value === 'high',    icon: '💰', title: 'Wysoka wartość' },
  { key: 'valueLow',         match: (c) => c.value === 'low',     icon: '♻️', title: 'Niska wartość' },
  { key: 'isOnExpedition',   match: (c) => c.isOnExpedition,      icon: '✈️', title: 'Na ekspedycji' },
];

export default function CardIcons({ card }) {
  if (!card) return null;
  const active = ICONS.filter((i) => i.match(card));
  if (active.length === 0) return null;
  return (
    <span style={{ display: 'inline', marginLeft: 4, fontSize: 13, letterSpacing: 1 }}>
      {active.map((i, idx) => (
        <span key={idx} title={i.title}>{i.icon}</span>
      ))}
    </span>
  );
}
