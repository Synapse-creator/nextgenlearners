
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';


const gameLevels = {
    PG: [
        { scenario: "You see a friend fall down.", options: ["Help them up", "Laugh"], correct: 0, explanation: "Helping friends is kind!" },
        { scenario: "Mom gives you a cookie.", options: ["Say 'Thank You'", "Grab it and run"], correct: 0, explanation: "It's nice to say thank you." }
    ],
    Nursery: [
        { scenario: "You want to play with a toy your friend has.", options: ["Take it", "Ask, 'Can I play?'"], correct: 1, explanation: "Asking to share is the right way to play." },
        { scenario: "You accidentally spill some water.", options: ["Tell a grown-up", "Hide it"], correct: 0, explanation: "It's always best to tell the truth." }
    ],
    KG: [
        { scenario: "You see trash on the floor.", options: ["Leave it there", "Pick it up and put it in the bin"], correct: 1, explanation: "Keeping our space clean is a good deed." },
        { scenario: "It's time to eat.", options: ["Start eating right away", "Say 'Bismillah' first"], correct: 1, explanation: "We say 'Bismillah' before we eat to thank Allah." }
    ],
    'Class 1': [
        { scenario: "Your friend is sad because they lost their pencil.", options: ["Tell them it's okay", "Share one of your pencils"], correct: 1, explanation: "Sharing with those in need is a great act of kindness." },
        { scenario: "Your parents ask you to clean your room.", options: ["Say 'Okay' and do it", "Pretend you didn't hear"], correct: 0, explanation: "Obeying and helping our parents is very important." }
    ],
    'Class 2': [
        { scenario: "You find a toy in the playground that isn't yours.", options: ["Keep it", "Give it to a teacher"], correct: 1, explanation: "Honesty means returning things that are not ours." },
        { scenario: "Someone gives you a gift.", options: ["Say 'JazakAllah Khair'", "Just take it"], correct: 0, explanation: "We say 'JazakAllah Khair' to thank someone and pray for them." }
    ],
    'Class 3': [
        { scenario: "You see an elderly person who needs help crossing the street.", options: ["Wait for someone else to help", "Ask a grown-up to help them"], correct: 1, explanation: "Respecting and helping our elders is a very good deed." },
        { scenario: "Your friend tells you a secret.", options: ["Tell your other friends", "Keep the secret safe"], correct: 1, explanation: "A trustworthy person keeps the secrets of others." }
    ]
};

export default function GoodDeedsPath({ studentClass }: { studentClass: string; studentId: string; subject: string }) {
    const questions = gameLevels[studentClass as keyof typeof gameLevels] || gameLevels.PG;
    const [currentStep, setCurrentStep] = useState(0);
    const [position, setPosition] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const question = questions[currentStep];

    const handleOptionClick = (index: number) => {
        if (selectedOption !== null) return;
        setSelectedOption(index);
        if (index === question.correct) {
            setIsCorrect(true);
        } else {
            setIsCorrect(false);
        }
    };

    const handleNext = () => {
        if (isCorrect) {
            setPosition(p => Math.min(p + 1, questions.length));
        }
        if (currentStep < questions.length - 1) {
            setCurrentStep(s => s + 1);
            setSelectedOption(null);
            setIsCorrect(null);
        }
    };

    const isFinished = currentStep === questions.length - 1 && selectedOption !== null;

    return (
        <Card className="w-full h-auto sm:h-[550px] relative overflow-hidden shadow-lg border-4 border-primary/20 bg-blue-50 p-4 flex flex-col justify-between">
            <div>
                <h2 className="text-xl sm:text-2xl font-bold font-headline text-blue-800 text-center">The Path of Good Deeds</h2>
                {/* Game Board */}
                <div className="w-full h-24 bg-green-200 rounded-lg mt-4 p-2 flex items-center relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('/games/path.svg')] bg-repeat-x opacity-20"></div>
                     <motion.div
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary flex items-center justify-center"
                        animate={{ x: `${(position / questions.length) * 85}%` }}
                        transition={{ type: 'spring', stiffness: 100 }}
                        style={{ position: 'relative', left: '5%'}}
                     >
                         <Image src="/avatars/avatar1.gif" alt="Player" width={60} height={60} className="rounded-full" />
                     </motion.div>
                     <div className="absolute w-12 h-12 sm:w-16 sm:h-16 right-[5%] flex items-center justify-center">
                        <Image src="/games/mosque.png" alt="Goal" width={64} height={64} />
                     </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/80 rounded-lg shadow-md p-4 sm:p-6 text-center my-4"
                >
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">{question.scenario}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                        {question.options.map((option, index) => (
                            <Button
                                key={index}
                                variant={selectedOption === index ? (isCorrect ? 'default' : 'destructive') : 'outline'}
                                onClick={() => handleOptionClick(index)}
                                className={cn("h-auto py-3 text-sm sm:text-base whitespace-normal", selectedOption !== null && 'cursor-not-allowed')}
                            >
                                {option}
                            </Button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
            
            <AnimatePresence>
                {selectedOption !== null && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={`mt-4 p-4 rounded-lg text-center font-semibold ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                        <p>{isCorrect ? "That's a wonderful choice!" : "Let's try to make a better choice."}</p>
                        <p className="text-sm font-normal">{question.explanation}</p>
                    </motion.div>
                )}
            </AnimatePresence>
            
             <div className="text-center mt-4">
                <Button onClick={handleNext} disabled={selectedOption === null} className="w-full sm:w-1/2">
                    {isFinished ? 'Finish' : 'Next'} <ArrowRight className="ml-2" />
                </Button>
            </div>
        </Card>
    );
}
