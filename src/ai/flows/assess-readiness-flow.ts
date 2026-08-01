
'use server';

import { askGroq } from '@/ai/groq';

export type AssessReadinessInput = {
  childAge: number;
};

export type QuestionItem = {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  level: "PG" | "Nursery" | "KG" | "Class 1";
};

export type AssessReadinessOutput = {
  questions: QuestionItem[];
};

export async function assessReadiness(input: AssessReadinessInput): Promise<AssessReadinessOutput> {
  try {
    const systemPrompt = `You are an expert early childhood educator. Generate a 4-question assessment JSON to assess class readiness for a child aged ${input.childAge}.
Respond strictly in JSON matching this structure:
{
  "questions": [
    {
      "questionText": "Can your child identify the letter A?",
      "options": ["Yes, easily", "Getting started", "Not yet"],
      "correctAnswerIndex": 0,
      "level": "PG"
    }
  ]
}`;
    const userPrompt = `Child Age: ${input.childAge}`;
    const rawJson = await askGroq(systemPrompt, userPrompt, true);
    const parsed = JSON.parse(rawJson);
    if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Error assessing readiness via Groq:', err);
  }

  // Fallback assessment
  return {
    questions: [
      {
        questionText: "Can your child count 5 objects in front of them?",
        options: ["Yes, accurately", "Needs a little help", "Not yet"],
        correctAnswerIndex: 0,
        level: input.childAge <= 3 ? "PG" : "Nursery"
      },
      {
        questionText: "Can your child identify basic colors (Red, Blue, Yellow)?",
        options: ["Recognizes all of them", "Recognizes some", "Learning them now"],
        correctAnswerIndex: 0,
        level: input.childAge <= 4 ? "Nursery" : "KG"
      },
      {
        questionText: "Can your child speak in simple, clear sentences?",
        options: ["Very clearly", "In short 2-3 word phrases", "Still developing"],
        correctAnswerIndex: 0,
        level: input.childAge <= 5 ? "KG" : "Class 1"
      }
    ]
  };
}

