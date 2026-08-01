"use client"

import { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BellIcon } from "@/components/icons"
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { getIcon, isUrdu } from '@/lib/subjects';
import { format } from 'date-fns';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface TimetableItem {
    id: string;
    subject: string;
    time: string;
    day: string;
    class: string;
    date?: Date;
}

export default function CalendarView() {
    const [user, setUser] = useState<any>(null);
    const [studentClass, setStudentClass] = useState<string | null>(null);
    const [schedule, setSchedule] = useState<TimetableItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    useEffect(() => {
        const init = async () => {
            const { data } = await supabase.auth.getUser();
            const currentUser = data?.user;
            setUser(currentUser);

            if (currentUser) {
                const { data: userProfile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('uid', currentUser.id)
                    .single();

                const userClass = userProfile?.class_name || userProfile?.class || null;
                setStudentClass(userClass);

                if (userClass) {
                    const { data: timetableData } = await supabase
                        .from('timetable')
                        .select('*')
                        .eq('class_name', userClass);

                    if (timetableData) {
                        setSchedule(timetableData.map((t: any) => ({
                            id: t.id,
                            subject: t.subject,
                            time: t.start_time || t.time || '09:00',
                            day: t.day,
                            class: t.class_name || t.class,
                        })));
                    }
                }
            }
            setLoading(false);
        };

        init();
    }, []);

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    const eventsForSelectedDay = schedule.filter(item => item.day === (selectedDate ? format(selectedDate, 'EEEE') : ''))
        .sort((a, b) => a.time.localeCompare(b.time));

    const EventIcon = ({ subject }: { subject: string }) => {
        const iconInfo = getIcon(subject);
        if (iconInfo.type === 'image') {
            return <Image src={iconInfo.component as string} alt={subject} width={20} height={20} className="rounded-sm" />;
        }
        const IconComponent = iconInfo.component as React.ElementType;
        return <IconComponent className="w-5 h-5 text-primary" />;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <Card className="col-span-1 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-headline font-bold text-lg flex items-center gap-2">
                    <BellIcon /> Interactive Schedule
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border mx-auto"
                />
                
                <div className="space-y-2">
                    <h4 className="font-semibold text-sm">
                        Classes on {selectedDate ? format(selectedDate, 'PPP') : 'Selected Day'}:
                    </h4>
                    {eventsForSelectedDay.length > 0 ? (
                        <ul className="space-y-2 text-sm">
                            {eventsForSelectedDay.map(event => (
                                <li key={event.id} className="flex items-center justify-between p-2 rounded-md bg-secondary/30">
                                    <div className="flex items-center gap-2">
                                        <EventIcon subject={event.subject} />
                                        <span className={cn("font-medium", isUrdu(event.subject) && "font-urdu")}>
                                            {event.subject}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{event.time}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-xs text-muted-foreground italic">No classes scheduled for this day.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
