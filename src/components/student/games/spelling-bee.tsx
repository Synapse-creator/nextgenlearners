"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { CloudIcon } from '@/components/icons';

const gameLevels = {
    PG: { words: ['A', 'B', 'C', 'D', 'E'] }, // single letter matching conceptually
    Nursery: { words: ['CAT', 'DOG', 'SUN'] },
    KG: { words: ['BIRD', 'FISH', 'FROG'] },
    'Class 1': { words: ['APPLE', 'WATER', 'HOUSE'] },
    'Class 2': { words: ['ORANGE', 'SCHOOL', 'PENCIL'] },
    'Class 3': { words: ['ELEPHANT', 'COMPUTER', 'BEAUTIFUL'] },
};

const colors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];

interface Balloon {
    id: string;
    letter: string;
    x: number;
    delay: number;
    speed: number;
    color: string;
}

export default function SpellingBee({ studentClass, studentId }: { studentClass: string; studentId: string; subject: string }) {
    const { toast } = useToast();
    const gameAreaRef = useRef<HTMLDivElement>(null);
    const level = gameLevels[studentClass as keyof typeof gameLevels] || gameLevels.PG;
    
    const [targetWord, setTargetWord] = useState('');
    const [spelledWord, setSpelledWord] = useState('');
    const [balloons, setBalloons] = useState<Balloon[]>([]);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState<'playing' | 'correct'>('playing');

    const setupRound = useCallback(() => {
        if (!gameAreaRef.current) return;
        const width = gameAreaRef.current.getBoundingClientRect().width;
        
        const randomWord = level.words[Math.floor(Math.random() * level.words.length)];
        setTargetWord(randomWord);
        setSpelledWord('');
        setGameState('playing');

        // Create balloons for letters in the word + some distractors
        const letters = randomWord.split('');
        const distractors = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').sort(() => 0.5 - Math.random()).slice(0, 3);
        const allLetters = [...letters, ...distractors].sort(() => 0.5 - Math.random());

        const newBalloons: Balloon[] = allLetters.map((char, index) => ({
            id: `balloon-${index}-${Date.now()}`,
            letter: char,
            x: Math.random() * (width - 60),
            delay: Math.random() * 2,
            speed: 15 + Math.random() * 10,
            color: colors[index % colors.length]
        }));
        
        setBalloons(newBalloons);
    }, [level.words]);

    useEffect(() => {
        const timeoutId = setTimeout(setupRound, 100);
        return () => clearTimeout(timeoutId);
    }, [setupRound]);

    const handlePop = (balloon: Balloon) => {
        if (gameState !== 'playing') return;

        const nextLetterIndex = spelledWord.length;
        if (balloon.letter === targetWord[nextLetterIndex]) {
            const newSpelled = spelledWord + balloon.letter;
            setSpelledWord(newSpelled);
            
            // Remove popped balloon
            setBalloons(prev => prev.filter(b => b.id !== balloon.id));

            if (newSpelled === targetWord) {
                setGameState('correct');
                const newScore = score + 1;
                setScore(newScore);
                saveProgress(newScore);
                setTimeout(setupRound, 3000);
            }
        } else {
            toast({
                variant: "destructive",
                title: "Oops!",
                description: `You need the letter ${targetWord[nextLetterIndex]} next.`,
            });
        }
    };

    const saveProgress = async (currentScore: number) => {
        try {
            await supabase.from('users').update({
                game_progress_spelling_bee: currentScore,
                game_progress_updated_at: new Date().toISOString(),
            }).eq('uid', studentId);
        } catch (error) {
            console.error("Error saving game progress:", error);
        }
    };

    return (
        <Card className="w-full h-[500px] relative overflow-hidden shadow-lg border-4 border-primary/20 bg-gradient-to-b from-sky-200 to-sky-400">
            <CloudIcon className="absolute top-10 -left-10 w-48 h-48 text-white/50 animate-float" style={{ animationDuration: '10s' }} />
            <CloudIcon className="absolute bottom-5 -right-12 w-64 h-64 text-white/60 animate-float" style={{ animationDuration: '12s', animationDelay: '2s' }} />

            <CardContent className="p-4 h-full relative z-10 flex flex-col">
                <div className="flex justify-between items-center z-20">
                    <div className="bg-background/80 p-2 rounded-lg shadow-md backdrop-blur-sm flex flex-col">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase">Spell the word:</h3>
                        <div className="flex gap-1 mt-1">
                            {targetWord.split('').map((char, idx) => (
                                <div key={idx} className="w-8 h-10 border-b-4 border-primary flex items-center justify-center text-2xl font-bold">
                                    {spelledWord[idx] || ''}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-background/80 p-2 rounded-lg shadow-md flex items-center gap-2 backdrop-blur-sm">
                        <Star className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xl font-bold">{score}</span>
                    </div>
                </div>

                <div className="flex-grow w-full relative overflow-hidden mt-4" ref={gameAreaRef}>
                    <AnimatePresence>
                        {balloons.map((balloon) => (
                            <motion.div
                                key={balloon.id}
                                className="absolute flex flex-col items-center cursor-pointer"
                                style={{ left: balloon.x, bottom: -100 }}
                                initial={{ y: 0 }}
                                animate={{ y: -700 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ 
                                    y: { duration: balloon.speed, delay: balloon.delay, repeat: Infinity, ease: "linear" },
                                    scale: { duration: 0.2 },
                                    opacity: { duration: 0.2 }
                                }}
                                onClick={() => handlePop(balloon)}
                            >
                                <div className={cn(
                                    "w-16 h-20 rounded-[50%] flex items-center justify-center text-white font-bold text-3xl shadow-md border-b-4 border-r-4 border-black/20",
                                    balloon.color
                                )}>
                                    {balloon.letter}
                                </div>
                                {/* Balloon string */}
                                <div className="w-[2px] h-12 bg-white/50 -mt-1" />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {gameState === 'correct' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none bg-black/20 backdrop-blur-sm"
                        >
                            <Image src="/games/win.gif" alt="Correct" width={300} height={300} unoptimized />
                            <h2 className="text-5xl font-extrabold text-white drop-shadow-lg font-headline -mt-16">Great Spelling!</h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
