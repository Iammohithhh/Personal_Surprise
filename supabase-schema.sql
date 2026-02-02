-- Run this SQL in your Supabase Dashboard > SQL Editor

-- Create the shared_stories table
CREATE TABLE IF NOT EXISTS shared_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(12) UNIQUE NOT NULL,
  story_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  view_count INTEGER DEFAULT 0
);

-- Create index for faster lookups by code
CREATE INDEX IF NOT EXISTS idx_shared_stories_code ON shared_stories(code);

-- Enable Row Level Security
ALTER TABLE shared_stories ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read shared stories (they're meant to be public)
CREATE POLICY "Anyone can view shared stories"
ON shared_stories FOR SELECT
USING (true);

-- Allow anyone to create shared stories (no auth required)
CREATE POLICY "Anyone can create shared stories"
ON shared_stories FOR INSERT
WITH CHECK (true);

-- Allow updating view count
CREATE POLICY "Anyone can update view count"
ON shared_stories FOR UPDATE
USING (true)
WITH CHECK (true);

-- Optional: Create a function to clean up expired stories (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_stories()
RETURNS void AS $$
BEGIN
  DELETE FROM shared_stories WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
