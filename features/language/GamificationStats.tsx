import React from 'react';
import type { Badge } from '../../types';
import { StarIcon } from '../../components/icons/Icons';

interface GamificationStatsProps {
  points: number;
  badges: Badge[];
}

const GamificationStats: React.FC<GamificationStatsProps> = ({ points, badges }) => {
  return (
    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
      <h3 className="text-lg font-bold text-yellow-400 mb-3">Your Progress</h3>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <StarIcon className="h-7 w-7 text-yellow-400" />
          <span>{points}</span>
        </div>
        <span className="text-gray-400">Points Earned</span>
      </div>
      
      {badges.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-300 mb-2">Badges Unlocked</h4>
          <div className="flex flex-wrap gap-4">
            {badges.map((badge) => (
              <div 
                key={badge.name} 
                className="flex flex-col items-center text-center p-2 rounded-md bg-gray-700/50 w-24"
                title={`${badge.name}: ${badge.description}`}
              >
                <div className="text-yellow-400">{badge.icon}</div>
                <span className="text-xs mt-1 text-gray-300 truncate">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationStats;
