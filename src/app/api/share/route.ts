import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Generate a short random code
function generateCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const story = await request.json();

    // Generate a unique code
    let code = generateCode();
    let attempts = 0;

    // Try to insert, regenerate code if collision
    while (attempts < 5) {
      const { data, error } = await supabase
        .from('shared_stories')
        .insert({
          code,
          story_data: story,
        })
        .select('code')
        .single();

      if (!error && data) {
        return NextResponse.json({ code: data.code });
      }

      // If duplicate code, try again
      if (error?.code === '23505') {
        code = generateCode();
        attempts++;
        continue;
      }

      // Other error
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to save story' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate unique code' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Share API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
