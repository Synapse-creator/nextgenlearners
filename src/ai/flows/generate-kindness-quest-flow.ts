'use server';

import { askGroq } from '@/ai/groq';

export type GenerateKindnessQuestOutput = {
  quest: string;
};

const fallbackQuests = [
  "Your mission today is to give a big smile to three different people!",
  "Can you help a family member with a small chore without being asked?",
  "Today's quest is to say something nice to a friend.",
  "Your challenge is to draw a happy picture for someone in your family.",
  "Can you share one of your toys or snacks with a friend today?",
  "Say a warm 'Thank you' to your teacher or parent today!",
  "Give someone you love a big high-five or a warm hug!",
];

export async function generateKindnessQuest(): Promise<GenerateKindnessQuestOutput> {
  try {
    const systemPrompt = "You are a friendly and encouraging AI assistant for children. Generate a single, simple, and positive 'Kindness Quest' for a child (ages 3-9). Output ONLY the quest text in one short, happy sentence without any quotes or extra text.";
    const userPrompt = "Generate a new fun kindness quest for today.";
    const questText = await askGroq(systemPrompt, userPrompt);
    if (questText && questText.length > 5) {
      return { quest: questText.replace(/^"|"$/g, '') };
    }
  } catch (err) {
    console.error('Error generating kindness quest via Groq:', err);
  }
  const randomQuest = fallbackQuests[Math.floor(Math.random() * fallbackQuests.length)];
  return { quest: randomQuest };
}


