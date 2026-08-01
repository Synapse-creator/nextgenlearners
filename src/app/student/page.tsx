"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import DashboardView from '@/components/dashboard/dashboard-view';
import LibraryView from '@/components/dashboard/library-view';
import CalendarView from '@/components/dashboard/calendar-view';
import ReportView from '@/components/dashboard/report-view';
import StudentSubjectsView from '@/components/student/subjects-view';
import SyllabusView from '@/components/student/syllabus-view';
import ReadingBuddyView from '@/components/student/ai/reading-buddy';
import UserGuideView from '@/components/student/user-guide-view';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BackpackIcon, BookIcon, HomeIcon, CalendarIcon, VideoIcon, LogOutIcon, BookCopy, MicIcon, BookUser } from '@/components/icons';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

type View = 'dashboard' | 'subjects' | 'library' | 'calendar' | 'report' | 'saved_classes' | 'syllabus' | 'reading_buddy' | 'user_guide';

interface UserData {
    name?: string;
    parentName?: string;
    class?: string;
}

const navItems: { id: View; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
  { id: 'subjects', label: 'Subjects', icon: BackpackIcon },
  { id: 'syllabus', label: 'Syllabus', icon: BookCopy },
  { id: 'reading_buddy', label: 'Reading Buddy', icon: MicIcon },
  { id: 'library', label: 'E-Library', icon: BookIcon },
  { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
  { id: 'saved_classes', label: 'Saved Classes', icon: VideoIcon },
  { id: 'user_guide', label: 'User Guide', icon: BookUser },
];

const ComingSoon = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-card rounded-xl shadow-sm">
    <div className="bg-primary/20 p-4 rounded-full mb-4">
      <BackpackIcon className="w-12 h-12 text-primary-foreground" />
    </div>
    <h2 className="text-2xl font-bold font-headline mb-2">{title}</h2>
    <p className="text-muted-foreground">This learning treasure is still being polished. Check back soon!</p>
  </div>
);

export default function StudentDashboardPage() {
  const [view, setView] = useState<View>('dashboard');
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

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
  
  const handleSelectSubject = (subject: string) => {
    setView('subjects');
    setActiveSubject(subject);
  };
  
  const handleViewChange = (newView: View) => {
    setView(newView);
    if (newView !== 'subjects') {
      setActiveSubject(null);
    }
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <DashboardView onSelectSubject={handleSelectSubject} />;
      case 'subjects':
        return <StudentSubjectsView activeSubject={activeSubject} setActiveSubject={setActiveSubject} />;
      case 'syllabus':
        return <SyllabusView />;
      case 'reading_buddy':
        return <ReadingBuddyView />;
      case 'library':
        return <LibraryView />;
      case 'calendar':
        return <CalendarView />;
      case 'saved_classes':
        return <ComingSoon title="Saved Classes" />;
      case 'user_guide':
        return <UserGuideView />;
      default:
        return <DashboardView onSelectSubject={handleSelectSubject} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-sidebar-border bg-sidebar">
          <SidebarHeader className="p-4 flex items-center justify-between">
             <Image src="/logo.png" alt="NextGen Learners Logo" width={140} height={35} priority />
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleViewChange(item.id)}
                    isActive={view === item.id}
                    className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground rounded-lg"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
             <div className="flex items-center gap-3 mb-4">
                <Avatar>
                    <AvatarFallback>{userData?.name?.[0]?.toUpperCase() || 'S'}</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                    <p className="text-sm font-semibold truncate text-sidebar-foreground">{userData?.name || "Student"}</p>
                    <p className="text-xs text-muted-foreground truncate">{userData?.class || 'Class'}</p>
                </div>
             </div>
             <SidebarMenuButton onClick={handleLogout} className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg">
                <LogOutIcon className="mr-2 h-4 w-4" />
                Logout
             </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <div className="p-4 md:p-8 space-y-6">
            <DashboardHeader />
            <Separator />
            <main>
              {renderView()}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
