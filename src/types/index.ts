export interface Memory {
  id: string;
  photo?: string; // base64 or URL
  note: string;
  date?: string;
  location?: string;
}

export interface StoryChapter {
  id: string;
  title: string;
  narrative: string;
  memory: Memory;
  innerMonologue?: string;
  atmosphere?: string;
}

export interface LoveStory {
  id: string;
  partnerName: string;
  yourName: string;
  occasion: 'valentine' | 'anniversary' | 'birthday' | 'wedding' | 'proposal' | 'other';
  customOccasion?: string;
  memories: Memory[];
  chapters: StoryChapter[];
  finalMessage: string;
  createdAt: Date;
}

export type ViewMode = 'landing' | 'create' | 'preview' | 'experience';

export interface ExperienceState {
  currentChapter: number;
  isRevealed: boolean;
  hasResponded: boolean;
  response?: 'yes' | 'no';
}
