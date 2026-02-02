import { Story } from '@/types';

// Story data without heavy photo base64 strings
interface ShareableStory {
  id: string;
  recipientName: string;
  creatorName: string;
  recipientType?: string;
  occasion: string;
  customOccasion?: string;
  finalMessage: string;
  chapters: {
    id: string;
    title: string;
    narrative: string;
    atmosphere?: string;
    memory: {
      id: string;
      note?: string;
      date?: string;
      location?: string;
      hasPhoto?: boolean;
    };
  }[];
}

// Encode story for URL (without photos)
export function encodeStoryForShare(story: Story): string {
  // Create a lightweight version without photos
  const shareable: ShareableStory = {
    id: story.id,
    recipientName: story.recipientName,
    creatorName: story.creatorName,
    recipientType: story.recipientType,
    occasion: story.occasion,
    customOccasion: story.customOccasion,
    finalMessage: story.finalMessage,
    chapters: story.chapters.map(ch => ({
      id: ch.id,
      title: ch.title,
      narrative: ch.narrative,
      atmosphere: ch.atmosphere,
      memory: {
        id: ch.memory.id,
        note: ch.memory.note,
        date: ch.memory.date,
        location: ch.memory.location,
        hasPhoto: !!ch.memory.photo,
      },
    })),
  };

  // Convert to JSON and base64 encode
  const json = JSON.stringify(shareable);

  // Use base64url encoding (URL-safe)
  const base64 = btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return base64;
}

// Decode story from URL
export function decodeStoryFromShare(encoded: string): Story | null {
  try {
    // Add back padding if needed
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    // Decode
    const json = decodeURIComponent(escape(atob(base64)));
    const shareable: ShareableStory = JSON.parse(json);

    // Convert back to full Story format
    const story: Story = {
      id: shareable.id,
      recipientName: shareable.recipientName,
      creatorName: shareable.creatorName,
      recipientType: shareable.recipientType as Story['recipientType'],
      occasion: shareable.occasion as Story['occasion'],
      customOccasion: shareable.customOccasion,
      finalMessage: shareable.finalMessage,
      memories: shareable.chapters.map(ch => ({
        id: ch.memory.id,
        note: ch.memory.note,
        date: ch.memory.date,
        location: ch.memory.location,
        // No photo in shared version
      })),
      chapters: shareable.chapters.map(ch => ({
        id: ch.id,
        title: ch.title,
        narrative: ch.narrative,
        atmosphere: ch.atmosphere,
        memory: {
          id: ch.memory.id,
          note: ch.memory.note,
          date: ch.memory.date,
          location: ch.memory.location,
          // No photo in shared version
        },
      })),
      createdAt: new Date(),
    };

    return story;
  } catch (error) {
    console.error('Failed to decode story:', error);
    return null;
  }
}
