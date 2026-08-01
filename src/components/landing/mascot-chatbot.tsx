"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { CornerDownLeft, Loader2, MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { answerParentQuestion } from '@/ai/flows/answer-parent-questions-flow';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
}

export default function MascotChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hi there! I'm Leo, the NextGen Learners mascot. 🦁 How can I help you today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && scrollAreaRef.current) {
            setTimeout(() => {
                const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
                if (viewport) {
                    viewport.scrollTop = viewport.scrollHeight;
                }
            }, 100);
        }
    }, [messages, isOpen]);
    
    const handleSendMessage = async () => {
        if (input.trim() === '' || isLoading) return;

        const newUserMessage: Message = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await answerParentQuestion({ question: input });
            const newBotMessage: Message = { id: Date.now() + 1, text: result.answer, sender: 'bot' };
            setMessages(prev => [...prev, newBotMessage]);
        } catch (error) {
            const errorMessage: Message = { id: Date.now() + 1, text: "Oops! I'm having a little trouble thinking right now. Please try asking again in a moment.", sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <motion.div 
                className="fixed bottom-5 right-5 z-50"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
            >
                <Button onClick={() => setIsOpen(!isOpen)} className="rounded-full w-16 h-16 shadow-lg btn-bounce" aria-label="Toggle chatbot">
                     <AnimatePresence>
                        {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
                    </AnimatePresence>
                </Button>
            </motion.div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-5 z-50 w-[calc(100vw-40px)] sm:w-96 h-[60vh] sm:h-[70vh] max-h-[600px] bg-card rounded-xl shadow-2xl border flex flex-col"
                    >
                        <header className="flex items-center gap-3 p-4 border-b">
                            <Image src="/logo.png" alt="Mascot" width={40} height={40} className="rounded-full" />
                            <div>
                                <h3 className="font-bold font-headline">Leo the Lion</h3>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Online
                                </p>
                            </div>
                        </header>
                        <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
                            <div className="space-y-4">
                                {messages.map(message => (
                                    <div key={message.id} className={cn("flex gap-2", message.sender === 'user' ? 'justify-end' : 'justify-start')}>
                                        {message.sender === 'bot' && <Image src="/logo.png" alt="Mascot" width={32} height={32} className="w-8 h-8 rounded-full self-end" />}
                                        <div className={cn("max-w-[80%] rounded-xl px-4 py-2 text-sm", 
                                            message.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary rounded-bl-none'
                                        )}>
                                            {message.text}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                     <div className="flex gap-2 justify-start">
                                         <Image src="/logo.png" alt="Mascot" width={32} height={32} className="w-8 h-8 rounded-full self-end" />
                                         <div className="max-w-[80%] rounded-xl px-4 py-2 text-sm bg-secondary rounded-bl-none flex items-center">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                         </div>
                                     </div>
                                )}
                            </div>
                        </ScrollArea>
                        <footer className="p-4 border-t">
                             <div className="relative">
                                <Textarea 
                                    placeholder="Ask a question..." 
                                    className="pr-12"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                />
                                <Button size="icon" className="absolute bottom-2 right-2 h-8 w-8" onClick={handleSendMessage} disabled={isLoading}>
                                    <CornerDownLeft className="w-4 h-4" />
                                </Button>
                             </div>
                        </footer>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
