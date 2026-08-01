"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { BackpackIcon, BookIcon, CrayonIcon, NotebookIcon, StarIcon } from "@/components/icons"
import Image from "next/image"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Loader2, Gamepad2 } from "lucide-react";
import { subjectsByClass, getIcon, isUrdu } from "@/lib/subjects";
import { cn } from "@/lib/utils";
import MiniStoryGenerator from "../student/ai/mini-story-generator";
import RhymeFinder from "../student/ai/rhyme-finder";
import EncouragementBuddy from "../student/ai/encouragement-buddy";
import SongGenerator from "../student/ai/song-generator";
import { isWithinInterval, addHours, setHours, setMinutes } from 'date-fns';

interface Badge {
  title: string;
  date: string;
}

interface UserData {
  name?: string;
  badges?: Badge[];
  class?: string;
}

interface TimetableItem {
    id: string;
    subject: string;
    time: string;
    day: string;
    class: string;
    link?: string;
}

interface QuizResult {
    id: string;
    quizTitle: string;
    score: number;
    total: number;
}

interface DashboardViewProps {
  onSelectSubject: (subject: string) => void;
}

const motivationalMessages = [
    "You're a learning superstar! ✨",
    "Wow, look at you go! 🚀",
    "Keep up the amazing work! 🎉",
    "Every answer makes you smarter! 🧠",
    "You're on fire! 🔥"
];

const GameProgressCard = ({ title, score }: { title: string, score: number }) => {
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                    <Gamepad2 /> {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-4xl font-bold text-primary">{score}</p>
                <p className="text-sm font-semibold text-muted-foreground">Total Score</p>
                <p className="text-sm text-amber-600 mt-4 bg-amber-100 p-2 rounded-md">{randomMessage}</p>
            </CardContent>
        </Card>
    )
}

const JoinClassButton = ({ session }: { session: TimetableItem }) => {
    const [isClassTime, setIsClassTime] = useState(false);

    useEffect(() => {
        const checkTime = () => {
            if (!session.time) return;
            const now = new Date();
            const [hours, minutes] = session.time.split(':').map(Number);
            const classStartTime = setMinutes(setHours(now, hours), minutes);
            const classEndTime = addHours(classStartTime, 1);
            setIsClassTime(isWithinInterval(now, { start: classStartTime, end: classEndTime }));
        };
        
        checkTime();
        const interval = setInterval(checkTime, 60000);
        return () => clearInterval(interval);
    }, [session.time]);
    
    return (
        <a href={session.link} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="btn-bounce" disabled={!isClassTime || !session.link}>
                Join Class
            </Button>
        </a>
    );
};


export default function DashboardView({ onSelectSubject }: DashboardViewProps) {
  const [userData, setUserData] = useState<UserData>({});
  const [schedule, setSchedule] = useState<TimetableItem[]>([]);
  const [recentQuizResult, setRecentQuizResult] = useState<QuizResult | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  const badges = userData.badges || [];
  const studentClass = userData.class;
  const subjects = studentClass ? subjectsByClass[studentClass] || [] : [];
  
  useEffect(() => {
    const fetchData = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        setLoadingSchedule(false);
        setLoadingSubjects(false);
        return;
      }

      // Fetch user profile
      const { data: userProfile } = await supabase.from('users').select('*').eq('uid', user.id).single();
      if (userProfile) {
        setUserData({
          name: userProfile.name,
          class: userProfile.class_name || userProfile.class,
          badges: userProfile.badges || [],
        });
        setLoadingSubjects(false);

        // Fetch today's schedule
        const today = new Date().toLocaleDateString('en-us', { weekday: 'long' });
        const userClass = userProfile.class_name || userProfile.class;
        if (userClass) {
          const { data: timetableData } = await supabase
            .from('timetable')
            .select('*')
            .eq('class_name', userClass)
            .eq('day', today);

          if (timetableData) {
            const items: TimetableItem[] = timetableData.map((t: any) => ({
              id: t.id,
              subject: t.subject,
              time: t.start_time || t.time || '09:00',
              day: t.day,
              class: t.class_name,
              link: t.room || '',
            })).sort((a: TimetableItem, b: TimetableItem) => a.time.localeCompare(b.time));
            setSchedule(items);
          }
        }
        setLoadingSchedule(false);

        // Fetch recent quiz result
        const { data: quizResults } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('student_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(1);

        if (quizResults && quizResults.length > 0) {
          const result = quizResults[0];
          const { data: quiz } = await supabase.from('quizzes').select('title').eq('id', result.quiz_id).single();
          setRecentQuizResult({
            id: result.id,
            quizTitle: quiz?.title || 'a recent quiz',
            score: result.score,
            total: result.total_questions || 5,
          });
        }
      } else {
        setLoadingSubjects(false);
        setLoadingSchedule(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <EncouragementBuddy studentName={userData.name} badges={badges} recentQuizResult={recentQuizResult} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSchedule ? (
                  <div className="flex items-center justify-center p-8">
                      <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
                  </div>
              ) : (
                  <ul className="space-y-4">
                  {schedule.length > 0 ? schedule.map((item, index) => {
                      const iconInfo = getIcon(item.subject);
                      return (
                          <li key={index} className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-secondary/50 transition-colors duration-200">
                          <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg bg-blue-100`}>
                                {iconInfo.type === 'icon' && (
                                    <div className={`p-2 rounded-lg bg-blue-100`}>
                                        {iconInfo.type === 'icon' && <iconInfo.component className="w-6 h-6 text-foreground/80" />}
                                    </div>
                                )}
                                {iconInfo.type === 'image' && (
                                    <Image src={iconInfo.component as string} alt={item.subject} width={24} height={24} className="rounded-md" />
                                )}
                              </div>
                              <div>
                              <p className={cn("font-semibold text-foreground", isUrdu(item.subject) && "text-lg font-urdu")}>{item.subject}</p>
                              <p className="text-sm text-muted-foreground">{item.time}</p>
                              </div>
                          </div>
                          <JoinClassButton session={item} />
                          </li>
                      )
                  }) : (
                      <li className="text-center py-10 text-muted-foreground">No classes scheduled for today.</li>
                  )}
                  </ul>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="font-headline text-xl">My Courses</CardTitle>
              <CardDescription>Click on a course to start your lesson!</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSubjects ? (
                  <div className="flex items-center justify-center p-8">
                      <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
                  </div>
              ) : subjects.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {subjects.map((subjectName) => {
                      const iconInfo = getIcon(subjectName);
                      return (
                      <div key={subjectName} className="flex flex-col items-center text-center gap-2 cursor-pointer group" onClick={() => onSelectSubject(subjectName)}>
                          <div className={`relative w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20 transition-transform duration-300 group-hover:scale-110`}>
                              {iconInfo.type === 'icon' && (
                                  <iconInfo.component className="w-10 h-10 text-foreground/70" />
                              )}
                              {iconInfo.type === 'image' && (
                                  <Image src={iconInfo.component as string} alt={subjectName} width={60} height={60} className="rounded-md" />
                              )}
                          </div>
                          <p className={cn("font-semibold text-sm text-foreground", isUrdu(subjectName) && "text-lg font-urdu")}>{subjectName}</p>
                      </div>
                      )
                  })}
                  </div>
              ) : (
                  <p className="text-center py-10 text-muted-foreground">No courses assigned yet. Your teacher needs to assign you to a class.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          <SongGenerator studentName={userData.name} />
          <MiniStoryGenerator />
          <RhymeFinder />
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                  <CardTitle className="font-headline text-xl">My Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-center mb-4">
                    <div className="inline-block relative">
                      <Image src="/badge.gif" alt="Animated Badge" width={120} height={120} className="rounded-full" />
                      <div className="absolute -top-1 -right-1 p-2 bg-accent rounded-full animate-bounce">
                          <StarIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold font-headline mt-2 text-primary-foreground">You have {badges.length} Badges! ⭐</h3>
                    <p className="text-sm text-muted-foreground">Keep up the great work!</p>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                      <label className="text-sm font-medium">Weekly Progress</label>
                      <Progress value={75} className="h-3" />
                  </div>
                  
                  <Separator className="my-4" />

                  <h4 className="font-semibold mb-3">Recent Badges</h4>
                  <ul className="space-y-3">
                    {badges.length > 0 ? badges.map((badge) => (
                      <li key={badge.title} className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-100 rounded-full">
                              <StarIcon className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                              <p className="font-medium text-sm text-foreground">{badge.title}</p>
                              <p className="text-xs text-muted-foreground">Awarded on {badge.date}</p>
                          </div>
                      </li>
                    )) : (
                      <li className="text-sm text-muted-foreground text-center">No badges awarded yet. Keep learning!</li>
                    )}
                  </ul>
              </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
