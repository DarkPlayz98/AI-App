
import React, { useState, useMemo } from 'react';
import FlashcardsView from './features/flashcards/FlashcardsView';
import LanguageHubView from './features/language/LanguageHubView';
import MathSolverView from './features/math/MathSolverView';
import TabButton from './components/TabButton';
import { BookOpenIcon, MessageSquareIcon, SigmaIcon } from './components/icons/Icons';

type Tab = 'flashcards' | 'language' | 'math';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('flashcards');

  const tabs = useMemo(() => [
    { id: 'flashcards' as Tab, label: 'Flashcards', icon: <BookOpenIcon /> },
    { id: 'language' as Tab, label: 'Language Hub', icon: <MessageSquareIcon /> },
    { id: 'math' as Tab, label: 'Math Solver', icon: <SigmaIcon /> },
  ], []);

  const renderContent = () => {
    switch (activeTab) {
      case 'flashcards':
        return <FlashcardsView />;
      case 'language':
        return <LanguageHubView />;
      case 'math':
        return <MathSolverView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <div className="container mx-auto p-4 max-w-5xl">
        <header className="text-center my-6 md:my-10">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            LearnSphere AI
          </h1>
          <p className="text-gray-400 mt-2">Your AI-powered personal tutor for any subject.</p>
        </header>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-2xl">
          <nav className="p-2 border-b border-gray-700/50 flex flex-wrap justify-center gap-2">
            {tabs.map(tab => (
              <TabButton
                key={tab.id}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </TabButton>
            ))}
          </nav>

          <main className="p-4 md:p-8">
            {renderContent()}
          </main>
        </div>

        <footer className="text-center text-gray-500 text-sm py-8">
          <p>Powered by Gemini. Built for modern learning.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
