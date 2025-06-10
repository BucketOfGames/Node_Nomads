/*
  # NodeNomads Game Schema

  1. New Tables
    - `players`
      - `id` (uuid, primary key)
      - `handle` (text, unique username)
      - `faction` (text, red or blue)
      - `stripe_customer_id` (text, nullable)
      - `ally_of` (uuid, foreign key to players)
      - `charge` (integer, current charge amount)
      - `created_at` (timestamp)
      - `last_income_at` (timestamp)

    - `nodes`
      - `id` (uuid, primary key)
      - `owner_id` (uuid, foreign key to players)
      - `charge` (integer, stored charge)
      - `fortify_lvl` (integer, fortification level)
      - `x` (float, world position)
      - `y` (float, world position)
      - `created_at` (timestamp)

    - `edges`
      - `src_id` (uuid, foreign key to nodes)
      - `dst_id` (uuid, foreign key to nodes)
      - `owner_id` (uuid, foreign key to players)
      - `created_at` (timestamp)

    - `faction_scores`
      - `week_start` (date, primary key)
      - `red_score` (integer)
      - `blue_score` (integer)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for real-time game updates
*/

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle text UNIQUE NOT NULL,
  faction text NOT NULL CHECK (faction IN ('red', 'blue')),
  stripe_customer_id text,
  ally_of uuid REFERENCES players(id),
  charge integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  last_income_at timestamptz DEFAULT now()
);

-- Create nodes table
CREATE TABLE IF NOT EXISTS nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES players(id),
  charge integer DEFAULT 0,
  fortify_lvl integer DEFAULT 0,
  x float NOT NULL,
  y float NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create edges table
CREATE TABLE IF NOT EXISTS edges (
  src_id uuid REFERENCES nodes(id) ON DELETE CASCADE,
  dst_id uuid REFERENCES nodes(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES players(id),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (src_id, dst_id)
);

-- Create faction scores table
CREATE TABLE IF NOT EXISTS faction_scores (
  week_start date PRIMARY KEY,
  red_score integer DEFAULT 0,
  blue_score integer DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE faction_scores ENABLE ROW LEVEL SECURITY;

-- Players policies
CREATE POLICY "Players can read all players"
  ON players FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can update own data"
  ON players FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Nodes policies
CREATE POLICY "Everyone can read nodes"
  ON nodes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can insert nodes"
  ON nodes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Players can update own nodes"
  ON nodes FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Edges policies
CREATE POLICY "Everyone can read edges"
  ON edges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can insert edges"
  ON edges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Players can delete own edges"
  ON edges FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Faction scores policies
CREATE POLICY "Everyone can read faction scores"
  ON faction_scores FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_nodes_owner ON nodes(owner_id);
CREATE INDEX IF NOT EXISTS idx_nodes_position ON nodes(x, y);
CREATE INDEX IF NOT EXISTS idx_edges_src ON edges(src_id);
CREATE INDEX IF NOT EXISTS idx_edges_dst ON edges(dst_id);
CREATE INDEX IF NOT EXISTS idx_edges_owner ON edges(owner_id);

-- Insert initial neutral nodes in a grid pattern
DO $$
DECLARE
  i integer;
  j integer;
BEGIN
  FOR i IN -10..10 LOOP
    FOR j IN -10..10 LOOP
      IF (i % 3 = 0 AND j % 3 = 0) THEN
        INSERT INTO nodes (x, y, charge) VALUES (i * 5.0, j * 5.0, 10);
      END IF;
    END LOOP;
  END LOOP;
END $$;