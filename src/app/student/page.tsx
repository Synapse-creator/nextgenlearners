"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardView from '@/components/dashboard/dashboard-view';
import LibraryView from '@/components/dashboard/library-view';
import CalendarView from '@/components/dashboard/calendar-view';
import StudentSubjectsView from '@/components/student/subjects-view';
import SyllabusView from '@/components/student/syllabus-view';
import ReadingBuddyView from '@/components/student/ai/reading-buddy';
import UserGuideView from '@/components/student/user-guide-view';
import SettingsModal from '@/components/dashboard/settings-modal';
import MiniStoryGenerator from '@/components/student/ai/mini-story-generator';
import RhymeFinder from '@/components/student/ai/rhyme-finder';
import SongGenerator from '@/components/student/ai/song-generator';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { BackpackIcon } from '@/components/icons';

type View = 'dashboard' | 'subjects' | 'library' | 'calendar' | 'syllabus' | 'reading_buddy' | 'user_guide';

interface UserData {
  name?: string;
  parentName?: string;
  class?: string;
  email?: string;
}

export default function StudentDashboardPage() {
  const [view, setView] = useState<View>('dashboard');
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeAiTool, setActiveAiTool] = useState<'song' | 'story' | 'rhyme' | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data?.user;

      if (!currentUser) {
        router.push('/login');
        return;
      }

      setUser(currentUser);

      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('uid', currentUser.id)
        .single();

      if (userProfile) {
        setUserData({
          name: userProfile.name,
          class: userProfile.class_name || userProfile.class,
          email: currentUser.email || userProfile.email,
        });
      } else {
        setUserData({
          name: currentUser.user_metadata?.name || 'Ahmad Dawood',
          class: 'Class 3',
          email: currentUser.email || 'ahmad@nextgen.edu',
        });
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/login');
    } catch (error) {
      toast({ variant: "destructive", title: "Logout Failed", description: "Something went wrong." });
    }
  };

  const handleSelectSubject = (subject: string | null) => {
    setView('subjects');
    setActiveSubject(subject);
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
    if (newView !== 'subjects') {
      setActiveSubject(null);
    }
  };

  const handleNotificationClick = () => {
    toast({
      title: "Notifications 🔔",
      description: "You are all caught up! No new notifications today.",
    });
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <DashboardView onSelectSubject={handleSelectSubject} />;
      case 'subjects':
        return <StudentSubjectsView selectedSubject={activeSubject} setSelectedSubject={setActiveSubject} />;
      case 'syllabus':
        return <SyllabusView />;
      case 'reading_buddy':
        return <ReadingBuddyView />;
      case 'library':
        return <LibraryView />;
      case 'calendar':
        return <CalendarView />;
      case 'user_guide':
        return <UserGuideView />;
      default:
        return <DashboardView onSelectSubject={handleSelectSubject} />;
    }
  };

  const displayName = userData?.name || "Ahmad Dawood";
  const displayClass = userData?.class ? `Level 12 Explorer (${userData.class})` : "Level 12 Explorer";

  return (
    <div className="bg-[#f8faf7] text-[#191c1b] min-h-screen flex font-headline relative overflow-x-hidden">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#f2f4f1] flex flex-col py-8 z-40 rounded-r-2xl shadow-[40px_0_40px_rgba(44,105,86,0.05)] border-r border-[#A8E6CF]/20">
        <div className="px-6 mb-8">
          <h1 className="font-bold text-2xl text-[#2c6956] font-headline tracking-tight">NextGen</h1>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFD3B6] flex items-center justify-center overflow-hidden border-2 border-white shadow-sm font-bold text-[#795836]">
              {displayName[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#2c6956] truncate">{displayName}</p>
              <p className="text-[10px] text-[#404945] truncate">{displayClass}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1">
          <button
            onClick={() => handleViewChange('dashboard')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 squishy-btn text-left",
              view === 'dashboard'
                ? "bg-[#2c6956] text-white shadow-md shadow-[#2c6956]/20"
                : "text-[#404945] hover:bg-[#A8E6CF]/20"
            )}
          >
            <span className="material-symbols-outlined text-xl">dashboard</span>
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => handleViewChange('subjects')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 squishy-btn text-left",
              view === 'subjects'
                ? "bg-[#2c6956] text-white shadow-md shadow-[#2c6956]/20"
                : "text-[#404945] hover:bg-[#A8E6CF]/20"
            )}
          >
            <span className="material-symbols-outlined text-xl">auto_stories</span>
            <span>Subjects</span>
          </button>

          <button
            onClick={() => handleViewChange('syllabus')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 squishy-btn text-left",
              view === 'syllabus'
                ? "bg-[#2c6956] text-white shadow-md shadow-[#2c6956]/20"
                : "text-[#404945] hover:bg-[#A8E6CF]/20"
            )}
          >
            <span className="material-symbols-outlined text-xl">assignment</span>
            <span>Syllabus</span>
          </button>

          <button
            onClick={() => handleViewChange('reading_buddy')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 squishy-btn text-left",
              view === 'reading_buddy'
                ? "bg-[#2c6956] text-white shadow-md shadow-[#2c6956]/20"
                : "text-[#404945] hover:bg-[#A8E6CF]/20"
            )}
          >
            <span className="material-symbols-outlined text-xl">face</span>
            <span>Reading Buddy</span>
          </button>

          <button
            onClick={() => handleViewChange('library')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 squishy-btn text-left",
              view === 'library'
                ? "bg-[#2c6956] text-white shadow-md shadow-[#2c6956]/20"
                : "text-[#404945] hover:bg-[#A8E6CF]/20"
            )}
          >
            <span className="material-symbols-outlined text-xl">library_books</span>
            <span>E-Library</span>
          </button>

          {/* Quick Access AI Tools Section */}
          <div className="mt-8 pt-6 border-t border-[#bfc9c3]/30 px-1">
            <p className="text-[10px] font-bold text-[#795836] uppercase tracking-wider mb-4 px-3">
              Quick AI Tools
            </p>
            <div className="space-y-1">
              <button
                onClick={() => setActiveAiTool('song')}
                className="w-full flex items-center gap-3 text-[#404945] hover:bg-[#CAF0F8]/40 px-4 py-3 rounded-xl transition-all group squishy-btn text-left"
              >
                <span className="material-symbols-outlined text-[#2c6956] group-hover:scale-110 transition-transform">
                  music_note
                </span>
                <span className="font-bold text-sm">Sing My Name</span>
              </button>

              <button
                onClick={() => setActiveAiTool('story')}
                className="w-full flex items-center gap-3 text-[#404945] hover:bg-[#A8E6CF]/30 px-4 py-3 rounded-xl transition-all group squishy-btn text-left"
              >
                <span
                  className="material-symbols-outlined text-[#2c6956] group-hover:scale-110 transition-transform"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
                <span className="font-bold text-sm">Story Gen</span>
              </button>

              <button
                onClick={() => setActiveAiTool('rhyme')}
                className="w-full flex items-center gap-3 text-[#404945] hover:bg-[#FFD3B6]/40 px-4 py-3 rounded-xl transition-all group squishy-btn text-left"
              >
                <span className="material-symbols-outlined text-[#795836] group-hover:scale-110 transition-transform">
                  lyrics
                </span>
                <span className="font-bold text-sm">Rhyme Finder</span>
              </button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex-1 h-screen overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar relative z-10">
        {/* Top Greeting Bar & Actions */}
        <header className="flex justify-between items-start mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#2D3436] font-headline">
              Welcome back, {displayName}! 👋
            </h2>
            <p className="text-sm md:text-base text-[#636E72] mt-1 font-body">
              You're doing amazing today. Ready for a new adventure?
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleNotificationClick}
              className="w-12 h-12 bg-white shadow-sm border border-[#bfc9c3]/30 rounded-full text-[#404945] flex items-center justify-center hover:bg-[#A8E6CF]/20 transition-colors squishy-btn"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-12 h-12 bg-white shadow-sm border border-[#bfc9c3]/30 rounded-full text-[#404945] flex items-center justify-center hover:bg-[#A8E6CF]/20 transition-colors squishy-btn"
              title="Settings"
            >
              <span className="material-symbols-outlined text-xl">settings</span>
            </button>
          </div>
        </header>

        {/* View Content */}
        {renderView()}
      </main>

      {/* Background Floating Atmosphere Elements */}
      <div className="fixed pointer-events-none inset-0 z-0 opacity-[0.03]">
        <span className="material-symbols-outlined absolute top-20 right-10 text-9xl text-[#2c6956]">forest</span>
        <span className="material-symbols-outlined absolute bottom-40 right-80 text-8xl text-[#795836]">potted_plant</span>
        <span className="material-symbols-outlined absolute top-1/2 left-72 text-7xl text-[#2c6956]">eco</span>
        <span className="material-symbols-outlined absolute bottom-20 left-10 text-[200px] text-[#2c6956]">landscape</span>
      </div>

      {/* Settings Modal (Password Reset & Logout) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        userData={userData}
        onLogout={handleLogout}
      />

      {/* AI Tool Dialog Modals */}
      <Dialog open={activeAiTool !== null} onOpenChange={(open) => !open && setActiveAiTool(null)}>
        <DialogContent className="max-w-xl rounded-2xl p-6 bg-white border border-[#A8E6CF]/40 shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>AI Assistant Tool</DialogTitle>
            <DialogDescription>Interactive AI Tool for students</DialogDescription>
          </DialogHeader>

          {activeAiTool === 'song' && (
            <SongGenerator studentName={displayName} />
          )}
          {activeAiTool === 'story' && (
            <MiniStoryGenerator />
          )}
          {activeAiTool === 'rhyme' && (
            <RhymeFinder />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
