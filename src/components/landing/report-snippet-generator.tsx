"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, FileText, Bot } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { generateReportSnippet } from '@/ai/flows/generate-report-snippet-flow';

export default function ReportSnippetGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [snippet, setSnippet] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSnippet = async () => {
    setIsLoading(true);
    setSnippet(null);
    try {
      const result = await generateReportSnippet();
      setSnippet(result.snippet);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Could not generate snippet. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="text-center">
        <div className="mx-auto w-fit mb-2 bg-green-100 p-3 rounded-full">
            <Bot className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="font-headline text-2xl">Parent's AI Insights</CardTitle>
        <CardDescription>Click below to see a sample of the encouraging, AI-powered progress reports parents receive weekly.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center text-center">
        {isLoading ? (
            <div className="flex items-center text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating report snippet...
            </div>
        ) : snippet ? (
            <blockquote className="p-4 bg-secondary/50 rounded-lg border-l-4 border-primary text-left">
                <p className="italic text-foreground">"{snippet}"</p>
                 <footer className="text-xs text-muted-foreground mt-2">- From Zayn's Weekly Report</footer>
            </blockquote>
        ) : (
             <div className="text-center text-muted-foreground p-4">
                <FileText className="w-12 h-12 mx-auto mb-2" />
                <p>Your sample report snippet will appear here.</p>
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={fetchSnippet} disabled={isLoading} className="w-full btn-bounce">
          {isLoading ? '...' : <><Sparkles className="mr-2 h-4 w-4" />Generate Snippet</>}
        </Button>
      </CardFooter>
    </Card>
  );
}
