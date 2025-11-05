// FIX: Import React to make its types, like React.ReactNode, available.
import React from 'react';

export interface Flashcard {
  question: string;
  answer: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Badge {
  name: string;
  description: string;
  icon: React.ReactNode;
  threshold: number;
}
