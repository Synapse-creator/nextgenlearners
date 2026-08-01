
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Music } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { findRhymes } from '@/ai/flows/find-rhymes-flow';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  word: z.string().min(2, "Please enter a word.").regex(/^[a-zA-Z]+$/, "Only letters are allowed."),
});
type FormData = z.infer<typeof formSchema>;

export default function RhymeFinder() {
  const [isLoading, setIsLoading] = useState(false);
  const [rhymes, setRhymes] = useState<string[] | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: "",
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setRhymes(null);
    try {
      const result = await findRhymes(data);
      setRhymes(result.rhymes);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Could not find rhymes. Please try another word.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center gap-2">
          <Music /> AI Rhyme Finder
        </CardTitle>
        <CardDescription>Find words that sound the same!</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="word"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Word to Rhyme</FormLabel>
                  <FormControl><Input placeholder="e.g., cat" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isLoading && (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Finding rhymes...
              </div>
            )}
            {rhymes && (
              <div className="p-4 bg-secondary/50 rounded-lg flex flex-wrap gap-2">
                {rhymes.map((rhyme, index) => (
                    <Badge key={index} variant="secondary" className="text-base">{rhyme}</Badge>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full btn-bounce">
              {isLoading ? '...' : <><Sparkles className="mr-2 h-4 w-4" />Find Rhymes</>}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
