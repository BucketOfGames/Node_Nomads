import React, { useState } from 'react';
import { Gamepad2, Zap } from 'lucide-react';
import { signInAnonymously } from '../lib/supabase';

interface LoginFormProps {
  onLogin: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [handle, setHandle] = useState('');
  const [faction, setFaction] = useState<'red' | 'blue'>('red');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      await signInAnonymously(handle.trim(), faction);
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 flex items-center justify-center p-4">
      <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gamepad2 className="w-8 h-8 text-purple-400" />
            <Zap className="w-6 h-6 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">NodeNomads</h1>
          <p className="text-gray-400">Perpetual Graph-Strategy Idle MMO</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="handle" className="block text-sm font-medium text-gray-300 mb-2">
              Choose your handle
            </label>
            <input
              id="handle"
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={20}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Choose your faction
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFaction('red')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  faction === 'red'
                    ? 'border-red-500 bg-red-900/30 text-red-200'
                    : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-red-400'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500" />
                  <span className="font-medium">Red</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFaction('blue')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  faction === 'blue'
                    ? 'border-blue-500 bg-blue-900/30 text-blue-200'
                    : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500" />
                  <span className="font-medium">Blue</span>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-900/30 border border-red-500/30 text-red-200 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !handle.trim()}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all disabled:cursor-not-allowed"
          >
            {isLoading ? 'Entering the grid...' : 'Enter NodeNomads'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="text-xs text-gray-400 space-y-1">
            <p>• Claim nodes on the infinite graph</p>
            <p>• Earn charge while offline</p>
            <p>• Battle for faction supremacy</p>
            <p>• No resets, ever-persistent world</p>
          </div>
        </div>
      </div>
    </div>
  );
};