"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .bouncy-button {
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .bouncy-button:active {
            transform: scale(0.92);
        }
        .bouncy-button:hover {
            transform: scale(1.05);
        }

        @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.1); }
        }

        .star-sparkle {
            animation: twinkle 3s ease-in-out infinite;
        }

        .input-focus-glow:focus-within {
            box-shadow: 0 0 15px rgba(168, 230, 207, 0.5);
            border-color: #A8E6CF;
        }
      `}} />
      <div className="min-h-screen flex items-stretch font-body bg-[#f8faf7] overflow-hidden">
        {/* Left Side: Login Form */}
        <div className="w-full lg:w-[40%] flex flex-col justify-center px-6 md:px-16 lg:px-24 bg-[#f8faf7] z-10 relative">
          
          {/* Brand Logo */}
          <div className="absolute top-12 left-6 md:left-16 lg:left-24 flex items-center gap-2">
            <Image src="/logo.png" alt="NextGen Learners Logo" width={150} height={40} />
          </div>

          <div className="max-w-md w-full mx-auto space-y-10 mt-20 lg:mt-0">
            <div className="space-y-4">
              <h1 className="font-headline text-4xl md:text-5xl text-[#191c1b]">Welcome back!</h1>
              <p className="text-lg font-medium text-[#636E72]">Ready to continue your learning journey?</p>
            </div>

            {/* Login Card */}
            <div className="bg-white p-8 rounded-[2rem] shadow-[0_40px_40px_-15px_rgba(44,105,86,0.08)] border border-[#e1e3e0]/30">
              <form className="space-y-8" onSubmit={handleLogin}>
                
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold tracking-wide text-[#404945] ml-2" htmlFor="email">Explorer Email</label>
                  <div className="relative flex items-center input-focus-glow rounded-xl transition-all border border-[#bfc9c3] bg-[#f2f4f1] px-4 py-4">
                    <span className="material-symbols-outlined text-[#707974] mr-3">alternate_email</span>
                    <input 
                      className="bg-transparent border-none focus:outline-none focus:ring-0 w-full text-base font-medium text-[#191c1b] placeholder:text-[#bfc9c3]" 
                      id="email" 
                      placeholder="example@explorer.com" 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold tracking-wide text-[#404945] ml-2" htmlFor="password">Secret Password</label>
                  <div className="relative flex items-center input-focus-glow rounded-xl transition-all border border-[#bfc9c3] bg-[#f2f4f1] px-4 py-4">
                    <span className="material-symbols-outlined text-[#707974] mr-3">lock</span>
                    <input 
                      className="bg-transparent border-none focus:outline-none focus:ring-0 w-full text-base font-medium text-[#191c1b] placeholder:text-[#bfc9c3]" 
                      id="password" 
                      placeholder="••••••••" 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      className="text-[#707974] hover:text-[#2c6956] transition-colors focus:outline-none" 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                  <div className="flex justify-end pt-2">
                    <a className="text-xs font-semibold text-[#2c6956] hover:underline decoration-2 underline-offset-4" href="#">Lost your key?</a>
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  className="w-full bouncy-button bg-[#FFF9C4] hover:bg-[#ffd1a7] text-[#2d1600] text-xl font-headline py-4 rounded-full shadow-lg shadow-[#FFF9C4]/20 flex items-center justify-center gap-3 border-b-4 border-[#795836]/20 disabled:opacity-70 disabled:pointer-events-none" 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>rocket_launch</span>
                  )}
                  {isLoading ? 'Blasting off...' : 'Login'}
                </button>
              </form>
            </div>
          </div>

          {/* Decorative Floating Sparkle */}
          <div className="absolute bottom-12 right-12 opacity-40 star-sparkle hidden lg:block">
            <span className="material-symbols-outlined text-[#A8E6CF] text-6xl">star</span>
          </div>
        </div>

        {/* Right Side: Immersive Visuals */}
        <div className="hidden lg:flex w-[60%] relative overflow-hidden bg-[#6C63FF] justify-center items-center group">
          {/* Main Hero Image Component */}
          <div className="absolute inset-0 z-0">
            <div 
              className="w-full h-full bg-cover bg-center opacity-90 scale-110 transition-transform duration-1000 group-hover:scale-125" 
              style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida/AP1WRLtt121dFVOI_jk5DFuSkOfz3Vc47nErT2fYOi_SHOn0yGjhA2EusUfVTDWaAaHknv_X8zN6UHij4Gf3RRidDB6fzO3YfVu54CWs5sB5x75C6kHrCIlt8oG_S7wYmDIoA0wCjojbdYpErfIlz1cw0h9jpy_V8qxUZer5bTVDr5FzFmaSzGNTAlhOqi-uMr9gLksYV4ML1FeObH55rICyYcdkDQRaRhxD8JOqynRYJCMIxPAVm5qJrDMbPHow")'}}
            />
            {/* Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#6C63FF]/80 via-transparent to-[#6C63FF]/30"></div>
          </div>

          {/* Content on top of background */}
          <div className="relative z-10 text-center px-12 space-y-8 max-w-2xl">
            <div className="bg-white/20 backdrop-blur-xl p-12 rounded-[2rem] border border-white/30 animate-float">
              <h2 className="font-headline text-5xl text-white mb-4 drop-shadow-lg">Welcome back, little explorer!</h2>
              <p className="text-lg font-medium text-[#CAF0F8] leading-relaxed">Your magic map is ready. Let's blast off to today's learning adventure!</p>
            </div>

            {/* Animated Progress Tag */}
            <div className="inline-flex items-center gap-3 bg-[#A8E6CF]/90 text-[#0d503f] px-6 py-3 rounded-full text-sm font-bold tracking-wide shadow-xl">
              <span className="material-symbols-outlined text-xl" style={{fontVariationSettings: "'FILL' 1"}}>auto_stories</span>
              Your digital education awaits
            </div>
          </div>

          {/* Floating Particles & Stars */}
          <div className="absolute top-20 left-20 star-sparkle" style={{animationDelay: '100ms'}}>
            <span className="material-symbols-outlined text-[#FFF9C4] text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
          </div>
          <div className="absolute bottom-40 right-20 star-sparkle" style={{animationDelay: '700ms'}}>
            <span className="material-symbols-outlined text-[#FFD3B6] text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
          </div>
          <div className="absolute top-1/4 right-1/4 star-sparkle" style={{animationDelay: '300ms'}}>
            <span className="material-symbols-outlined text-[#CAF0F8] text-5xl" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
          </div>

          {/* Animated Floating Clouds */}
          <div className="absolute top-10 right-20 opacity-30 animate-float" style={{animationDelay: '-1s'}}>
            <span className="material-symbols-outlined text-white text-[120px]">cloud</span>
          </div>
          <div className="absolute bottom-20 left-10 opacity-20 animate-float" style={{animationDelay: '-3s'}}>
            <span className="material-symbols-outlined text-white text-[150px]">cloud</span>
          </div>
        </div>

        {/* Mobile Background Accent */}
        <div className="lg:hidden fixed bottom-0 left-0 w-full h-1/3 z-0 overflow-hidden pointer-events-none">
          <div 
            className="w-full h-full bg-cover bg-center opacity-30 blur-xl" 
            style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida/AP1WRLtt121dFVOI_jk5DFuSkOfz3Vc47nErT2fYOi_SHOn0yGjhA2EusUfVTDWaAaHknv_X8zN6UHij4Gf3RRidDB6fzO3YfVu54CWs5sB5x75C6kHrCIlt8oG_S7wYmDIoA0wCjojbdYpErfIlz1cw0h9jpy_V8qxUZer5bTVDr5FzFmaSzGNTAlhOqi-uMr9gLksYV4ML1FeObH55rICyYcdkDQRaRhxD8JOqynRYJCMIxPAVm5qJrDMbPHow")'}}
          />
        </div>
      </div>
    </>
  );
}
