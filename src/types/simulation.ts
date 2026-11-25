export interface AiSimulationStep {
  stepNumber: number;
  id: string;
  name: string;
  nameKn: string;
  symbol: string;
  actionButtonLabel: string;
  actionButtonLabelKn: string;
  pipExplanation: string;
  pipExplanationKn: string;
  visualState: {
    skyGradient: string;
    stageAtmosphere: string;
    activeVisualEmoji: string;
    animationType: 'pulse' | 'bounce' | 'sparkle' | 'flow' | 'rain' | 'float';
    gaugeLabel: string;
    gaugeValue: string;
    gaugePercent: number;
  };
  causeAndEffect: {
    cause: string;
    effect: string;
  };
  sensoryClues?: {
    sight?: string;
    sightKn?: string;
    touch?: string;
    touchKn?: string;
    sound?: string;
    soundKn?: string;
  };
  aacReactionPhrase?: string;
  aacReactionPhraseKn?: string;
}

export interface AiSimulation {
  topic: string;
  topicKn?: string;
  inquiryQuestion: string;
  inquiryQuestionKn?: string;
  introMessage: string;
  introMessageKn?: string;
  themeType: 'weather' | 'botany' | 'physics' | 'biology' | 'chemistry' | 'space' | 'general';
  steps: AiSimulationStep[];
  celebrationMessage: string;
  celebrationMessageKn?: string;
  isAiGenerated?: boolean;
}
