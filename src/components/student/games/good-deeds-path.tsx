"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, HeartHandshake, Star, Sparkles, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface GoodDeedsPathProps {
    studentClass: string;
    studentId: string;
    subject: string;
}

const gameLevels = {
    PG: [
        { topic: "Kindness to Friends", scenario: "You see a friend fall down on the playground.", options: ["Help them up kindly 🤝", "Laugh at them ❌"], correct: 0, explanation: "Helping friends up with a smile is a wonderful good deed!" },
        { topic: "Gratitude & Manners", scenario: "Your teacher gives you a nice sticker.", options: ["Say 'Thank You!' 😊", "Take it without saying anything ❌"], correct: 0, explanation: "Saying 'Thank You' shows politeness and good manners!" }
    ],
    Nursery: [
        { topic: "Sharing & Caring", scenario: "You want to play with a toy your classmate is holding.", options: ["Ask politely: 'May I share?' 🧸", "Snatch it away ❌"], correct: 0, explanation: "Asking politely to share makes playing fun for everyone!" },
        { topic: "Truthfulness", scenario: "You accidentally spill a cup of water on the table.", options: ["Tell the truth to a grown-up 🧼", "Hide and pretend you didn't do it ❌"], correct: 0, explanation: "Honesty is always the best policy!" }
    ],
    KG: [
        { topic: "Cleanliness (Taharah)", scenario: "You see empty paper wrappers on the floor.", options: ["Pick them up and throw in the bin 🗑️", "Leave them on the floor ❌"], correct: 0, explanation: "Cleanliness is half of faith! Keeping surroundings clean is a great deed." },
        { topic: "Bismillah", scenario: "You sit down at the dinner table to eat your food.", options: ["Say 'Bismillah' before taking a bite 🤲", "Start eating quickly without a word ❌"], correct: 0, explanation: "Saying 'Bismillah' brings blessings into our food!" }
    ],
    'Class 1': [
        { topic: "Helping Others", scenario: "Your classmate forgot their pencil for writing class.", options: ["Share your extra pencil with them ✏️", "Keep all pencils to yourself ❌"], correct: 0, explanation: "Sharing items with those in need is an act of charity and love!" },
        { topic: "Respecting Parents", scenario: "Your parents ask you to clean your play area.", options: ["Say 'Yes' happily and help clean up 🧹", "Pretend you didn't hear ❌"], correct: 0, explanation: "Listening to and obeying parents earns immense blessings!" }
    ],
    'Class 2': [
        { topic: "Honesty & Integrity", scenario: "You find a lost water bottle on the playground.", options: ["Hand it over to your teacher 🏫", "Keep it for yourself ❌"], correct: 0, explanation: "Honesty means returning lost items to their rightful owner!" },
        { topic: "JazakAllah Khair", scenario: "Someone helps you pick up your fallen books.", options: ["Say 'JazakAllah Khair' (May Allah reward you!) 💖", "Just walk away ❌"], correct: 0, explanation: "Saying 'JazakAllah Khair' prays for goodness and reward for the helper!" }
    ],
    'Class 3': [
        { topic: "Civic Duty & Elders", scenario: "An elderly person is struggling to carry a heavy bag.", options: ["Offer to help carry the bag 🛍️", "Ignore and walk past ❌"], correct: 0, explanation: "Helping elderly people and showing respect is a noble duty!" },
        { topic: "Keeping Promises", scenario: "Your friend tells you a secret in trust.", options: ["Keep the secret safe and locked 🔐", "Tell everyone at school ❌"], correct: 0, explanation: "Trustworthiness (Amanah) means keeping promises and secrets safe!" }
    ]
};

export default function GoodDeedsPath({ studentClass }: GoodDeedsPathProps) {
    const { toast } = useToast();
    const questions = gameLevels[studentClass as keyof typeof gameLevels] || gameLevels.PG;
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);

    const question = questions[currentStep % questions.length];

    const handleOptionClick = (index: number) => {
        if (selectedOption !== null) return;
        setSelectedOption(index);
        
        if (index === question.correct) {
            setIsCorrect(true);
            setScore(prev => prev + 10);
            toast({
                title: "Noble Good Deed! 🌟",
                description: question.explanation,
            });
        } else {
            setIsCorrect(false);
            toast({
                variant: "destructive",
                title: "Think about the good deed!",
                description: "Choose the kind and honest choice!",
            });
        }
    };

    const handleNext = () => {
        setSelectedOption(null);
        setIsCorrect(null);
        setCurrentStep(prev => prev + 1);
    };

    return (
        <Card className="border border-[#A8E6CF]/30 shadow-lg rounded-2xl bg-white overflow-hidden">
            <CardHeader className="bg-[#f8faf7] border-b border-[#bfc9c3]/30 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl md:text-2xl font-bold font-headline text-[#2D3436] flex items-center gap-2">
                            <HeartHandshake className="w-6 h-6 text-[#2c6956]" />
                            Good Deeds Quest ({studentClass})
                        </CardTitle>
                        <span className="text-xs font-bold text-[#2c6956] bg-[#A8E6CF]/30 px-3 py-0.5 rounded-full inline-block mt-1">
                            Topic: {question.topic}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 bg-[#FFF9C4] px-4 py-1.5 rounded-full border border-[#795836]/20">
                        <Star className="w-4 h-4 fill-[#795836] text-[#795836]" />
                        <span className="font-bold text-sm text-[#795836]">Deeds Points: {score}</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
                {/* Scenario Header */}
                <div className="bg-[#f2f4f1] p-6 rounded-2xl border border-[#bfc9c3]/30 text-center">
                    <span className="text-xs font-bold text-[#636E72] uppercase tracking-wider block mb-2">
                        Scenario #{currentStep + 1}
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold text-[#2D3436] font-headline leading-relaxed">
                        "{question.scenario}"
                    </h3>
                    <p className="text-xs text-[#2c6956] font-bold mt-2">
                        What is the best good deed to do?
                    </p>
                </div>

                {/* Scenario Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.options.map((opt, idx) => {
                        const isSelected = selectedOption === idx;
                        let btnClass = "bg-white border-[#bfc9c3]/40 text-[#2D3436] hover:bg-[#f8faf7]";

                        if (selectedOption !== null) {
                            if (idx === question.correct) {
                                btnClass = "bg-[#A8E6CF]/40 border-[#2c6956] text-[#2c6956] font-extrabold shadow-md";
                            } else if (isSelected) {
                                btnClass = "bg-[#ffdad6] border-[#ba1a1a] text-[#ba1a1a]";
                            }
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleOptionClick(idx)}
                                disabled={selectedOption !== null}
                                className={cn(
                                    "p-6 rounded-2xl border-2 text-left transition-all duration-200 squishy-btn flex items-center justify-between gap-3 text-base font-bold",
                                    btnClass
                                )}
                            >
                                <span>{opt}</span>
                                {selectedOption !== null && idx === question.correct && (
                                    <Check className="w-5 h-5 text-[#2c6956]" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Moral Lesson Feedback */}
                <AnimatePresence>
                    {selectedOption !== null && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-[#FFF9C4]/40 p-5 rounded-2xl border border-[#795836]/20 space-y-3"
                        >
                            <div className="flex items-center gap-2 text-[#795836] font-bold text-sm">
                                <Sparkles className="w-5 h-5" />
                                Moral Lesson & Virtue:
                            </div>
                            <p className="text-sm text-[#2D3436] font-body leading-relaxed">
                                {question.explanation}
                            </p>
                            <div className="flex justify-end pt-2">
                                <Button
                                    onClick={handleNext}
                                    className="bg-[#2c6956] hover:bg-[#1e4b3d] text-white font-bold rounded-xl px-6 squishy-btn"
                                >
                                    Next Good Deed <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
