
import React, { useState, useCallback } from 'react';
import { generateFlashcards } from '../../services/geminiService';
import type { Flashcard as FlashcardType } from '../../types';
import Flashcard from '../../components/Flashcard';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import { SparklesIcon } from '../../components/icons/Icons';

const FlashcardsView: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setFlashcards([]);

    try {
      const cards = await generateFlashcards(topic);
      setFlashcards(cards);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [topic]);
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleGenerate();
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="w-full max-w-lg text-center">
        <h2 className="text-2xl font-bold text-gray-100">AI Flashcard Generator</h2>
        <p className="text-gray-400 mt-2">Enter any topic and get a set of flashcards, powered by Google Search for up-to-date information.</p>
      </div>

      <div className="w-full max-w-lg flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., 'The Renaissance' or 'React Hooks'"
          className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex items-center justify-center bg-indigo-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed"
        >
          <SparklesIcon />
          Generate
        </button>
      </div>

      {error && <div className="w-full max-w-lg"><Alert message={error} /></div>}

      {isLoading && <Spinner text="Generating flashcards..." />}

      {flashcards.length > 0 && (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcards.map((card, index) => (
            <Flashcard key={index} card={card} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FlashcardsView;
