export interface Player {
  id: string;
  handle: string;
  faction: 'red' | 'blue';
  stripe_customer_id?: string;
  ally_of?: string;
  charge: number;
  created_at: string;
  last_income_at: string;
}

export interface GameNode {
  id: string;
  owner_id?: string;
  charge: number;
  fortify_lvl: number;
  x: number;
  y: number;
  created_at: string;
}

export interface GameEdge {
  src_id: string;
  dst_id: string;
  owner_id?: string;
  created_at: string;
}

export interface FactionScore {
  week_start: string;
  red_score: number;
  blue_score: number;
}

export interface GameState {
  player?: Player;
  nodes: GameNode[];
  edges: GameEdge[];
  factionScores?: FactionScore;
  isLoading: boolean;
  error?: string;
}

export interface CameraPosition {
  x: number;
  y: number;
  z: number;
}