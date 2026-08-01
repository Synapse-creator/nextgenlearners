
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { classes, subjectsByClass, getIcon, isUrdu } from "@/lib/subjects";
import * as Icons from "@/components/icons";
import { VideoIcon } from "@/components/icons";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "../ui/dialog";
import CreateQuizForm from "./create-quiz-form";
import QuizzesList, { type Quiz } from "./quizzes-list";
import QuizScoresView from "./quiz-scores-view";
import WorksheetsView from "./worksheets-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/lib/supabase';
import { isWithinInterval, addHours, setHours, setMinutes, setSeconds, setMilliseconds, parse } from 'date-fns';

type DialogView = 'list' | 'create-quiz' | 'scores';

interface TimetableItem {
  id: string;
  subject: string;
  time: string;
  day: string;
  class: string;
  link?: string;
}

const StartClassButton = ({ session, subjectName }: { session?: TimetableItem, subjectName: string }) => {
    const [isClassTime, setIsClassTime] = useState(false);

    useEffect(() => {
        const checkTime = () => {
            if (!session?.time) {
                setIsClassTime(false);
                return;
            }
            const now = new Date();
            const [hours, minutes] = session.time.split(':').map(Number);
            const classStartTime = setMinutes(setHours(now, hours), minutes);
            const classEndTime = addHours(classStartTime, 1);
            setIsClassTime(isWithinInterval(now, { start: classStartTime, end: classEndTime }));
        };
        
        checkTime();
        const interval = setInterval(checkTime, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [session]);
    
    return (
        <a href={session?.link} target="_blank" rel="noopener noreferrer">
            <Button className="w-full" disabled={!isClassTime || !session?.link}>
                <VideoIcon className="w-4 h-4 mr-2" />
                Start Live Class
            </Button>
        </a>
    );
};


export default function SubjectsView() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogView, setDialogView] = useState<DialogView>('list');
  const [currentSubject, setCurrentSubject] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isWorksheetDialogOpen, setIsWorksheetDialogOpen] = useState(false);
  const [timetable, setTimetable] = useState<TimetableItem[]>([]);

  const subjects = selectedClass ? subjectsByClass[selectedClass] : [];

  useEffect(() => {
    if (selectedClass) {
      const fetchTimetable = async () => {
        const { data } = await supabase
          .from('timetable')
          .select('*')
          .eq('class_name', selectedClass);
        if (data) {
          setTimetable(data.map((t: any) => ({
            id: t.id,
            subject: t.subject,
            time: t.start_time || t.time || '09:00',
            day: t.day,
            class: t.class_name,
            link: t.room || '',
          })));
        }
      };
      fetchTimetable();
    }
  }, [selectedClass]);
  
  const handleOpenQuizDialog = (subject: string) => {
    setCurrentSubject(subject);
    setDialogView('list');
    setIsDialogOpen(true);
  };
  
  const handleOpenWorksheetDialog = (subject: string) => {
    setCurrentSubject(subject);
    setIsWorksheetDialogOpen(true);
  };

  const handleViewScores = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setDialogView('scores');
  };

  const handleCreateNewQuiz = () => {
    setDialogView('create-quiz');
  };

  const handleQuizCreated = () => {
    setDialogView('list');
  };

  const renderDialogContent = () => {
    if (!selectedClass || !currentSubject) return null;

    switch (dialogView) {
      case 'list':
        return (
          <QuizzesList
            selectedClass={selectedClass}
            subject={currentSubject}
            onCreateClick={handleCreateNewQuiz}
            onViewScoresClick={handleViewScores}
          />
        );
      case 'create-quiz':
        return (
          <CreateQuizForm
            setOpen={setIsDialogOpen}
            selectedClass={selectedClass}
            subject={currentSubject}
            onQuizCreated={handleQuizCreated}
          />
        );
      case 'scores':
        if (!selectedQuiz) return null;
        return (
            <QuizScoresView
                quiz={selectedQuiz}
                onBack={() => setDialogView('list')}
            />
        );
      default:
        return null;
    }
  };

  return (
    <div>
        <CardHeader className="px-0">
            <CardTitle>Subjects</CardTitle>
            <CardDescription>Select a class to manage learning materials for each subject.</CardDescription>
        </CardHeader>

        <div className="mb-6 max-w-xs">
            <Select onValueChange={setSelectedClass}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a class..." />
                </SelectTrigger>
                <SelectContent>
                    {classes.map((className) => (
                        <SelectItem key={className} value={className}>
                            {className}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        {selectedClass ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subjects.map((subjectName) => {
                    const iconInfo = getIcon(subjectName);
                    const today = new Date().toLocaleDateString('en-us', { weekday: 'long' });
                    const todaysSession = timetable.find(
                        item => item.day === today && item.subject === subjectName
                    );

                    return (
                        <Card key={subjectName}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className="w-8 h-8 flex items-center justify-center">
                                      {iconInfo.type === 'icon' && (
                                          <iconInfo.component className="w-6 h-6 text-primary" />
                                      )}
                                      {iconInfo.type === 'image' && (
                                          <Image src={iconInfo.component as string} alt={subjectName} width={28} height={28} />
                                      )}
                                    </div>
                                    <span className={cn(isUrdu(subjectName) && "text-2xl font-urdu")}>{subjectName}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="worksheets">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="worksheets">Worksheets</TabsTrigger>
                                        <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                                        <TabsTrigger value="live_class">Live Class</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="worksheets" className="mt-4">
                                        <Button variant="outline" className="w-full" onClick={() => handleOpenWorksheetDialog(subjectName)}>Manage Worksheets</Button>
                                    </TabsContent>
                                    <TabsContent value="quizzes" className="mt-4">
                                       <Button variant="outline" className="w-full" onClick={() => handleOpenQuizDialog(subjectName)}>Manage Quizzes</Button>
                                    </TabsContent>
                                    <TabsContent value="live_class" className="mt-4">
                                        <StartClassButton session={todaysSession} subjectName={subjectName} />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        ) : (
            <Card className="flex flex-col items-center justify-center h-64 text-center p-8 bg-card rounded-xl shadow-sm border-dashed">
                <div className="bg-primary/20 p-4 rounded-full mb-4">
                    <Icons.BackpackIcon className="w-12 h-12 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold font-headline mb-2">Please select a class</h2>
                <p className="text-muted-foreground max-w-sm">Once you select a class, its subjects will be displayed here for you to manage.</p>
            </Card>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-xl">
              {renderDialogContent()}
            </DialogContent>
        </Dialog>
        
        <Dialog open={isWorksheetDialogOpen} onOpenChange={setIsWorksheetDialogOpen}>
            <DialogContent className="sm:max-w-xl">
              {selectedClass && currentSubject && (
                 <WorksheetsView 
                    selectedClass={selectedClass}
                    subject={currentSubject}
                 />
              )}
            </DialogContent>
        </Dialog>

    </div>
  );
}
