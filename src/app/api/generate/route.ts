import { NextResponse } from 'next/server';
import { Memory, Story, StoryChapter, Occasion, RecipientType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface GenerateRequest {
  // New field names
  recipientName?: string;
  creatorName?: string;
  recipientType?: RecipientType;
  // Legacy field names (for backward compatibility)
  partnerName?: string;
  yourName?: string;
  occasion: Occasion;
  customOccasion?: string;
  memories: Memory[];
  finalMessage: string;
}

// Generate beautiful narratives without AI
function generateNarrative(
  memory: Memory,
  index: number,
  total: number,
  recipientName: string,
  hasPhoto: boolean
): {
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
    `${recipientName}, do you remember this moment?`,
    `There are some moments that define us.`,
    `Some memories shine brighter than others.`,
    `I close my eyes and I'm right back there.`,
    `This is one of those moments I'll never forget.`,
  ];

  const photoOnlyNarratives = [
    `A picture is worth a thousand words, and this one speaks volumes about how much you mean to me.`,
    `This image captures something words could never fully express.`,
    `Every time I see this, I'm reminded of how special our bond is.`,
    `Some moments are best captured in silence, letting the image tell the story.`,
    `This picture holds a thousand memories, each one more precious than the last.`,
  ];

  const innerMonologues = [
    "What I didn't tell you... is that my heart was racing the entire time.",
    "What I didn't tell you... is that I already knew you were special.",
    "What I didn't tell you... is that I knew, even then, you meant so much to me.",
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

  let narrative: string;

  if (!memory.note && hasPhoto) {
    // Photo-only memory
    narrative = photoOnlyNarratives[index % photoOnlyNarratives.length];
    if (isFirst) {
      narrative = `This is where our story begins. ${narrative}`;
    } else if (isLast) {
      narrative = `And then there was this moment. ${narrative}`;
    }
  } else if (memory.note) {
    narrative = `${opening} ${memory.note}`;
    if (isFirst) {
      narrative = `This is where our story begins. ${memory.note} Looking back, I realize this was the moment that set everything in motion.`;
    } else if (isLast) {
      narrative = `And then there was this moment. ${memory.note} Every memory with you has led us here, to this very moment.`;
    }
  } else {
    narrative = photoOnlyNarratives[index % photoOnlyNarratives.length];
  }

  return { title, narrative, innerMonologue, atmosphere };
}

function buildPrompt(
  memory: Memory,
  index: number,
  total: number,
  creatorName: string,
  recipientName: string,
  occasionText: string,
  recipientType: string
): string {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const hasPhoto = !!memory.photo;
  const hasNote = !!memory.note;

  const relationshipContext = recipientType === 'partner'
    ? 'romantic love story'
    : recipientType === 'friend'
    ? 'heartfelt friendship story'
    : recipientType === 'parent' || recipientType === 'grandparent'
    ? 'loving tribute to family'
    : 'meaningful personal story';

  let memoryDescription = '';
  if (hasNote) {
    memoryDescription = `Note from ${creatorName}: "${memory.note}"`;
  } else if (hasPhoto) {
    memoryDescription = `A meaningful photo memory (no text description provided)`;
  }

  return `You are a storyteller crafting a deeply personal ${relationshipContext}. Write a chapter from ${creatorName}'s perspective to ${recipientName}.

Memory details:
- ${memoryDescription}
${memory.date ? `- When: ${memory.date}` : ''}
${memory.location ? `- Where: ${memory.location}` : ''}
${hasPhoto && !hasNote ? '- This is a photo-only memory, so write something evocative about the visual memory' : ''}

This is chapter ${index + 1} of ${total}.
${isFirst ? 'This is the opening chapter - set the emotional tone and introduce the story beautifully.' : ''}
${isLast ? 'This is the final memory chapter before the final message - build emotional anticipation.' : ''}

The occasion is: ${occasionText}
The relationship: ${recipientType}

Write:
1. A short, evocative chapter title (3-5 words)
2. A narrative paragraph (2-3 sentences) that transforms this memory into beautiful prose. Write in second person ("You were..."), making ${recipientName} feel the moment.
3. An inner monologue (1-2 sentences) - what ${creatorName} was thinking/feeling but didn't say out loud. Start with "What I didn't tell you..."
4. An atmosphere description (a few words describing the sensory details - sounds, smells, light)

Respond ONLY with valid JSON in this exact format:
{
  "title": "chapter title",
  "narrative": "the narrative paragraph",
  "innerMonologue": "the inner thoughts",
  "atmosphere": "sensory atmosphere"
}

Be emotionally authentic, not cheesy. Make it feel real and personal.`;
}

async function generateWithGroq(
  memories: Memory[],
  creatorName: string,
  recipientName: string,
  occasionText: string,
  recipientType: string
): Promise<StoryChapter[]> {
  const Groq = (await import('groq-sdk')).default;
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const chapters: StoryChapter[] = [];

  for (let i = 0; i < memories.length; i++) {
    const memory = memories[i];
    const prompt = buildPrompt(memory, i, memories.length, creatorName, recipientName, occasionText, recipientType);

    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content || '{}';
      const chapterContent = JSON.parse(content);

      chapters.push({
        id: uuidv4(),
        title: chapterContent.title || `Memory ${i + 1}`,
        narrative: chapterContent.narrative || memory.note || 'A cherished memory.',
        memory,
        innerMonologue: chapterContent.innerMonologue,
        atmosphere: chapterContent.atmosphere,
      });
    } catch (aiError) {
      console.error('Groq chapter error:', aiError);
      const generated = generateNarrative(memory, i, memories.length, recipientName, !!memory.photo);
      chapters.push({
        id: uuidv4(),
        ...generated,
        memory,
      });
    }
  }

  return chapters;
}

async function generateWithOpenAI(
  memories: Memory[],
  creatorName: string,
  recipientName: string,
  occasionText: string,
  recipientType: string
): Promise<StoryChapter[]> {
  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const chapters: StoryChapter[] = [];

  for (let i = 0; i < memories.length; i++) {
    const memory = memories[i];
    const prompt = buildPrompt(memory, i, memories.length, creatorName, recipientName, occasionText, recipientType);

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content || '{}';
      const chapterContent = JSON.parse(content);

      chapters.push({
        id: uuidv4(),
        title: chapterContent.title || `Memory ${i + 1}`,
        narrative: chapterContent.narrative || memory.note || 'A cherished memory.',
        memory,
        innerMonologue: chapterContent.innerMonologue,
        atmosphere: chapterContent.atmosphere,
      });
    } catch (aiError) {
      console.error('OpenAI chapter error:', aiError);
      const generated = generateNarrative(memory, i, memories.length, recipientName, !!memory.photo);
      chapters.push({
        id: uuidv4(),
        ...generated,
        memory,
      });
    }
  }

  return chapters;
}

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();

    // Support both new and legacy field names
    const recipientName = body.recipientName || body.partnerName || 'Someone Special';
    const creatorName = body.creatorName || body.yourName || 'Someone';
    const recipientType = body.recipientType || 'friend';
    const { occasion, customOccasion, memories, finalMessage } = body;

    if (!recipientName || !creatorName || !memories || memories.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const occasionText = occasion === 'other' ? customOccasion || 'special occasion' : occasion;

    // Check which AI providers are available
    const hasGroq = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here';
    const hasOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';

    let chapters: StoryChapter[] = [];

    // Try Groq first (free!), then OpenAI, then fallback
    if (hasGroq) {
      try {
        console.log('Using Groq for story generation...');
        chapters = await generateWithGroq(memories, creatorName, recipientName, occasionText, recipientType);
      } catch (error) {
        console.error('Groq failed, trying fallback:', error);
        if (hasOpenAI) {
          chapters = await generateWithOpenAI(memories, creatorName, recipientName, occasionText, recipientType);
        } else {
          chapters = memories.map((memory, index) => {
            const generated = generateNarrative(memory, index, memories.length, recipientName, !!memory.photo);
            return { id: uuidv4(), ...generated, memory };
          });
        }
      }
    } else if (hasOpenAI) {
      try {
        console.log('Using OpenAI for story generation...');
        chapters = await generateWithOpenAI(memories, creatorName, recipientName, occasionText, recipientType);
      } catch (error) {
        console.error('OpenAI failed, using fallback:', error);
        chapters = memories.map((memory, index) => {
          const generated = generateNarrative(memory, index, memories.length, recipientName, !!memory.photo);
          return { id: uuidv4(), ...generated, memory };
        });
      }
    } else {
      // No AI API keys - use beautiful pre-written narratives
      console.log('No AI API key found, using fallback narratives...');
      chapters = memories.map((memory, index) => {
        const generated = generateNarrative(memory, index, memories.length, recipientName, !!memory.photo);
        return { id: uuidv4(), ...generated, memory };
      });
    }

    const story: Story = {
      id: uuidv4(),
      recipientName,
      creatorName,
      recipientType,
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

    return NextResponse.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    );
  }
}
