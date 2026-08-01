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
        { topic: "Kindness & Help (نیکی اور مدد)", scenario: "You see a friend fall down on the playground. (دوست کھیل میں گر گیا)", options: ["Help them up with a smile (پیار سے اٹھائیں) 🤝", "Laugh at them ❌"], correct: 0, explanation: "Helping friends up with a smile is a Sunnah and a wonderful good deed!" },
        { topic: "Gratitude (شکر گزاری)", scenario: "Your teacher gives you a nice sticker. (استاد نے تحفہ دیا)", options: ["Say 'Thank You / JazakAllah!' (جزاک اللہ کہیں) 😊", "Take it without saying anything ❌"], correct: 0, explanation: "Saying 'JazakAllah Khair' (جزاک اللہ خیر) shows politeness and gratitude!" }
    ],
    Nursery: [
        { topic: "First Kalima & Faith (کلمہ طیبہ)", scenario: "What do Muslims recite to proclaim faith in Allah?", options: ["لَا إِلٰهَ إِلَّا اللهُ مُحَمَّدٌ رَّسُوْلُ اللهِ 🤲", "Just random words ❌"], correct: 0, explanation: "The First Kalima Tayyiba proclaims: 'There is no god but Allah, Muhammad (PBUH) is His Messenger'." },
        { topic: "Cleanliness (صفائی نصف ایمان ہے)", scenario: "You see empty paper wrappers on the classroom floor.", options: ["Pick them up and throw in the bin (کوڑے دان میں ڈالیں) 🗑️", "Leave them on the floor ❌"], correct: 0, explanation: "Prophet Muhammad (PBUH) said: 'النظافة من الإيمان' (Cleanliness is half of faith)!" }
    ],
    KG: [
        { topic: "Eating Etiquette (کھانے کے آداب)", scenario: "You sit down at the dinner table to eat your meal.", options: ["Say 'Bismillah' with right hand (بسم اللہ پڑھیں) 🤲", "Start eating with left hand without Bismillah ❌"], correct: 0, explanation: "Eating with your right hand and saying 'Bismillah' brings blessings (Barakah)!" },
        { topic: "Daily Duas (مسنون دعائیں)", scenario: "What should you say when waking up in the morning?", options: ["اَلْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا 🌅", "Don't say anything ❌"], correct: 0, explanation: "We thank Allah for giving us life and a new day to learn!" }
    ],
    'Class 1': [
        { topic: "5 Daily Prayers (پنجگانہ نمازیں)", scenario: "How many obligatory (Farz) prayers do Muslims offer each day?", options: ["5 Daily Prayers (فجر، ظہر، عصر، مغرب، عشاء) 🕌", "2 Prayers ❌"], correct: 0, explanation: "Namaz (Salah) is the second pillar of Islam and the light of a believer's heart!" },
        { topic: "Respecting Parents (والدین کی اطاعت)", scenario: "Your parents ask you to clean your room.", options: ["Say 'Yes' happily and help (جی امی/ابو!) 🧹", "Say 'No' or make excuses ❌"], correct: 0, explanation: "Quran teaches us: 'Do not even say Uff (اخ) to parents'. Respecting parents earns Jannah!" }
    ],
    'Class 2': [
        { topic: "Stories of Prophets (قصص الأنبياء)", scenario: "Which Prophet built the Holy Kaaba in Makkah with his son Isma'il (A.S.)?", options: ["Hazrat Ibrahim (A.S.) (حضرت ابراہیم علیہ السلام) 🕋", "Hazrat Nuh (A.S.) ❌"], correct: 0, explanation: "Hazrat Ibrahim (A.S.) built the Kaaba and taught us devotion to Allah!" },
        { topic: "Honesty & Al-Amin (الصادق والامین)", scenario: "What title did the people of Makkah give to Prophet Muhammad (PBUH) before Prophethood?", options: ["Al-Sadiq & Al-Amin (The Truthful & Trustworthy) 📜", "The Emperor ❌"], correct: 0, explanation: "Our Beloved Prophet (PBUH) was always honest and trustworthy!" }
    ],
    'Class 3': [
        { topic: "5 Pillars of Islam (ارکانِ اسلام)", scenario: "Which pillar of Islam involves giving charity to the poor and needy?", options: ["Zakat (زکوٰۃ) 🪙", "Hajj ❌"], correct: 0, explanation: "Zakat purifies wealth and helps the poor in our community!" },
        { topic: "Good Manners & Adab (حسنِ اخلاق)", scenario: "Prophet Muhammad (PBUH) said: 'The best among you are those who have the best...'", options: ["Manners & Character (خلاقیات و اخلاق) 💖", "Wealth ❌"], correct: 0, explanation: "Hadith: 'خِيَارُكُمْ أَحْسَنُكُمْ أَخْلاَقًا' - The best of believers possess noble character!" }
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
                        let btnClass = "bg-[#ffffff] border-[#bfc9c3]/40 text-[#2D3436] hover:bg-[#f8faf7]";

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
