
"use client";

import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Repeat, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const wuduSteps = [
    { id: 1, text: "Make Niyyah (Intention)", hint: "thinking praying" },
    { id: 2, text: "Say Bismillah", hint: "open hands praying" },
    { id: 3, text: "Wash Hands (3 times)", hint: "washing hands" },
    { id: 4, text: "Rinse Mouth (3 times)", hint: "rinsing mouth" },
    { id: 5, text: "Sniff Water into Nose (3 times)", hint: "washing nose" },
    { id: 6, text: "Wash Face (3 times)", hint: "washing face child" },
    { id: 7, text: "Wash Arms to Elbows (3 times)", hint: "washing arms" },
    { id: 8, text: "Wipe Head (1 time)", hint: "wiping head" },
    { id: 9, text: "Wipe Ears (1 time)", hint: "wiping ears" },
    { id: 10, text: "Wash Feet (3 times)", hint: "washing feet" },
];

const shuffleArray = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

const SortableItem = ({ item }: { item: { id: number; text: string; hint: string } }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-3 bg-white rounded-lg shadow-md flex items-center gap-3 cursor-grab active:cursor-grabbing">
            <Image src={`https://picsum.photos/seed/${item.hint.replace(/ /g, '-')}/50/50`} alt={item.text} width={40} height={40} className="rounded-md" data-ai-hint={item.hint} />
            <span className="font-medium text-sm sm:text-base">{item.text}</span>
        </div>
    );
};

export default function WuduGamePage() {
    const [shuffledItems, setShuffledItems] = useState(shuffleArray(wuduSteps));
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setShuffledItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const checkOrder = () => {
        const isOrderCorrect = shuffledItems.every((item, index) => item.id === index + 1);
        setIsCorrect(isOrderCorrect);
    };
    
    const resetGame = () => {
        setShuffledItems(shuffleArray(wuduSteps));
        setIsCorrect(null);
    }
    
    if (!isClient) {
        return null; // Don't render on the server to avoid hydration mismatch
    }

    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
             <Link href="/" className="absolute top-4 left-4">
                <Button variant="outline">Back to Home</Button>
            </Link>
            <Card className="w-full max-w-md mx-auto shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold font-headline text-blue-800">Wudu Steps Challenge</CardTitle>
                    <CardDescription>Drag and drop the steps into the correct order to learn how to make Wudu!</CardDescription>
                </CardHeader>
                <CardContent>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={shuffledItems}>
                            <div className="space-y-2">
                                {shuffledItems.map(item => (
                                    <SortableItem key={item.id} item={item} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                    
                    <AnimatePresence>
                    {isCorrect !== null && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={cn("mt-4 p-4 rounded-lg text-center font-bold", isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}
                        >
                            {isCorrect ? "Masha'Allah, that's perfect!" : "Not quite, try again!"}
                        </motion.div>
                    )}
                    </AnimatePresence>
                </CardContent>
                <CardContent>
                     {isCorrect === true ? (
                        <Button onClick={resetGame} className="w-full btn-bounce">
                           <Repeat className="mr-2"/> Play Again
                        </Button>
                    ) : (
                        <Button onClick={checkOrder} className="w-full btn-bounce">
                            <Check className="mr-2"/> Check My Order
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
