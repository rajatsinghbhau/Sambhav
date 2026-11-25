import { ConceptGraph, DistractorNode } from '../types/conceptGraph';

/**
 * The Canonical Concept Graph for the Water Cycle.
 * This is the SINGLE SOURCE OF TRUTH across the application.
 *
 * Sequence: Sun → Heat → Water → Evaporation → Vapour → Condensation → Rain
 * Note: 💨 is reserved exclusively for Vapour.
 */
export const WATER_CYCLE_GRAPH: ConceptGraph = {
  id: 'water-cycle',
  title: 'Water Cycle',
  titleKn: 'ಜಲಚಕ್ರ',
  subtitle: "Today's Science Lesson",
  nodes: [
    {
      id: 'sun',
      label: 'Sun',
      kannadaLabel: 'ಸೂರ್ಯ',
      symbol: '☀️',
      explanation: 'The Sun provides energy and warm sunlight to our planet Earth.'
    },
    {
      id: 'heat',
      label: 'Heat',
      kannadaLabel: 'ಶಾಖ',
      symbol: '🔥',
      explanation: 'Solar energy creates heat that warms up the air and water bodies.'
    },
    {
      id: 'water',
      label: 'Water',
      kannadaLabel: 'ನೀರು',
      symbol: '💧',
      explanation: 'Water in oceans, rivers, and lakes warms up under direct heat.'
    },
    {
      id: 'evaporation',
      label: 'Evaporation',
      kannadaLabel: 'ಆವಿಯಾಗುವಿಕೆ',
      symbol: '⬆️',
      explanation: 'Warm water turns from liquid into invisible gas rising into the sky.'
    },
    {
      id: 'vapour',
      label: 'Vapour',
      kannadaLabel: 'ನೀರಾವಿ',
      symbol: '💨',
      explanation: 'Water vapour floats upward through the air into the cooler upper atmosphere.'
    },
    {
      id: 'condensation',
      label: 'Condensation',
      kannadaLabel: 'ಘನೀಕರಣ',
      symbol: '☁️',
      explanation: 'When water vapour cools, it changes into tiny water droplets. This is called condensation.'
    },
    {
      id: 'rain',
      label: 'Rain',
      kannadaLabel: 'ಮಳೆ',
      symbol: '🌧️',
      explanation: 'Dense water droplets combine in clouds and fall down as precipitation or rain.'
    }
  ],
  edges: [
    { from: 'sun', to: 'heat', relation: 'produces' },
    { from: 'heat', to: 'water', relation: 'heats' },
    { from: 'water', to: 'evaporation', relation: 'causes' },
    { from: 'evaporation', to: 'vapour', relation: 'creates' },
    { from: 'vapour', to: 'condensation', relation: 'leads_to' },
    { from: 'condensation', to: 'rain', relation: 'forms' }
  ]
};

export const DISTRACTOR_NODES: DistractorNode[] = [
  { id: 'snow', label: 'Snow', kannadaLabel: 'ಹಿಮ', symbol: '❄️' },
  { id: 'wind', label: 'Wind', kannadaLabel: 'ಗಾಳಿ', symbol: '🌬️' }
];

export const FALLBACK_GRAPH: ConceptGraph = WATER_CYCLE_GRAPH;
