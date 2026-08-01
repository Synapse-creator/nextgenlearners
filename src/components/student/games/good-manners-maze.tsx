
"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';


const gameLevels = {
    PG: [
        { scenario: "You want a toy.", options: ["Say 'Please'", "Just take it"], correct: 0, explanation: "Saying 'please' is the polite way to ask for something." },
        { scenario: "Someone gives you a cookie.", options: ["Say 'Thank you'", "Say nothing"], correct: 0, explanation: "It's always nice to thank someone who gives you a gift." }
    ],
    Nursery: [
        { scenario: "You meet your teacher in the morning.", options: ["Look away", "Say 'Assalamu Alaikum'"], correct: 1, explanation: "Greeting others with 'Assalamu Alaikum' is a beautiful sunnah." },
        { scenario: "You need to sneeze.", options: ["Sneeze loudly", "Cover your mouth"], correct: 1, explanation: "We should cover our mouths when we sneeze to be considerate of others." }
    ],
    KG: [
        { scenario: "Your friend is talking.", options: ["Interrupt them", "Wait for your turn"], correct: 1, explanation: "It's good manners to listen when others are speaking and wait for our turn." },
        { scenario: "You are visiting someone's house.", options: ["Run around and touch everything", "Sit nicely and be gentle"], correct: 1, explanation: "We should be respectful guests in other people's homes." }
    ],
    'Class 1': [
        { scenario: "You see an adult you know.", options: ["Ignore them", "Greet them with a smile"], correct: 1, explanation: "Respecting our elders by greeting them is a sign of good character." },
        { scenario: "You are eating with others.", options: ["Eat with your left hand", "Eat with your right hand"], correct: 1, explanation: "The Prophet (PBUH) taught us to eat with our right hand." }
    ],
    'Class 2': [
        { scenario: "You make a mistake and hurt your friend's feelings.", options: ["Say 'I'm sorry'", "Blame them"], correct: 0, explanation: "A sincere apology is important when we make a mistake." },
        { scenario: "Your mom asks for your help.", options: ["Say 'In a minute' and forget", "Help her right away"], correct: 1, explanation: "Helping our parents is a great way to show them love and respect." }
    ],
    'Class 3': [
        { scenario: "Your friend shares something with you.", options: ["Take the biggest piece", "Share equally"], correct: 1, explanation: "Sharing fairly is a sign of kindness and justice." },
        { scenario: "You are given food you don't like.", options: ["Say 'I don't like this'", "Say nothing and eat what you can"], correct: 1, explanation: "We should be grateful for our food and not complain about it." }
    ]
};

export default function GoodMannersMaze({ studentClass }: { studentClass: string; }) {
    const questions = gameLevels[studentClass as keyof typeof gameLevels] || gameLevels.PG;
    const [currentStep, setCurrentStep] = useState(0);
    const [path, setPath] = useState<boolean[]>([]);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const question = questions[currentStep];

    const handleOptionClick = (index: number) => {
        if (selectedOption !== null) return;
        setSelectedOption(index);
        const correct = index === question.correct;
        setIsCorrect(correct);
        setPath(p => [...p, correct]);
    };

    const handleNext = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(s => s + 1);
            setSelectedOption(null);
            setIsCorrect(null);
        }
    };
    
    const isFinished = currentStep === questions.length - 1 && selectedOption !== null;

    return (
        <Card className="w-full h-auto sm:h-[550px] relative overflow-hidden shadow-lg border-4 border-primary/20 bg-green-50 p-4 flex flex-col justify-between">
             <div>
                <h2 className="text-xl sm:text-2xl font-bold font-headline text-green-800 text-center">The Good Manners Maze</h2>
                {/* Maze Path */}
                <div className="w-full h-24 bg-green-200 rounded-lg mt-4 p-2 flex items-center relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('/games/path.svg')] bg-repeat-x opacity-20"></div>
                     <motion.div
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary flex items-center justify-center"
                        animate={{ x: `${(path.filter(Boolean).length / questions.length) * 85}%` }}
                        transition={{ type: 'spring', stiffness: 100 }}
                        style={{ position: 'relative', left: '5%'}}
                     >
                         <Image src="/avatars/avatar2.gif" alt="Player" width={60} height={60} className="rounded-full" />
                     </motion.div>
                     <div className="absolute w-12 h-12 sm:w-16 sm:h-16 right-[5%] flex items-center justify-center">
                        <Image src="/games/home.png" alt="Goal" width={64} height={64} data-ai-hint="finish house" />
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
                        <p>{isCorrect ? "Masha'Allah! That's the right way." : "Oops! Let's remember the better way."}</p>
                        <p className="text-sm font-normal">{question.explanation}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="text-center mt-4">
                <Button onClick={handleNext} disabled={selectedOption === null} className="w-full sm:w-1/2">
                    {isFinished ? 'Finish' : 'Next Step'} <ArrowRight className="ml-2" />
                </Button>
            </div>
        </Card>
    );
}
