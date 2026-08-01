"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Lightbulb, CheckCircle, Save } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { generateQuiz, GenerateQuizOutput } from '@/ai/flows/generate-quiz-questions-flow';
import { supabase } from '@/lib/supabase';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';

const formSchema = z.object({
  prompt: z.string().min(10, "Please provide a more detailed prompt for the quiz."),
  numQuestions: z.coerce.number().int().min(1, "Minimum 1 question.").max(10, "Maximum 10 questions."),
});

type FormData = z.infer<typeof formSchema>;

interface CreateQuizFormProps {
  setOpen: (open: boolean) => void;
  selectedClass: string;
  subject: string;
  onQuizCreated: () => void;
}

export default function CreateQuizForm({ setOpen, selectedClass, subject, onQuizCreated }: CreateQuizFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [quizData, setQuizData] = useState<GenerateQuizOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: `A fun quiz about ${subject}`,
      numQuestions: 5,
    }
  });

  async function onGenerate(data: FormData) {
    setIsGenerating(true);
    setQuizData(null);
    try {
      const result = await generateQuiz({
        prompt: data.prompt,
        classLevel: selectedClass,
        numQuestions: data.numQuestions,
      });
      setQuizData(result);
      toast({
        title: 'Quiz Generated!',
        description: 'Review the questions below. You can regenerate or save the quiz.',
      });
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'The AI failed to generate a quiz. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function onSave() {
    if (!quizData) return;
    setIsSaving(true);
    try {
        const { error } = await supabase.from('quizzes').insert([
          {
            title: quizData.title,
            questions: quizData.questions,
            class_name: selectedClass,
            subject: subject,
          },
        ]);

        if (error) throw error;

        toast({
            title: 'Quiz Saved! 🚀',
            description: `${quizData.title} is now available for students.`,
        });
        onQuizCreated();
    } catch (error: any) {
        console.error("Error saving quiz: ", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: error.message || "Could not save the quiz. Please try again.",
        });
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <Sparkles className="text-primary" /> Create AI Quiz ({subject})
        </DialogTitle>
        <DialogDescription>Generate a custom quiz for {selectedClass} using AI.</DialogDescription>
      </DialogHeader>
      
      {!quizData ? (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onGenerate)} className="space-y-4 py-4">
                <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Topic / Prompt</FormLabel>
                        <FormControl>
                            <Textarea placeholder="e.g., A quiz on basic shapes and colors..." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="numQuestions"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Number of Questions</FormLabel>
                        <FormControl>
                            <Input type="number" min={1} max={10} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <DialogFooter className="pt-4">
                    <Button type="submit" disabled={isGenerating} className="w-full btn-bounce">
                    {isGenerating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Quiz...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Questions
                        </>
                    )}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      ) : (
        <div className="space-y-4 py-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
                <CheckCircle className="text-green-500" /> {quizData.title}
            </h3>
            <ScrollArea className="h-60 w-full rounded-md border p-4">
                <div className="space-y-4">
                    {quizData.questions.map((q, idx) => (
                        <div key={idx} className="space-y-1">
                            <p className="font-semibold text-sm">{idx + 1}. {q.question}</p>
                            <ul className="text-xs text-muted-foreground list-disc list-inside">
                                {q.options.map((opt: string, oIdx: number) => (
                                    <li key={oIdx} className={opt === q.correctAnswer ? "font-semibold text-green-600" : ""}>
                                        {opt}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setQuizData(null)}>Regenerate</Button>
                <Button onClick={onSave} disabled={isSaving} className="btn-bounce">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Quiz
                </Button>
            </DialogFooter>
        </div>
      )}
    </>
  );
}
