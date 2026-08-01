
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { generateMiniStory } from '@/ai/flows/generate-mini-story-flow';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  characterName: z.string().min(2, "Please enter a name."),
  topic: z.string().min(3, "Please enter a topic."),
});
type FormData = z.infer<typeof formSchema>;

export default function MiniStoryGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [story, setStory] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      characterName: "",
      topic: "",
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setStory(null);
    try {
      const result = await generateMiniStory(data);
      setStory(result.story);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Could not write story. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center gap-2">
          <BookOpen /> Mini Story Generator
        </CardTitle>
        <CardDescription>Create your own magical story with AI!</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="characterName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Character Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Alex" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Story About...</FormLabel>
                  <FormControl><Input placeholder="e.g., a friendly lion" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isLoading && (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Writing your story...
              </div>
            )}
            {story && (
              <div className="p-4 bg-secondary/50 rounded-lg text-sm text-foreground">
                {story}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full btn-bounce">
              {isLoading ? '...' : <><Sparkles className="mr-2 h-4 w-4" />Write Story</>}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
