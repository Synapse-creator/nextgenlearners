
"use client";

import React, { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, FlaskConical, Lightbulb, Repeat, ArrowRight, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const gameLevels = {
    PG: {
        question: "What happens when you mix blue and yellow?",
        items: [{ id: 'blue-paint', hint: 'blue paint' }, { id: 'yellow-paint', hint: 'yellow paint' }],
        correctDrop: 'blue-paint-yellow-paint',
        result: { color: 'bg-green-500', text: 'Green!' }
    },
    Nursery: {
        question: "What happens when you mix blue and yellow?",
        items: [{ id: 'blue-paint', hint: 'blue paint' }, { id: 'yellow-paint', hint: 'yellow paint' }],
        correctDrop: 'blue-paint-yellow-paint',
        result: { color: 'bg-green-500', text: 'Green!' }
    },
    KG: {
        question: "Which of these will float in water?",
        items: [{ id: 'leaf', hint: 'green leaf' }, { id: 'rock', hint: 'small rock' }],
        correctDrop: 'leaf',
        result: { text: 'The leaf floats!' }
    },
    'Class 1': {
        question: "What does a plant need to grow?",
        items: [{ id: 'sun', hint: 'bright sun' }, { id: 'water', hint: 'water drop' }, { id: 'toy-car', hint: 'red toy car' }],
        correctDrop: 'sun-water',
        result: { text: 'Plants need sun and water!' }
    },
    'Class 2': {
        question: "Which of these will sink in water?",
        items: [{ id: 'feather', hint: 'white feather' }, { id: 'coin', hint: 'gold coin' }],
        correctDrop: 'coin',
        result: { text: 'The coin sinks!' }
    },
    'Class 3': {
        question: "What happens when you heat water?",
        items: [{ id: 'ice-cube', hint: 'ice cube' }, { id: 'fire', hint: 'small fire' }],
        correctDrop: 'ice-cube-fire',
        result: { text: 'It melts and turns to steam!' }
    }
};

const DraggableItem = ({ item }: { item: any }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: item.id });
    const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : {};
    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            layoutId={item.id}
            className="w-20 h-20 sm:w-24 sm:h-24 bg-white/80 rounded-lg shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing p-2"
            whileHover={{ scale: 1.1 }}
        >
            <Image src={`https://picsum.photos/seed/${item.hint.replace(' ', '-')}/100/100`} width={100} height={100} alt={item.hint} data-ai-hint={item.hint} className="rounded-md object-contain" />
        </motion.div>
    );
};

const DroppableArea = ({ id, children, isOver, gameState }: { id: string; children: React.ReactNode, isOver: boolean, gameState: 'playing' | 'correct' | 'incorrect' }) => {
    const { setNodeRef } = useDroppable({ id });
    return (
        <motion.div
            ref={setNodeRef}
            className={cn(`w-full h-48 sm:h-64 border-4 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors duration-300`,
                isOver ? 'bg-green-200 border-green-500' : 'bg-blue-100 border-blue-400',
                gameState === 'incorrect' && 'border-red-500'
            )}
            animate={gameState === 'incorrect' ? { x: [-5, 5, -5, 5, 0] } : {}}
            transition={{ duration: 0.3 }}
        >
            {children}
        </motion.div>
    );
};

export default function ScienceLabAdventure({ studentClass }: { studentClass: string; studentId: string; subject: string }) {
    const level = gameLevels[studentClass as keyof typeof gameLevels] || gameLevels.PG;
    const [items, setItems] = useState(level.items);
    const [droppedItems, setDroppedItems] = useState<any[]>([]);
    const [isOver, setIsOver] = useState(false);
    const [gameState, setGameState] = useState<'playing' | 'correct' | 'incorrect'>('playing');

    const handleDragEnd = (event: DragEndEvent) => {
        const { over, active } = event;
        setIsOver(false);
        setGameState('playing'); // Reset incorrect state on new drop
        if (over && over.id === 'lab-area') {
            const droppedItem = items.find(i => i.id === active.id);
            if (droppedItem && !droppedItems.find(i => i.id === droppedItem.id)) {
                setItems(prev => prev.filter(i => i.id !== active.id));
                setDroppedItems(prev => [...prev, droppedItem]);
            }
        }
    };

    const checkAnswer = () => {
        const droppedIds = droppedItems.map(i => i.id).sort();
        const correctIds = level.correctDrop.split('-').sort();
        
        if (droppedIds.length === correctIds.length && droppedIds.every((id, index) => id === correctIds[index])) {
            setGameState('correct');
        } else {
            setGameState('incorrect');
        }
    };
    
    const resetGame = () => {
        setItems(level.items);
        setDroppedItems([]);
        setGameState('playing');
    };

    if (gameState === 'correct') {
        return (
            <Card className="w-full h-auto sm:h-[500px] relative overflow-hidden shadow-lg border-4 border-primary/20 bg-green-50 p-4 flex flex-col items-center justify-center text-center">
                <Image src="/games/win.gif" alt="Experiment Success!" width={300} height={300} unoptimized />
                <h2 className="text-4xl font-extrabold text-primary font-headline -mt-16">Eureka!</h2>
                <p className="text-xl font-semibold mt-4">{level.result.text}</p>
                {level.result.color && <div className={`w-20 h-20 rounded-full ${level.result.color} mt-2 border-4 border-white shadow-lg`}></div>}
                <Button onClick={resetGame} className="mt-8">
                    <Repeat className="mr-2" />
                    New Experiment
                </Button>
            </Card>
        );
    }

    return (
        <DndContext onDragEnd={handleDragEnd} onDragOver={() => setIsOver(true)} onDragLeave={() => setIsOver(false)}>
            <Card className="w-full h-auto sm:h-[500px] relative overflow-hidden shadow-lg border-4 border-primary/20 bg-blue-50 p-4 flex flex-col">
                <div className="text-center mb-4">
                    <h2 className="text-lg sm:text-2xl font-bold font-headline text-blue-800">Science Lab Adventure</h2>
                    <p className="text-base sm:text-lg font-semibold text-foreground mt-1">{level.question}</p>
                </div>

                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4 sm:mb-8 min-h-[100px] border-b-2 border-blue-200 pb-4">
                    <AnimatePresence>
                        {items.map(item => <DraggableItem key={item.id} item={item} />)}
                    </AnimatePresence>
                     {items.length === 0 && <p className="text-muted-foreground">All items moved to the lab!</p>}
                </div>

                <div className="flex-grow flex flex-col justify-between">
                    <DroppableArea id="lab-area" isOver={isOver} gameState={gameState}>
                        <div className="flex flex-wrap gap-4 justify-center items-center">
                            {droppedItems.length === 0 && (
                                <div className="text-center text-blue-700">
                                    <FlaskConical className="w-12 h-12 mx-auto" />
                                    <p className="font-semibold mt-2">Drag items here to experiment</p>
                                </div>
                            )}
                            {droppedItems.map(item => (
                                <motion.div key={item.id} layoutId={item.id} className="w-20 h-20 sm:w-24 sm:h-24 bg-white/80 rounded-lg shadow-md flex items-center justify-center p-2">
                                    <Image src={`https://picsum.photos/seed/${item.hint.replace(' ', '-')}/100/100`} width={100} height={100} alt={item.hint} data-ai-hint={item.hint} className="rounded-md object-contain" />
                                </motion.div>
                            ))}
                        </div>
                    </DroppableArea>
                     <AnimatePresence>
                        {droppedItems.length > 0 && gameState !== 'incorrect' && (
                            <motion.div
                                className="mt-4 text-center"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                            >
                                <Button onClick={checkAnswer}>
                                    Check Experiment <ArrowRight className="ml-2" />
                                </Button>
                            </motion.div>
                        )}
                        {gameState === 'incorrect' && (
                             <motion.div
                                className="mt-4 text-center"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                            >
                                <Button variant="destructive" onClick={resetGame}>
                                    <Repeat className="mr-2" />
                                    Try Again
                                </Button>
                            </motion.div>
                        )}
                     </AnimatePresence>
                </div>
            </Card>
        </DndContext>
    );
}

