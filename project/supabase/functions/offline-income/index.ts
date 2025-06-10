/*
  # Offline Income CRON Job

  Processes offline income for all players every 5 minutes:
  1. Calculate time since last income
  2. Award +1 charge per node per minute
  3. Update player charge and last_income_at
  4. Update faction scores
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface Player {
  id: string;
  charge: number;
  last_income_at: string;
  faction: 'red' | 'blue';
}

interface NodeCount {
  owner_id: string;
  count: number;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Get all players
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('id, charge, last_income_at, faction');

    if (playersError) throw playersError;

    // Get node counts per owner
    const { data: nodeCounts, error: nodeCountsError } = await supabase
      .from('nodes')
      .select('owner_id')
      .not('owner_id', 'is', null)
      .then(({ data, error }) => {
        if (error) return { data: null, error };
        
        const counts = data?.reduce((acc: Record<string, number>, node) => {
          acc[node.owner_id] = (acc[node.owner_id] || 0) + 1;
          return acc;
        }, {});

        return {
          data: Object.entries(counts || {}).map(([owner_id, count]) => ({
            owner_id,
            count: count as number,
          })),
          error: null,
        };
      });

    if (nodeCountsError) throw nodeCountsError;

    const nodeCountMap = new Map<string, number>();
    nodeCounts?.forEach((nc: NodeCount) => {
      nodeCountMap.set(nc.owner_id, nc.count);
    });

    // Calculate and update player incomes
    const updates: Array<{ id: string; charge: number }> = [];
    let redScore = 0;
    let blueScore = 0;

    for (const player of players as Player[]) {
      const lastIncome = new Date(player.last_income_at);
      const minutesSinceLastIncome = Math.floor(
        (now.getTime() - lastIncome.getTime()) / (1000 * 60)
      );

      if (minutesSinceLastIncome >= 1) {
        const nodeCount = nodeCountMap.get(player.id) || 0;
        const incomeAmount = nodeCount * minutesSinceLastIncome;
        const newCharge = player.charge + incomeAmount;

        updates.push({
          id: player.id,
          charge: newCharge,
        });

        // Add to faction scores
        if (player.faction === 'red') {
          redScore += newCharge;
        } else {
          blueScore += newCharge;
        }
      }
    }

    // Batch update players
    for (const update of updates) {
      await supabase
        .from('players')
        .update({
          charge: update.charge,
          last_income_at: now.toISOString(),
        })
        .eq('id', update.id);
    }

    // Update faction scores for this week
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    await supabase
      .from('faction_scores')
      .upsert({
        week_start: weekStart.toISOString().split('T')[0],
        red_score: redScore,
        blue_score: blueScore,
      });

    return new Response(
      JSON.stringify({
        success: true,
        processed: updates.length,
        faction_scores: { red: redScore, blue: blueScore },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Offline income error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});