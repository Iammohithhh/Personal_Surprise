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
  storyStyle?: 'short' | 'medium' | 'none';
}

// Generate narratives - style can be 'short', 'medium', or 'none'
function generateNarrative(
  memory: Memory,
  index: number,
  total: number,
  recipientName: string,
  hasPhoto: boolean,
  style: 'short' | 'medium' | 'none' = 'short'
): {
  title: string;
  narrative: string;
  innerMonologue?: string;
  atmosphere?: string;
} {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  // Simple titles for all styles
  const simpleTitles = [
    `Memory ${index + 1}`,
    "A Special Moment",
    "Remember This?",
    "This Day",
    "Together",
  ];

  // For "none" style - just use user's words directly
  if (style === 'none') {
    const title = simpleTitles[index % simpleTitles.length];
    const narrative = memory.note || (hasPhoto ? "A special memory captured in this photo." : "A cherished moment.");
    return {
      title,
      narrative,
      atmosphere: memory.location || undefined,
    };
  }

  const titles = [
    "The Moment Everything Changed",
    "When Time Stood Still",
    "A Memory Worth Keeping",
    "The Day I Knew",
    "A Beautiful Memory",
    "Our Story Continues",
    "A Special Moment",
    "This Chapter",
  ];

  const shortOpenings = [
    `Remember this?`,
    `This moment meant a lot.`,
    `I still think about this.`,
  ];

  const photoOnlyNarratives = [
    `This photo says it all.`,
    `Some moments don't need words.`,
    `This picture means so much to me.`,
  ];

  const title = titles[index % titles.length];
  const opening = shortOpenings[index % shortOpenings.length];
  const atmosphere = memory.location || undefined;

  let narrative: string;

  if (!memory.note && hasPhoto) {
    narrative = photoOnlyNarratives[index % photoOnlyNarratives.length];
  } else if (memory.note) {
    if (style === 'short') {
      narrative = `${opening} ${memory.note}`;
    } else {
      // medium style - add a bit more context
      if (isFirst) {
        narrative = `This is where it begins. ${memory.note}`;
      } else if (isLast) {
        narrative = `And then there was this. ${memory.note}`;
      } else {
        narrative = `${opening} ${memory.note}`;
      }
    }
  } else {
    narrative = photoOnlyNarratives[index % photoOnlyNarratives.length];
  }

  return { title, narrative, atmosphere };
}

function buildPrompt(
  memory: Memory,
  index: number,
  total: number,
  creatorName: string,
  recipientName: string,
  occasionText: string,
  recipientType: string,
  style: 'short' | 'medium' = 'short'
): string {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const hasPhoto = !!memory.photo;
  const hasNote = !!memory.note;

  const relationshipContext = recipientType === 'partner'
    ? 'romantic'
    : recipientType === 'friend'
    ? 'friendship'
    : recipientType === 'parent' || recipientType === 'grandparent'
    ? 'family appreciation'
    : 'personal';

  let memoryDescription = '';
  if (hasNote) {
    memoryDescription = `Note: "${memory.note}"`;
  } else if (hasPhoto) {
    memoryDescription = `A photo memory (no text provided)`;
  }

  const lengthInstruction = style === 'short'
    ? 'Keep it SHORT - 1-2 sentences maximum. Be concise and genuine.'
    : 'Keep it moderate length - 2-3 sentences. Balanced and heartfelt.';

  return `Write a ${relationshipContext} story chapter from ${creatorName} to ${recipientName}.

Memory: ${memoryDescription}
${memory.date ? `When: ${memory.date}` : ''}
${memory.location ? `Where: ${memory.location}` : ''}

Chapter ${index + 1} of ${total}.${isFirst ? ' (Opening chapter)' : ''}${isLast ? ' (Final chapter before message)' : ''}
Occasion: ${occasionText}

IMPORTANT: ${lengthInstruction}
- Do NOT be overly poetic or dramatic
- Do NOT add "What I didn't tell you" type phrases
- Just be genuine and direct
- If the note already expresses sentiment, don't embellish too much

Respond with JSON only:
{
  "title": "3-4 word title",
  "narrative": "the story text - ${style === 'short' ? '1-2 sentences' : '2-3 sentences'}",
  "atmosphere": "location or mood in few words"
}`;
}

// Process a single memory with Groq
async function processMemoryWithGroq(
  groq: InstanceType<typeof import('groq-sdk').default>,
  memory: Memory,
  index: number,
  total: number,
  creatorName: string,
  recipientName: string,
  occasionText: string,
  recipientType: string,
  style: 'short' | 'medium'
): Promise<StoryChapter> {
  const prompt = buildPrompt(memory, index, total, creatorName, recipientName, occasionText, recipientType, style);

  try {
    // Short timeout per request - 8 seconds (fast model)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Groq timeout')), 8000);
    });

    const completionPromise = groq.chat.completions.create({
      model: 'llama-3.1-8b-instant', // Much faster model!
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const completion = await Promise.race([completionPromise, timeoutPromise]) as Awaited<typeof completionPromise>;

    const content = completion.choices[0]?.message?.content || '{}';
    const chapterContent = JSON.parse(content);

    return {
      id: uuidv4(),
      title: chapterContent.title || `Memory ${index + 1}`,
      narrative: chapterContent.narrative || memory.note || 'A cherished memory.',
      memory,
      atmosphere: chapterContent.atmosphere,
    };
  } catch (aiError) {
    console.error(`Groq chapter ${index + 1} error:`, aiError);
    const generated = generateNarrative(memory, index, total, recipientName, !!memory.photo, style);
    return {
      id: uuidv4(),
      ...generated,
      memory,
    };
  }
}

// Process memories in batches with concurrency limit
async function processBatch<T>(
  items: T[],
  processor: (item: T, index: number) => Promise<StoryChapter>,
  concurrency: number = 3
): Promise<StoryChapter[]> {
  const results: StoryChapter[] = new Array(items.length);

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchPromises = batch.map((item, batchIndex) =>
      processor(item, i + batchIndex)
    );
    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach((result, batchIndex) => {
      results[i + batchIndex] = result;
    });
  }

  return results;
}

async function generateWithGroq(
  memories: Memory[],
  creatorName: string,
  recipientName: string,
  occasionText: string,
  recipientType: string,
  style: 'short' | 'medium' = 'short'
): Promise<StoryChapter[]> {
  const Groq = (await import('groq-sdk')).default;
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
    timeout: 10000, // 10 second timeout for SDK
  });

  // Process memories in parallel batches of 3
  const chapters = await processBatch(
    memories,
    (memory, index) => processMemoryWithGroq(
      groq, memory, index, memories.length,
      creatorName, recipientName, occasionText, recipientType, style
    ),
    3 // Process 3 at a time
  );

  return chapters;
}

// Process a single memory with OpenAI
async function processMemoryWithOpenAI(
  openai: InstanceType<typeof import('openai').default>,
  memory: Memory,
  index: number,
  total: number,
  creatorName: string,
  recipientName: string,
  occasionText: string,
  recipientType: string,
  style: 'short' | 'medium'
): Promise<StoryChapter> {
  const prompt = buildPrompt(memory, index, total, creatorName, recipientName, occasionText, recipientType, style);

  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI timeout')), 15000);
    });

    const completionPromise = openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const completion = await Promise.race([completionPromise, timeoutPromise]) as Awaited<typeof completionPromise>;

    const content = completion.choices[0]?.message?.content || '{}';
    const chapterContent = JSON.parse(content);

    return {
      id: uuidv4(),
      title: chapterContent.title || `Memory ${index + 1}`,
      narrative: chapterContent.narrative || memory.note || 'A cherished memory.',
      memory,
      atmosphere: chapterContent.atmosphere,
    };
  } catch (aiError) {
    console.error(`OpenAI chapter ${index + 1} error:`, aiError);
    const generated = generateNarrative(memory, index, total, recipientName, !!memory.photo, style);
    return {
      id: uuidv4(),
      ...generated,
      memory,
    };
  }
}

async function generateWithOpenAI(
  memories: Memory[],
  creatorName: string,
  recipientName: string,
  occasionText: string,
  recipientType: string,
  style: 'short' | 'medium' = 'short'
): Promise<StoryChapter[]> {
  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 20000,
  });

  // Process memories in parallel batches of 3
  const chapters = await processBatch(
    memories,
    (memory, index) => processMemoryWithOpenAI(
      openai, memory, index, memories.length,
      creatorName, recipientName, occasionText, recipientType, style
    ),
    3 // Process 3 at a time
  );

  return chapters;
}

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();

    // Support both new and legacy field names
    const recipientName = body.recipientName || body.partnerName || 'Someone Special';
    const creatorName = body.creatorName || body.yourName || 'Someone';
    const recipientType = body.recipientType || 'friend';
    const storyStyle = body.storyStyle || 'short';
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

    // Helper to generate local fallback chapters
    const generateLocalChapters = () => memories.map((memory, index) => {
      const generated = generateNarrative(memory, index, memories.length, recipientName, !!memory.photo, storyStyle as 'short' | 'medium' | 'none');
      return { id: uuidv4(), ...generated, memory };
    });

    // Overall timeout for AI generation - 25 seconds max
    const OVERALL_TIMEOUT = 25000;

    // If style is "none", skip AI and use user's own words
    if (storyStyle === 'none') {
      console.log('Using user notes directly (no AI)...');
      chapters = generateLocalChapters();
    }
    // For many memories (8+), use instant local generation
    else if (memories.length >= 8) {
      console.log(`${memories.length} memories - using instant local generation...`);
      chapters = generateLocalChapters();
    }
    // For 5-7 memories, use AI with timeout
    else if (memories.length >= 5) {
      console.log(`${memories.length} memories detected, using optimized generation...`);

      // Try AI with overall timeout, fall back to local if it takes too long
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Overall timeout')), OVERALL_TIMEOUT);
        });

        const aiPromise = hasGroq
          ? generateWithGroq(memories, creatorName, recipientName, occasionText, recipientType, storyStyle)
          : hasOpenAI
          ? generateWithOpenAI(memories, creatorName, recipientName, occasionText, recipientType, storyStyle)
          : Promise.resolve(generateLocalChapters());

        chapters = await Promise.race([aiPromise, timeoutPromise]);
      } catch (error) {
        console.error('AI generation timed out or failed, using local:', error);
        chapters = generateLocalChapters();
      }
    }
    // Try Groq first (free!), then OpenAI, then fallback
    else if (hasGroq) {
      try {
        console.log('Using Groq for story generation...');
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Overall timeout')), OVERALL_TIMEOUT);
        });
        chapters = await Promise.race([
          generateWithGroq(memories, creatorName, recipientName, occasionText, recipientType, storyStyle as 'short' | 'medium'),
          timeoutPromise
        ]);
      } catch (error) {
        console.error('Groq failed, trying fallback:', error);
        if (hasOpenAI) {
          try {
            chapters = await generateWithOpenAI(memories, creatorName, recipientName, occasionText, recipientType, storyStyle as 'short' | 'medium');
          } catch {
            chapters = generateLocalChapters();
          }
        } else {
          chapters = generateLocalChapters();
        }
      }
    } else if (hasOpenAI) {
      try {
        console.log('Using OpenAI for story generation...');
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Overall timeout')), OVERALL_TIMEOUT);
        });
        chapters = await Promise.race([
          generateWithOpenAI(memories, creatorName, recipientName, occasionText, recipientType, storyStyle as 'short' | 'medium'),
          timeoutPromise
        ]);
      } catch (error) {
        console.error('OpenAI failed, using fallback:', error);
        chapters = generateLocalChapters();
      }
    } else {
      // No AI API keys - use pre-written narratives
      console.log('No AI API key found, using fallback narratives...');
      chapters = generateLocalChapters();
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
