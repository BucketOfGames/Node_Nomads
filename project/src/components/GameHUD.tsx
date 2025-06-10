import React from 'react';
import { Zap, MapPin, Users, Trophy } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';

export const GameHUD: React.FC = () => {
  const { player, nodes, factionScores } = useGameStore();

  if (!player) return null;

  const ownedNodes = nodes.filter(node => node.owner_id === player.id);
  const factionColor = player.faction === 'red' ? 'text-red-400' : 'text-blue-400';
  const factionBg = player.faction === 'red' ? 'bg-red-900/20 border-red-500/30' : 'bg-blue-900/20 border-blue-500/30';

  return (
    <div className="fixed top-4 left-4 z-50 space-y-3">
      {/* Player Stats */}
      <div className={`${factionBg} backdrop-blur-sm border rounded-lg p-4 min-w-64`}>
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-3 h-3 rounded-full ${player.faction === 'red' ? 'bg-red-400' : 'bg-blue-400'}`} />
          <h2 className="text-white font-semibold">{player.handle}</h2>
          <span className={`text-xs px-2 py-1 rounded ${factionColor} bg-opacity-20`}>
            {player.faction.toUpperCase()}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm">Charge:</span>
            <span className="font-mono font-semibold text-yellow-400">
              {player.charge.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2 text-white">
            <MapPin className="w-4 h-4 text-green-400" />
            <span className="text-sm">Nodes:</span>
            <span className="font-mono font-semibold text-green-400">
              {ownedNodes.length}
            </span>
          </div>

          <div className="text-xs text-gray-400">
            Income: +{ownedNodes.length}/min
          </div>
        </div>
      </div>

      {/* Faction Scores */}
      {factionScores && (
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <h3 className="text-white text-sm font-semibold">Weekly Scores</h3>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-red-400 text-sm">Red</span>
              </div>
              <span className="text-red-400 font-mono text-sm">
                {factionScores.red_score.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-blue-400 text-sm">Blue</span>
              </div>
              <span className="text-blue-400 font-mono text-sm">
                {factionScores.blue_score.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Help */}
      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg p-3">
        <div className="text-xs text-gray-400 space-y-1">
          <div>• Click neutral node to capture</div>
          <div>• Click owned node to fortify</div>
          <div>• Click rival edge to raid</div>
        </div>
      </div>
    </div>
  );
};