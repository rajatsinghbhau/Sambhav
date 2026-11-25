import { TeachingActivity, SimplifiedExplanation, FictionalStudent, ExamRevisionCheckpoint } from '../types/stage4';

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

/**
 * PART 7 — CURATED MULTI-TIER REVISION CHECKPOINTS
 * Offline deterministic checkpoints for quick recall, spaced retrieval, and exam review.
 */
export const REVISION_CHECKPOINTS: Record<string, ExamRevisionCheckpoint> = {
  condensation: {
    conceptId: 'condensation',
    conceptLabel: 'Condensation',
    memoryHook: 'Warm invisible vapour cools down and turns back into visible water drops (like outside a cold soda can).',
    questions: [
      {
        id: 'q-cond-1',
        type: 'visual_symbol',
        prompt: 'Which picture card shows Condensation forming in the sky?',
        options: ['☁️ Clouds forming', '☀️ Bright Sun', '💧 Puddle of water'],
        correctIndex: 0,
        explanation: 'Condensation happens when warm vapour cools high in the air to form clouds!'
      },
      {
        id: 'q-cond-2',
        type: 'real_life',
        prompt: 'You take a cold bottle out of the fridge. Why do drops form on the outside?',
        options: ['Water is leaking from inside the bottle', 'Invisible moisture in the warm room air touched the cold glass and cooled down', 'The bottle melted'],
        correctIndex: 1,
        explanation: 'Water in the air condensed into tiny drops when it touched the chilled cold surface.'
      },
      {
        id: 'q-cond-3',
        type: 'cause_effect',
        prompt: 'What must happen to water vapour for it to condense into clouds or raindrops?',
        options: ['It must get hotter and boil', 'It must cool down', 'It must be hidden under the soil'],
        correctIndex: 1,
        explanation: 'Cooling down causes spread-out vapour particles to come together into liquid water.'
      }
    ]
  },
  evaporation: {
    conceptId: 'evaporation',
    conceptLabel: 'Evaporation',
    memoryHook: 'Liquid water absorbs heat and turns into invisible rising water vapour.',
    questions: [
      {
        id: 'q-evap-1',
        type: 'visual_symbol',
        prompt: 'Which symbol shows liquid water rising up into the warm air?',
        options: ['⬆️ Rising Vapour', '🌧️ Falling Rain', '❄️ Cold Ice'],
        correctIndex: 0,
        explanation: 'Evaporation is water rising as vapour when warmed by the sun.'
      },
      {
        id: 'q-evap-2',
        type: 'real_life',
        prompt: 'After it rains, puddles on the sunny playground disappear. Where did the water go?',
        options: ['Dogs drank it all', 'Heat from the sun evaporated the water into the air', 'It turned into sand'],
        correctIndex: 1,
        explanation: 'Sunlight warmed the puddle and turned it into invisible water vapour.'
      },
      {
        id: 'q-evap-3',
        type: 'cause_effect',
        prompt: 'What energy source causes natural evaporation from lakes and oceans?',
        options: ['Heat from the Sun', 'Wind blowing in circles', 'Cold nighttime moonlight'],
        correctIndex: 0,
        explanation: 'Solar heat provides thermal energy for water to evaporate.'
      }
    ]
  },
  vapour: {
    conceptId: 'vapour',
    conceptLabel: 'Water Vapour',
    memoryHook: 'Invisible water gas floating in the air around us.',
    questions: [
      {
        id: 'q-vap-1',
        type: 'visual_symbol',
        prompt: 'Water vapour is in what physical state of matter?',
        options: ['Solid ice', 'Invisible gas in air', 'Hard stone'],
        correctIndex: 1,
        explanation: 'Water vapour is the gas phase of water floating in our atmosphere.'
      },
      {
        id: 'q-vap-2',
        type: 'cause_effect',
        prompt: 'What happens to water vapour when it rises high into the colder sky?',
        options: ['It stays hot forever', 'It cools down and condenses into cloud droplets', 'It vanishes permanently from the Earth'],
        correctIndex: 1,
        explanation: 'High in the atmosphere, low temperatures condense vapour into clouds.'
      }
    ]
  },
  rain: {
    conceptId: 'rain',
    conceptLabel: 'Rain (Precipitation)',
    memoryHook: 'Cloud droplets become too heavy to float and gravity pulls them down to Earth.',
    questions: [
      {
        id: 'q-rain-1',
        type: 'cause_effect',
        prompt: 'Why does rain fall from heavy clouds?',
        options: ['Water droplets in clouds group together and become too heavy to stay floating', 'The clouds get angry', 'The sun pulls the water down'],
        correctIndex: 0,
        explanation: 'When condensed drops grow heavy, gravity pulls them down as precipitation!'
      },
      {
        id: 'q-rain-2',
        type: 'real_life',
        prompt: 'Where does rain water go after it falls on hills and soil?',
        options: ['It flows into streams, rivers, and replenishes groundwater', 'It leaves Earth into outer space', 'It disappears forever'],
        correctIndex: 0,
        explanation: 'Rainwater collects into bodies of water, continuing the continuous cycle.'
      }
    ]
  }
};
