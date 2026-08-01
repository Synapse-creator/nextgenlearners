
"use client";

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, RefreshCw } from 'lucide-react';
import { generateEncouragement, GenerateEncouragementInput } from '@/ai/flows/generate-encouragement-flow';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface Badge {
  title: string;
  date: string;
}

interface QuizResult {
    id: string;
    quizTitle: string;
    score: number;
    total: number;
}

interface EncouragementBuddyProps {
    studentName?: string;
    badges?: Badge[];
    recentQuizResult?: QuizResult | null;
}

export default function EncouragementBuddy({ studentName, badges, recentQuizResult }: EncouragementBuddyProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMessage = async () => {
    setIsLoading(true);
    try {
        const input: GenerateEncouragementInput = {
            studentName: studentName || 'Superstar',
            badges: badges?.map(b => b.title),
            recentQuiz: recentQuizResult ? {
                quizTitle: recentQuizResult.quizTitle,
                score: recentQuizResult.score,
                total: recentQuizResult.total,
            } : undefined,
        };
      const result = await generateEncouragement(input);
      setMessage(result.message);
    } catch (error) {
      // Don't show an error toast, just fallback to a default message
      setMessage("Welcome! Ready for a new day of learning and fun? Let's go! 🚀");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Generate message only when data is available
    if (studentName !== undefined && badges !== undefined && recentQuizResult !== undefined) {
        fetchMessage();
    }
  }, [studentName, badges, recentQuizResult]);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg bg-primary/10 border-2 border-primary/20 shadow-sm">
        <Image src="/i-am-proud-of-you.png" alt="Encouragement Buddy" width={100} height={100} />
        <div className="flex-grow text-center sm:text-left">
            <h3 className="font-bold font-headline text-lg text-primary-foreground">A Message For You!</h3>
            {isLoading ? (
                <p className="text-muted-foreground italic">Your buddy is thinking of something nice to say...</p>
            ) : (
                <p className="text-foreground">{message}</p>
            )}
        </div>
        <Button variant="ghost" size="sm" onClick={fetchMessage} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            New Message
        </Button>
    </div>
  );
}
