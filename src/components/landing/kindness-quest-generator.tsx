
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { generateKindnessQuest } from '@/ai/flows/generate-kindness-quest-flow';

export default function KindnessQuestGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [quest, setQuest] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchQuest = async () => {
    setIsLoading(true);
    try {
      const result = await generateKindnessQuest();
      setQuest(result.quest);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Could not generate quest. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuest();
  }, []);

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="text-center">
        <div className="mx-auto w-fit mb-2 bg-pink-100 p-3 rounded-full">
            <Heart className="w-8 h-8 text-pink-500" />
        </div>
        <CardTitle className="font-headline text-2xl">Kindness Quest</CardTitle>
        <CardDescription>Get a fun kindness mission for the day!</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center text-center">
        {isLoading ? (
            <div className="flex items-center text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Finding a quest...
            </div>
        ) : (
            <p className="text-lg font-semibold text-foreground h-20">{quest}</p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={fetchQuest} disabled={isLoading} className="w-full btn-bounce">
          {isLoading ? '...' : <><Sparkles className="mr-2 h-4 w-4" />New Quest</>}
        </Button>
      </CardFooter>
    </Card>
  );
}
