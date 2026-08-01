"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Lightbulb, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { generateLearningObjective } from '@/ai/flows/generate-learning-objective-flow';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { classes } from '@/lib/subjects';

const formSchema = z.object({
  topic: z.string().min(3, "Please enter a topic."),
  classLevel: z.string({ required_error: "Please select a class." }),
});
type FormData = z.infer<typeof formSchema>;

export default function LearningObjectiveGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [objective, setObjective] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { topic: "", classLevel: undefined },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setObjective(null);
    try {
      const result = await generateLearningObjective(data);
      setObjective(result.objective);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Could not generate objective. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="text-center">
        <div className="mx-auto w-fit mb-2 bg-purple-100 p-3 rounded-full">
            <Lightbulb className="w-8 h-8 text-purple-600" />
        </div>
        <CardTitle className="font-headline text-2xl">Teacher's AI Assistant</CardTitle>
        <CardDescription>See how our AI helps teachers create lesson plans instantly. Enter a topic to generate a learning objective.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-grow">
          <CardContent className="flex-grow space-y-4">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson Topic</FormLabel>
                  <FormControl><Input placeholder="e.g., The Solar System" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="classLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Level</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classes.map((className) => (
                          <SelectItem key={className} value={className}>{className}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isLoading} className="w-full btn-bounce">
              {isLoading ? '...' : <><Sparkles className="mr-2 h-4 w-4" />Generate Objective</>}
            </Button>

            {isLoading && (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </div>
            )}
            {objective && (
              <div className="p-4 bg-secondary/50 rounded-lg text-sm text-foreground space-y-2 mt-4">
                <div className="flex items-center gap-2 font-semibold">
                    <Target className="w-5 h-5 text-primary" />
                    <span>Generated Learning Objective:</span>
                </div>
                <p className="pl-7">{objective}</p>
              </div>
            )}
          </CardContent>
        </form>
      </Form>
    </Card>
  );
}
