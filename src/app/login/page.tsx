"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.user) {
        // Query user details from users table
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('uid', data.user.id)
          .single();

        const role = userProfile?.role || data.user.user_metadata?.role || 'student';
        const name = userProfile?.name || data.user.user_metadata?.name || 'User';

        toast({ title: "Login Successful", description: `Welcome back, ${name}!` });
        if (role === 'teacher') {
          router.push('/teacher');
        } else {
          router.push('/student');
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid credentials",
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
              <CardTitle className="text-2xl font-bold font-headline">Welcome Back!</CardTitle>
              <CardDescription>Enter your email and password to access your dashboard.</CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full btn-bounce" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Don't have an account? <Link href="/signup" className="underline text-primary font-semibold">Sign Up</Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
      <div className="hidden lg:flex items-center justify-center bg-primary/10 p-10">
        <Image
          src="/login_hero.png"
          alt="Fun learning environment"
          width="800"
          height="600"
          className="rounded-2xl shadow-xl object-cover"
        />
      </div>
    </div>
  );
}
