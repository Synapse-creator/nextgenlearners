
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Languages } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { translateName } from '@/ai/flows/translate-name-flow';

const formSchema = z.object({
  name: z.string().min(2, "Please enter a name."),
});
type FormData = z.infer<typeof formSchema>;

interface TranslationResult {
    meaning: string;
    urduTranslation: string;
}

export default function NameTranslator() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setResult(null);
    try {
      const translationResult = await translateName(data);
      setResult(translationResult);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Could not get translation. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="text-center">
        <div className="mx-auto w-fit mb-2 bg-blue-100 p-3 rounded-full">
            <Languages className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="font-headline text-2xl">Translate Your Name</CardTitle>
        <CardDescription>Discover your name's meaning and see it in Urdu!</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-grow">
          <CardContent className="flex-grow space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter a Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Sarah" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isLoading && (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Translating...
              </div>
            )}
            {result && (
              <div className="p-4 bg-secondary/50 rounded-lg text-sm text-foreground space-y-3">
                <p><span className='font-semibold'>Meaning:</span> {result.meaning}</p>
                <div className='text-center'>
                    <p className='font-semibold'>In Urdu:</p>
                    <p className="text-4xl font-urdu">{result.urduTranslation}</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full btn-bounce">
              {isLoading ? '...' : <><Sparkles className="mr-2 h-4 w-4" />Discover</>}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
