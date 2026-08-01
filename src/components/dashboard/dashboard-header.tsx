"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const avatarGifs = ['/avatars/avatar1.gif', '/avatars/avatar2.gif', '/avatars/avatar3.gif'];

export default function DashboardHeader() {
  const { toggleSidebar } = useSidebar();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [userName, setUserName] = useState<string | null>(null);
  const [userInitial, setUserInitial] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const getRandomAvatar = () => avatarGifs[Math.floor(Math.random() * avatarGifs.length)];
    setAvatarUrl(getRandomAvatar());
    setCurrentDate(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (user) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('name')
          .eq('uid', user.id)
          .single();

        const name = userProfile?.name || user.user_metadata?.name || 'Student';
        setUserName(name);
        setUserInitial(name[0]?.toUpperCase() || 'S');
      }
    };
    fetchUser();
  }, []);

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleSidebar}
        >
          <PanelLeft className="h-6 w-6" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        <Avatar className="h-16 w-16 border-4 border-white shadow-md">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{userInitial}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline text-foreground animate-in fade-in slide-in-from-top-2 duration-500">
            Welcome back, {userName || "Student"}!
          </h1>
          <p className="text-muted-foreground animate-in fade-in slide-in-from-top-3 duration-500 delay-100">
            {currentDate}
          </p>
        </div>
      </div>
    </header>
  );
}
