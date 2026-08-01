
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookCopy, CheckCircle2 } from "lucide-react";
import { syllabusByClass } from "@/lib/syllabus";
import { isUrdu } from "@/lib/subjects";
import { cn } from "@/lib/utils";
import * as Icons from "@/components/icons";

interface SyllabusViewProps {
    studentClass?: string | null;
}

export default function SyllabusView({ studentClass }: SyllabusViewProps) {
    const syllabus = studentClass ? syllabusByClass[studentClass as keyof typeof syllabusByClass] : null;

    if (!syllabus) {
        return (
            <Card className="flex flex-col items-center justify-center h-64 text-center p-8 bg-card rounded-xl shadow-sm border-dashed">
                <div className="bg-primary/20 p-4 rounded-full mb-4">
                    <Icons.BackpackIcon className="w-12 h-12 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold font-headline mb-2">No Syllabus Available</h2>
                <p className="text-muted-foreground">Your teacher has not assigned you to a class yet, or a syllabus is not available for your class.</p>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                    <BookCopy /> {studentClass} Syllabus
                </CardTitle>
                <CardDescription>Here's a look at all the exciting things you'll be learning!</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full" defaultValue={syllabus[0].subject}>
                    {syllabus.map((item) => (
                        <AccordionItem key={item.subject} value={item.subject}>
                            <AccordionTrigger className={cn("text-lg font-bold", isUrdu(item.subject) && "text-2xl font-urdu")}>
                                {item.subject}
                            </AccordionTrigger>
                            <AccordionContent>
                                <ul className="space-y-3 pl-2">
                                    {item.topics.map((topic, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                            <div className={cn(isUrdu(topic) && "font-urdu text-lg text-right w-full")}>
                                                {topic}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}
