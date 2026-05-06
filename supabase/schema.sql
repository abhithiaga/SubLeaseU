-- ============================================================
-- SubleaseU Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PROFILES ─────────────────────────────────────────────────
-- Created automatically when a user signs up via trigger
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  school TEXT,           -- parsed from .edu domain
  avatar_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  push_token TEXT,       -- Expo push notification token
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, school)
  VALUES (
    NEW.id,
    NEW.email,
    -- Extract school from email domain
    CASE
      WHEN NEW.email LIKE '%@utexas.edu' THEN 'UT Austin'
      WHEN NEW.email LIKE '%@tamu.edu' THEN 'Texas A&M'
      WHEN NEW.email LIKE '%@rice.edu' THEN 'Rice University'
      WHEN NEW.email LIKE '%@harvard.edu' THEN 'Harvard'
      WHEN NEW.email LIKE '%@mit.edu' THEN 'MIT'
      WHEN NEW.email LIKE '%@stanford.edu' THEN 'Stanford'
      WHEN NEW.email LIKE '%@ucla.edu' THEN 'UCLA'
      ELSE UPPER(SPLIT_PART(SPLIT_PART(NEW.email, '@', 2), '.', 1))
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── LISTINGS (Leasers — people who need out) ──────────────────
CREATE TABLE listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  school TEXT NOT NULL,

  -- Property info
  building_name TEXT NOT NULL,        -- e.g. "WAMPUS at Union"
  address TEXT,
  unit_number TEXT,
  bedrooms INTEGER NOT NULL,
  bathrooms NUMERIC(3,1) NOT NULL,
  sqft INTEGER,
  furnished BOOLEAN DEFAULT FALSE,
  amenities TEXT[],                   -- ['gym', 'pool', 'parking', ...]

  -- Lease info
  monthly_rent INTEGER NOT NULL,      -- in dollars
  lease_start DATE NOT NULL,
  lease_end DATE NOT NULL,
  sublease_start DATE,                -- when they need someone to take over
  original_lease_pdf_url TEXT,

  -- Listing details
  description TEXT,
  photos TEXT[],                       -- Supabase Storage URLs
  contact_email TEXT,
  contact_phone TEXT,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'filled', 'expired')),
  urgent BOOLEAN DEFAULT FALSE,        -- true if deadline < 30 days
  reason TEXT,                         -- "Got internship in Boston", etc.

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active listings from own school" ON listings
  FOR SELECT USING (status = 'active');
CREATE POLICY "Users can insert own listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own listings" ON listings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own listings" ON listings
  FOR DELETE USING (auth.uid() = user_id);

-- Index for fast school + date filtering
CREATE INDEX listings_school_idx ON listings(school, status, lease_start);

-- ── SEEKERS (Leasees — people who need a place) ───────────────
CREATE TABLE seekers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  school TEXT NOT NULL,

  -- What they need
  budget_max INTEGER NOT NULL,         -- max monthly rent in $
  bedrooms_needed INTEGER NOT NULL,
  move_in_date DATE NOT NULL,
  move_out_date DATE,
  furnished_required BOOLEAN DEFAULT FALSE,
  notes TEXT,                          -- "Need pet-friendly, near campus"

  -- Status
  active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE seekers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active seekers from own school" ON seekers
  FOR SELECT USING (active = TRUE);
CREATE POLICY "Users can insert own seeker posts" ON seekers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own seeker posts" ON seekers
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own seeker posts" ON seekers
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX seekers_school_idx ON seekers(school, active, move_in_date);

-- ── MESSAGES ──────────────────────────────────────────────────
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see messages they sent or received" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receivers can mark as read" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);

CREATE INDEX messages_listing_idx ON messages(listing_id, created_at);
CREATE INDEX messages_users_idx ON messages(sender_id, receiver_id);

-- ── MATCHES (auto-computed, optional cache table) ─────────────
-- A view is simpler — no table needed
CREATE OR REPLACE VIEW matches AS
SELECT
  l.id AS listing_id,
  l.building_name,
  l.monthly_rent,
  l.lease_start,
  l.bedrooms,
  l.school AS listing_school,
  s.id AS seeker_id,
  s.user_id AS seeker_user_id,
  s.budget_max,
  s.move_in_date,
  s.bedrooms_needed,
  s.school AS seeker_school,
  -- Match score: higher = better
  (
    CASE WHEN s.budget_max >= l.monthly_rent THEN 40 ELSE 0 END +
    CASE WHEN s.bedrooms_needed = l.bedrooms THEN 30 ELSE 0 END +
    CASE WHEN ABS(EXTRACT(DAY FROM (s.move_in_date - l.lease_start))) <= 14 THEN 30 ELSE 10 END
  ) AS match_score
FROM listings l
JOIN seekers s ON l.school = s.school
WHERE l.status = 'active' AND s.active = TRUE
  AND s.budget_max >= l.monthly_rent
  AND s.bedrooms_needed = l.bedrooms;

-- ── Enable Realtime ───────────────────────────────────────────
-- Run these in Supabase Dashboard → Database → Replication
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE listings;
-- ALTER PUBLICATION supabase_realtime ADD TABLE seekers;

-- ── Storage Bucket ─────────────────────────────────────────────
-- Run in Supabase Dashboard → Storage:
-- Create bucket "listing-photos" with public access
-- Create bucket "lease-pdfs" with private access
