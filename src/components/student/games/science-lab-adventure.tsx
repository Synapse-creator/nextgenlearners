"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, FlaskConical, Lightbulb, Repeat, ArrowRight, Star, Sparkles, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ScienceLabAdventureProps {
  studentClass: string;
  studentId: string;
  subject: string;
}

interface QuestionRound {
  topic: string;
  question: string;
  explanation: string;
  options: { id: string; text: string; icon: string; isCorrect: boolean }[];
}

const classScienceData: Record<string, QuestionRound[]> = {
  PG: [
    {
      topic: "Living Things",
      question: "Which one of these is a LIVING thing that grows?",
      explanation: "Puppies grow, breathe, and play because they are living things!",
      options: [
        { id: "puppy", text: "Cute Puppy 🐶", icon: "🐶", isCorrect: true },
        { id: "toy-block", text: "Plastic Block 🧱", icon: "🧱", isCorrect: false },
        { id: "spoon", text: "Metal Spoon 🥄", icon: "🥄", isCorrect: false }
      ]
    },
    {
      topic: "Colors & Light",
      question: "What shines brightly in the sky during the day?",
      explanation: "The Sun gives us bright light and warmth every day!",
      options: [
        { id: "sun", text: "Bright Sun ☀️", icon: "☀️", isCorrect: true },
        { id: "moon", text: "Night Moon 🌙", icon: "🌙", isCorrect: false },
        { id: "cloud", text: "Rain Cloud 🌧️", icon: "🌧️", isCorrect: false }
      ]
    }
  ],
  Nursery: [
    {
      topic: "Animal Habitats",
      question: "Where does a fish live happily?",
      explanation: "Fish have gills that let them breathe under water!",
      options: [
        { id: "water", text: "Deep Blue Ocean 🌊", icon: "🌊", isCorrect: true },
        { id: "tree", text: "High Tree Branch 🌳", icon: "🌳", isCorrect: false },
        { id: "nest", text: "Bird Nest 🪹", icon: "🪹", isCorrect: false }
      ]
    },
    {
      topic: "Five Senses",
      question: "Which organ do we use to listen to music?",
      explanation: "Our ears catch sound vibrations so we can hear songs!",
      options: [
        { id: "ears", text: "Ears 👂", icon: "👂", isCorrect: true },
        { id: "eyes", text: "Eyes 👀", icon: "👀", isCorrect: false },
        { id: "nose", text: "Nose 👃", icon: "👃", isCorrect: false }
      ]
    }
  ],
  KG: [
    {
      topic: "Sink or Float",
      question: "Which of these will FLOAT on top of water?",
      explanation: "Light dry leaves trap air so they float effortlessly on water!",
      options: [
        { id: "leaf", text: "Green Leaf 🍃", icon: "🍃", isCorrect: true },
        { id: "stone", text: "Heavy Stone 🪨", icon: "🪨", isCorrect: false },
        { id: "coin", text: "Metal Coin 🪙", icon: "🪙", isCorrect: false }
      ]
    },
    {
      topic: "Plant Life",
      question: "What part of the plant absorbs water from the soil?",
      explanation: "Roots anchor the plant underground and suck up nutrients and water!",
      options: [
        { id: "roots", text: "Roots 🪴", icon: "🪴", isCorrect: true },
        { id: "flower", text: "Petal Flower 🌸", icon: "🌸", isCorrect: false },
        { id: "leaf", text: "Green Leaf 🍃", icon: "🍃", isCorrect: false }
      ]
    }
  ],
  'Class 1': [
    {
      topic: "States of Matter",
      question: "What happens to liquid water when it gets VERY cold in a freezer?",
      explanation: "Water freezes into solid ice when cooled below 0°C!",
      options: [
        { id: "ice", text: "It becomes solid Ice 🧊", icon: "🧊", isCorrect: true },
        { id: "steam", text: "It becomes hot Steam ♨️", icon: "♨️", isCorrect: false },
        { id: "juice", text: "It turns into Juice 🧃", icon: "🧃", isCorrect: false }
      ]
    },
    {
      topic: "Plant Growth",
      question: "What two essential things do green plants need for photosynthesis?",
      explanation: "Plants convert Sunlight and Water into energy to grow healthy!",
      options: [
        { id: "sun-water", text: "Sunlight & Water ☀️💧", icon: "☀️💧", isCorrect: true },
        { id: "candy-milk", text: "Candy & Milk 🍬🥛", icon: "🍬🥛", isCorrect: false },
        { id: "wind-rock", text: "Strong Wind & Rocks 💨🪨", icon: "💨🪨", isCorrect: false }
      ]
    }
  ],
  'Class 2': [
    {
      topic: "Water Cycle",
      question: "What is it called when water turns into gas and rises into clouds?",
      explanation: "Evaporation occurs when heat warms water, turning liquid into water vapor!",
      options: [
        { id: "evap", text: "Evaporation ☁️", icon: "☁️", isCorrect: true },
        { id: "freezing", text: "Freezing 🧊", icon: "🧊", isCorrect: false },
        { id: "melting", text: "Melting 🫠", icon: "🫠", isCorrect: false }
      ]
    },
    {
      topic: "Simple Machines",
      question: "Which simple machine helps lift heavy loads using a wheel and rope?",
      explanation: "A Pulley uses a wheel and rope to lift heavy objects easily!",
      options: [
        { id: "pulley", text: "Pulley 🛞", icon: "🛞", isCorrect: true },
        { id: "ramp", text: "Inclined Ramp 📐", icon: "📐", isCorrect: false },
        { id: "screw", text: "Metal Screw 🔩", icon: "🔩", isCorrect: false }
      ]
    }
  ],
  'Class 3': [
    {
      topic: "Magnetism",
      question: "Which two magnet poles ATTRACT each other?",
      explanation: "Opposite poles (North and South) pull together and attract!",
      options: [
        { id: "opp", text: "North & South Poles (Opposites) 🧲", icon: "🧲", isCorrect: true },
        { id: "same", text: "North & North Poles (Same) ❌", icon: "❌", isCorrect: false },
        { id: "south-south", text: "South & South Poles (Same) ❌", icon: "❌", isCorrect: false }
      ]
    },
    {
      topic: "Food Chain & Ecosystem",
      question: "What is the primary source of energy for all producers (plants) in a food chain?",
      explanation: "The Sun provides light energy that plants use to make food for all living things!",
      options: [
        { id: "sun", text: "The Sun ☀️", icon: "☀️", isCorrect: true },
        { id: "moon", text: "The Moon 🌙", icon: "🌙", isCorrect: false },
        { id: "fire", text: "Camp Fire 🔥", icon: "🔥", isCorrect: false }
      ]
    }
  ]
};

export default function ScienceLabAdventure({ studentClass }: ScienceLabAdventureProps) {
  const rounds = classScienceData[studentClass] || classScienceData['Class 1'];
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const { toast } = useToast();

  const currentRound = rounds[currentRoundIndex % rounds.length];

  const handleSelectOption = (option: { id: string; text: string; isCorrect: boolean }) => {
    if (isAnswered) return;

    setSelectedOptionId(option.id);
    setIsAnswered(true);
    setShowExplanation(true);

    if (option.isCorrect) {
      setScore(prev => prev + 10);
      toast({
        title: "Correct Answer! 🔬✨",
        description: "Great discovery, Young Scientist!",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Nice try! Read the lab secret below!",
      });
    }
  };

  const handleNextRound = () => {
    setIsAnswered(false);
    setSelectedOptionId(null);
    setShowExplanation(false);
    setCurrentRoundIndex(prev => prev + 1);
  };

  return (
    <Card className="border border-[#A8E6CF]/30 shadow-lg rounded-2xl bg-white overflow-hidden">
      <CardHeader className="bg-[#f8faf7] border-b border-[#bfc9c3]/30 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold font-headline text-[#2D3436] flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-[#2c6956]" />
              Science Lab Adventure ({studentClass})
            </CardTitle>
            <span className="text-xs font-bold text-[#2c6956] bg-[#A8E6CF]/30 px-3 py-1 rounded-full inline-block mt-1">
              Topic: {currentRound.topic}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-[#FFF9C4] px-4 py-1.5 rounded-full border border-[#795836]/20">
            <Star className="w-4 h-4 fill-[#795836] text-[#795836]" />
            <span className="font-bold text-sm text-[#795836]">Score: {score}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Question Header */}
        <div className="bg-[#f2f4f1] p-6 rounded-2xl border border-[#bfc9c3]/30 text-center">
          <span className="text-xs font-bold text-[#636E72] uppercase tracking-wider block mb-2">
            Lab Experiment #{currentRoundIndex + 1}
          </span>
          <h3 className="text-lg md:text-2xl font-bold text-[#2D3436] font-headline leading-snug">
            {currentRound.question}
          </h3>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentRound.options.map(opt => {
            const isSelected = selectedOptionId === opt.id;
            let btnClass = "bg-white border-[#bfc9c3]/40 text-[#2D3436] hover:bg-[#f8faf7]";

            if (isAnswered) {
              if (opt.isCorrect) {
                btnClass = "bg-[#A8E6CF]/40 border-[#2c6956] text-[#2c6956] font-extrabold shadow-md";
              } else if (isSelected) {
                btnClass = "bg-[#ffdad6] border-[#ba1a1a] text-[#ba1a1a]";
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt)}
                disabled={isAnswered}
                className={cn(
                  "p-5 rounded-2xl border-2 text-left transition-all duration-200 squishy-btn flex flex-col items-center text-center gap-3",
                  btnClass
                )}
              >
                <span className="text-4xl">{opt.icon}</span>
                <span className="font-bold text-sm md:text-base">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {/* Educational Explanation Box */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-[#CAF0F8]/30 p-5 rounded-2xl border border-[#2563eb]/20 space-y-3"
            >
              <div className="flex items-center gap-2 text-[#2563eb] font-bold text-sm">
                <Lightbulb className="w-5 h-5" />
                Scientific Insight:
              </div>
              <p className="text-sm text-[#2D3436] font-body leading-relaxed">
                {currentRound.explanation}
              </p>
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleNextRound}
                  className="bg-[#2c6956] hover:bg-[#1e4b3d] text-white font-bold rounded-xl px-6 squishy-btn"
                >
                  Next Discovery <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
