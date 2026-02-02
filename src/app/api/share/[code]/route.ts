import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the story
    const { data, error } = await supabase
      .from('shared_stories')
      .select('story_data, view_count')
      .eq('code', code)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Update view count (fire and forget)
    supabase
      .from('shared_stories')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('code', code)
      .then(() => {});

    return NextResponse.json(data.story_data);
  } catch (error) {
    console.error('Fetch story error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
