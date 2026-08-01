'use server';

import { askGroq } from '@/ai/groq';

export type GenerateLessonPlanInput = {
  topic: string;
  classLevel: string;
};

export type GenerateLessonPlanOutput = {
  learningObjectives: string[];
  talkingPoints: string[];
  activityIdea: {
    title: string;
    description: string;
  };
  quizQuestion: {
    question: string;
    options: string[];
    correctAnswer: string;
  };
};

export async function generateLessonPlan(input: GenerateLessonPlanInput): Promise<GenerateLessonPlanOutput> {
  try {
    const systemPrompt = `You are an expert curriculum designer. Generate a JSON object for a lesson plan.
Respond strictly in JSON matching this exact structure:
{
  "learningObjectives": ["Objective 1", "Objective 2"],
  "talkingPoints": ["Point 1", "Point 2"],
  "activityIdea": {
    "title": "Activity Name",
    "description": "Fun description"
  },
  "quizQuestion": {
    "question": "Sample question?",
    "options": ["Opt 1", "Opt 2", "Opt 3"],
    "correctAnswer": "Opt 1"
  }
}`;
    const userPrompt = `Topic: ${input.topic}\nClass Level: ${input.classLevel}`;
    const rawJson = await askGroq(systemPrompt, userPrompt, true);
    const parsed = JSON.parse(rawJson);
    if (parsed.learningObjectives && parsed.talkingPoints && parsed.activityIdea) {
      return parsed;
    }
  } catch (err) {
    console.error('Error generating lesson plan via Groq:', err);
  }

  // Fallback lesson plan
  return {
    learningObjectives: [
      `Understand key concepts of ${input.topic || 'the lesson'}`,
      `Apply knowledge through interactive activities`
    ],
    talkingPoints: [
      `Welcome students and introduce ${input.topic || 'today topic'}.`,
      `Discuss real-world examples suitable for ${input.classLevel || 'Class 1'}.`,
      `Wrap up with Q&A.`
    ],
    activityIdea: {
      title: `${input.topic || 'Creative'} Exploration`,
      description: `Students work in small groups to draw and present their ideas about ${input.topic || 'the topic'}.`
    },
    quizQuestion: {
      question: `What did we learn today about ${input.topic || 'this topic'}?`,
      options: ['New fun concepts', 'Nothing at all', 'Playing games only'],
      correctAnswer: 'New fun concepts'
    }
  };
}

