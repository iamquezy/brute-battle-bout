// Fantasy Name Generator

const PREFIXES = [
  'Ath', 'Bel', 'Cor', 'Dar', 'El', 'Fal', 'Gar', 'Hel', 'Il', 'Jor',
  'Kal', 'Lor', 'Mal', 'Nor', 'Or', 'Pho', 'Quar', 'Ral', 'Sar', 'Thor',
  'Ul', 'Val', 'Wyl', 'Xan', 'Yor', 'Zar',
];

const SUFFIXES = [
  'adin', 'bane', 'cris', 'dor', 'el', 'fang', 'grim', 'hart', 'ion', 'jun',
  'kar', 'lis', 'mon', 'nar', 'or', 'pol', 'quin', 'ren', 'sar', 'thar',
  'ul', 'ven', 'win', 'xus', 'yan', 'zor',
];

const TITLES = [
  'the Brave', 'the Fierce', 'the Swift', 'the Wise', 'the Strong',
  'the Shadow', 'Blade', 'Shadowblade', 'Stormborn', 'Ironheart',
  'the Cunning', 'the Bold', 'the Mighty', 'Frostborn', 'Flamekeeper',
  'the Wanderer', 'the Hunter', 'the Destroyer', 'the Eternal', 'the Chosen',
];

export function generateRandomName(): string {
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
  const title = TITLES[Math.floor(Math.random() * TITLES.length)];
  
  // 70% chance to include title
  if (Math.random() < 0.7) {
    return `${prefix}${suffix} ${title}`;
  }
  
  return `${prefix}${suffix}`;
}

export function generateNamesByClass(characterClass: 'fighter' | 'mage' | 'archer'): string {
  const classTitles = {
    fighter: ['the Crusher', 'the Mountain', 'Ironclad', 'the Berserker', 'the Warden'],
    mage: ['the Sorcerer', 'the Sage', 'Spellweaver', 'the Mystic', 'the Arcane'],
    archer: ['the Swift', 'the Hawk', 'Deadeye', 'the Ranger', 'Windrunner'],
  };
  
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
  const title = classTitles[characterClass][Math.floor(Math.random() * classTitles[characterClass].length)];
  
  return `${prefix}${suffix} ${title}`;
}
