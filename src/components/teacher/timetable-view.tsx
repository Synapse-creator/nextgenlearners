"use client";

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, CrayonIcon } from '@/components/icons';
import { Loader2, Trash2, Link as LinkIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Form, FormControl, FormItem, FormMessage, FormLabel } from '../ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { classes, subjectsByClass, isUrdu } from '@/lib/subjects';
import { cn } from '@/lib/utils';
import { isWithinInterval, addHours, setHours, setMinutes } from 'date-fns';

interface TimetableItem {
  id: string;
  subject: string;
  time: string;
  day: string;
  class: string;
  link?: string;
}

type Inputs = {
  subject: string;
  time: string;
  day: string;
  class: string;
  link: string;
};

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const JoinClassButton = ({ session }: { session: TimetableItem }) => {
    const [isClassTime, setIsClassTime] = useState(false);

    useEffect(() => {
        const checkTime = () => {
            if (!session.time || !session.day) return;
            const now = new Date();
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            if (days[now.getDay()] !== session.day) {
                setIsClassTime(false);
                return;
            }
            const [hours, minutes] = session.time.split(':').map(Number);
            const classStartTime = setMinutes(setHours(now, hours), minutes);
            const classEndTime = addHours(classStartTime, 1);
            setIsClassTime(isWithinInterval(now, { start: classStartTime, end: classEndTime }));
        };
        
        checkTime();
        const interval = setInterval(checkTime, 60000);
        return () => clearInterval(interval);
    }, [session.time, session.day]);
    
    return (
        <a href={session.link} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="btn-bounce" disabled={!isClassTime || !session.link}>
                Join Class
            </Button>
        </a>
    );
};

export default function TimetableView() {
  const form = useForm<Inputs>();
  const { handleSubmit, reset, control, formState: { errors }, watch } = form;
  const [timetable, setTimetable] = useState<TimetableItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();
  
  const selectedClass = watch("class");

  const fetchTimetable = async () => {
    try {
      const { data, error } = await supabase.from('timetable').select('*');
      if (error) throw error;
      if (data) {
        const items: TimetableItem[] = data.map((doc: any) => ({
          id: doc.id,
          subject: doc.subject,
          time: doc.start_time || doc.time || '09:00',
          day: doc.day,
          class: doc.class_name || doc.class,
          link: doc.room || doc.link || '',
        }));

        items.sort((a, b) => {
          const dayComparison = daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
          if (dayComparison !== 0) return dayComparison;
          return a.time.localeCompare(b.time);
        });
        setTimetable(items);
      }
    } catch (error) {
      console.error("Error fetching timetable:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchTimetable();

    const subscription = supabase
      .channel('public:timetable')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timetable' }, () => {
        fetchTimetable();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!data.subject || !data.day || !data.class) {
        toast({ variant: "destructive", title: "Error", description: "Please select a class, subject, and day." });
        return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.from('timetable').insert([
        {
          class_name: data.class,
          subject: data.subject,
          day: data.day,
          start_time: data.time || '09:00',
          end_time: data.time || '10:00',
          room: data.link || '',
        },
      ]);

      if (error) throw error;

      toast({ title: "Success!", description: "Timetable item added successfully." });
      reset({ subject: '', time: '', day: '', class: '', link: ''});
      fetchTimetable();
    } catch (error: any) {
      console.error("Error adding timetable item:", error);
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not add timetable item." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
        const { error } = await supabase.from('timetable').delete().eq('id', id);
        if (error) throw error;

        toast({
            title: "Success!",
            description: "Timetable item removed successfully.",
        });
        setTimetable(prev => prev.filter(t => t.id !== id));
    } catch (error: any) {
        console.error("Error removing timetable item:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not remove timetable item.",
        });
    }
  };

  const subjectsForSelectedClass = selectedClass ? subjectsByClass[selectedClass] || [] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Add to Timetable</CardTitle>
          <CardDescription>Add a new class session to the schedule.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Controller
                    name="class"
                    control={control}
                    rules={{ required: "Class is required" }}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                           <FormControl>
                             <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
                           </FormControl>
                            <SelectContent>
                                {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                   />
                  <FormMessage>{errors.class?.message}</FormMessage>
                </FormItem>
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Controller
                    name="subject"
                    control={control}
                    rules={{ required: "Subject is required" }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedClass}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                              {subjectsForSelectedClass.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                      </Select>
                    )}
                  />
                  <FormMessage>{errors.subject?.message}</FormMessage>
               </FormItem>
              <FormItem>
                <FormLabel htmlFor="time">Time</FormLabel>
                <FormControl>
                  <Input id="time" type="time" {...control.register("time", { required: true })} />
                </FormControl>
                {errors.time && <FormMessage>Time is required.</FormMessage>}
              </FormItem>
               <FormItem>
                <FormLabel htmlFor="link">Class Link</FormLabel>
                <FormControl>
                  <Input id="link" type="url" placeholder="https://meet.google.com/..." {...control.register("link")} />
                </FormControl>
                {errors.link && <FormMessage>Please enter a valid URL.</FormMessage>}
              </FormItem>
              <FormItem>
                  <FormLabel>Day</FormLabel>
                  <Controller
                    name="day"
                    control={control}
                    rules={{ required: "Day is required" }}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                           <FormControl>
                             <SelectTrigger><SelectValue placeholder="Select a day" /></SelectTrigger>
                           </FormControl>
                            <SelectContent>
                                {daysOfWeek.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                   />
                  <FormMessage>{errors.day?.message}</FormMessage>
              </FormItem>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Session
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Current Timetable</CardTitle>
          <CardDescription>This is the schedule that students will see.</CardDescription>
        </CardHeader>
        <CardContent>
          {isFetching ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ul className="space-y-4">
              {timetable.length > 0 ? timetable.map((item) => (
                <li key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg bg-background hover:bg-secondary/50 transition-colors duration-200">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-blue-100 hidden sm:flex">
                      <CrayonIcon className="w-6 h-6 text-foreground/80" />
                    </div>
                    <div>
                      <p className={cn("font-semibold text-foreground", isUrdu(item.subject) && "text-lg font-urdu")}>{item.subject} <span className="text-xs font-normal text-muted-foreground">({item.class})</span></p>
                      <p className="text-sm text-muted-foreground">{item.day} at {item.time}</p>
                      {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1"><LinkIcon className="w-3 h-3" /> {item.link}</a>}
                    </div>
                  </div>
                   <div className="flex items-center gap-2 self-end sm:self-center mt-2 sm:mt-0">
                      <JoinClassButton session={item} />
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the class session from the timetable.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                   </div>
                </li>
              )) : (
                <div className="text-center py-10 text-muted-foreground">
                    <CalendarIcon className="mx-auto h-12 w-12" />
                    <p className="mt-4">No classes scheduled yet.</p>
                </div>
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
