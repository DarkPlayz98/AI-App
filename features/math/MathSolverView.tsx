
import React, { useState, useCallback } from 'react';
import { solveMathProblem } from '../../services/geminiService';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import { SigmaIcon } from '../../components/icons/Icons';

const MathSolverView: React.FC = () => {
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSolve = useCallback(async () => {
    if (!problem.trim()) {
      setError('Please enter a math problem or concept.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSolution('');

    try {
      const result = await solveMathProblem(problem);
      setSolution(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [problem]);
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      handleSolve();
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="w-full max-w-2xl text-center">
        <h2 className="text-2xl font-bold text-gray-100">Advanced Math Solver</h2>
        <p className="text-gray-400 mt-2">
          Ask complex math questions. Our AI will engage its "Thinking Mode" to provide detailed, step-by-step solutions.
        </p>
      </div>

      <div className="w-full max-w-2xl flex flex-col gap-2">
        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., 'Find the derivative of f(x) = (x^2 + 1) * sin(x)' or 'Explain the Pythagorean theorem'"
          className="w-full h-32 bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          disabled={isLoading}
        />
        <button
          onClick={handleSolve}
          disabled={isLoading}
          className="flex items-center justify-center bg-indigo-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed"
        >
          <SigmaIcon />
          Solve with Steps (Ctrl+Enter)
        </button>
      </div>

      {error && <div className="w-full max-w-2xl"><Alert message={error} /></div>}
      
      {isLoading && <Spinner text="Thinking deeply..." size="lg" />}

      {solution && (
        <div className="w-full max-w-2xl bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-indigo-400">Solution</h3>
          <pre className="text-gray-200 whitespace-pre-wrap font-sans text-base leading-relaxed">
            {solution}
          </pre>
        </div>
      )}
    </div>
  );
};

export default MathSolverView;
