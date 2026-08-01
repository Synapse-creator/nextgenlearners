"use client";

import React, { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Weight {
    id: string;
    value: number;
}

const generateProblem = (level: string) => {
    let targetSum = 0;
    let availableWeights: number[] = [];

    switch (level) {
        case 'PG':
        case 'Nursery': 
            targetSum = Math.floor(Math.random() * 5) + 1;
            availableWeights = [1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);
            break;
        case 'KG':
        case 'Class 1': 
            targetSum = Math.floor(Math.random() * 8) + 3;
            availableWeights = [1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5).slice(0, 5);
            availableWeights[0] = Math.floor(targetSum / 2);
            availableWeights[1] = targetSum - availableWeights[0];
            break;
        case 'Class 2':
        case 'Class 3': 
            targetSum = Math.floor(Math.random() * 20) + 10;
            availableWeights = [5, 10, 15, 2, 3, 4, 7, 8].sort(() => Math.random() - 0.5).slice(0, 6);
            availableWeights[0] = Math.floor(targetSum / 2);
            availableWeights[1] = targetSum - availableWeights[0];
            break;
        default:
            targetSum = 5;
            availableWeights = [1, 2, 3, 4, 5];
    }
    
    const weights: Weight[] = availableWeights.map((val, i) => ({
        id: `weight-${val}-${i}-${Date.now()}`,
        value: val
    }));

    return { targetSum, weights };
};

const DraggableWeight = ({ weight }: { weight: Weight }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: weight.id, data: weight });
    const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : {};
    
    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            layoutId={weight.id}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing border-b-4 border-slate-950 text-white font-bold text-2xl z-20 relative"
            whileHover={{ scale: 1.05 }}
        >
            {weight.value}
        </motion.div>
    );
};

const ScaleSide = ({ id, children, currentSum, targetSum }: { id: string; children: React.ReactNode, currentSum: number, targetSum: number }) => {
    const { setNodeRef, isOver } = useDroppable({ id });
    
    let rotate = 0;
    if (id === 'scale-right') {
        const diff = currentSum - targetSum;
        rotate = Math.min(Math.max(diff * 2, -20), 20);
    }

    return (
        <motion.div
            ref={setNodeRef}
            className={cn(
                "w-full h-32 sm:h-40 rounded-xl flex flex-col items-center justify-end p-2 transition-colors duration-300 relative border-b-8 border-amber-900",
                isOver ? 'bg-primary/10' : ''
            )}
            animate={{ rotate }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
        >
            <div className="absolute bottom-[-8px] w-[110%] h-4 bg-amber-800 rounded-full" />
            <div className="flex flex-wrap-reverse gap-2 justify-center items-end pb-4 z-10 w-full min-h-[4rem]">
                {children}
            </div>
        </motion.div>
    );
};

export default function MathBalance({ studentClass, studentId, subject }: { studentClass: string; studentId: string; subject: string }) {
    const { toast } = useToast();
    const [gameState, setGameState] = useState<'playing' | 'correct'>('playing');
    const [targetSum, setTargetSum] = useState(0);
    const [availableWeights, setAvailableWeights] = useState<Weight[]>([]);
    const [placedWeights, setPlacedWeights] = useState<Weight[]>([]);
    const [score, setScore] = useState(0);

    const setupRound = () => {
        const problem = generateProblem(studentClass);
        setTargetSum(problem.targetSum);
        setAvailableWeights(problem.weights);
        setPlacedWeights([]);
        setGameState('playing');
    };

    useEffect(() => {
        setupRound();
    }, [studentClass]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { over, active } = event;
        
        if (over && over.id === 'scale-right') {
            const weight = availableWeights.find(w => w.id === active.id) || placedWeights.find(w => w.id === active.id);
            if (weight && !placedWeights.find(w => w.id === weight.id)) {
                setAvailableWeights(prev => prev.filter(w => w.id !== active.id));
                setPlacedWeights(prev => [...prev, weight]);
            }
        } else if (over && over.id === 'weights-pool') {
             const weight = placedWeights.find(w => w.id === active.id);
             if (weight) {
                 setPlacedWeights(prev => prev.filter(w => w.id !== active.id));
                 setAvailableWeights(prev => [...prev, weight]);
             }
        }
    };

    const currentSum = placedWeights.reduce((sum, w) => sum + w.value, 0);

    useEffect(() => {
        if (currentSum === targetSum && targetSum > 0 && gameState === 'playing') {
            setGameState('correct');
            const newScore = score + 1;
            setScore(newScore);
            saveProgress(newScore);
            setTimeout(setupRound, 3000);
        } else if (currentSum > targetSum) {
            toast({
                variant: "destructive",
                title: "Too Heavy!",
                description: "Remove some weights to balance the scale.",
            });
        }
    }, [currentSum, targetSum, gameState]);

    const saveProgress = async (currentScore: number) => {
        try {
            await supabase.from('users').update({
                game_progress_math_balance: currentScore,
                game_progress_updated_at: new Date().toISOString(),
            }).eq('uid', studentId);
        } catch (error) {
            console.error("Error saving game progress:", error);
        }
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <Card className="w-full h-auto sm:h-[500px] relative overflow-hidden shadow-lg border-4 border-primary/20 bg-sky-50 flex flex-col">
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex justify-between items-center z-20">
                    <div className="bg-background/80 p-2 rounded-lg shadow-md backdrop-blur-sm">
                        <h3 className="text-base sm:text-lg font-bold font-headline flex items-center">
                            <span>Balance the Scale!</span>
                        </h3>
                    </div>
                    <div className="bg-background/80 p-2 rounded-lg shadow-md flex items-center gap-2 backdrop-blur-sm">
                        <Star className="text-yellow-400 fill-yellow-400" />
                        <span className="text-lg sm:text-xl font-bold">{score}</span>
                    </div>
                </div>

                <div className="flex-grow flex flex-col justify-center items-center mt-12 p-4">
                    <div className="w-full max-w-2xl relative flex items-end justify-between pb-2">
                        
                        {/* Left Side (Target) */}
                        <div className="w-[45%] flex flex-col items-center">
                            <div className="w-full h-32 sm:h-40 rounded-xl flex flex-col items-center justify-end p-2 relative border-b-8 border-amber-900">
                                <div className="absolute bottom-[-8px] w-[110%] h-4 bg-amber-800 rounded-full" />
                                <div className="flex gap-2 justify-center items-end pb-4 z-10 w-full min-h-[4rem]">
                                    <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full shadow-xl flex flex-col items-center justify-center border-4 border-amber-200">
                                        <span className="text-3xl font-extrabold text-amber-900">{targetSum}</span>
                                        <span className="text-xs font-bold text-amber-900 uppercase">Target</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-4 h-24 bg-amber-700 mx-auto border-l-2 border-r-2 border-black/20" />
                        </div>

                        {/* Center Fulcrum Base */}
                        <div className="absolute left-1/2 bottom-[-8px] -translate-x-1/2 w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[50px] border-b-amber-800 z-10" />

                        {/* Right Side (Player Drops) */}
                        <div className="w-[45%] flex flex-col items-center">
                            <ScaleSide id="scale-right" currentSum={currentSum} targetSum={targetSum}>
                                {placedWeights.map(weight => (
                                    <DraggableWeight key={weight.id} weight={weight} />
                                ))}
                                {placedWeights.length === 0 && (
                                    <span className="text-muted-foreground font-semibold text-sm mb-4">Drop Weights Here</span>
                                )}
                            </ScaleSide>
                            <div className="w-4 h-24 bg-amber-700 mx-auto border-l-2 border-r-2 border-black/20" />
                        </div>
                    </div>
                     <div className="w-full max-w-2xl h-8 bg-amber-900 rounded-t-xl" />
                </div>

                {/* Weights Pool */}
                <div className="bg-slate-200 min-h-[120px] p-4 flex justify-center gap-4 flex-wrap border-t-4 border-slate-300">
                    <DroppableArea id="weights-pool">
                        {availableWeights.map(weight => (
                            <DraggableWeight key={weight.id} weight={weight} />
                        ))}
                    </DroppableArea>
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
                            <h2 className="text-5xl font-extrabold text-white drop-shadow-lg font-headline -mt-16">Balanced!</h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </DndContext>
    );
}

const DroppableArea = ({ id, children }: { id: string; children: React.ReactNode }) => {
    const { setNodeRef } = useDroppable({ id });
    return (
        <div ref={setNodeRef} className="flex flex-wrap gap-4 justify-center w-full min-h-[5rem]">
            {children}
        </div>
    );
};
