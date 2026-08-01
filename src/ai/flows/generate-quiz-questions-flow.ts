'use server';

import { askGroq } from '@/ai/groq';

export type GenerateQuizInput = {
  prompt: string;
  classLevel: string;
  numQuestions: number;
};

export type QuizQuestion = {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
};

export type GenerateQuizOutput = {
  title: string;
  questions: QuizQuestion[];
};

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  try {
    const systemPrompt = `You are an expert educator. Generate a JSON object for a multiple-choice quiz based on the user's request.
Respond strictly in JSON matching this exact structure:
{
  "title": "Quiz Title",
  "questions": [
    {
      "questionText": "Question description?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "explanation": "Why this option is correct."
    }
  ]
}`;
    const userPrompt = `Topic: ${input.prompt}\nClass Level: ${input.classLevel}\nNumber of Questions: ${input.numQuestions || 3}`;
    const rawJson = await askGroq(systemPrompt, userPrompt, true);
    const parsed = JSON.parse(rawJson);
    if (parsed.title && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Error generating quiz via Groq:', err);
  }

  // Fallback quiz
  return {
    title: `${input.prompt || 'Fun Learning'} Quiz`,
    questions: [
      {
        questionText: `What is an important concept in ${input.prompt || 'this lesson'}?`,
        options: ['Learning and exploring', 'Sleeping all day', 'Ignoring rules', 'None of the above'],
        correctAnswerIndex: 0,
        explanation: 'Learning and exploring helps us grow!'
      },
      {
        questionText: `Which of these is helpful for a ${input.classLevel || 'student'}?`,
        options: ['Practicing every day', 'Giving up early', 'Not reading books', 'Forgetting homework'],
        correctAnswerIndex: 0,
        explanation: 'Daily practice leads to success!'
      }
    ]
  };
}

