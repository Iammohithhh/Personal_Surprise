export interface Memory {
  id: string;
  photo?: string; // base64 or URL
  note?: string; // Made optional
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

// Extended occasions for broader audience
export type Occasion =
  | 'valentine'
  | 'anniversary'
  | 'birthday'
  | 'wedding'
  | 'proposal'
  | 'friendship'
  | 'graduation'
  | 'thank_you'
  | 'congratulations'
  | 'get_well'
  | 'new_year'
  | 'mothers_day'
  | 'fathers_day'
  | 'just_because'
  | 'other';

// Relationship types for broader audience
export type RecipientType =
  | 'partner'
  | 'friend'
  | 'family'
  | 'parent'
  | 'sibling'
  | 'grandparent'
  | 'colleague'
  | 'other';

export interface Story {
  id: string;
  userId?: string; // For logged in users
  recipientName: string;
  creatorName: string;
  recipientType: RecipientType;
  occasion: Occasion;
  customOccasion?: string;
  memories: Memory[];
  chapters: StoryChapter[];
  finalMessage: string;
  createdAt: Date;
  updatedAt?: Date;
  isPublic?: boolean;
  shareCode?: string;
}

// Keep LoveStory as alias for backward compatibility
export type LoveStory = Story;

export type ViewMode = 'landing' | 'create' | 'preview' | 'experience' | 'dashboard';

export interface ExperienceState {
  currentChapter: number;
  isRevealed: boolean;
  hasResponded: boolean;
  response?: 'yes' | 'no';
}

// User profile
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
}

// Database types for Supabase
export interface DbStory {
  id: string;
  user_id: string;
  recipient_name: string;
  creator_name: string;
  recipient_type: RecipientType;
  occasion: Occasion;
  custom_occasion?: string;
  final_message: string;
  share_code?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbMemory {
  id: string;
  story_id: string;
  photo_url?: string;
  note?: string;
  date?: string;
  location?: string;
  order_index: number;
  created_at: string;
}

export interface DbChapter {
  id: string;
  story_id: string;
  memory_id: string;
  title: string;
  narrative: string;
  inner_monologue?: string;
  atmosphere?: string;
  order_index: number;
  created_at: string;
}
