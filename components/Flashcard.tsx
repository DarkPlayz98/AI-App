
import React, { useState } from 'react';
import type { Flashcard as FlashcardType } from '../types';

interface FlashcardProps {
  card: FlashcardType;
}

const Flashcard: React.FC<FlashcardProps> = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="w-full h-64 perspective-1000 cursor-pointer" 
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-700 ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front of card */}
        <div className="absolute w-full h-full backface-hidden flex items-center justify-center p-6 bg-gray-800 border border-gray-700 rounded-xl shadow-lg">
          <p className="text-xl text-center font-semibold text-gray-200">{card.question}</p>
        </div>
        
        {/* Back of card */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center p-6 bg-indigo-800 border border-indigo-700 rounded-xl shadow-lg">
          <p className="text-lg text-center text-indigo-100">{card.answer}</p>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
