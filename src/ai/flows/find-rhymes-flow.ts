'use server';

import { askGroq } from '@/ai/groq';

export type FindRhymesInput = {
  word: string;
};

export type FindRhymesOutput = {
  rhymes: string[];
};

export async function findRhymes(input: FindRhymesInput): Promise<FindRhymesOutput> {
  try {
    const systemPrompt = `You are a fun rhyming assistant for young children. Return a JSON array of 4-5 simple words that rhyme with the given word. Only return valid JSON like: {"rhymes":["cat","bat","hat","mat"]}`;
    const rawJson = await askGroq(systemPrompt, `Word: ${input.word}`, true);
    const parsed = JSON.parse(rawJson);
    if (parsed.rhymes && Array.isArray(parsed.rhymes)) {
      return parsed;
    }
  } catch (err) {
    console.error('Error finding rhymes via Groq:', err);
  }
  return { rhymes: ['cat', 'bat', 'hat', 'mat', 'sat'] };
}
