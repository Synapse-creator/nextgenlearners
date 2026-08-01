"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { classes } from '@/lib/subjects';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { RocketIcon } from '../icons';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import Link from 'next/link';

const formSchema = z.object({
  parentName: z.string().min(2, "Parent's name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(10, "Phone number is required."),
  childName: z.string().min(2, "Child's name is required."),
  childAge: z.string().min(1, "Child's age is required."),
  desiredClass: z.string({ required_error: "Please select a class." }),
  communicationMode: z.string({ required_error: "Please select a communication mode." }),
  hasPrinter: z.string().optional(),
  hasMsWordKnowledge: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions to proceed.",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface EnrollmentFormProps {
  setOpen: (open: boolean) => void;
  preselectedClass?: string;
}

export default function EnrollmentForm({ setOpen, preselectedClass }: EnrollmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        parentName: "",
        email: "",
        phone: "",
        childName: "",
        childAge: "",
        desiredClass: preselectedClass || undefined,
        termsAccepted: false,
    }
  });

  const desiredClass = form.watch("desiredClass");

  useEffect(() => {
    if (preselectedClass) {
        form.setValue("desiredClass", preselectedClass);
    }
  }, [preselectedClass, form]);

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('leads').insert([
        {
          parent_name: data.parentName,
          child_name: data.childName,
          child_age: data.childAge,
          phone: data.phone,
          email: data.email,
          status: 'new',
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Enrollment Request Received! 🚀',
        description: "Thank you! We will get back to you shortly.",
      });
      form.reset();
      setOpen(false);
    } catch (error: any) {
      console.error('Error submitting enrollment form:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <DialogHeader className='text-center'>
        <div className="mx-auto w-fit mb-2 bg-primary/20 p-3 rounded-full">
            <RocketIcon className="w-8 h-8 text-primary" />
        </div>
        <DialogTitle className="font-headline text-2xl">Start Your Adventure!</DialogTitle>
        <DialogDescription>Fill out the form below to begin the enrollment process.</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="parentName"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>Parent's Name</FormLabel>
                  <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="childName"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>Child's Name</FormLabel>
                  <FormControl><Input placeholder="Your child's full name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>Email Address</FormLabel>
                  <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl><Input type="tel" placeholder="Your contact number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="childAge"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>Child's Age</FormLabel>
                  <FormControl><Input type="number" placeholder="e.g., 4" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="desiredClass"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>Desired Class</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classes.map((className) => (
                          <SelectItem key={className} value={className}>{className}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hasPrinter"
              render={({ field }) => (
                <FormItem className="md:col-span-2 space-y-3">
                  <FormLabel>Do you have a printer?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="yes" id="printer-yes" />
                        </FormControl>
                        <FormLabel htmlFor="printer-yes" className="font-normal">Yes</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="no" id="printer-no" />
                        </FormControl>
                        <FormLabel htmlFor="printer-no" className="font-normal">No</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(desiredClass === "Class 2" || desiredClass === "Class 3") && (
              <FormField
                  control={form.control}
                  name="hasMsWordKnowledge"
                  render={({ field }) => (
                  <FormItem className="md:col-span-2 space-y-3">
                      <FormLabel>Does the student have a little knowledge of MS Word?</FormLabel>
                      <FormControl>
                      <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                      >
                          <FormItem className="flex items-center space-x-2">
                          <FormControl>
                              <RadioGroupItem value="yes" id="msword-yes" />
                          </FormControl>
                          <FormLabel htmlFor="msword-yes" className="font-normal">Yes</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                          <FormControl>
                              <RadioGroupItem value="no" id="msword-no" />
                          </FormControl>
                          <FormLabel htmlFor="msword-no" className="font-normal">No</FormLabel>
                          </FormItem>
                      </RadioGroup>
                      </FormControl>
                      <FormMessage />
                  </FormItem>
                  )}
              />
            )}

            <FormField
              control={form.control}
              name="communicationMode"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Preferred Communication</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="How should we contact you?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                     I agree to the <Link href="/terms" target="_blank" className="underline text-primary hover:text-primary/80">Terms and Conditions</Link>.
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="w-full btn-bounce bg-accent hover:bg-accent/90 text-accent-foreground" size="lg">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Application
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
