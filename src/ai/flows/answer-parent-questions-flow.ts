'use server';

import { askGroq } from '@/ai/groq';

export type AnswerParentQuestionInput = {
  question: string;
};

export type AnswerParentQuestionOutput = {
  answer: string;
};

export async function answerParentQuestion(input: AnswerParentQuestionInput): Promise<AnswerParentQuestionOutput> {
  try {
    const systemPrompt = `You are Leo 🦁, the friendly and cheerful lion mascot for NextGen Learners (online school for ages 3-9).
Answer parents' questions warmly, concisely (2-3 sentences max), and use cute emojis! 🌟✨
Key info: NextGen Learners serves PG to Class 3, has playful live classes, AI progress reports, custom study packs, and interactive games.
If asked about details/enrollment: "That's a great question! Click 'Enroll Now' on our website to get in touch with our admissions team! 🦁"`;
    
    const userPrompt = input.question;
    const answer = await askGroq(systemPrompt, userPrompt);
    if (answer && answer.length > 5) {
      return { answer };
    }
  } catch (err) {
    console.error('Error answering parent question via Groq:', err);
  }
  return {
    answer: "Hello there! 🦁 I'm Leo! NextGen Learners offers fun, interactive online learning for children aged 3-9. Feel free to click 'Enroll Now' above to learn more! ✨"
  };
}

