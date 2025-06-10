import React, { useState, useEffect } from 'react';
import { ArrowRight, MapPin, Zap, Sword, X } from 'lucide-react';

interface TutorialProps {
  onComplete: () => void;
}

export const Tutorial: React.FC<TutorialProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const tutorialSteps = [
    {
      icon: <MapPin className="w-6 h-6 text-green-400" />,
      title: "Welcome to NodeNomads!",
      content: "You've entered a perpetual graph-strategy MMO. Your goal is to claim territory and earn charge over time.",
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      title: "Claiming Nodes",
      content: "Click on gray (neutral) nodes to capture them for 10 charge. You'll earn +1 charge per minute for each node you own.",
    },
    {
      icon: <MapPin className="w-6 h-6 text-blue-400" />,
      title: "Fortifying Territory",
      content: "Click on your own nodes to fortify them. Higher fortification makes them harder to raid and increases their value.",
    },
    {
      icon: <Sword className="w-6 h-6 text-red-400" />,
      title: "Raiding Enemies",
      content: "Click on rival faction edges (connections between nodes) to raid them. Success destroys the connection!",
    },
    {
      icon: <Zap className="w-6 h-6 text-purple-400" />,
      title: "Idle Progression",
      content: "Your nodes generate charge even when you're offline. The game never stops - build your empire and dominate!",
    },
  ];

  const currentStep = tutorialSteps[step];

  const handleNext = () => {
    if (step < tutorialSteps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md relative transform transition-all duration-300">
        <button
          onClick={handleComplete}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            {currentStep.icon}
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            {currentStep.title}
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            {currentStep.content}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === step ? 'bg-purple-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            {step < tutorialSteps.length - 1 ? 'Next' : 'Start Playing'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center">
            Step {step + 1} of {tutorialSteps.length}
          </div>
        </div>
      </div>
    </div>
  );
};