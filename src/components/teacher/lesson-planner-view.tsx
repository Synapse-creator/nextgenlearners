
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateLessonPlan, GenerateLessonPlanOutput } from '@/ai/flows/generate-lesson-plan-flow';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Lightbulb, CheckCircle, Target, Activity, HelpCircle } from "lucide-react";
import { classes } from "@/lib/subjects";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { subjectsByClass } from "@/lib/subjects";
import { syllabusByClass } from "@/lib/syllabus";

const formSchema = z.object({
  classLevel: z.string({ required_error: "Please select a class." }),
  subject: z.string({ required_error: "Please select a subject." }),
  topic: z.string({ required_error: "Please select a topic." }),
});

type FormData = z.infer<typeof formSchema>;

export default function LessonPlannerView() {
  const [lessonPlan, setLessonPlan] = useState<GenerateLessonPlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      classLevel: undefined,
      subject: undefined,
      topic: undefined,
    },
  });

  const selectedClass = form.watch("classLevel");
  const selectedSubject = form.watch("subject");

  const subjectsForSelectedClass = selectedClass ? subjectsByClass[selectedClass] || [] : [];
  const topicsForSelectedSubject = (selectedClass && selectedSubject && syllabusByClass[selectedClass as keyof typeof syllabusByClass])
    ? syllabusByClass[selectedClass as keyof typeof syllabusByClass].find(s => s.subject === selectedSubject)?.topics || []
    : [];

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setLessonPlan(null);
    try {
      const result = await generateLessonPlan(data);
      setLessonPlan(result);
       toast({
        title: "Lesson Plan Generated! ✨",
        description: "Your new lesson plan is ready below.",
      });
    } catch (error) {
      console.error("Error generating lesson plan:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem generating the lesson plan. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const PlanSection = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <div>
        <h3 className="font-bold font-headline text-lg flex items-center gap-2 mb-2">
            <Icon className="w-5 h-5 text-primary" />
            {title}
        </h3>
        <div className="pl-7 text-sm space-y-2 text-muted-foreground">
            {children}
        </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <Card className="shadow-sm lg:col-span-1">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Lightbulb /> AI Lesson Planner
          </CardTitle>
          <CardDescription>Select a topic from the syllabus, and the AI will create a structured plan for you.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="classLevel"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Class</FormLabel>
                        <Select onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue('subject', undefined as any);
                            form.setValue('topic', undefined as any);
                        }} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
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
               <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <Select 
                            onValueChange={(value) => {
                                field.onChange(value);
                                form.setValue('topic', undefined as any);
                            }} 
                            value={field.value} 
                            disabled={!selectedClass}
                        >
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {subjectsForSelectedClass.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
               />
                <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Topic</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedSubject}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select a topic from the syllabus" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {topicsForSelectedSubject.map((topic, index) => (
                                    <SelectItem key={index} value={topic}>{topic}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
               />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full btn-bounce">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="mr-2 h-4 w-4" />Generate Plan</>}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <div className="lg:col-span-2">
        {isLoading ? (
             <Card className="shadow-sm min-h-[400px]">
                <CardContent className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6">
                    <Sparkles className="w-16 h-16 mb-4 animate-pulse text-primary" />
                    <p className="font-semibold">Our AI is crafting a brilliant lesson plan...</p>
                    <p className="text-sm">This should only take a moment.</p>
                </CardContent>
             </Card>
        ) : lessonPlan ? (
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Generated Lesson Plan</CardTitle>
                    <CardDescription>Topic: {form.getValues('topic')} for {form.getValues('classLevel')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <PlanSection icon={Target} title="Learning Objectives">
                        <ul className="list-disc pl-5 space-y-1">
                            {lessonPlan.learningObjectives.map((obj, i) => <li key={i}>{obj}</li>)}
                        </ul>
                    </PlanSection>
                    <PlanSection icon={Lightbulb} title="Talking Points">
                        <ul className="list-disc pl-5 space-y-1">
                            {lessonPlan.talkingPoints.map((point, i) => <li key={i}>{point}</li>)}
                        </ul>
                    </PlanSection>
                    <PlanSection icon={Activity} title="Activity Idea">
                        <p className="font-semibold text-foreground">{lessonPlan.activityIdea.title}</p>
                        <p>{lessonPlan.activityIdea.description}</p>
                    </PlanSection>
                     <PlanSection icon={HelpCircle} title="Quiz Question">
                        <p className="font-semibold text-foreground">{lessonPlan.quizQuestion.question}</p>
                         <ul className="list-decimal pl-5 space-y-1">
                            {lessonPlan.quizQuestion.options.map((opt, i) => <li key={i}>{opt}</li>)}
                        </ul>
                        <p className="font-medium text-green-600 bg-green-100/50 p-2 rounded-md">Correct Answer: {lessonPlan.quizQuestion.correctAnswer}</p>
                    </PlanSection>
                </CardContent>
            </Card>
        ) : (
            <Card className="shadow-sm min-h-[400px]">
                 <CardContent className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6">
                    <div className="bg-primary/20 p-4 rounded-full mb-4">
                        <Sparkles className="w-12 h-12 text-primary-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold font-headline mb-2">Your Lesson Plan Awaits</h2>
                    <p className="max-w-xs">Fill out the form to generate a new lesson plan with objectives, activities, and more!</p>
                 </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
