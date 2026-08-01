"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Volume2, Sparkles, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

const gameLevels = {
    PG: { topic: "Alphabet Phonics", words: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'] },
    Nursery: { topic: "3-Letter CVC Words", words: ['CAT', 'DOG', 'SUN', 'BUS', 'HAT', 'PEN', 'BUG', 'CUP', 'FAN', 'PIG'] },
    KG: { topic: "Animals & Nature Words", words: ['BIRD', 'FISH', 'FROG', 'DUCK', 'LION', 'STAR', 'MOON', 'BOOK', 'TREE', 'MILK'] },
    'Class 1': { topic: "Vocabulary & Spelling", words: ['APPLE', 'WATER', 'HOUSE', 'CHAIR', 'PLANT', 'TRAIN', 'SMILE', 'GRASS', 'CLOUD', 'BREAD'] },
    'Class 2': { topic: "Nouns & Action Words", words: ['ORANGE', 'SCHOOL', 'PENCIL', 'RABBIT', 'FLOWER', 'FRIEND', 'SUMMER', 'MONKEY', 'YELLOW', 'PLANET'] },
    'Class 3': { topic: "Advanced Spelling Bee", words: ['ELEPHANT', 'COMPUTER', 'BEAUTIFUL', 'QUESTION', 'DINOSAUR', 'BUTTERFLY', 'EXPLORER', 'SUNSHINE', 'RAINBOW', 'TEACHER'] },
};

const colors = ['bg-[#FFD3B6]', 'bg-[#CAF0F8]', 'bg-[#A8E6CF]', 'bg-[#FFF9C4]', 'bg-[#d8e9bd]'];

interface Balloon {
    id: string;
    letter: string;
    x: number;
    delay: number;
    speed: number;
    color: string;
}

export default function SpellingBee({ studentClass }: { studentClass: string; studentId: string; subject: string }) {
    const { toast } = useToast();
    const gameAreaRef = useRef<HTMLDivElement>(null);
    const levelData = gameLevels[studentClass as keyof typeof gameLevels] || gameLevels.PG;
    
    const [targetWord, setTargetWord] = useState('');
    const [spelledWord, setSpelledWord] = useState('');
    const [balloons, setBalloons] = useState<Balloon[]>([]);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState<'playing' | 'correct'>('playing');

    const speakWord = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    const setupRound = useCallback(() => {
        if (!gameAreaRef.current) return;
        const width = gameAreaRef.current.getBoundingClientRect().width;
        
        const randomWord = levelData.words[Math.floor(Math.random() * levelData.words.length)];
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
            x: (index * (width / (allLetters.length + 1))) + 20,
            delay: Math.random() * 0.5,
            speed: 4 + Math.random() * 2,
            color: colors[index % colors.length],
        }));

        setBalloons(newBalloons);
    }, [levelData]);

    useEffect(() => {
        setupRound();
    }, [setupRound]);

    const handleBalloonClick = (balloon: Balloon) => {
        if (gameState === 'correct') return;

        const nextCharNeeded = targetWord[spelledWord.length];
        
        if (balloon.letter === nextCharNeeded) {
            const newSpelled = spelledWord + balloon.letter;
            setSpelledWord(newSpelled);
            setBalloons(prev => prev.filter(b => b.id !== balloon.id));

            if (newSpelled === targetWord) {
                setGameState('correct');
                setScore(prev => prev + 10);
                speakWord(targetWord);
                toast({
                    title: "Word Spelled Correctly! 🐝✨",
                    description: `Awesome job spelling ${targetWord}!`,
                });
                setTimeout(() => {
                    setupRound();
                }, 1200);
            }
        } else {
            toast({
                variant: "destructive",
                title: "Try another letter!",
                description: `Next letter needed: ${nextCharNeeded}`,
            });
        }
    };

    return (
        <Card className="border border-[#A8E6CF]/30 shadow-lg rounded-2xl bg-white overflow-hidden">
            <CardContent className="p-6">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 p-4 bg-[#f8faf7] rounded-xl border border-[#bfc9c3]/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#A8E6CF]/40 flex items-center justify-center text-[#2c6956]">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-[#2D3436] font-headline">
                                Spelling Bee Arena ({studentClass})
                            </h3>
                            <span className="text-xs font-bold text-[#2c6956] bg-[#A8E6CF]/30 px-3 py-0.5 rounded-full inline-block">
                                Topic: {levelData.topic}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => speakWord(targetWord)}
                            className="p-2 rounded-full bg-[#2c6956]/10 text-[#2c6956] hover:bg-[#2c6956]/20 transition-colors squishy-btn"
                            title="Listen to Word"
                        >
                            <Volume2 className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2 bg-[#FFF9C4] px-4 py-1.5 rounded-full border border-[#795836]/20">
                            <Star className="w-4 h-4 fill-[#795836] text-[#795836]" />
                            <span className="font-bold text-sm text-[#795836]">Score: {score}</span>
                        </div>
                    </div>
                </div>

                {/* Target Word Container */}
                <div className="bg-[#f2f4f1] p-6 rounded-2xl border border-[#bfc9c3]/30 text-center mb-6">
                    <span className="text-xs uppercase font-bold text-[#636E72] tracking-wider block mb-2">
                        Pop Balloons To Spell The Word:
                    </span>
                    <div className="flex justify-center items-center gap-2">
                        {targetWord.split('').map((char, index) => {
                            const isFilled = index < spelledWord.length;
                            return (
                                <div
                                    key={index}
                                    className={`w-12 h-14 md:w-14 md:h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-extrabold font-headline transition-all ${
                                        isFilled
                                            ? "bg-[#2c6956] text-white border-[#2c6956] shadow-md scale-105"
                                            : "bg-white border-dashed border-[#bfc9c3] text-[#bfc9c3]"
                                    }`}
                                >
                                    {isFilled ? spelledWord[index] : "_"}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Balloon Floating Arena */}
                <div
                    ref={gameAreaRef}
                    className="relative w-full h-[360px] md:h-[400px] bg-gradient-to-b from-[#CAF0F8]/30 to-[#f8faf7] border-2 border-dashed border-[#bfc9c3]/40 rounded-2xl overflow-hidden"
                >
                    <AnimatePresence>
                        {balloons.map(balloon => (
                            <motion.button
                                key={balloon.id}
                                onClick={() => handleBalloonClick(balloon)}
                                style={{ left: balloon.x }}
                                className={`absolute w-16 h-20 md:w-20 md:h-24 rounded-full border-4 border-white shadow-md flex items-center justify-center text-2xl font-extrabold font-headline text-[#2D3436] squishy-btn cursor-pointer ${balloon.color}`}
                                initial={{ y: 380, opacity: 0 }}
                                animate={{
                                    y: [360, -20],
                                    opacity: 1
                                }}
                                transition={{
                                    y: { duration: balloon.speed, repeat: Infinity, ease: "linear" },
                                    opacity: { duration: 0.3 }
                                }}
                                exit={{ scale: 0, opacity: 0 }}
                            >
                                {balloon.letter}
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    );
}
