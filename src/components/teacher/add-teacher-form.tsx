"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldAlert } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

const formSchema = z.object({
  name: z.string().min(2, "Teacher's full name is required."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  subjectSpecialty: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddTeacherFormProps {
  setOpen: (open: boolean) => void;
  onTeacherAdded?: () => void;
}

export default function AddTeacherForm({ setOpen, onTeacherAdded }: AddTeacherFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      subjectSpecialty: "",
    }
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: 'teacher',
          },
        },
      });

      if (authError) throw authError;

      const uid = authData.user?.id || crypto.randomUUID();

      const { error: dbError } = await supabase.from('users').insert([
        {
          uid: uid,
          name: data.name,
          email: data.email,
          role: 'teacher',
          specialty: data.subjectSpecialty || 'General Instructor',
        },
      ]);

      if (dbError) throw dbError;

      toast({
        title: 'Teacher Account Created! 🍎',
        description: `${data.name} has been added as an official instructor.`,
      });
      form.reset();
      setOpen(false);
      onTeacherAdded?.();
    } catch (error: any) {
      console.error('Error creating teacher:', error);
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: error.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-headline text-2xl flex items-center gap-2">
          🍎 Add New Instructor
        </DialogTitle>
        <DialogDescription>
          Create a official teacher account. Only Admin Teachers can perform this action.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teacher Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Ms. Sarah Khan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="teacher@nextgenlearners.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temporary Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subjectSpecialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject Specialty (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Mathematics & Science" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="btn-bounce font-bold">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Teacher Account
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
