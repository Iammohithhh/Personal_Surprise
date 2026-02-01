import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Memory, LoveStory, StoryChapter, ViewMode, ExperienceState } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface StoreState {
  // View state
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Story creation
  currentStory: Partial<LoveStory>;
  setPartnerName: (name: string) => void;
  setYourName: (name: string) => void;
  setOccasion: (occasion: LoveStory['occasion'], custom?: string) => void;
  addMemory: (memory: Omit<Memory, 'id'>) => void;
  updateMemory: (id: string, memory: Partial<Memory>) => void;
  removeMemory: (id: string) => void;
  setChapters: (chapters: StoryChapter[]) => void;
  setFinalMessage: (message: string) => void;

  // Generated story
  generatedStory: LoveStory | null;
  setGeneratedStory: (story: LoveStory) => void;

  // Experience state
  experienceState: ExperienceState;
  setCurrentChapter: (chapter: number) => void;
  revealChapter: () => void;
  setResponse: (response: 'yes' | 'no') => void;
  resetExperience: () => void;

  // Utilities
  resetAll: () => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
}

const initialExperienceState: ExperienceState = {
  currentChapter: 0,
  isRevealed: false,
  hasResponded: false,
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // View state
      viewMode: 'landing',
      setViewMode: (mode) => set({ viewMode: mode }),

      // Story creation
      currentStory: {
        memories: [],
        occasion: 'valentine',
      },
      setPartnerName: (name) =>
        set((state) => ({
          currentStory: { ...state.currentStory, partnerName: name },
        })),
      setYourName: (name) =>
        set((state) => ({
          currentStory: { ...state.currentStory, yourName: name },
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
          currentStory: { memories: [], occasion: 'valentine' },
          generatedStory: null,
          experienceState: initialExperienceState,
          isGenerating: false,
        }),
      isGenerating: false,
      setIsGenerating: (generating) => set({ isGenerating: generating }),
    }),
    {
      name: 'love-story-storage',
      partialize: (state) => ({
        currentStory: state.currentStory,
        generatedStory: state.generatedStory,
      }),
    }
  )
);
