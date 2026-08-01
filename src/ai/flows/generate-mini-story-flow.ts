'use server';

import { askGroq } from '@/ai/groq';

export type GenerateMiniStoryInput = {
  characterName: string;
  topic: string;
};

export type GenerateMiniStoryOutput = {
  story: string;
};

export async function generateMiniStory(input: GenerateMiniStoryInput): Promise<GenerateMiniStoryOutput> {
  try {
    const systemPrompt = "You are a creative and fun storyteller for young children (ages 3-8). Write a single, happy, single-paragraph story. Output ONLY the story text directly.";
    const userPrompt = `Write a short story where the main character is ${input.characterName} and the topic is ${input.topic}.`;
    const storyText = await askGroq(systemPrompt, userPrompt);
    if (storyText && storyText.length > 10) {
      return { story: storyText };
    }
  } catch (err) {
    console.error('Error generating mini story via Groq:', err);
  }
  return {
    story: `Once upon a time, ${input.characterName || 'a brave young learner'} went on an exciting adventure involving ${input.topic || 'wonder and discovery'}! With a warm heart and bright eyes, ${input.characterName || 'they'} learned something wonderful that brought joy to everyone around.`
  };
}

