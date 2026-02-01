import { NextResponse } from 'next/server';
import { Memory, LoveStory, StoryChapter } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface GenerateRequest {
  partnerName: string;
  yourName: string;
  occasion: LoveStory['occasion'];
  customOccasion?: string;
  memories: Memory[];
  finalMessage: string;
}

// Generate beautiful narratives without AI
function generateNarrative(memory: Memory, index: number, total: number, partnerName: string): {
  title: string;
  narrative: string;
  innerMonologue: string;
  atmosphere: string;
} {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const titles = [
    "The Moment Everything Changed",
    "When Time Stood Still",
    "A Memory Etched in Gold",
    "The Day I Knew",
    "Written in the Stars",
    "Our Beautiful Beginning",
    "Where Love Found Us",
    "A Chapter of Forever",
    "When Hearts Aligned",
    "The Magic Between Us"
  ];

  const openings = [
    `${partnerName}, do you remember this moment?`,
    `There are some moments that define us.`,
    `Some memories shine brighter than others.`,
    `I close my eyes and I'm right back there.`,
    `This is one of those moments I'll never forget.`,
  ];

  const innerMonologues = [
    "What I didn't tell you... is that my heart was racing the entire time.",
    "What I didn't tell you... is that I was already falling for you.",
    "What I didn't tell you... is that I knew, even then, you were special.",
    "What I didn't tell you... is that I replay this moment in my mind constantly.",
    "What I didn't tell you... is that this was when everything changed for me.",
    "What I didn't tell you... is that I was trying so hard to play it cool.",
    "What I didn't tell you... is that I never wanted that moment to end.",
  ];

  const atmospheres = [
    "soft light, gentle warmth, the world fading away",
    "time slowing down, hearts beating in sync",
    "laughter in the air, eyes meeting across the room",
    "quiet intimacy, unspoken understanding",
    "golden hour light, everything perfect",
    "the world around us disappearing",
    "a feeling of coming home",
  ];

  const title = titles[index % titles.length];
  const opening = openings[index % openings.length];
  const innerMonologue = innerMonologues[index % innerMonologues.length];
  const atmosphere = memory.location
    ? `${memory.location} — ${atmospheres[index % atmospheres.length]}`
    : atmospheres[index % atmospheres.length];

  let narrative = `${opening} ${memory.note}`;

  if (isFirst) {
    narrative = `This is where our story begins. ${memory.note} Looking back, I realize this was the moment that set everything in motion.`;
  } else if (isLast) {
    narrative = `And then there was this moment. ${memory.note} Every memory with you has led us here, to this very moment.`;
  }

  return { title, narrative, innerMonologue, atmosphere };
}

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();
    const { partnerName, yourName, occasion, customOccasion, memories, finalMessage } = body;

    if (!partnerName || !yourName || !memories || memories.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if OpenAI is available
    const hasOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';

    let chapters: StoryChapter[] = [];

    if (hasOpenAI) {
      // Dynamic import to avoid build errors
      try {
        const OpenAI = (await import('openai')).default;
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        const occasionText = occasion === 'other' ? customOccasion : occasion;

        for (let i = 0; i < memories.length; i++) {
          const memory = memories[i];
          const isFirst = i === 0;
          const isLast = i === memories.length - 1;

          const prompt = `You are a romantic storyteller crafting a deeply personal love story. Write a chapter for a love story from ${yourName}'s perspective to ${partnerName}.

Memory details:
- Note from ${yourName}: "${memory.note}"
${memory.date ? `- When: ${memory.date}` : ''}
${memory.location ? `- Where: ${memory.location}` : ''}

This is chapter ${i + 1} of ${memories.length}.
${isFirst ? 'This is the opening chapter - set the emotional tone and introduce the story beautifully.' : ''}
${isLast ? 'This is the final memory chapter before the big question - build emotional anticipation.' : ''}

The occasion is: ${occasionText}

Write:
1. A short, evocative chapter title (3-5 words)
2. A narrative paragraph (2-3 sentences) that transforms this memory into beautiful prose. Write in second person ("You were..."), making ${partnerName} feel the moment.
3. An inner monologue (1-2 sentences) - what ${yourName} was thinking/feeling but didn't say out loud. Start with "What I didn't tell you..."
4. An atmosphere description (a few words describing the sensory details - sounds, smells, light)

Respond in JSON format:
{
  "title": "chapter title",
  "narrative": "the narrative paragraph",
  "innerMonologue": "the inner thoughts",
  "atmosphere": "sensory atmosphere"
}

Be emotionally authentic, not cheesy. Make it feel real and personal.`;

          try {
            const completion = await openai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.8,
              response_format: { type: 'json_object' },
            });

            const chapterContent = JSON.parse(completion.choices[0].message.content || '{}');

            chapters.push({
              id: uuidv4(),
              title: chapterContent.title || `Memory ${i + 1}`,
              narrative: chapterContent.narrative || memory.note,
              memory,
              innerMonologue: chapterContent.innerMonologue,
              atmosphere: chapterContent.atmosphere,
            });
          } catch (aiError) {
            // Fallback for this chapter
            const generated = generateNarrative(memory, i, memories.length, partnerName);
            chapters.push({
              id: uuidv4(),
              ...generated,
              memory,
            });
          }
        }
      } catch (importError) {
        // OpenAI import failed, use fallback
        chapters = memories.map((memory, index) => {
          const generated = generateNarrative(memory, index, memories.length, partnerName);
          return {
            id: uuidv4(),
            ...generated,
            memory,
          };
        });
      }
    } else {
      // No OpenAI API key - use beautiful pre-written narratives
      chapters = memories.map((memory, index) => {
        const generated = generateNarrative(memory, index, memories.length, partnerName);
        return {
          id: uuidv4(),
          ...generated,
          memory,
        };
      });
    }

    const story: LoveStory = {
      id: uuidv4(),
      partnerName,
      yourName,
      occasion,
      customOccasion,
      memories,
      chapters,
      finalMessage,
      createdAt: new Date(),
    };

    return NextResponse.json(story);
  } catch (error) {
    console.error('Error generating story:', error);

    // Return error response
    return NextResponse.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    );
  }
}
