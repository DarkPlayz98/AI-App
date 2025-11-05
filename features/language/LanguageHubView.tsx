import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getTutorResponse, generateQuiz, getPronunciation, playAudio } from '../../services/geminiService';
import type { ChatMessage, QuizQuestion, Badge } from '../../types';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import { VolumeUpIcon, FirstStepsBadgeIcon, TalkativeBadgeIcon, GeniusBadgeIcon } from '../../components/icons/Icons';
import GamificationStats from './GamificationStats';

const ALL_BADGES: Badge[] = [
    { name: 'First Steps', description: 'Earned for starting a conversation.', threshold: 5, icon: <FirstStepsBadgeIcon /> },
    { name: 'Talkative', description: 'Earned for sending multiple messages.', threshold: 50, icon: <TalkativeBadgeIcon /> },
    { name: 'Quiz Whiz', description: 'Earned for acing a quiz question.', threshold: 100, icon: <GeniusBadgeIcon /> },
];

const LanguageHubView: React.FC = () => {
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { role: 'model', text: "Hello! I'm your AI language tutor. How can I help you practice today?" }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [quiz, setQuiz] = useState<QuizQuestion | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isQuizLoading, setIsQuizLoading] = useState(false);

    const [pronunciationText, setPronunciationText] = useState('');
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    
    const [points, setPoints] = useState(0);
    const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);

    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    useEffect(() => {
        const newlyEarned = ALL_BADGES.filter(badge => 
            points >= badge.threshold && !earnedBadges.some(eb => eb.name === badge.name)
        );
        if (newlyEarned.length > 0) {
            setEarnedBadges(prev => [...prev, ...newlyEarned].sort((a,b) => a.threshold - b.threshold));
        }
    }, [points, earnedBadges]);

    const handleSend = useCallback(async () => {
        if (!userInput.trim()) return;

        setPoints(p => p + 5);
        const newUserMessage: ChatMessage = { role: 'user', text: userInput };
        setChatHistory(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsReplying(true);
        setError(null);

        try {
            const response = await getTutorResponse(chatHistory, userInput);
            setChatHistory(prev => [...prev, { role: 'model', text: response }]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsReplying(false);
        }
    }, [userInput, chatHistory]);
    
    const handleGenerateQuiz = useCallback(async () => {
        setIsQuizLoading(true);
        setError(null);
        setQuiz(null);
        setSelectedAnswer(null);
        const context = chatHistory.slice(-5).map(m => m.text).join(' ');
        try {
            const quizData = await generateQuiz(context);
            setQuiz(quizData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsQuizLoading(false);
        }
    }, [chatHistory]);

    const handlePronounce = useCallback(async () => {
        if (!pronunciationText.trim()) return;
        setPoints(p => p + 10);
        setIsAudioLoading(true);
        setError(null);
        try {
            const audioData = await getPronunciation(pronunciationText);
            await playAudio(audioData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsAudioLoading(false);
        }
    }, [pronunciationText]);

    const handleAnswerQuestion = (option: string) => {
        setSelectedAnswer(option);
        if (quiz && option === quiz.correctAnswer) {
            setPoints(p => p + 25);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Chat */}
            <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-gray-100">Language Practice Chat</h2>
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg h-96 flex flex-col">
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                         {isReplying && (
                            <div className="flex justify-start">
                                <div className="px-4 py-2 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none">
                                    <Spinner size="sm" />
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="p-2 border-t border-gray-700 flex gap-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Type your message..."
                            className="flex-grow bg-gray-700 border-none rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={isReplying}
                        />
                        <button onClick={handleSend} disabled={isReplying} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-800">Send</button>
                    </div>
                </div>
            </div>

            {/* Right Column: Tools & Gamification */}
            <div className="flex flex-col gap-8">
                 <GamificationStats points={points} badges={earnedBadges} />

                 {/* Pronunciation Tool */}
                <div>
                    <h2 className="text-xl font-bold text-gray-100 mb-2">Pronunciation Helper</h2>
                    <div className="flex gap-2">
                         <input
                            type="text"
                            value={pronunciationText}
                            onChange={e => setPronunciationText(e.target.value)}
                            placeholder="Word or phrase to pronounce"
                            className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={isAudioLoading}
                        />
                        <button onClick={handlePronounce} disabled={isAudioLoading || !pronunciationText.trim()} className="bg-teal-600 p-3 rounded-md hover:bg-teal-700 disabled:bg-teal-800 flex items-center justify-center">
                            {isAudioLoading ? <Spinner size="sm"/> : <VolumeUpIcon className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
                
                {/* Quiz Tool */}
                <div>
                    <h2 className="text-xl font-bold text-gray-100 mb-2">Mini-Quiz</h2>
                     <button onClick={handleGenerateQuiz} disabled={isQuizLoading} className="w-full bg-purple-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-purple-800">
                        {isQuizLoading ? 'Generating...' : 'Generate Quiz from Conversation'}
                    </button>
                    {isQuizLoading && <div className="mt-4 flex justify-center"><Spinner /></div>}
                    {quiz && (
                        <div className="mt-4 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                            <p className="font-semibold mb-3">{quiz.question}</p>
                            <div className="space-y-2">
                                {quiz.options.map((option, i) => {
                                    const isCorrect = option === quiz.correctAnswer;
                                    const isSelected = option === selectedAnswer;
                                    let buttonClass = 'bg-gray-700 hover:bg-gray-600';
                                    if (isSelected && selectedAnswer !== null) {
                                        buttonClass = isCorrect ? 'bg-green-600' : 'bg-red-600';
                                    } else if (selectedAnswer !== null && isCorrect) {
                                        buttonClass = 'bg-green-600/50 text-gray-400';
                                    }
                                    
                                    return (
                                        <button key={i} onClick={() => handleAnswerQuestion(option)} disabled={selectedAnswer !== null}
                                            className={`w-full text-left p-2 rounded-md transition-colors ${buttonClass}`}
                                        >
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
             {error && <div className="lg:col-span-2"><Alert message={error} /></div>}
        </div>
    );
};

export default LanguageHubView;
