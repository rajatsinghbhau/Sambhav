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
    memoryHook: 'Warm invisible vapour cools down and turns back into visible water drops (like outside a chilled glass).',
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
        options: [
          'Water is leaking from inside the bottle',
          'Invisible moisture in the warm room air touched the cold glass and cooled down',
          'The bottle melted'
        ],
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
      },
      {
        id: 'q-cond-4',
        type: 'sensory_observation',
        prompt: 'When you breathe onto a cool mirror on a chilly morning, what sensory change happens on the glass?',
        options: [
          'The mirror fogs up with tiny wet droplets you can wipe with your finger',
          'The mirror catches on fire',
          'The mirror becomes completely dry and dusty'
        ],
        correctIndex: 0,
        explanation: 'Warm, moist breath cools against the chilly mirror surface, condensing into visible water mist!'
      },
      {
        id: 'q-cond-5',
        type: 'curriculum_sequence',
        prompt: 'In the water cycle, what happens immediately BEFORE condensation forms clouds?',
        options: [
          'Evaporated water vapour rises up into the cooler sky',
          'Snow melts under the ground',
          'Rain falls heavily into rivers'
        ],
        correctIndex: 0,
        explanation: 'Rising invisible water vapour must first reach the high, cool atmosphere before it can condense into clouds.'
      },
      {
        id: 'q-cond-6',
        type: 'concept_check',
        prompt: 'Is condensation a physical change of state from gas to liquid, or does water disappear?',
        options: [
          'It is a change of state from invisible gas to liquid water',
          'Water is destroyed permanently',
          'Liquid water turns directly into rock'
        ],
        correctIndex: 0,
        explanation: 'Condensation changes gas (water vapour) back into liquid droplets without destroying any water.'
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
        options: [
          'Dogs drank it all',
          'Heat from the sun evaporated the water into the air',
          'It turned into sand'
        ],
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
      },
      {
        id: 'q-evap-4',
        type: 'sensory_observation',
        prompt: 'When you step out of a swimming pool on a warm breezy day, what does your skin feel as water evaporates?',
        options: [
          'Your skin feels pleasantly cool as evaporating water carries away heat',
          'Your skin instantly freezes into solid ice',
          'Your skin gets heavier and hot'
        ],
        correctIndex: 0,
        explanation: 'Evaporation takes away heat energy, which is why drying skin feels wonderfully cool!'
      },
      {
        id: 'q-evap-5',
        type: 'curriculum_sequence',
        prompt: 'What is liquid water converted into during the evaporation milestone?',
        options: [
          'Invisible water vapour gas',
          'Hard granite stone',
          'Solid ice cubes'
        ],
        correctIndex: 0,
        explanation: 'Evaporation transforms liquid water into airborne, invisible water vapour.'
      },
      {
        id: 'q-evap-6',
        type: 'concept_check',
        prompt: 'Which wet laundry will dry (evaporate) the fastest?',
        options: [
          'Clothes hung outside spread out in bright sun and wind',
          'Clothes bunched up in a dark, cold, damp cellar',
          'Clothes sealed inside a plastic bag in the freezer'
        ],
        correctIndex: 0,
        explanation: 'Heat and airflow provide maximum energy for water molecules to evaporate rapidly!'
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
        options: [
          'It stays hot forever',
          'It cools down and condenses into cloud droplets',
          'It vanishes permanently from the Earth'
        ],
        correctIndex: 1,
        explanation: 'High in the atmosphere, low temperatures condense vapour into clouds.'
      },
      {
        id: 'q-vap-3',
        type: 'real_life',
        prompt: 'Can you usually see pure water vapour gas in the air in your classroom?',
        options: [
          'No, pure water vapour is an invisible gas throughout the air',
          'Yes, it is bright neon green',
          'Yes, it looks like purple smoke'
        ],
        correctIndex: 0,
        explanation: 'Water vapour is completely transparent and invisible until it condenses.'
      },
      {
        id: 'q-vap-4',
        type: 'sensory_observation',
        prompt: 'When a hot shower is running, what does the bathroom air feel like?',
        options: [
          'Warm, humid, and full of moisture',
          'Bone dry like a desert sandstorm',
          'Bitterly freezing and snowy'
        ],
        correctIndex: 0,
        explanation: 'Warm water fills the air with lots of warm, humid water vapour!'
      },
      {
        id: 'q-vap-5',
        type: 'curriculum_sequence',
        prompt: 'Where did the water vapour in our air originally come from?',
        options: [
          'From liquid water evaporating off oceans, lakes, plants, and rivers',
          'From falling meteorites',
          'From deep underground metal mines'
        ],
        correctIndex: 0,
        explanation: 'Sunlight evaporates surface water, creating the moisture circulating in our atmosphere.'
      },
      {
        id: 'q-vap-6',
        type: 'concept_check',
        prompt: 'What is the key difference between water vapour and liquid water?',
        options: [
          'Vapour particles are spread out as a gas; liquid particles stay closer together as a fluid',
          'Vapour is made of plastic; liquid is made of iron',
          'There is no difference in temperature or state'
        ],
        correctIndex: 0,
        explanation: 'Gas particles have more thermal energy and bounce freely, while liquid particles flow together.'
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
        options: [
          'Water droplets in clouds group together and become too heavy to stay floating',
          'The clouds get angry',
          'The sun pulls the water down'
        ],
        correctIndex: 0,
        explanation: 'When condensed drops grow heavy, gravity pulls them down as precipitation!'
      },
      {
        id: 'q-rain-2',
        type: 'real_life',
        prompt: 'Where does rain water go after it falls on hills and soil?',
        options: [
          'It flows into streams, rivers, and replenishes groundwater',
          'It leaves Earth into outer space',
          'It disappears forever'
        ],
        correctIndex: 0,
        explanation: 'Rainwater collects into bodies of water, continuing the continuous cycle.'
      },
      {
        id: 'q-rain-3',
        type: 'visual_symbol',
        prompt: 'Which picture card shows Rain (Precipitation) in our curriculum graph?',
        options: ['🌧️ Rain clouds with falling droplets', '☀️ Dry sunshine', '🌋 Hot volcano'],
        correctIndex: 0,
        explanation: 'The rain cloud with falling blue drops represents precipitation.'
      },
      {
        id: 'q-rain-4',
        type: 'sensory_observation',
        prompt: 'What sounds and sensations tell you rain is arriving?',
        options: [
          'Sound of pitter-patter raindrops on leaves and the fresh smell of damp soil',
          'Rumble of roaring tigers',
          'Total silence with floating sand'
        ],
        correctIndex: 0,
        explanation: 'The sound of raindrops and the earthy scent of rain on dry ground are classic sensory signs!'
      },
      {
        id: 'q-rain-5',
        type: 'curriculum_sequence',
        prompt: 'After rain falls into rivers and oceans, what stage restarts the water cycle?',
        options: [
          'Solar heating and evaporation begin the cycle again',
          'The water cycle stops forever',
          'The Earth turns upside down'
        ],
        correctIndex: 0,
        explanation: 'The water cycle is a continuous loop: rain returns water to Earth, where sun heats it to evaporate again.'
      },
      {
        id: 'q-rain-6',
        type: 'concept_check',
        prompt: 'Why is rain essential for plants, animals, and humans in our community?',
        options: [
          'It provides fresh water for crops to grow and fills drinking water reservoirs',
          'It paints all the trees blue',
          'It replaces all oxygen with rocks'
        ],
        correctIndex: 0,
        explanation: 'Precipitation delivers essential freshwater that sustains agriculture, ecosystems, and drinking reserves.'
      }
    ]
  },
  sun: {
    conceptId: 'sun',
    conceptLabel: 'Sun (Solar Energy)',
    memoryHook: 'The bright Sun provides solar heat energy that powers the continuous water cycle.',
    questions: [
      {
        id: 'q-sun-1',
        type: 'visual_symbol',
        prompt: 'Which card represents the primary energy powerhouse of the water cycle?',
        options: ['☀️ Bright Golden Sun', '🌙 Night Moon', '⭐ Distant Star'],
        correctIndex: 0,
        explanation: 'The Sun provides the solar heat that powers the entire water cycle.'
      },
      {
        id: 'q-sun-2',
        type: 'cause_effect',
        prompt: 'Without heat from the Sun, what would happen to the water cycle?',
        options: [
          'Water would freeze or remain still; evaporation would stop',
          'Rain would fall ten times faster',
          'Oceans would boil spontaneously'
        ],
        correctIndex: 0,
        explanation: 'Thermal energy from the sun is the engine driving evaporation and weather patterns.'
      },
      {
        id: 'q-sun-3',
        type: 'real_life',
        prompt: 'On a hot sunny afternoon, why does a puddle on the pavement dry up faster than on a cloudy day?',
        options: [
          'Direct sunlight gives water molecules more heat energy to escape into the air',
          'The sun reaches down with hands and scoops the water',
          'Clouds absorb the puddle directly'
        ],
        correctIndex: 0,
        explanation: 'Warm solar rays accelerate evaporation by heating surface water.'
      },
      {
        id: 'q-sun-4',
        type: 'sensory_observation',
        prompt: 'When you stand outside under the midday sun, what do you feel on your skin?',
        options: [
          'Gentle warmth and radiant thermal heat',
          'Extreme chilly ice and snow',
          'Strong electric shocks'
        ],
        correctIndex: 0,
        explanation: 'Solar radiation transfers thermal heat energy directly to Earth and water surfaces.'
      },
      {
        id: 'q-sun-5',
        type: 'curriculum_sequence',
        prompt: 'What process in the water cycle does the Sun directly stimulate first?',
        options: [
          'Heating liquid water so it evaporates into vapour',
          'Freezing clouds into heavy hail',
          'Digging underground rivers'
        ],
        correctIndex: 0,
        explanation: 'Solar energy heats surface water, kicking off the evaporation phase.'
      },
      {
        id: 'q-sun-6',
        type: 'concept_check',
        prompt: 'Does the Sun lose any water when it shines on the ocean?',
        options: [
          'No, the Sun provides heat from far away; it does not contain or absorb Earth water',
          'Yes, the Sun drinks half the ocean',
          'The sun is made of ocean water'
        ],
        correctIndex: 0,
        explanation: 'The sun is our solar star 150 million km away; its heat warms Earth without absorbing water itself.'
      }
    ]
  },
  water: {
    conceptId: 'water',
    conceptLabel: 'Water (Liquid Reservoirs)',
    memoryHook: 'Liquid water in lakes, rivers, and oceans is the foundational reservoir of life.',
    questions: [
      {
        id: 'q-wat-1',
        type: 'visual_symbol',
        prompt: 'Which symbol represents liquid water in oceans, lakes, and rivers?',
        options: ['💧 Blue Water Droplet', '🔥 Campfire Flame', '💨 Grey Smoke'],
        correctIndex: 0,
        explanation: 'The blue droplet represents liquid water, the foundation of the water cycle.'
      },
      {
        id: 'q-wat-2',
        type: 'real_life',
        prompt: 'About how much of the Earth’s surface is covered by liquid water?',
        options: ['About 71% — most of our blue planet!', 'Only 5%', 'Exactly 100% with no dry land'],
        correctIndex: 0,
        explanation: 'Oceans and seas cover over 70% of Earth, providing abundant water for the cycle.'
      },
      {
        id: 'q-wat-3',
        type: 'cause_effect',
        prompt: 'What happens to liquid water when it is heated to high temperatures?',
        options: [
          'It turns into invisible water vapour gas',
          'It turns into solid iron',
          'It vanishes permanently from reality'
        ],
        correctIndex: 0,
        explanation: 'Heating water gives its molecules enough energy to break free as vapor.'
      },
      {
        id: 'q-wat-4',
        type: 'sensory_observation',
        prompt: 'How does cool drinking water feel and taste when you drink it after playing sports?',
        options: [
          'Refreshing, fluid, and hydrating',
          'Crunchy like gravel',
          'Hot and spicy like chili'
        ],
        correctIndex: 0,
        explanation: 'Liquid water has no taste or shape of its own and quenches our biological thirst.'
      },
      {
        id: 'q-wat-5',
        type: 'curriculum_sequence',
        prompt: 'When rain falls, what does it replenish on the ground?',
        options: [
          'Lakes, rivers, ponds, and groundwater stores',
          'Only factory roofs',
          'Outer space clouds'
        ],
        correctIndex: 0,
        explanation: 'Precipitation collects in water bodies, restoring water reserves.'
      },
      {
        id: 'q-wat-6',
        type: 'concept_check',
        prompt: 'Does Earth ever create new water, or does the same water recycle over millions of years?',
        options: [
          'The same water constantly recycles through evaporation, condensation, and rain!',
          'New water is manufactured by factories every day',
          'All water on Earth is less than two days old'
        ],
        correctIndex: 0,
        explanation: 'Water is naturally conserved and recycled continuously across Earth for billions of years!'
      }
    ]
  }
};
