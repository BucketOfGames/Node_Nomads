import { create } from 'zustand';
import { GameState, GameNode, GameEdge, Player } from '../types/game';
import { supabase } from '../lib/supabase';

interface GameStore extends GameState {
  initializeGame: () => Promise<void>;
  captureNode: (nodeId: string) => Promise<void>;
  fortifyNode: (nodeId: string) => Promise<void>;
  raidEdge: (srcId: string, dstId: string) => Promise<void>;
  subscribeToUpdates: () => void;
  unsubscribeFromUpdates: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  nodes: [],
  edges: [],
  isLoading: true,
  
  initializeGame: async () => {
    try {
      set({ isLoading: true });

      // Get current player
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: player, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('id', user.id)
        .single();

      if (playerError) throw playerError;

      // Get nodes
      const { data: nodes, error: nodesError } = await supabase
        .from('nodes')
        .select('*')
        .order('created_at');

      if (nodesError) throw nodesError;

      // Get edges
      const { data: edges, error: edgesError } = await supabase
        .from('edges')
        .select('*')
        .order('created_at');

      if (edgesError) throw edgesError;

      // Get faction scores
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const { data: factionScores } = await supabase
        .from('faction_scores')
        .select('*')
        .eq('week_start', weekStart.toISOString().split('T')[0])
        .single();

      set({
        player,
        nodes: nodes || [],
        edges: edges || [],
        factionScores,
        isLoading: false,
        error: undefined,
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  },

  captureNode: async (nodeId: string) => {
    const { player } = get();
    if (!player) return;

    try {
      // Check if player has enough charge
      if (player.charge < 10) {
        throw new Error('Not enough charge to capture node');
      }

      // Update node ownership and player charge
      const { error: nodeError } = await supabase
        .from('nodes')
        .update({ owner_id: player.id })
        .eq('id', nodeId)
        .is('owner_id', null);

      if (nodeError) throw nodeError;

      const { error: playerError } = await supabase
        .from('players')
        .update({ charge: player.charge - 10 })
        .eq('id', player.id);

      if (playerError) throw playerError;

      // Update local state
      set((state) => ({
        player: state.player ? { ...state.player, charge: state.player.charge - 10 } : undefined,
        nodes: state.nodes.map((node) =>
          node.id === nodeId ? { ...node, owner_id: player.id } : node
        ),
      }));
    } catch (error) {
      console.error('Capture node error:', error);
    }
  },

  fortifyNode: async (nodeId: string) => {
    const { player } = get();
    if (!player) return;

    try {
      const node = get().nodes.find((n) => n.id === nodeId);
      if (!node || node.owner_id !== player.id) return;

      const fortifyCost = (node.fortify_lvl + 1) * 20;
      if (player.charge < fortifyCost) {
        throw new Error('Not enough charge to fortify node');
      }

      // Update node fortification and player charge
      const { error: nodeError } = await supabase
        .from('nodes')
        .update({ fortify_lvl: node.fortify_lvl + 1 })
        .eq('id', nodeId);

      if (nodeError) throw nodeError;

      const { error: playerError } = await supabase
        .from('players')
        .update({ charge: player.charge - fortifyCost })
        .eq('id', player.id);

      if (playerError) throw playerError;

      // Update local state
      set((state) => ({
        player: state.player ? { ...state.player, charge: state.player.charge - fortifyCost } : undefined,
        nodes: state.nodes.map((n) =>
          n.id === nodeId ? { ...n, fortify_lvl: n.fortify_lvl + 1 } : n
        ),
      }));
    } catch (error) {
      console.error('Fortify node error:', error);
    }
  },

  raidEdge: async (srcId: string, dstId: string) => {
    const { player } = get();
    if (!player) return;

    try {
      // Simulate quick-time event success (50% chance for demo)
      const success = Math.random() > 0.5;
      
      if (success) {
        // Remove the edge
        const { error } = await supabase
          .from('edges')
          .delete()
          .eq('src_id', srcId)
          .eq('dst_id', dstId);

        if (error) throw error;

        // Update local state
        set((state) => ({
          edges: state.edges.filter(
            (edge) => !(edge.src_id === srcId && edge.dst_id === dstId)
          ),
        }));
      }
    } catch (error) {
      console.error('Raid edge error:', error);
    }
  },

  subscribeToUpdates: () => {
    // Subscribe to nodes changes
    supabase
      .channel('nodes-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'nodes' },
        (payload) => {
          set((state) => {
            if (payload.eventType === 'INSERT') {
              return {
                nodes: [...state.nodes, payload.new as GameNode],
              };
            } else if (payload.eventType === 'UPDATE') {
              return {
                nodes: state.nodes.map((node) =>
                  node.id === payload.new.id ? payload.new as GameNode : node
                ),
              };
            } else if (payload.eventType === 'DELETE') {
              return {
                nodes: state.nodes.filter((node) => node.id !== payload.old.id),
              };
            }
            return state;
          });
        }
      )
      .subscribe();

    // Subscribe to edges changes
    supabase
      .channel('edges-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'edges' },
        (payload) => {
          set((state) => {
            if (payload.eventType === 'INSERT') {
              return {
                edges: [...state.edges, payload.new as GameEdge],
              };
            } else if (payload.eventType === 'DELETE') {
              return {
                edges: state.edges.filter(
                  (edge) =>
                    !(edge.src_id === payload.old.src_id && edge.dst_id === payload.old.dst_id)
                ),
              };
            }
            return state;
          });
        }
      )
      .subscribe();
  },

  unsubscribeFromUpdates: () => {
    supabase.removeAllChannels();
  },
}));