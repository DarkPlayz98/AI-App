// FIX: Corrected import path from "@google/genAI" to "@google/genai".
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import type { Flashcard, QuizQuestion, ChatMessage } from '../types';

// Assume process.env.API_KEY is available
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateFlashcards = async (topic: string): Promise<Flashcard[]> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate 5-10 high-quality flashcards about "${topic}". For each flashcard, provide a concise question and a clear, accurate answer.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING },
            },
            required: ['question', 'answer'],
          },
        },
        // FIX: Removed 'tools: [{ googleSearch: {} }]' as it conflicts with 'responseMimeType' and 'responseSchema' for JSON output.
      },
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw new Error("Failed to generate flashcards. Please check the topic and try again.");
  }
};

export const getTutorResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  try {
    const chatContents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));
    chatContents.push({ role: 'user', parts: [{ text: newMessage }] });

    const response = await ai.models.generateContent({
      // FIX: Updated model from 'gemini-2.5-flash-lite' to the recommended 'gemini-flash-lite-latest'.
      model: 'gemini-flash-lite-latest',
      // FIX: Corrected the 'contents' payload to pass the chat history array directly.
      contents: chatContents,
      config: {
        systemInstruction: "You are a friendly and encouraging language tutor. Your primary goal is to help the user practice a new language through conversation. After each user message, provide a natural response, and then **always** include a 'Feedback' section. This section, clearly marked with `**Feedback:**`, should provide concise, bullet-pointed feedback on the user's grammar, vocabulary, and sentence structure from their most recent message. If there are no errors, commend them on their good work. Keep your main response conversational and the feedback constructive.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error getting tutor response:", error);
    throw new Error("I'm sorry, I couldn't process that. Let's try something else.");
  }
};

export const generateQuiz = async (context: string): Promise<QuizQuestion> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the following context: "${context}", create one multiple-choice quiz question to test understanding. The question should have 4 options.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                        },
                        correctAnswer: { type: Type.STRING },
                    },
                    required: ['question', 'options', 'correctAnswer'],
                },
            },
        });
        const jsonText = response.text.trim();
        const quiz = JSON.parse(jsonText);
        if (quiz.options.length !== 4) {
            throw new Error("Generated quiz does not have 4 options.");
        }
        return quiz;
    } catch (error) {
        console.error("Error generating quiz:", error);
        throw new Error("Failed to generate a quiz. Please try again.");
    }
};

export const getPronunciation = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say this clearly: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error getting pronunciation:", error);
        throw new Error("Could not generate audio for the provided text.");
    }
};


export const solveMathProblem = async (problem: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `Please solve the following math problem and provide a detailed, step-by-step explanation. Format the answer clearly using Markdown for headings, bold text, and code blocks for equations or steps if necessary.\n\nProblem: ${problem}`,
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error solving math problem:", error);
        throw new Error("Failed to solve the math problem. The problem might be too complex or malformed.");
    }
};


// Audio decoding utilities
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function playAudio(base64Audio: string) {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioData = decode(base64Audio);

    const dataInt16 = new Int16Array(audioData.buffer);
    const frameCount = dataInt16.length / 1; // numChannels = 1
    const buffer = audioContext.createBuffer(1, frameCount, 24000); // sampleRate = 24000
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
}
