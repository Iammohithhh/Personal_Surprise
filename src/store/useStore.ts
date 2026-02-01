import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Memory, Story, StoryChapter, ViewMode, ExperienceState, Occasion, RecipientType, UserProfile } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface StoreState {
  // Auth state
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isAuthLoading: boolean;
  setIsAuthLoading: (loading: boolean) => void;

  // View state
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // User's saved stories
  savedStories: Story[];
  setSavedStories: (stories: Story[]) => void;
  addSavedStory: (story: Story) => void;
  removeSavedStory: (id: string) => void;

  // Story creation
  currentStory: Partial<Story>;
  setRecipientName: (name: string) => void;
  setCreatorName: (name: string) => void;
  setRecipientType: (type: RecipientType) => void;
  setOccasion: (occasion: Occasion, custom?: string) => void;
  addMemory: (memory: Omit<Memory, 'id'>) => void;
  updateMemory: (id: string, memory: Partial<Memory>) => void;
  removeMemory: (id: string) => void;
  setChapters: (chapters: StoryChapter[]) => void;
  setFinalMessage: (message: string) => void;
  loadStoryForEdit: (story: Story) => void;

  // Generated story
  generatedStory: Story | null;
  setGeneratedStory: (story: Story) => void;

  // Experience state
  experienceState: ExperienceState;
  setCurrentChapter: (chapter: number) => void;
  revealChapter: () => void;
  setResponse: (response: 'yes' | 'no') => void;
  resetExperience: () => void;

  // Utilities
  resetAll: () => void;
  resetCurrentStory: () => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
}

const initialExperienceState: ExperienceState = {
  currentChapter: 0,
  isRevealed: false,
  hasResponded: false,
};

const initialStory: Partial<Story> = {
  memories: [],
  occasion: 'just_because',
  recipientType: 'friend',
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      setUser: (user) => set({ user }),
      isAuthLoading: true,
      setIsAuthLoading: (loading) => set({ isAuthLoading: loading }),

      // View state
      viewMode: 'landing',
      setViewMode: (mode) => set({ viewMode: mode }),

      // User's saved stories
      savedStories: [],
      setSavedStories: (stories) => set({ savedStories: stories }),
      addSavedStory: (story) =>
        set((state) => ({
          savedStories: [story, ...state.savedStories],
        })),
      removeSavedStory: (id) =>
        set((state) => ({
          savedStories: state.savedStories.filter((s) => s.id !== id),
        })),

      // Story creation
      currentStory: initialStory,
      setRecipientName: (name) =>
        set((state) => ({
          currentStory: { ...state.currentStory, recipientName: name },
        })),
      setCreatorName: (name) =>
        set((state) => ({
          currentStory: { ...state.currentStory, creatorName: name },
        })),
      setRecipientType: (type) =>
        set((state) => ({
          currentStory: { ...state.currentStory, recipientType: type },
        })),
      setOccasion: (occasion, custom) =>
        set((state) => ({
          currentStory: { ...state.currentStory, occasion, customOccasion: custom },
        })),
      addMemory: (memory) =>
        set((state) => ({
          currentStory: {
            ...state.currentStory,
            memories: [...(state.currentStory.memories || []), { ...memory, id: uuidv4() }],
          },
        })),
      updateMemory: (id, memoryUpdate) =>
        set((state) => ({
          currentStory: {
            ...state.currentStory,
            memories: (state.currentStory.memories || []).map((m) =>
              m.id === id ? { ...m, ...memoryUpdate } : m
            ),
          },
        })),
      removeMemory: (id) =>
        set((state) => ({
          currentStory: {
            ...state.currentStory,
            memories: (state.currentStory.memories || []).filter((m) => m.id !== id),
          },
        })),
      setChapters: (chapters) =>
        set((state) => ({
          currentStory: { ...state.currentStory, chapters },
        })),
      setFinalMessage: (message) =>
        set((state) => ({
          currentStory: { ...state.currentStory, finalMessage: message },
        })),
      loadStoryForEdit: (story) =>
        set({
          currentStory: story,
          viewMode: 'create',
        }),

      // Generated story
      generatedStory: null,
      setGeneratedStory: (story) => set({ generatedStory: story }),

      // Experience state
      experienceState: initialExperienceState,
      setCurrentChapter: (chapter) =>
        set((state) => ({
          experienceState: { ...state.experienceState, currentChapter: chapter, isRevealed: false },
        })),
      revealChapter: () =>
        set((state) => ({
          experienceState: { ...state.experienceState, isRevealed: true },
        })),
      setResponse: (response) =>
        set((state) => ({
          experienceState: { ...state.experienceState, hasResponded: true, response },
        })),
      resetExperience: () => set({ experienceState: initialExperienceState }),

      // Utilities
      resetAll: () =>
        set({
          viewMode: 'landing',
          currentStory: initialStory,
          generatedStory: null,
          experienceState: initialExperienceState,
          isGenerating: false,
        }),
      resetCurrentStory: () =>
        set({
          currentStory: initialStory,
          generatedStory: null,
          experienceState: initialExperienceState,
        }),
      isGenerating: false,
      setIsGenerating: (generating) => set({ isGenerating: generating }),
    }),
    {
      name: 'surprise-story-storage',
      partialize: (state) => ({
        currentStory: state.currentStory,
        generatedStory: state.generatedStory,
        savedStories: state.savedStories,
      }),
    }
  )
);
