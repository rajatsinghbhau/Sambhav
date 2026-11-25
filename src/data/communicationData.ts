export interface CommunicationPhrase {
  id: string;
  text: string;
  kannadaText: string;
  symbol: string;
}

export const COMMUNICATION_PHRASES: CommunicationPhrase[] = [
  { id: 'p1', text: 'I know the answer', kannadaText: 'ನನಗೆ ಉತ್ತರ ತಿಳಿದಿದೆ', symbol: '💬' },
  { id: 'p2', text: 'I have a question', kannadaText: 'ನನಗೊಂದು ಪ್ರಶ್ನೆ ಇದೆ', symbol: '❓' },
  { id: 'p3', text: 'Explain again', kannadaText: 'ಮತ್ತೊಮ್ಮೆ ವಿವರಿಸಿ', symbol: '🔁' },
  { id: 'p4', text: 'I need help', kannadaText: 'ನನಗೆ ಸಹಾಯ ಬೇಕು', symbol: '🙋' },
  { id: 'p5', text: 'I understand', kannadaText: 'ನನಗೆ ಅರ್ಥವಾಯಿತು', symbol: '✅' },
  { id: 'p6', text: 'I want to say something', kannadaText: 'ನಾನು ಏನಾದರೂ ಹೇಳಲು ಬಯಸುತ್ತೇನೆ', symbol: '🗣️' },
];

export const SAMBHAV_GUIDE_PROMPTS = [
  'Tell me what you learned today.',
  'What happens after the Sun heats water?',
  'What happens after evaporation?',
  'What happens when water vapour cools?',
  'Can you teach condensation back to me?',
] as const;
