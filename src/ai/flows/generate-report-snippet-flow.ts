'use server';

import { askGroq } from '@/ai/groq';

export type GenerateReportSnippetOutput = {
  snippet: string;
};

export async function generateReportSnippet(): Promise<GenerateReportSnippetOutput> {
  try {
    const systemPrompt = `You are an enthusiastic AI assistant for NextGen Learners. Generate a short, positive 2-3 sentence weekly progress report snippet for a fictional student named Zayn. Mention a fun accomplishment (like earning a Math Ninja badge) and use cute emojis! Output ONLY the snippet text.`;
    const userPrompt = "Generate a sample weekly progress report snippet.";
    const snippetText = await askGroq(systemPrompt, userPrompt);
    if (snippetText && snippetText.length > 10) {
      return { snippet: snippetText };
    }
  } catch (err) {
    console.error('Error generating report snippet via Groq:', err);
  }
  return {
    snippet: "Zayn had a fantastic week in our digital classroom! 🚀 He showed amazing focus during his 'Number Ninjas' quiz and earned a new 'Math Magician' badge for his collection. We are so proud of his progress!"
  };
}

