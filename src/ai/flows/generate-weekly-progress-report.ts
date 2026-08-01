'use server';

import { askGroq } from '@/ai/groq';

export type GenerateWeeklyProgressReportInput = {
  studentName: string;
  teacherRemarks: string;
  quizScores: { quizTitle: string; score: string }[];
  badgesEarned: string[];
};

export type GenerateWeeklyProgressReportOutput = {
  report: string;
};

export async function generateWeeklyProgressReport(input: GenerateWeeklyProgressReportInput): Promise<GenerateWeeklyProgressReportOutput> {
  try {
    const systemPrompt = `You are an enthusiastic AI assistant for NextGen Learners. Write a fun, positive, emoji-filled weekly progress report for parents of young children. Use sections: Weekly Adventure Summary, Quiz Quest!, Badge Collection!, and Next Week's Mission. Keep it concise and warm.`;
    const quizText = input.quizScores.length > 0
      ? input.quizScores.map(q => `${q.quizTitle}: ${q.score}`).join(', ')
      : 'No quizzes this week';
    const badgesText = input.badgesEarned.length > 0 ? input.badgesEarned.join(', ') : 'None this week';
    const userPrompt = `Student: ${input.studentName}\nTeacher Remarks: ${input.teacherRemarks}\nQuiz Scores: ${quizText}\nBadges Earned: ${badgesText}`;
    const reportText = await askGroq(systemPrompt, userPrompt);
    if (reportText && reportText.length > 10) {
      return { report: reportText };
    }
  } catch (err) {
    console.error('Error generating weekly report via Groq:', err);
  }
  return {
    report: `🌟 Hello ${input.studentName}'s Family!\n\n**Weekly Adventure Summary**: ${input.teacherRemarks || 'A great week of learning!'}\n\n**Quiz Quest!** 🎯: ${input.quizScores.map(q => `${q.quizTitle}: ${q.score}`).join(', ') || 'Keep practicing!'}\n\n**Badge Collection!** 🏆: ${input.badgesEarned.join(', ') || 'Aim for a badge next week!'}\n\n**Next Week's Mission**: Keep up the amazing work — every day is a new adventure! 🚀`
  };
}

