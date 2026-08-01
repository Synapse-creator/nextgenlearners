"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Download, FileText, Gamepad2, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { subjectsByClass, getIcon, isUrdu, isLanguageSubject, isMathSubject, isArtSubject, isGkScienceSubject, isIslamiatSubject } from "@/lib/subjects";
import * as Icons from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";
import QuizPlayer, { type QuizResult } from "./quiz-player";
import LetterWordSplash from "./games/letter-word-splash";
import NumberBubblePop from "./games/number-bubble-pop";
import ScienceLabAdventure from "./games/science-lab-adventure";
import GoodDeedsPath from "./games/good-deeds-path";
import GoodMannersMaze from "./games/good-manners-maze";
import MathBalance from "./games/math-balance";
import SpellingBee from "./games/spelling-bee";
import CreativeCanvas from "./games/creative-canvas";
import StudentWorksheetsView from "./student-worksheets-view";


interface StudentSubjectsViewProps {
  selectedSubject: string | null;
  setSelectedSubject: (subject: string | null) => void;
}

interface Quiz {
    id: string;
    title: string;
    questions: any[];
    allowRetake?: boolean;
    createdAt: string;
}

const GamesContent = ({ studentClass, subject, userId }: { studentClass: string; subject: string; userId: string }) => {
    const islamiatGame = React.useMemo(() => {
        const games = [GoodDeedsPath, GoodMannersMaze];
        const RandomGame = games[Math.floor(Math.random() * games.length)];
        return <RandomGame studentClass={studentClass} studentId={userId} subject={subject} />;
    }, [studentClass, subject, userId]);

    const mathGame = React.useMemo(() => {
        const games = [NumberBubblePop, MathBalance];
        const RandomGame = games[Math.floor(Math.random() * games.length)];
        return <RandomGame studentClass={studentClass} studentId={userId} subject={subject} />;
    }, [studentClass, subject, userId]);

    const languageGame = React.useMemo(() => {
        // Spelling bee is english only
        if (isUrdu(subject)) {
            return <LetterWordSplash studentClass={studentClass} studentId={userId} subject={subject} />;
        }
        const games = [LetterWordSplash, SpellingBee];
        const RandomGame = games[Math.floor(Math.random() * games.length)];
        return <RandomGame studentClass={studentClass} studentId={userId} subject={subject} />;
    }, [studentClass, subject, userId]);

    if (!userId) return null;

    if (isArtSubject(subject)) {
        return <CreativeCanvas studentClass={studentClass} studentId={userId} subject={subject} />;
    }

    if (isLanguageSubject(subject)) {
        return languageGame;
    }
    
    if (isMathSubject(subject)) {
        return mathGame;
    }

    if (isGkScienceSubject(subject)) {
        return <ScienceLabAdventure studentClass={studentClass} studentId={userId} subject={subject} />;
    }
    
    if (isIslamiatSubject(subject)) {
        return islamiatGame;
    }

    return <ScienceLabAdventure studentClass={studentClass} studentId={userId} subject={subject} />;
}

const QuizzesContent = ({ studentClass, subject, userId }: { studentClass: string; subject: string; userId: string }) => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [quizResults, setQuizResults] = useState<{[quizId: string]: QuizResult}>({});
    const [loading, setLoading] = useState(true);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const { data } = await supabase
                    .from('quizzes')
                    .select('*')
                    .eq('class_name', studentClass)
                    .eq('subject', subject)
                    .order('created_at', { ascending: false });
                setQuizzes((data || []).map((q: any) => ({ ...q, createdAt: q.created_at })));
            } catch (err) {
                console.warn('Error fetching quizzes:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, [studentClass, subject]);

    useEffect(() => {
        if (!userId) return;
        const fetchResults = async () => {
            try {
                const { data } = await supabase
                    .from('quiz_results')
                    .select('*')
                    .eq('student_id', userId);
                const results: {[quizId: string]: QuizResult} = {};
                (data || []).forEach((r: any) => {
                    if (!results[r.quiz_id] || r.score > results[r.quiz_id].score) {
                        results[r.quiz_id] = { quizId: r.quiz_id, studentId: r.student_id, score: r.score, total: r.total_questions, completedAt: r.completed_at };
                    }
                });
                setQuizResults(results);
            } catch (err) {
                console.warn('Error fetching quiz results:', err);
            }
        };
        fetchResults();
    }, [userId]);

    if (loading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        );
    }
    
    if (quizzes.length === 0) {
        return <PlaceholderContent icon={Icons.CrayonIcon} title="Quizzes" description="No quizzes have been added to this section yet." />;
    }

    return (
        <>
            <ul className="space-y-3">
                {quizzes.map(quiz => {
                    const result = quizResults[quiz.id];
                    const hasBeenTaken = !!result;
                    return (
                        <li key={quiz.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                            <div className="flex items-center gap-3">
                                <Gamepad2 className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="font-medium">{quiz.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Created on {format(new Date(quiz.createdAt), 'PPP')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {hasBeenTaken && (
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-sm font-semibold text-yellow-500">
                                            <Star className="w-4 h-4 fill-yellow-400" />
                                            <span>{result.score}/{result.total}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Best Score</p>
                                    </div>
                                )}
                                <Button 
                                    size="sm" 
                                    className="btn-bounce" 
                                    onClick={() => setSelectedQuiz(quiz)}
                                    disabled={hasBeenTaken && !quiz.allowRetake}
                                >
                                   {hasBeenTaken ? "Retake Quiz" : "Start Quiz"}
                                </Button>
                            </div>
                        </li>
                    )
                })}
            </ul>
            {selectedQuiz && userId && (
                <QuizPlayer
                    quiz={selectedQuiz}
                    studentId={userId}
                    onClose={() => setSelectedQuiz(null)}
                />
            )}
        </>
    );
};

const PlaceholderContent = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
    <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-card rounded-xl shadow-inner border-dashed">
        <div className="bg-primary/20 p-4 rounded-full mb-4">
            <Icon className="w-12 h-12 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold font-headline mb-2">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
    </div>
)

export default function StudentSubjectsView({ selectedSubject, setSelectedSubject }: StudentSubjectsViewProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [studentClass, setStudentClass] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const { data } = await supabase.from('users').select('class_name').eq('uid', user.id).single();
          setStudentClass(data?.class_name || null);
        }
      } catch (err) {
        console.warn('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const subjects = studentClass ? subjectsByClass[studentClass] || [] : [];

  if (loading) {
      return (
        <div>
            <div className="text-center mb-8">
                <Skeleton className="h-8 w-1/2 mx-auto" />
                <Skeleton className="h-4 w-3/4 mx-auto mt-2" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-0">
                           <Skeleton className="h-32 w-full" />
                           <div className="p-4 bg-card">
                              <Skeleton className="h-6 w-3/4 mx-auto" />
                           </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      )
  }
  
  if (!studentClass) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-card rounded-xl shadow-sm border-dashed">
            <div className="bg-primary/20 p-4 rounded-full mb-4">
                <Icons.BackpackIcon className="w-12 h-12 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold font-headline mb-2">No Class Assigned</h2>
            <p className="text-muted-foreground">Your teacher has not assigned you to a class yet. Please check back later.</p>
        </div>
      )
  }

  if (selectedSubject) {
    const iconInfo = getIcon(selectedSubject);
    return (
      <div>
        <Button variant="ghost" onClick={() => setSelectedSubject(null)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Subjects
        </Button>
        <div className="flex items-center gap-4 mb-6">
            <div className={`p-4 rounded-lg bg-primary/20`}>
                {iconInfo.type === 'icon' && (
                    <iconInfo.component className="w-10 h-10 text-foreground/80" />
                )}
                {iconInfo.type === 'image' && (
                    <Image src={iconInfo.component as string} alt={selectedSubject} width={40} height={40} className="rounded-md" />
                )}
            </div>
            <h2 className={cn("text-3xl font-bold font-headline", isUrdu(selectedSubject) && "text-4xl font-urdu")}>{selectedSubject}</h2>
        </div>

        <Tabs defaultValue="worksheets">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="worksheets">Worksheets</TabsTrigger>
                <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                <TabsTrigger value="games">Games</TabsTrigger>
                <TabsTrigger value="saved_classes">Saved Classes</TabsTrigger>
            </TabsList>
            <TabsContent value="worksheets" className="mt-4">
                {studentClass && userId && <StudentWorksheetsView studentClass={studentClass} subject={selectedSubject} studentId={userId} />}
            </TabsContent>
            <TabsContent value="quizzes" className="mt-4">
               {studentClass && userId && <QuizzesContent studentClass={studentClass} subject={selectedSubject} userId={userId} />}
            </TabsContent>
            <TabsContent value="games" className="mt-4">
                {studentClass && userId && <GamesContent studentClass={studentClass} subject={selectedSubject} userId={userId} />}
            </TabsContent>
            <TabsContent value="saved_classes" className="mt-4">
                <PlaceholderContent icon={Icons.VideoIcon} title="Saved Classes" description="No materials have been added to this section yet." />
            </TabsContent>
        </Tabs>

      </div>
    );
  }

  return (
    <div>
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-headline">My Subjects ({studentClass})</h2>
            <p className="text-muted-foreground">Choose a subject to see your learning materials.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {subjects.map((subjectName) => {
            const iconInfo = getIcon(subjectName);
            return(
                <Card 
                    key={subjectName} 
                    className="overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer"
                    onClick={() => setSelectedSubject(subjectName)}
                >
                    <CardContent className="p-0">
                        <div className={`h-32 bg-primary/10 flex items-center justify-center`}>
                           {iconInfo.type === 'icon' && (
                                <iconInfo.component className="w-16 h-16 text-foreground/70 transition-transform duration-300 group-hover:scale-110" />
                            )}
                            {iconInfo.type === 'image' && (
                                <Image src={iconInfo.component as string} alt={subjectName} width={80} height={80} className="transition-transform duration-300 group-hover:scale-110 rounded-md" />
                            )}
                        </div>
                        <div className="p-4 bg-card">
                            <h3 className={cn("font-bold font-headline text-center", isUrdu(subjectName) && "text-xl font-urdu")}>{subjectName}</h3>
                        </div>
                    </CardContent>
                </Card>
            )
        })}
        </div>
    </div>
  );
}
