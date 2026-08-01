"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SidebarProvider, Sidebar, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, useSidebar } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BackpackIcon, LogOutIcon, UsersIcon, VideoIcon, CalendarIcon, BookUser } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import StudentList from '@/components/teacher/student-list';
import SubjectsView from '@/components/teacher/subjects-view';
import SavedClassesView from '@/components/teacher/saved-classes-view';
import TimetableView from '@/components/teacher/timetable-view';
import LeadsView from '@/components/teacher/leads-view';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Lightbulb, PanelLeft, BookCopy } from 'lucide-react';
import LessonPlannerView from '@/components/teacher/lesson-planner-view';
import SyllabusView from '@/components/teacher/syllabus-view';
import UserGuideView from '@/components/teacher/user-guide-view';

type View = 'students' | 'subjects' | 'saved_classes' | 'timetable' | 'leads' | 'lesson-planner' | 'syllabus' | 'user_guide';

const navItems: { id: View; label: string; icon: React.ElementType }[] = [
    { id: 'students', label: 'Students', icon: UsersIcon },
    { id: 'subjects', label: 'Subjects', icon: BackpackIcon },
    { id: 'timetable', label: 'Timetable', icon: CalendarIcon },
    { id: 'lesson-planner', label: 'Lesson Planner', icon: Lightbulb },
    { id: 'syllabus', label: 'Syllabus', icon: BookCopy },
    { id: 'saved_classes', label: 'Saved Classes', icon: VideoIcon },
    { id: 'user_guide', label: 'User Guide', icon: BookUser },
];

function TeacherDashboardHeader({ userName }: { userName: string }) {
    const { toggleSidebar } = useSidebar();
    return (
        <header className="flex items-center justify-between">
            <div className='flex items-center gap-2'>
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={toggleSidebar}
                >
                    <PanelLeft className="h-6 w-6" />
                    <span className="sr-only">Toggle Sidebar</span>
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold font-headline text-foreground">
                    Welcome back, {userName}!
                </h1>
            </div>
        </header>
    )
}

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('students');

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data?.user;

      if (currentUser) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('uid', currentUser.id)
          .single();

        const role = userProfile?.role || currentUser.user_metadata?.role || 'teacher';
        if (role === 'teacher') {
          setUser({
            uid: currentUser.id,
            name: userProfile?.name || currentUser.user_metadata?.name || 'Teacher',
            email: currentUser.email,
          });
        } else {
          router.push('/login');
          toast({ variant: "destructive", title: "Access Denied", description: "You must be a teacher to access this page." });
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    };

    checkUser();
  }, [router, toast]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/login');
    } catch (error) {
      toast({ variant: "destructive", title: "Logout Failed", description: "Something went wrong." });
    }
  };
  
  const renderView = () => {
    switch (view) {
        case 'leads':
            return <LeadsView />;
        case 'students':
            return <StudentList />;
        case 'subjects':
            return <SubjectsView />;
        case 'saved_classes':
            return <SavedClassesView />;
        case 'timetable':
            return <TimetableView />;
        case 'lesson-planner':
            return <LessonPlannerView />;
        case 'syllabus':
            return <SyllabusView />;
        case 'user_guide':
            return <UserGuideView />;
        default:
            return <StudentList />;
    }
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Skeleton className="w-full h-full" />
        </div>
    );
  }

  if (!user) {
    return null;
  }

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
                    onClick={() => setView(item.id)}
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
                    <AvatarFallback>{user?.name?.[0]?.toUpperCase() || 'T'}</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                    <p className="text-sm font-semibold truncate text-sidebar-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
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
            <TeacherDashboardHeader userName={user?.name || "Teacher"} />
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
