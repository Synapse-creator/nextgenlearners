"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, XCircle, ArrowRight, Award, Star } from 'lucide-react';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface QuizQuestion {
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
}

interface Quiz {
    id: string;
    title: string;
    questions: QuizQuestion[];
    allowRetake?: boolean;
}

export interface QuizResult {
    quizId: string;
    studentId: string;
    score: number;
    total: number;
    completedAt: any;
}

interface QuizPlayerProps {
    quiz: Quiz;
    studentId: string;
    onClose: () => void;
}

type AnswerState = 'unanswered' | 'correct' | 'incorrect';

export default function QuizPlayer({ quiz, studentId, onClose }: QuizPlayerProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
    const [isFinished, setIsFinished] = useState(false);
    const { toast } = useToast();

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

    useEffect(() => {
        if (isLastQuestion) {
            const img = new (window as any).Image();
            img.src = '/trophy.gif';
        }
    }, [isLastQuestion]);

    const handleAnswerSelect = (index: number) => {
        if (answerState !== 'unanswered') return;

        setSelectedAnswerIndex(index);
        if (index === currentQuestion.correctAnswerIndex) {
            setAnswerState('correct');
            setScore(s => s + 1);
        } else {
            setAnswerState('incorrect');
        }
    };

    const saveResult = async (finalScore: number) => {
        try {
            // Fetch student name from users table
            const { data: userData } = await supabase.from('users').select('name').eq('uid', studentId).single();
            const studentName = userData?.name || 'Student';

            const { error } = await supabase.from('quiz_results').insert([
                {
                    quiz_id: quiz.id,
                    student_id: studentId,
                    student_name: studentName,
                    score: finalScore,
                    total_questions: quiz.questions.length,
                },
            ]);

            if (error) throw error;
        } catch (error: any) {
            console.error("Error saving quiz result:", error);
            toast({
                variant: 'destructive',
                title: "Save Failed",
                description: "Could not save your quiz score. Please try again.",
            });
        }
    };

    const handleNext = () => {
        if (isLastQuestion) {
            const finalScore = answerState === 'correct' ? score + 1 : score;
            setIsFinished(true);
            saveResult(finalScore);
        } else {
            setCurrentQuestionIndex(i => i + 1);
            setSelectedAnswerIndex(null);
            setAnswerState('unanswered');
        }
    };

    const progressPercentage = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    if (isFinished) {
        return (
            <div className="text-center space-y-6 py-8">
                <Image src="/trophy.gif" alt="Trophy" width={120} height={120} className="mx-auto" />
                <h2 className="text-3xl font-headline font-bold">Quiz Completed! 🎉</h2>
                <p className="text-xl">Your Score: <span className="font-bold text-primary">{score} / {quiz.questions.length}</span></p>
                <div className="flex justify-center gap-4">
                    <Button onClick={onClose} className="btn-bounce">Back to Dashboard</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-headline text-lg font-bold">{quiz.title}</h3>
                <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-sm font-semibold text-muted-foreground">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </div>

            <div className="space-y-4">
                <p className="text-lg font-medium">{currentQuestion.questionText}</p>
                <div className="grid gap-3">
                    {currentQuestion.options.map((option, idx) => {
                        const isSelected = selectedAnswerIndex === idx;
                        const isCorrect = idx === currentQuestion.correctAnswerIndex;
                        let variantStyle = "outline";
                        if (answerState !== 'unanswered') {
                            if (isCorrect) variantStyle = "bg-green-100 border-green-500 text-green-800";
                            else if (isSelected) variantStyle = "bg-red-100 border-red-500 text-red-800";
                        }
                        return (
                            <Button
                                key={idx}
                                variant="outline"
                                className={cn("justify-start text-left font-normal h-auto py-3 px-4", variantStyle)}
                                onClick={() => handleAnswerSelect(idx)}
                                disabled={answerState !== 'unanswered'}
                            >
                                <span className="mr-3 font-semibold text-xs rounded-full border w-6 h-6 flex items-center justify-center">
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                {option}
                            </Button>
                        );
                    })}
                </div>
            </div>

            {answerState !== 'unanswered' && (
                <div className="flex justify-end pt-4">
                    <Button onClick={handleNext} className="btn-bounce">
                        {isLastQuestion ? 'Finish Quiz' : 'Next Question'} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
