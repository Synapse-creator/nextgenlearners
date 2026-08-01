"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Star, Calculator, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

interface Bubble {
    id: number;
    value: number | string;
    x: number;
    y: number;
    delay: number;
    size: number;
    color: string;
}

interface NumberBubblePopProps {
    studentClass: string;
    studentId: string;
    subject: string;
}

const bubbleColors = [
    'bg-[#FFD3B6]',
    'bg-[#CAF0F8]',
    'bg-[#A8E6CF]',
    'bg-[#FFF9C4]',
    'bg-[#d8e9bd]'
];

const shuffleArray = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

const generateMathProblem = (level: string): { problem: string; answer: number | string; topic: string; distractors: (number | string)[] } => {
    let num1: number, num2: number, answer: number | string, problem: string, topic: string;
    let distractors: (number | string)[] = [];

    switch (level) {
        case 'PG':
            answer = Math.floor(Math.random() * 5) + 1;
            problem = `Pop the bubble with number ${answer}!`;
            topic = "Number Recognition (1-5)";
            while (distractors.length < 4) {
                const randVal: number = Math.floor(Math.random() * 9) + 1;
                if (randVal !== answer && !distractors.includes(randVal)) distractors.push(randVal);
            }
            break;

        case 'Nursery':
            answer = Math.floor(Math.random() * 10) + 1;
            problem = `Find and pop number ${answer}!`;
            topic = "Counting & Numbers (1-10)";
            while (distractors.length < 4) {
                const randVal: number = Math.floor(Math.random() * 15) + 1;
                if (randVal !== answer && !distractors.includes(randVal)) distractors.push(randVal);
            }
            break;

        case 'KG':
            num1 = Math.floor(Math.random() * 5) + 1;
            num2 = Math.floor(Math.random() * 5) + 1;
            answer = num1 + num2;
            problem = `${num1} + ${num2} = ?`;
            topic = "Basic Addition (0-10)";
            while (distractors.length < 4) {
                const ansNum = typeof answer === 'number' ? answer : Number(answer);
                const randVal: number = ansNum + Math.floor(Math.random() * 7) - 3;
                if (randVal > 0 && randVal !== answer && !distractors.includes(randVal)) distractors.push(randVal);
            }
            break;

        case 'Class 1':
            if (Math.random() > 0.5) {
                num1 = Math.floor(Math.random() * 10) + 5;
                num2 = Math.floor(Math.random() * 10) + 1;
                answer = num1 + num2;
                problem = `${num1} + ${num2} = ?`;
                topic = "Addition up to 20";
            } else {
                num1 = Math.floor(Math.random() * 10) + 8;
                num2 = Math.floor(Math.random() * 7) + 1;
                answer = num1 - num2;
                problem = `${num1} - ${num2} = ?`;
                topic = "Subtraction up to 20";
            }
            while (distractors.length < 4) {
                const ansNum = typeof answer === 'number' ? answer : Number(answer);
                const randVal: number = ansNum + Math.floor(Math.random() * 9) - 4;
                if (randVal >= 0 && randVal !== answer && !distractors.includes(randVal)) distractors.push(randVal);
            }
            break;

        case 'Class 2':
            const op2 = Math.random();
            if (op2 < 0.5) {
                num1 = [2, 3, 4, 5, 10][Math.floor(Math.random() * 5)];
                num2 = Math.floor(Math.random() * 10) + 1;
                answer = num1 * num2;
                problem = `${num1} × ${num2} = ?`;
                topic = "Multiplication Tables";
            } else {
                num1 = Math.floor(Math.random() * 30) + 10;
                num2 = Math.floor(Math.random() * 20) + 5;
                answer = num1 + num2;
                problem = `${num1} + ${num2} = ?`;
                topic = "2-Digit Addition";
            }
            while (distractors.length < 4) {
                const ansNum = typeof answer === 'number' ? answer : Number(answer);
                const randVal: number = ansNum + (Math.random() > 0.5 ? 2 : -2) * (distractors.length + 1);
                if (randVal > 0 && randVal !== answer && !distractors.includes(randVal)) distractors.push(randVal);
            }
            break;

        case 'Class 3':
        default:
            const op3 = Math.random();
            if (op3 < 0.4) {
                num2 = Math.floor(Math.random() * 8) + 2;
                answer = Math.floor(Math.random() * 9) + 2;
                num1 = (answer as number) * num2;
                problem = `${num1} ÷ ${num2} = ?`;
                topic = "Division Basics";
            } else if (op3 < 0.7) {
                num1 = Math.floor(Math.random() * 9) + 2;
                num2 = Math.floor(Math.random() * 9) + 2;
                answer = num1 * num2;
                problem = `${num1} × ${num2} = ?`;
                topic = "Multiplication Master";
            } else {
                num1 = Math.floor(Math.random() * 100) + 50;
                num2 = Math.floor(Math.random() * 100) + 50;
                answer = num1 + num2;
                problem = `${num1} + ${num2} = ?`;
                topic = "3-Digit Mental Addition";
            }
            while (distractors.length < 4) {
                const ansNum = typeof answer === 'number' ? answer : Number(answer);
                const randVal: number = ansNum + Math.floor(Math.random() * 15) - 7;
                if (randVal > 0 && randVal !== answer && !distractors.includes(randVal)) distractors.push(randVal);
            }
            break;
    }

    return { problem, answer, topic, distractors };
};

export default function NumberBubblePop({ studentClass }: NumberBubblePopProps) {
    const { toast } = useToast();
    const gameAreaRef = useRef<HTMLDivElement>(null);
    
    const [problemData, setProblemData] = useState(() => generateMathProblem(studentClass));
    const [bubbles, setBubbles] = useState<Bubble[]>([]);
    const [score, setScore] = useState(0);
    const [poppedId, setPoppedId] = useState<number | null>(null);

    const setupRound = useCallback(() => {
        if (!gameAreaRef.current) return;
        const { width, height } = gameAreaRef.current.getBoundingClientRect();
        
        const newProblem = generateMathProblem(studentClass);
        setProblemData(newProblem);
        setPoppedId(null);

        const allValues = shuffleArray([newProblem.answer, ...newProblem.distractors]);
        const newBubbles: Bubble[] = [];

        allValues.forEach((val, idx) => {
            const size = 90 + Math.random() * 20;
            newBubbles.push({
                id: Date.now() + idx,
                value: val,
                x: Math.random() * (width - size - 20) + 10,
                y: Math.random() * (height - size - 100) + 80,
                delay: idx * 0.15,
                size,
                color: bubbleColors[idx % bubbleColors.length],
            });
        });

        setBubbles(newBubbles);
    }, [studentClass]);

    useEffect(() => {
        setupRound();
    }, [setupRound]);

    const handleBubbleClick = (bubble: Bubble) => {
        if (poppedId !== null) return;

        if (String(bubble.value) === String(problemData.answer)) {
            setPoppedId(bubble.id);
            setScore(prev => prev + 10);
            toast({
                title: "Correct Math Genius! 🧮🎉",
                description: `${problemData.problem} = ${problemData.answer}`,
            });
            setTimeout(() => {
                setupRound();
            }, 800);
        } else {
            toast({
                variant: "destructive",
                title: "Oops! Try another bubble!",
                description: `Think carefully about ${problemData.problem}`,
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
                            <Calculator className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-[#2D3436] font-headline">
                                Number Bubble Pop ({studentClass})
                            </h3>
                            <span className="text-xs font-bold text-[#2c6956] bg-[#A8E6CF]/30 px-3 py-0.5 rounded-full inline-block">
                                Topic: {problemData.topic}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-[#FFF9C4] px-4 py-1.5 rounded-full border border-[#795836]/20">
                        <Star className="w-4 h-4 fill-[#795836] text-[#795836]" />
                        <span className="font-bold text-sm text-[#795836]">Score: {score}</span>
                    </div>
                </div>

                {/* Math Challenge Banner */}
                <div className="bg-[#2c6956] text-white p-6 rounded-2xl text-center shadow-md mb-6">
                    <span className="text-xs uppercase font-bold text-[#A8E6CF] tracking-wider block mb-1">
                        Solve & Pop The Correct Bubble
                    </span>
                    <h2 className="text-3xl md:text-5xl font-extrabold font-headline">
                        {problemData.problem}
                    </h2>
                </div>

                {/* Interactive Bubble Arena */}
                <div
                    ref={gameAreaRef}
                    className="relative w-full h-[360px] md:h-[420px] bg-[#f2f4f1] border-2 border-dashed border-[#bfc9c3]/40 rounded-2xl overflow-hidden"
                >
                    <AnimatePresence>
                        {bubbles.map(bubble => (
                            <motion.button
                                key={bubble.id}
                                onClick={() => handleBubbleClick(bubble)}
                                style={{
                                    left: bubble.x,
                                    top: bubble.y,
                                    width: bubble.size,
                                    height: bubble.size,
                                }}
                                className={`absolute rounded-full border-4 border-white shadow-lg flex items-center justify-center text-2xl md:text-3xl font-extrabold font-headline text-[#2D3436] squishy-btn cursor-pointer ${bubble.color}`}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1, y: [0, -12, 0] }}
                                transition={{
                                    scale: { duration: 0.3, delay: bubble.delay },
                                    y: { duration: 3 + Math.random(), repeat: Infinity, ease: "easeInOut" }
                                }}
                                exit={{ scale: 0, opacity: 0 }}
                            >
                                {bubble.value}
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    );
}
