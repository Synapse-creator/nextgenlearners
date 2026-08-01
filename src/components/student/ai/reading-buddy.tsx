
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { generateReadingPassage } from '@/ai/flows/generate-reading-passage-flow';
import { MicIcon } from '@/components/icons';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  topic: z.string().min(3, "Please enter a topic for the story."),
});
type FormData = z.infer<typeof formSchema>;

interface ReadingBuddyViewProps {
    studentClass?: string | null;
}

export default function ReadingBuddyView({ studentClass }: ReadingBuddyViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [passage, setPassage] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
    },
  });

  async function onSubmit(data: FormData) {
    if (!studentClass) {
        toast({
            variant: 'destructive',
            title: 'Class not found',
            description: 'We couldn\'t find your class to generate a story. Please check your profile.',
        });
        return;
    }
    setIsLoading(true);
    setPassage(null);
    try {
      const result = await generateReadingPassage({ ...data, studentClass });
      setPassage(result.passage);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Could not write a story. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
            <Card className="shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-primary/20 p-2 rounded-full">
                            <MicIcon className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="font-headline text-2xl">My Reading Buddy</CardTitle>
                    </div>
                    <CardDescription>
                        Let's create a fun story! What should we read about today?
                    </CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="topic"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Story Topic</FormLabel>
                            <FormControl><Input placeholder="e.g., a friendly lion" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full btn-bounce">
                        {isLoading ? '...' : <><Sparkles className="mr-2 h-4 w-4" />Write a Story!</>}
                    </Button>
                    </form>
                </Form>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card className="shadow-sm min-h-[300px]">
                <CardHeader>
                     <CardTitle className="font-headline text-xl flex items-center gap-2">
                        <BookOpen /> Your Story
                    </CardTitle>
                    <CardDescription>Read the passage below out loud to practice!</CardDescription>
                </CardHeader>
                <CardContent>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                        <Loader2 className="mr-2 h-8 w-8 animate-spin mb-4" />
                        <p className="font-semibold">Our AI Buddy is writing a special story just for you...</p>
                    </div>
                ) : passage ? (
                    <ScrollArea className="h-64 p-4 bg-secondary/30 rounded-lg">
                        <p className="text-lg leading-relaxed whitespace-pre-wrap">{passage}</p>
                    </ScrollArea>
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                        <Image src="/reading.png" alt="Reading" width={120} height={120} />
                        <p className="mt-4 font-semibold">Your new story will appear here!</p>
                    </div>
                )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
