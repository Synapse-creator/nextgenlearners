"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { subjectsByClass, getIcon, isUrdu } from "@/lib/subjects";
import { cn } from "@/lib/utils";
import { Loader2, TrendingUp, Play, Trophy, Star, Gamepad2, Award } from "lucide-react";
import { isWithinInterval, addHours, setHours, setMinutes } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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

interface DashboardViewProps {
  onSelectSubject: (subject: string) => void;
}

// Subject Descriptions Helper
const getSubjectDescription = (subjectName: string): string => {
  const upper = subjectName.toUpperCase();
  if (upper.includes("AUTHOR") || upper.includes("STORY") || upper.includes("WORD") || upper.includes("ENGLISH") || upper.includes("ABC") || upper.includes("LETTER")) {
    return "Learn to weave magical tales and master the art of storytelling.";
  }
  if (upper.includes("MATH") || upper.includes("NUMBER") || upper.includes("WIZARD") || upper.includes("MAGIC") || upper.includes("NINJA")) {
    return "Unlock the secrets of numbers with fun mathematical spells.";
  }
  if (upper.includes("SCIENCE") || upper.includes("SAFARI") || upper.includes("DISCOVER") || upper.includes("WORLD") || upper.includes("EXPLORE")) {
    return "Journey through the stars and discover how the world works.";
  }
  if (subjectName.includes("حروف") || subjectName.includes("کہانی") || subjectName.includes("الفاظ") || subjectName.includes("سفر")) {
    return "اردو کے خوشنما الفاظ اور دلچسپ کہانیاں سیکھیں۔";
  }
  if (upper.includes("COLOR") || upper.includes("CREATION") || upper.includes("ART")) {
    return "Explore colorful drawings, creative arts and fun crafts.";
  }
  if (upper.includes("FAITH") || upper.includes("MANNERS") || subjectName.includes("دین") || subjectName.includes("راہیں")) {
    return "Discover good manners, inspiring values and positive habits.";
  }
  return "Explore interactive lessons, exciting games and fun quizzes.";
};

const getSubjectBgColor = (index: number): string => {
  const colors = ["bg-[#FFD3B6]", "bg-[#CAF0F8]", "bg-[#A8E6CF]", "bg-[#FFF9C4]", "bg-[#d8e9bd]"];
  return colors[index % colors.length];
};

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
      <button
        disabled={!isClassTime || !session.link}
        className="px-4 py-2 bg-[#2c6956] text-white rounded-xl text-xs font-bold disabled:opacity-50 squishy-btn flex items-center gap-1"
      >
        Join Class
      </button>
    </a>
  );
};

import { generateEncouragement } from "@/ai/flows/generate-encouragement-flow";
import { Sparkles, RefreshCw } from "lucide-react";

export default function DashboardView({ onSelectSubject }: DashboardViewProps) {
  const [userData, setUserData] = useState<UserData>({});
  const [schedule, setSchedule] = useState<TimetableItem[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [aiMotivationalMessage, setAiMotivationalMessage] = useState<string>("");
  const [loadingMessage, setLoadingMessage] = useState<boolean>(false);

  const studentClass = userData.class || "Class 3";
  const rawSubjects = subjectsByClass[studentClass] || subjectsByClass["Class 3"] || ["Young Authors", "Number Wizards", "Science Safari"];
  const studentFirstName = userData.name ? userData.name.split(' ')[0] : "Ahmad";

  const loadAiMessage = async (name: string) => {
    setLoadingMessage(true);
    try {
      const res = await generateEncouragement({ studentName: name });
      if (res?.message) {
        setAiMotivationalMessage(res.message);
      } else {
        setAiMotivationalMessage(`${name}, you have explored 5 new planets this week! Keep shining like a star! ⭐`);
      }
    } catch (err) {
      setAiMotivationalMessage(`${name}, every step you take in learning brings you closer to your big dreams! 🚀`);
    } finally {
      setLoadingMessage(false);
    }
  };

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
        const name = userProfile.name || "Ahmad";
        setUserData({
          name: userProfile.name,
          class: userProfile.class_name || userProfile.class,
          badges: userProfile.badges || [
            { title: "Space Explorer", date: "Recently" },
            { title: "Story Master", date: "Recently" }
          ],
        });
        setLoadingSubjects(false);
        loadAiMessage(name.split(' ')[0]);

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
      } else {
        const fallbackName = user.user_metadata?.name || "Ahmad Dawood";
        setUserData({
          name: fallbackName,
          class: "Class 3",
          badges: [
            { title: "Star Scholar", date: "This Week" },
            { title: "Math Magician", date: "This Week" }
          ]
        });
        setLoadingSubjects(false);
        setLoadingSchedule(false);
        loadAiMessage(fallbackName.split(' ')[0]);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-10 relative z-10 pb-12">
      {/* Daily Quest Progress Bar */}
      <section className="bg-white rounded-2xl p-6 card-shadow border border-[#A8E6CF]/20 flex flex-col md:flex-row items-center gap-6">
        <div className="flex items-center gap-4 min-w-max">
          <div className="w-12 h-12 bg-[#FFF9C4] rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[#795836] font-bold">military_tech</span>
          </div>
          <div>
            <h4 className="font-bold text-[#2D3436] text-sm font-headline">Daily Quest</h4>
            <p className="text-xs text-[#636E72]">4 of 5 activities done!</p>
          </div>
        </div>
        <div className="flex-1 w-full bg-[#eceeeb] rounded-full h-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-[#2c6956] rounded-full transition-all duration-1000" style={{ width: '80%' }}></div>
          <div className="absolute top-0 right-0 h-full flex items-center pr-3 pointer-events-none">
            <span className="material-symbols-outlined text-[12px] text-white animate-pulse">star</span>
          </div>
        </div>
        <div className="hidden md:block">
          <span className="text-[#2c6956] font-bold text-xs">+50 Gems today!</span>
        </div>
      </section>

      {/* Message For You Banner */}
      <section className="relative bg-white rounded-2xl card-shadow overflow-hidden group">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
            alt="Illustrative banner"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGm2CfNDrqPUljcaWUzhxJ7ffOF9DTXhIYYFLBwrgNBjH5mbimaQZMYw_FFr-VzKUNKTJsXZ7oHnnA_dHrqdPYWxaewwMqJwDgKCAp3WoZNlQJcHWSGoavHjhXEJzZPNAPNbWJtHdlGoYcaJdPrDY0QVOdJqvkJ8Y7LvD4lFUDNci0Dssl-DBq1H70znNA35Mv3IvjywIY65wm9E5V5kZm5ymJA8rKFdLjGaLxAg6yLVRgLiH_D1F9AA"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent"></div>
        </div>
        <div className="relative z-10 p-8 md:p-14 max-w-2xl">
          <span className="inline-block px-4 py-1.5 bg-[#FFF9C4] text-[#2c6956] rounded-full text-xs font-bold mb-4 shadow-sm flex items-center gap-1.5 w-fit">
            <Sparkles className="w-4 h-4 text-[#795836]" /> Daily AI Inspiration
          </span>
          <h3 className="text-3xl md:text-5xl font-bold font-headline text-[#2c6956] mb-4 leading-tight">
            Message For You!
          </h3>
          <p className="text-base md:text-lg text-[#404945] leading-relaxed font-body min-h-[50px]">
            {loadingMessage ? (
              <span className="flex items-center gap-2 text-[#636E72]">
                <Loader2 className="w-5 h-5 animate-spin text-[#2c6956]" /> Crafting your AI learning message...
              </span>
            ) : (
              `"${aiMotivationalMessage || `${studentFirstName}, keep learning and reaching for the stars every single day! ⭐`}"`
            )}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowStatsModal(true)}
              className="px-8 py-3.5 bg-[#2c6956] hover:bg-[#1e4b3d] text-white rounded-full font-bold shadow-lg shadow-[#2c6956]/20 squishy-btn flex items-center gap-2 text-sm md:text-base"
            >
              Check My Stats <span className="material-symbols-outlined text-lg">trending_up</span>
            </button>
            <button
              onClick={() => loadAiMessage(studentFirstName)}
              disabled={loadingMessage}
              className="px-5 py-3.5 bg-white border border-[#2c6956]/30 text-[#2c6956] hover:bg-[#A8E6CF]/20 rounded-full font-bold shadow-sm squishy-btn flex items-center gap-2 text-xs md:text-sm"
              title="Get a new AI message"
            >
              <RefreshCw className={cn("w-4 h-4", loadingMessage && "animate-spin")} />
              New Motivation
            </button>
          </div>
        </div>
      </section>

      {/* My Learning Path - Row of Interactive Subject Tiles */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h3 className="text-2xl md:text-3xl font-bold font-headline text-[#2D3436] border-l-4 border-[#2c6956] pl-4">
            My Learning Path
          </h3>
          <button
            onClick={() => onSelectSubject(rawSubjects[0])}
            className="text-[#2c6956] font-bold text-sm hover:underline flex items-center gap-1 squishy-btn"
          >
            View All Courses <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {loadingSubjects ? (
          <div className="flex items-center justify-center p-12 bg-white rounded-2xl shadow-sm">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-[#2c6956]" />
            <span className="text-sm font-semibold text-[#636E72]">Loading your subjects...</span>
          </div>
        ) : (
          <div className="flex flex-row overflow-x-auto gap-6 pb-4 custom-scrollbar snap-x">
            {rawSubjects.map((subjectName, idx) => {
              const iconInfo = getIcon(subjectName);
              const bgColor = getSubjectBgColor(idx);
              const description = getSubjectDescription(subjectName);

              return (
                <div
                  key={subjectName}
                  onClick={() => onSelectSubject(subjectName)}
                  className="bg-white rounded-2xl p-6 card-shadow flex items-center gap-6 hover:translate-x-1 transition-all cursor-pointer border border-transparent hover:border-[#A8E6CF]/40 min-w-[320px] md:min-w-[380px] flex-shrink-0 snap-start group"
                >
                  <div className={`w-36 h-28 rounded-xl ${bgColor} flex-shrink-0 flex items-center justify-center overflow-hidden shadow-inner`}>
                    {iconInfo.type === 'image' ? (
                      <Image
                        src={iconInfo.component as string}
                        alt={subjectName}
                        width={70}
                        height={70}
                        className="object-contain transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-5xl text-[#2c6956] opacity-85 transition-transform group-hover:scale-110">
                        {subjectName.toUpperCase().includes("MATH") ? "calculate" : subjectName.toUpperCase().includes("SCIENCE") ? "rocket_launch" : "abc"}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={cn("font-bold font-headline text-lg md:text-xl text-[#2D3436] truncate", isUrdu(subjectName) && "font-urdu text-2xl")}>
                        {subjectName}
                      </h4>
                    </div>
                    <p className="text-[#636E72] text-xs md:text-sm line-clamp-2 mb-2 font-body">
                      {description}
                    </p>
                  </div>

                  <button className="w-11 h-11 rounded-full bg-[#2c6956] text-white flex items-center justify-center squishy-btn shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
                    <span className="material-symbols-outlined text-xl">play_arrow</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Today's Schedule Section */}
      <section className="bg-[#f2f4f1] rounded-2xl p-8 border-2 border-dashed border-[#bfc9c3]/40 text-center">
        {loadingSchedule ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-[#2c6956]" />
          </div>
        ) : schedule.length > 0 ? (
          <div className="max-w-2xl mx-auto space-y-4">
            <h4 className="font-bold text-xl text-[#2D3436] font-headline mb-4">Today's Live Classes</h4>
            <div className="space-y-3">
              {schedule.map((item, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-full bg-[#A8E6CF]/30 flex items-center justify-center text-[#2c6956] font-bold">
                      <span className="material-symbols-outlined">auto_stories</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#2D3436] text-sm">{item.subject}</p>
                      <p className="text-xs text-[#636E72]">{item.time}</p>
                    </div>
                  </div>
                  <JoinClassButton session={item} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="material-symbols-outlined text-[#707974] text-3xl">event_busy</span>
            </div>
            <h4 className="font-bold text-xl font-headline text-[#404945]">Today's Schedule</h4>
            <p className="text-sm text-[#636E72] mt-2 font-body">No classes scheduled for today. Enjoy your exploration time!</p>
          </div>
        )}
      </section>

      {/* Stats & Achievements Modal */}
      <Dialog open={showStatsModal} onOpenChange={setShowStatsModal}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-white border border-[#A8E6CF]/30 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-headline text-[#2D3436] flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#2c6956]" />
              Explorer Stats & Badges
            </DialogTitle>
            <DialogDescription className="text-xs text-[#636E72]">
              Track your weekly progress and earned achievements!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 my-2">
            {/* Level & Gems Banner */}
            <div className="bg-gradient-to-r from-[#A8E6CF]/30 to-[#CAF0F8]/30 p-4 rounded-xl flex items-center justify-between border border-[#A8E6CF]/40">
              <div>
                <p className="text-xs font-bold text-[#2c6956] uppercase">Current Level</p>
                <p className="text-2xl font-bold text-[#2D3436]">Level 12 Explorer</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-[#795836] uppercase">Total Gems</p>
                <p className="text-2xl font-bold text-[#795836] flex items-center justify-end gap-1">
                  ⭐ 350
                </p>
              </div>
            </div>

            {/* Weekly Goal Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#404945]">
                <span>Weekly Quest Progress</span>
                <span>80% Completed</span>
              </div>
              <Progress value={80} className="h-3 bg-[#eceeeb]" />
            </div>

            {/* Badges List */}
            <div>
              <h5 className="font-bold text-sm text-[#2D3436] mb-3 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#2c6956]" />
                Recent Badges
              </h5>
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {(userData.badges || []).map((badge, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-[#f8faf7] rounded-xl border border-[#bfc9c3]/30">
                    <div className="w-9 h-9 rounded-full bg-[#FFF9C4] flex items-center justify-center text-[#795836] font-bold">
                      <Star className="w-4 h-4 fill-[#795836]" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#2D3436]">{badge.title}</p>
                      <p className="text-[10px] text-[#636E72]">Awarded {badge.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={() => setShowStatsModal(false)}
            className="w-full bg-[#2c6956] hover:bg-[#1e4b3d] text-white font-bold rounded-xl py-2 squishy-btn"
          >
            Keep Exploring! 🚀
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
