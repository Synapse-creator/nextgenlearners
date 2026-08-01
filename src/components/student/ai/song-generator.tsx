
"use client";

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Music, Play, Pause, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { generateSong } from '@/ai/flows/generate-song-flow';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  theme: z.enum(["Adventure", "Bedtime", "Silly Fun"], { required_error: "Please select a theme."}),
});
type FormData = z.infer<typeof formSchema>;

interface SongResult {
    lyrics: string;
    audioDataUri: string;
}

interface SongGeneratorProps {
    studentName?: string;
}

export default function SongGenerator({ studentName }: SongGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SongResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  
  const handlePlayPause = () => {
    if (audioRef.current) {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    }
  };

  async function onSubmit(data: FormData) {
    if (!studentName) {
        toast({ variant: 'destructive', title: 'Could not find student name.' });
        return;
    }
    setIsLoading(true);
    setResult(null);
    setIsPlaying(false);
    try {
      const songResult = await generateSong({ name: studentName, ...data });
      setResult(songResult);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Could not create song. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center gap-2">
          <Music /> "Sing My Name" Song Generator
        </CardTitle>
        <CardDescription>Create a special song just for you!</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose a Song Theme</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a theme" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Adventure">🚀 Adventure</SelectItem>
                      <SelectItem value="Bedtime">🌙 Bedtime</SelectItem>
                      <SelectItem value="Silly Fun">🤪 Silly Fun</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {isLoading && (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Your song is being written...
              </div>
            )}

            {result && (
              <div className="space-y-4">
                 <ScrollArea className="h-40 w-full rounded-md border p-4 bg-secondary/30">
                    <pre className="text-sm whitespace-pre-wrap font-sans">{result.lyrics}</pre>
                 </ScrollArea>
                 <div className="flex items-center gap-2">
                    <Button type="button" onClick={handlePlayPause} size="icon">
                        {isPlaying ? <Pause /> : <Play />}
                    </Button>
                    <a href={result.audioDataUri} download={`${studentName}_song.wav`}>
                        <Button type="button" variant="outline" size="icon">
                            <Download />
                        </Button>
                    </a>
                    <audio 
                        ref={audioRef} 
                        src={result.audioDataUri} 
                        onEnded={() => setIsPlaying(false)}
                    />
                 </div>
              </div>
            )}
            
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full btn-bounce">
              {isLoading ? '...' : <><Sparkles className="mr-2 h-4 w-4" />Create My Song!</>}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
