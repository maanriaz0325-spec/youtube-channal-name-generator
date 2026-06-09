export interface Scores {
  memorability: number;
  pronunciation: number;
  scalability: number;
  brandPotential: number;
}

export interface Tests {
  phoneTest: string;
  thumbnailTest: string;
  longevityTest: string;
  searchTest: string;
}

export interface Availability {
  youtubeHandleStatus: string;
  handleSuggestion: string;
  domainNote: string;
}

export interface ResearchData {
  coreActivity: string;
  invisibleStruggle: string;
  transformationMoment: string;
  coreTension: string;
  nicheObjects: string[];
}

export interface NameCard {
  name: string;
  angle: string;
  wordCount: number;
  complexityBalance?: string;
  researchConnection?: string;
  whyItWorks: string;
  viewerThought?: string;
  handleSuggestion?: string;
  twist?: string;
  length?: string;
  audienceIdealization?: string;
  emotionalBranding?: string;
  brandHistoryCheck?: string;
  overallScore: number;
  scoreLabel: string;
  scores: Scores;
  tests: Tests;
  availability: Availability;
  variations: string[];
}

export interface GeneratorResponse {
  userWords: string;
  niche: string;
  tone: string;
  research: ResearchData;
  names: NameCard[];
}

