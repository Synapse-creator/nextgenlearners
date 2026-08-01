'use server';

import { askGroq } from '@/ai/groq';

export type GenerateSongInput = {
  name: string;
  theme: 'Adventure' | 'Bedtime' | 'Silly Fun';
};

export type GenerateSongOutput = {
  lyrics: string;
  audioDataUri: string;
};

export async function generateSong(input: GenerateSongInput): Promise<GenerateSongOutput> {
  try {
    const systemPrompt = `You are a cheerful songwriter for young children. Write a short, simple song (2-3 verses) for a child. The theme is ${input.theme}. Include the child's name at least twice. Output ONLY the lyrics with line breaks.`;
    const userPrompt = `Child's name: ${input.name}\nTheme: ${input.theme}`;
    const lyrics = await askGroq(systemPrompt, userPrompt);
    if (lyrics && lyrics.length > 10) {
      return { lyrics, audioDataUri: '' };
    }
  } catch (err) {
    console.error('Error generating song via Groq:', err);
  }
  return {
    lyrics: `🎵 ${input.name}, ${input.name}, shine so bright!\n${input.name}, ${input.name}, you're our light!\nLearning, growing every day,\n${input.name}'s here to play and stay! 🎵`,
    audioDataUri: ''
  };
}
