"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, Star, ArrowRight, RefreshCcw, Droplet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface WuduStepsGuideProps {
  studentClass: string;
  studentId: string;
  subject: string;
}

interface WuduStep {
  id: number;
  title: string;
  urduTitle: string;
  description: string;
  icon: string;
  count: string;
}

const wuduStepsData: WuduStep[] = [
  {
    id: 1,
    title: "1. Niyyah & Bismillah",
    urduTitle: "بسم اللہ پڑھنا اور نیت کرنا",
    description: "Make the intention in your heart and say 'Bismillah-ir-Rahman-ir-Rahim'.",
    icon: "🤲",
    count: "Once"
  },
  {
    id: 2,
    title: "2. Wash Both Hands",
    urduTitle: "دونوں ہاتھ کلائیوں تک دھونا",
    description: "Wash both hands thoroughly up to the wrists, ensuring water reaches between fingers.",
    icon: "🧼",
    count: "3 Times"
  },
  {
    id: 3,
    title: "3. Rinse Mouth (Madmadah)",
    urduTitle: "کلی کرنا",
    description: "Take water into your mouth and rinse thoroughly.",
    icon: "👄",
    count: "3 Times"
  },
  {
    id: 4,
    title: "4. Rinse Nose (Istinshaq)",
    urduTitle: "ناک میں پانی ڈالنا",
    description: "Sniff water gently into your nostrils and blow it out softly.",
    icon: "👃",
    count: "3 Times"
  },
  {
    id: 5,
    title: "5. Wash Face",
    urduTitle: "چہرہ دھونا",
    description: "Wash your full face from the top of the forehead to chin, and ear to ear.",
    icon: "🧕",
    count: "3 Times"
  },
  {
    id: 6,
    title: "6. Wash Both Arms",
    urduTitle: "کہنیوں تک ہاتھ دھونا",
    description: "Wash your right arm first, then left arm up to and including the elbows.",
    icon: "💪",
    count: "3 Times"
  },
  {
    id: 7,
    title: "7. Masah of Head & Wash Feet",
    urduTitle: "مسح کرنا اور پاؤں دھونا",
    description: "Wipe wet hands over your head/ears, then wash right and left feet up to the ankles.",
    icon: "🦶",
    count: "3 Times"
  }
];

export default function WuduStepsGuide({ studentClass }: WuduStepsGuideProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { toast } = useToast();

  const currentStep = wuduStepsData[currentStepIndex];

  const handleStepComplete = () => {
    if (!completedSteps.includes(currentStep.id)) {
      setCompletedSteps(prev => [...prev, currentStep.id]);
    }

    if (currentStepIndex < wuduStepsData.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      toast({
        title: "MashAllah! Wudu Completed! ✨",
        description: "You have learned all steps of Wudu perfectly!",
      });
    }
  };

  const resetGuide = () => {
    setCurrentStepIndex(0);
    setCompletedSteps([]);
  };

  return (
    <Card className="border border-[#A8E6CF]/30 shadow-lg rounded-2xl bg-white overflow-hidden">
      <CardHeader className="bg-[#f8faf7] border-b border-[#bfc9c3]/30 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold font-headline text-[#2D3436] flex items-center gap-2">
              <Droplet className="w-6 h-6 text-[#2563eb]" />
              Interactive Wudu Learning Guide ({studentClass})
            </CardTitle>
            <span className="text-xs font-bold text-[#2c6956] bg-[#A8E6CF]/30 px-3 py-0.5 rounded-full inline-block mt-1">
              Topic: Step-by-Step Wudu Ritual (وضو کے فرائض)
            </span>
          </div>

          <div className="flex items-center gap-2 bg-[#FFF9C4] px-4 py-1.5 rounded-full border border-[#795836]/20">
            <Star className="w-4 h-4 fill-[#795836] text-[#795836]" />
            <span className="font-bold text-sm text-[#795836]">
              {completedSteps.length} / {wuduStepsData.length} Done
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Step Visual Card */}
        <div className="bg-gradient-to-br from-[#CAF0F8]/40 to-[#f8faf7] p-8 rounded-2xl border border-[#2563eb]/20 text-center space-y-4">
          <div className="w-24 h-24 rounded-2xl bg-white shadow-md flex items-center justify-center text-5xl mx-auto border-2 border-white">
            {currentStep.icon}
          </div>

          <div>
            <span className="text-xs font-extrabold text-[#2563eb] bg-white px-4 py-1 rounded-full shadow-sm inline-block mb-2">
              Step {currentStep.id} of {wuduStepsData.length} • Repeat {currentStep.count}
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-[#2D3436] font-headline">
              {currentStep.title}
            </h3>
            <h4 className="text-xl font-bold text-[#2c6956] font-urdu mt-1">
              {currentStep.urduTitle}
            </h4>
            <p className="text-sm md:text-base text-[#404945] font-body max-w-lg mx-auto mt-3 leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleStepComplete}
              className="bg-[#2c6956] hover:bg-[#1e4b3d] text-white font-bold rounded-xl px-8 py-3 squishy-btn"
            >
              {currentStepIndex < wuduStepsData.length - 1 ? (
                <>
                  Complete Step & Next <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Finish Wudu <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Step Progress Tracker Bar */}
        <div className="flex justify-between items-center gap-2 pt-2">
          {wuduStepsData.map((step, idx) => {
            const isCurrent = idx === currentStepIndex;
            const isDone = completedSteps.includes(step.id);

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStepIndex(idx)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 squishy-btn",
                  isCurrent
                    ? "bg-[#2c6956] text-white border-[#2c6956] shadow-md scale-105"
                    : isDone
                    ? "bg-[#A8E6CF]/40 text-[#2c6956] border-[#2c6956]/40"
                    : "bg-[#f2f4f1] text-[#636E72] border-[#bfc9c3]/30"
                )}
              >
                <span>{step.icon}</span>
                <span className="hidden sm:inline">Step {step.id}</span>
              </button>
            );
          })}
        </div>

        {completedSteps.length === wuduStepsData.length && (
          <div className="bg-[#FFF9C4] p-4 rounded-2xl border border-[#795836]/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-[#795836]">
              <Sparkles className="w-5 h-5" />
              Congratulations! You are a certified Wudu Master!
            </div>
            <Button onClick={resetGuide} variant="outline" size="sm" className="rounded-xl font-bold">
              <RefreshCcw className="w-3.5 h-3.5 mr-1" /> Practice Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
