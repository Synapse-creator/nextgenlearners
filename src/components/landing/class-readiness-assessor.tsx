
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, ArrowRight, Lightbulb, User, CheckCircle2 } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { assessReadiness, AssessReadinessOutput } from '@/ai/flows/assess-readiness-flow';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Progress } from '../ui/progress';
import { Label } from '../ui/label';

type AssessorState = 'initial' | 'loading' | 'assessment' | 'result';

const formSchema = z.object({
  childAge: z.coerce.number().int().min(2, "Age must be at least 2.").max(8, "Age must be no more than 8."),
});
type FormData = z.infer<typeof formSchema>;

interface ClassReadinessAssessorProps {
    onEnrollClick: (className: string) => void;
}

const classOrder = ["PG", "Nursery", "KG", "Class 1", "Class 2", "Class 3"];

export default function ClassReadinessAssessor({ onEnrollClick }: ClassReadinessAssessorProps) {
  const [assessorState, setAssessorState] = useState<AssessorState>('initial');
  const [quizData, setQuizData] = useState<AssessReadinessOutput | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [recommendedClass, setRecommendedClass] = useState<string>('PG');
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { childAge: '' as any },
  });

  async function onStart(data: FormData) {
    setAssessorState('loading');
    try {
      const result = await assessReadiness({ childAge: data.childAge });
      setQuizData(result);
      setAnswers(new Array(result.questions.length).fill(null));
      setAssessorState('assessment');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Could not generate assessment. Please try again.' });
      setAssessorState('initial');
    }
  }

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);

    setTimeout(() => {
        if (currentQuestionIndex < (quizData?.questions.length || 0) - 1) {
            setCurrentQuestionIndex(i => i + 1);
        } else {
            calculateResult(newAnswers as number[]);
            setAssessorState('result');
        }
    }, 500);
  };

  const calculateResult = (finalAnswers: number[]) => {
    if (!quizData) return;
    const correctAnswersByLevel: { [level: string]: number } = {};
    
    quizData.questions.forEach((q, index) => {
        if (finalAnswers[index] === q.correctAnswerIndex) {
            correctAnswersByLevel[q.level] = (correctAnswersByLevel[q.level] || 0) + 1;
        }
    });

    // Find the highest level with at least one correct answer
    let highestLevel = "PG";
    for (const level of classOrder) {
        if (correctAnswersByLevel[level] > 0) {
            highestLevel = level;
        }
    }
    setRecommendedClass(highestLevel);
  };

  const currentQuestion = quizData?.questions[currentQuestionIndex];
  const progress = quizData ? ((currentQuestionIndex + 1) / quizData.questions.length) * 100 : 0;

  return (
    <div>
        <AnimatePresence mode="wait">
            {assessorState === 'initial' && (
                <motion.div key="initial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <DialogHeader className='text-center'>
                        <div className="mx-auto w-fit mb-2 bg-primary/20 p-3 rounded-full">
                            <Lightbulb className="w-8 h-8 text-primary" />
                        </div>
                        <DialogTitle className="font-headline text-2xl">Class Readiness Assessor</DialogTitle>
                        <DialogDescription>Let's find the perfect starting point for your child's learning adventure. Just a few fun questions!</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onStart)} className="space-y-4 py-6">
                            <FormField
                            control={form.control}
                            name="childAge"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Child's Age</FormLabel>
                                <FormControl><Input type="number" placeholder="e.g., 4" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <Button type="submit" className="w-full btn-bounce">
                                Start Assessment <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </form>
                    </Form>
                </motion.div>
            )}

            {assessorState === 'loading' && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                    <Sparkles className="w-16 h-16 mb-4 animate-pulse text-primary" />
                    <p className="font-semibold">Our AI is preparing a few fun questions...</p>
                </motion.div>
            )}

            {assessorState === 'assessment' && currentQuestion && (
                <motion.div key="assessment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <DialogHeader>
                         <Progress value={progress} className="mb-4 h-2" />
                         <DialogTitle className="font-headline text-xl text-center">{currentQuestion.questionText}</DialogTitle>
                    </DialogHeader>
                    <RadioGroup onValueChange={(val) => handleAnswer(parseInt(val))} className="py-6 space-y-3">
                        {currentQuestion.options.map((option, index) => (
                           <Label 
                                key={index}
                                htmlFor={`option-${index}`} 
                                className={cn(
                                    "flex items-center gap-4 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors",
                                    answers[currentQuestionIndex] === index && 'bg-accent border-primary'
                                )}>
                                <RadioGroupItem
                                    value={String(index)}
                                    id={`option-${index}`}
                                />
                                <span className="flex-grow">{option}</span>
                            </Label>
                        ))}
                    </RadioGroup>
                </motion.div>
            )}

             {assessorState === 'result' && (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                    <div className="mx-auto w-fit mb-4 bg-green-100 p-4 rounded-full">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                    <DialogTitle className="font-headline text-2xl">Recommendation Ready!</DialogTitle>
                    <DialogDescription className="mt-2">Based on the answers, we recommend starting with:</DialogDescription>
                    <p className="text-5xl font-bold font-headline text-primary my-4">{recommendedClass}</p>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">This class seems like a great fit to help your child grow and have fun. You can always discuss this with our teachers after enrolling.</p>
                    <Button onClick={() => onEnrollClick(recommendedClass)} size="lg" className="mt-8 btn-bounce">
                        Enroll in {recommendedClass}
                    </Button>
                </motion.div>
             )}
        </AnimatePresence>
    </div>
  );
}
