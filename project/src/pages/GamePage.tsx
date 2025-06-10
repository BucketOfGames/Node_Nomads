import React, { useEffect, useState } from 'react';
import { GameScene } from '../components/GameScene';
import { GameHUD } from '../components/GameHUD';
import { Tutorial } from '../components/Tutorial';
import { LoadingScreen } from '../components/LoadingScreen';
import { useGameStore } from '../stores/gameStore';

export const GamePage: React.FC = () => {
  const [showTutorial, setShowTutorial] = useState(true);
  const { initializeGame, subscribeToUpdates, unsubscribeFromUpdates, isLoading, error } = useGameStore();

  useEffect(() => {
    initializeGame();
    subscribeToUpdates();

    return () => {
      unsubscribeFromUpdates();
    };
  }, [initializeGame, subscribeToUpdates, unsubscribeFromUpdates]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Connection Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <GameScene />
      <GameHUD />
      
      {showTutorial && (
        <Tutorial onComplete={handleTutorialComplete} />
      )}
    </div>
  );
};