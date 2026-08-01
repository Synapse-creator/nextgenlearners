
"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Speaker, Volume2, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { isUrdu } from '@/lib/subjects';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { CloudIcon } from '@/components/icons';

interface GameItem {
    id: number;
    value: string;
    x: number;
    y: number;
    delay: number;
    size: number;
    color: string;
}

const gameLevels = {
    PG: { type: 'letters', items: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('') },
    Nursery: { type: 'letters', items: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('') },
    KG: { type: 'words', items: ['CAT', 'DOG', 'SUN', 'BED', 'EGG', 'FAN', 'HAT', 'JAM', 'KEY', 'LOG'] },
    'Class 1': { type: 'words', items: ['APPLE', 'BALL', 'CHAIR', 'DUCK', 'FISH', 'GOAT', 'HOUSE', 'IGLOO', 'JUICE', 'KITE'] },
    'Class 2': { type: 'words', items: ['ORANGE', 'TABLE', 'SCHOOL', 'FLOWER', 'WATER', 'HAPPY', 'PENCIL', 'RABBIT', 'SMILE', 'TIGER'] },
    'Class 3': { type: 'words', items: ['ELEPHANT', 'COMPUTER', 'BEAUTIFUL', 'QUESTION', 'FRIEND', 'FAMILY', 'CHOCOLATE', 'BUTTERFLY', 'HOLIDAY', 'LANGUAGE'] },
};
const urduLevels = {
    PG: { type: 'letters', items: 'ابپتٹثجچحخدڈذرڑزژسشصضطظعغفقکگلمنوهیے'.split('') },
    Nursery: { type: 'letters', items: 'ابپتٹثجچحخدڈذرڑزژسشصضطظعغفقکگلمنوهیے'.split('') },
    KG: { type: 'words', items: ['بلی', 'کتا', 'سورج', 'باغ', 'گھر', 'پھول', 'تارا', 'قلم', 'کتاب'] },
    'Class 1': { type: 'words', items: ['سیب', 'میز', 'کرسی', 'پانی', 'خوش', 'پنسل', 'خرگوش', 'دوست', 'اسکول'] },
    'Class 2': { type: 'words', items: ['مالٹا', 'میز', 'اسکول', 'پھول', 'پانی', 'خوش', 'پنسل', 'خرگوش', 'مسکراہٹ', 'شیر'] },
    'Class 3': { type: 'words', items: ['ہاتھی', 'کمپیوٹر', 'خوبصورت', 'سوال', 'دوست', 'خاندان', 'چاکلیٹ', 'تتلی', 'چھٹی', 'زبان'] },
};

const shuffleArray = (array: any[]) => [...array].sort(() => Math.random() - 0.5);
const bubbleColors = ['bg-pink-400/50', 'bg-blue-400/50', 'bg-green-400/50', 'bg-purple-400/50', 'bg-orange-400/50'];


// Function to check for collision between circles
const checkCollision = (item1: GameItem, item2: GameItem) => {
    const dx = item1.x - item2.x;
    const dy = item1.y - item2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (item1.size / 2 + item2.size / 2);
};

export default function LetterWordSplash({ studentClass, studentId, subject }: { studentClass: string; studentId: string; subject: string }) {
    const { toast } = useToast();
    const gameAreaRef = useRef<HTMLDivElement>(null);
    const isUrduSubject = isUrdu(subject);
    const levels = isUrduSubject ? urduLevels : gameLevels;
    const { items: allItems } = levels[studentClass as keyof typeof levels] || levels.PG;
    
    const [target, setTarget] = useState('');
    const [options, setOptions] = useState<GameItem[]>([]);
    const [score, setScore] = useState(0);
    const [incorrectAttempts, setIncorrectAttempts] = useState(0);
    const [gameState, setGameState] = useState<'playing' | 'correct' | 'finished'>('playing');
    const [poppedId, setPoppedId] = useState<number | null>(null);

    const setupRound = useCallback(() => {
        if (!gameAreaRef.current) return;
        const { width, height } = gameAreaRef.current.getBoundingClientRect();
        
        setPoppedId(null);
        const shuffled = shuffleArray(allItems);
        const newTarget = shuffled[0];
        setTarget(newTarget);

        const distractors = shuffled.slice(1, 5);
        const optionValues = shuffleArray([newTarget, ...distractors]);
        const newOptions: GameItem[] = [];

        optionValues.forEach((value, index) => {
            let newItem: GameItem;
            let collision: boolean;
            let attempts = 0;

            const itemSize = (isUrduSubject ? 110 + Math.random() * 40 : 80 + Math.random() * 40) * (width < 640 ? 0.7 : 1);

            do {
                collision = false;
                newItem = {
                    id: Date.now() + index,
                    value,
                    x: Math.random() * (width - itemSize),
                    y: Math.random() * (height - itemSize - 80) + 80, // Avoid spawning in header area
                    delay: Math.random() * 1,
                    size: itemSize,
                    color: bubbleColors[index % bubbleColors.length],
                };

                for (const existingItem of newOptions) {
                    if (checkCollision(newItem, existingItem)) {
                        collision = true;
                        break;
                    }
                }
                attempts++;
            } while (collision && attempts < 100); // Prevent infinite loops

            newOptions.push(newItem);
        });

        setOptions(newOptions);
        setGameState('playing');
        setIncorrectAttempts(0);
    }, [allItems, isUrduSubject]);

    useEffect(() => {
        // We need a small delay to let the ref be set and the component to be rendered
        const timeoutId = setTimeout(setupRound, 100);
        
        window.addEventListener('resize', setupRound);
        return () => {
             clearTimeout(timeoutId);
             window.removeEventListener('resize', setupRound)
        };
    }, [setupRound]);

    const handleItemClick = (item: GameItem) => {
        if (gameState !== 'playing') return;

        if (item.value === target) {
            setScore(prev => prev + 1);
            setGameState('correct');
            setPoppedId(item.id);
            saveProgress(score + 1);
            setTimeout(setupRound, 2000); 
        } else {
            setIncorrectAttempts(prev => prev + 1);
            toast({
                variant: "destructive",
                title: "Try Again!",
                description: "That's not the right one.",
            });
        }
    };
    
    const saveProgress = async (currentScore: number) => {
        try {
            await supabase.from('users').update({
                game_progress_letter_splash: currentScore,
                game_progress_updated_at: new Date().toISOString(),
            }).eq('uid', studentId);
        } catch (error) {
            console.error("Error saving game progress:", error);
        }
    };

    return (
        <Card className="w-full h-auto sm:h-[500px] aspect-[9/16] sm:aspect-auto relative overflow-hidden shadow-lg border-4 border-primary/20 bg-gradient-to-b from-blue-200 to-blue-300">
            <CloudIcon className="absolute top-10 -left-10 w-48 h-48 text-white/50 animate-float" style={{ animationDuration: '10s' }} />
            <CloudIcon className="absolute bottom-5 -right-12 w-64 h-64 text-white/60 animate-float" style={{ animationDuration: '12s', animationDelay: '2s' }} />

            <CardContent className="p-2 sm:p-4 h-full relative z-10">
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex justify-between items-center z-20">
                    <div className="bg-background/80 p-2 rounded-lg shadow-md backdrop-blur-sm">
                        <h3 className="text-base sm:text-lg font-bold font-headline flex items-center">
                            <span className={cn("hidden sm:inline", isUrduSubject && "font-urdu text-2xl")}>
                                {isUrduSubject ? 'لفظ تلاش کریں' : 'Find the word:'}
                            </span>
                             <span className={cn("sm:hidden", isUrduSubject && "font-urdu text-2xl")}>
                                {isUrduSubject ? 'تلاش' : 'Find:'}
                            </span>
                            <span className={cn("ml-2 sm:ml-3 text-xl sm:text-2xl tracking-widest text-primary", isUrduSubject && "font-urdu text-3xl sm:text-4xl")}>{target}</span>
                        </h3>
                    </div>
                    <div className="bg-background/80 p-2 rounded-lg shadow-md flex items-center gap-2 backdrop-blur-sm">
                        <Star className="text-yellow-400 fill-yellow-400" />
                        <span className="text-lg sm:text-xl font-bold">{score}</span>
                    </div>
                </div>
                
                <div className="h-full w-full" ref={gameAreaRef}>
                  <AnimatePresence>
                    {options.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ 
                                scale: poppedId === item.id ? 0 : 1, 
                                opacity: poppedId === item.id ? 0 : 1,
                            }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: item.delay }}
                            className="absolute"
                            style={{
                                top: item.y,
                                left: item.x,
                            }}
                        >
                             <motion.button
                                onClick={() => handleItemClick(item)}
                                className={cn(
                                    "font-bold rounded-full shadow-lg text-white backdrop-blur-sm border-2 border-white/30",
                                    "flex items-center justify-center",
                                    item.color,
                                    isUrduSubject ? "text-3xl sm:text-4xl font-urdu" : "text-xl sm:text-2xl",
                                    incorrectAttempts > 0 && item.value !== target ? 'animate-jiggle-hover' : ''
                                )}
                                style={{
                                    width: item.size,
                                    height: item.size
                                }}
                                whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
                                whileTap={{ scale: 0.9 }}
                                animate={{
                                    y: [0, -10, 0],
                                }}
                                transition={{
                                    duration: 5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: item.delay,
                                }}
                            >
                                {item.value}
                            </motion.button>
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
                            className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none"
                        >
                            <Image src="/games/win.gif" alt="Correct" width={300} height={300} unoptimized />
                            <h2 className="text-5xl font-extrabold text-white drop-shadow-lg font-headline -mt-16">Correct!</h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
