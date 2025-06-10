import React from 'react';
import { Gamepad2, Zap } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Gamepad2 className="w-12 h-12 text-purple-400 animate-pulse" />
          <Zap className="w-8 h-8 text-yellow-400 animate-bounce" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">NodeNomads</h1>
        
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        
        <p className="text-gray-300">Connecting to the grid...</p>
      </div>
    </div>
  );
};