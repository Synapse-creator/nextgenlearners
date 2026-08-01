"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // 1. Sign up user via Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      const userId = data.user?.id;
      if (userId) {
        // 2. Insert user profile into Supabase users table
        await supabase.from('users').insert([
          {
            uid: userId,
            email: email,
            name: name,
            role: role,
            class_name: '',
          },
        ]);
      }

      toast({ title: "Account Created!", description: "You have been successfully signed up." });

      if (role === 'teacher') {
        router.push('/teacher');
      } else {
        router.push('/student');
      }

    } catch (error: any) {
      console.error("Signup failed:", error);
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
       <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md space-y-6">
           <div className="text-center">
            <Link href="/" className="inline-block">
                <Image src="/logo.png" alt="NextGen Learners Logo" width={150} height={40} />
            </Link>
          </div>
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold font-headline">Create an Account</CardTitle>
              <CardDescription>Join our community of happy learners!</CardDescription>
            </CardHeader>
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                    <Label>I am a...</Label>
                    <RadioGroup
                        value={role}
                        onValueChange={(value: 'student' | 'teacher') => setRole(value)}
                        className="flex gap-4 pt-2"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="student" id="role-student" />
                            <Label htmlFor="role-student">Student</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="teacher" id="role-teacher" />
                            <Label htmlFor="role-teacher">Teacher</Label>
                        </div>
                    </RadioGroup>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full btn-bounce" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Already have an account? <Link href="/login" className="underline text-primary font-semibold">Log In</Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
       <div className="hidden lg:flex items-center justify-center bg-primary/10 p-10">
        <Image
          src="https://picsum.photos/seed/signup/800/600"
          alt="Happy kids in a classroom"
          width="800"
          height="600"
          data-ai-hint="happy kids illustration"
          className="rounded-2xl shadow-xl object-cover"
        />
      </div>
    </div>
  );
}
