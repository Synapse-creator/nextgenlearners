"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

const formSchema = z.object({
  name: z.string().min(2, "Student's name is required."),
  parentName: z.string().min(2, "Parent's name is required."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type FormData = z.infer<typeof formSchema>;

interface AddStudentFormProps {
  setOpen: (open: boolean) => void;
}

export default function AddStudentForm({ setOpen }: AddStudentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      parentName: "",
      email: "",
      password: "",
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
            role: 'student',
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
          role: 'student',
          class_name: '',
        },
      ]);

      if (dbError) throw dbError;

      toast({
        title: 'Student Account Created! 🎉',
        description: `${data.name}'s account has been successfully created.`,
      });
      form.reset();
      setOpen(false);
    } catch (error: any) {
      console.error('Error creating student:', error);
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
        <DialogTitle className="font-headline text-2xl">Add New Student</DialogTitle>
        <DialogDescription>Create a new student account. They can change their password later.</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student's Full Name</FormLabel>
                <FormControl><Input placeholder="Enter student's full name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="parentName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent's Full Name</FormLabel>
                <FormControl><Input placeholder="Enter parent's full name" {...field} /></FormControl>
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
                <FormControl><Input type="email" placeholder="student@example.com" {...field} /></FormControl>
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
                <FormControl><Input type="password" placeholder="Min. 6 characters" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="w-full btn-bounce">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Student Account
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
