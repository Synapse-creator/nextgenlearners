'use server';

import { askGroq } from '@/ai/groq';

export type TranslateNameInput = {
  name: string;
};

export type TranslateNameOutput = {
  meaning: string;
  urduTranslation: string;
};

export async function translateName(input: TranslateNameInput): Promise<TranslateNameOutput> {
  try {
    const systemPrompt = `You are an expert on name meanings and Urdu translation. Given a name, return JSON with:
{"meaning": "short positive meaning/fun fact", "urduTranslation": "اردو نام"}
Only return valid JSON.`;
    const rawJson = await askGroq(systemPrompt, `Name: ${input.name}`, true);
    const parsed = JSON.parse(rawJson);
    if (parsed.meaning && parsed.urduTranslation) {
      return parsed;
    }
  } catch (err) {
    console.error('Error translating name via Groq:', err);
  }
  return {
    meaning: `${input.name} is a beautiful name meaning light and brilliance! ✨`,
    urduTranslation: input.name
  };
}

