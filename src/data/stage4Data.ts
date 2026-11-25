import { TeachingActivity, SimplifiedExplanation, FictionalStudent } from '../types/stage4';

/**
 * PART 3 — CURATED TEACHING ACTIVITY LIBRARY
 * Deterministic local activity library.
 * NO LLM generation: Same concept → same curated suggestions.
 */
export const CURATED_ACTIVITIES: TeachingActivity[] = [
  // Condensation
  {
    id: 'cold-glass',
    title: 'Cold Glass Observation',
    type: 'Hands-on',
    conceptIds: ['condensation'],
    duration: 5,
    description: 'Observe water droplets forming on the outside of a chilled cold glass.',
    inclusiveTip: 'Students may observe, point, gesture or explain verbally.'
  },
  {
    id: 'condensation-visual',
    title: 'Vapour to Droplet Progression',
    type: 'Visual',
    conceptIds: ['condensation'],
    duration: 5,
    description: 'Show visual diagram: Warm Vapour → Cooling Air → Tiny Water Droplets.',
    inclusiveTip: 'Use high-contrast cards and dual symbol-word representations.'
  },
  {
    id: 'condensation-movement',
    title: 'Cooling Particle Dance',
    type: 'Movement',
    conceptIds: ['condensation'],
    duration: 8,
    description: 'Students act as water particles spreading out when warm and moving closer together as they cool.',
    inclusiveTip: 'Encourage hand motions or wheelchair/seated arm swaying.'
  },
  {
    id: 'condensation-pair',
    title: 'Partner Glass Investigation',
    type: 'Pair Activity',
    conceptIds: ['condensation'],
    duration: 7,
    description: 'Pairs explain to each other where the droplets came from (air, not leaking from inside).',
    inclusiveTip: 'Partners can use AAC boards, thumbs up/down, or verbal exchange.'
  },
  {
    id: 'condensation-aac',
    title: 'Board Sentence Touch',
    type: 'Communication',
    conceptIds: ['condensation'],
    duration: 5,
    description: 'Touch 💨 Vapour + ❄️ Cool = ☁️ Condensation on the Communication Board.',
    inclusiveTip: 'Non-speaking students touch symbols with confirm-before-speak safety.'
  },

  // Evaporation
  {
    id: 'wet-wipe-demo',
    title: 'Disappearing Wet Spot',
    type: 'Quick Demonstration',
    conceptIds: ['evaporation'],
    duration: 5,
    description: 'Wipe a damp sponge across the chalkboard and watch the moisture disappear into thin air.',
    inclusiveTip: 'Students feel the wet board and observe drying change over 2 minutes.'
  },
  {
    id: 'evaporation-movement',
    title: 'Rising Vapour Motion',
    type: 'Movement',
    conceptIds: ['evaporation'],
    duration: 5,
    description: 'Students squat low as liquid water, then gently rise with fluttering fingers into the air.',
    inclusiveTip: 'All physical ranges of motion are welcomed; arm lifting or head tilt.'
  },

  // Heat & Sun
  {
    id: 'sun-lamp-tactile',
    title: 'Sunlight Warmth Touch',
    type: 'Hands-on',
    conceptIds: ['sun', 'heat'],
    duration: 5,
    description: 'Touch two plates: one kept under a warm light lamp and one in shade.',
    inclusiveTip: 'Tactile sensation allows immediate understanding of thermal energy transfer.'
  },

  // Rain
  {
    id: 'sponge-rain-sim',
    title: 'Heavy Cloud Squeeze',
    type: 'Hands-on',
    conceptIds: ['rain'],
    duration: 6,
    description: 'Add water drops into a sponge until it becomes too heavy and water rains out beneath.',
    inclusiveTip: 'Students can pour water, hold the sponge, or watch the downward drops.'
  },

  // Teach-Back Activity
  {
    id: 'water-cycle-teach-back',
    title: 'Milestone Chain Teach-Back',
    type: 'Teach-Back',
    conceptIds: ['sun', 'heat', 'water', 'evaporation', 'vapour', 'condensation', 'rain'],
    duration: 10,
    description: 'Students arrange concept cards from Sun to Rain, explaining each transition.',
    inclusiveTip: 'Students may arrange physical cards, tap AAC board, or point to board tokens.'
  }
];

/**
 * PART 9 — SIMPLIFIED EXPLANATIONS
 * Deterministic, offline, works without LLM.
 */
export const SIMPLIFIED_EXPLANATIONS: Record<string, SimplifiedExplanation> = {
  sun: {
    conceptId: 'sun',
    conceptSymbol: '☀️',
    conceptLabel: 'Sun',
    simpleExplanation: 'The Sun gives our world warm light and energy.',
    realLifeExample: 'When you stand outside on a sunny afternoon and feel warm on your skin.',
    visualPrompt: 'Bright golden sun shining over land and blue oceans.'
  },
  heat: {
    conceptId: 'heat',
    conceptSymbol: '🔥',
    conceptLabel: 'Heat',
    simpleExplanation: 'Heat makes things warm and gives energy to water.',
    realLifeExample: 'Warming a cup of tea or feeling a warm sidewalk after noon.',
    visualPrompt: 'Thermal energy waves warming up pond water.'
  },
  water: {
    conceptId: 'water',
    conceptSymbol: '💧',
    conceptLabel: 'Water',
    simpleExplanation: 'Water is the liquid in rivers, lakes, puddles and seas.',
    realLifeExample: 'Drinking clean water from a glass or splashing in a river.',
    visualPrompt: 'Clear blue lake under open sky.'
  },
  evaporation: {
    conceptId: 'evaporation',
    conceptSymbol: '⬆️',
    conceptLabel: 'Evaporation',
    simpleExplanation: 'Warm water turns into invisible floating gas and goes up into the sky.',
    realLifeExample: 'Wet clothes hanging on a clothesline becoming dry in the afternoon breeze.',
    visualPrompt: 'Upward arrows showing liquid turning into invisible vapour.'
  },
  vapour: {
    conceptId: 'vapour',
    conceptSymbol: '💨',
    conceptLabel: 'Vapour',
    simpleExplanation: 'Water vapour is warm water floating unseen in the air all around us.',
    realLifeExample: 'The warm steam rising gently from a hot bath or kettle.',
    visualPrompt: 'Gentle floating wisps rising high into the atmosphere.'
  },
  condensation: {
    conceptId: 'condensation',
    conceptSymbol: '☁️',
    conceptLabel: 'Condensation',
    simpleExplanation: 'When water vapour gets cooler, it changes into tiny drops of water.',
    realLifeExample: 'Water drops appear on the outside of a cold glass of ice water.',
    visualPrompt: 'Vapour cooling down into tiny shiny droplets forming clouds.'
  },
  rain: {
    conceptId: 'rain',
    conceptSymbol: '🌧️',
    conceptLabel: 'Rain',
    simpleExplanation: 'When water drops in a cloud get heavy, they fall back down to Earth.',
    realLifeExample: 'Raindrops pattering on your umbrella and filling puddles on the ground.',
    visualPrompt: 'Drops falling gently from full clouds back into rivers.'
  }
};

/**
 * PART 5 — FICTIONAL DEMO CLASS (6 Students)
 * Strict requirement:
 * No disability labels. No diagnosis. No rankings. No "weak student" labels.
 */
export const DEMO_STUDENTS: FictionalStudent[] = [
  {
    id: 's-ananya',
    name: 'Ananya',
    // Condensation early (needs reinforcement initially)
    initialChain: ['condensation', 'sun', 'heat', 'water', 'evaporation', 'vapour']
  },
  {
    id: 's-rahul',
    name: 'Rahul',
    // Full correct sequence up to condensation
    initialChain: ['sun', 'heat', 'water', 'evaporation', 'vapour', 'condensation']
  },
  {
    id: 's-meera',
    name: 'Meera',
    // Evaporation missing, condensation early
    initialChain: ['sun', 'heat', 'water', 'condensation', 'vapour']
  },
  {
    id: 's-arjun',
    name: 'Arjun',
    // Up to vapour demonstrated, condensation not yet attempted
    initialChain: ['sun', 'heat', 'water', 'evaporation', 'vapour']
  },
  {
    id: 's-kavya',
    name: 'Kavya',
    // Condensation placed first, then sun heat water
    initialChain: ['condensation', 'sun', 'heat', 'water']
  },
  {
    id: 's-rohan',
    name: 'Rohan',
    // Sequence up to condensation demonstrated
    initialChain: ['sun', 'heat', 'water', 'evaporation', 'vapour', 'condensation']
  }
];
