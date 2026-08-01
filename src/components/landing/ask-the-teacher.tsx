
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, User, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { answerTeacherQuestion } from '@/ai/flows/answer-teacher-questions-flow';
import { Textarea } from '../ui/textarea';
import Image from 'next/image';

const formSchema = z.object({
  question: z.string().min(10, "Please ask a specific question."),
});
type FormData = z.infer<typeof formSchema>;

export default function AskTheTeacher() {
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { question: "" },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setAnswer(null);
    try {
      const result = await answerTeacherQuestion(data);
      setAnswer(result.answer);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Could not get an answer. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="text-center">
        <div className="mx-auto w-fit mb-2">
            <Image src="/question.png" alt="Ask a question icon" width={60} height={60} />
        </div>
        <CardTitle className="font-headline text-2xl">Ask a Teacher</CardTitle>
        <CardDescription>Get thoughtful advice from our AI-powered teacher on common parenting questions.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-grow">
          <CardContent className="flex-grow space-y-4">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Question</FormLabel>
                  <FormControl>
                    <Textarea 
                        placeholder="e.g., How can I encourage my shy child to participate more in online classes?" 
                        className="min-h-[100px]"
                        {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isLoading} className="w-full btn-bounce">
              {isLoading ? '...' : <><Sparkles className="mr-2 h-4 w-4" />Ask Question</>}
            </Button>

            {isLoading && (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Thinking...
              </div>
            )}
            {answer && (
              <div className="p-4 bg-secondary/50 rounded-lg text-sm text-foreground space-y-2 mt-4">
                <div className="flex items-start gap-3">
                    <Image src="/question.png" alt="Teacher Icon" width={32} height={32} className="rounded-full mt-1" />
                    <p className="flex-1">{answer}</p>
                </div>
              </div>
            )}
          </CardContent>
        </form>
      </Form>
    </Card>
  );
}
