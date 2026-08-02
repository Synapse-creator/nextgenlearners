"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Star, Sparkles, BookOpen, Volume2, Trophy, ArrowRight, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface UrduCurriculumGameProps {
  studentClass: string;
  studentId: string;
  subject: string;
}

// Curriculum Data per Class
const urduClassContent: Record<string, {
  gameTitle: string;
  topicName: string;
  description: string;
  rounds: {
    prompt: string;
    englishPrompt: string;
    options: { id: string; text: string; isCorrect: boolean; detail?: string }[];
    explanation: string;
  }[];
}> = {
  PG: {
    gameTitle: "حروف کی پہچان اور تصویری کھیل",
    topicName: "حروفِ تہجی اور آوازیں (Alphabet & Sounds)",
    description: "تصویر کو دیکھیں اور صحیح حرفِ تہجی کا انتخاب کریں!",
    rounds: [
      {
        prompt: "تصویر میں '🍎 انار' ہے۔ یہ کس حرف سے شروع ہوتا ہے؟",
        englishPrompt: "Anar (Pomegranate) starts with which letter?",
        options: [
          { id: "alif", text: "ا (الف)", isCorrect: true, detail: "ا سے انار 🍎" },
          { id: "bay", text: "ب (بے)", isCorrect: false, detail: "ب سے بلی 🐱" },
          { id: "pay", text: "پ (پے)", isCorrect: false, detail: "پ سے پودا 🍃" },
        ],
        explanation: "شاباش! 'ا' سے انار ہوتا ہے! (Alif is for Anar) 🍎"
      },
      {
        prompt: "تصویر میں '🐱 بلی' ہے۔ یہ کس حرف سے شروع ہوتا ہے؟",
        englishPrompt: "Billi (Cat) starts with which letter?",
        options: [
          { id: "bay", text: "ب (بے)", isCorrect: true, detail: "ب سے بلی 🐱" },
          { id: "tay", text: "ت (تے)", isCorrect: false, detail: "ت سے تتلی 🦋" },
          { id: "jeem", text: "ج (جیم)", isCorrect: false, detail: "ج سے جہاز ✈️" },
        ],
        explanation: "بہت خوب! 'ب' سے بلی ہوتی ہے! (Bay is for Billi) 🐱"
      },
      {
        prompt: "تصویر میں '🦋 تتلی' ہے۔ یہ کس حرف سے شروع ہوتا ہے؟",
        englishPrompt: "Titli (Butterfly) starts with which letter?",
        options: [
          { id: "tay", text: "ت (تے)", isCorrect: true, detail: "ت سے تتلی 🦋" },
          { id: "pay", text: "پ (پے)", isCorrect: false, detail: "پ سے پتنگ 🪁" },
          { id: "sein", text: "س (سین)", isCorrect: false, detail: "س سے سورج ☀️" },
        ],
        explanation: "شاباش! 'ت' سے تتلی ہوتی ہے! (Tay is for Titli) 🦋"
      }
    ]
  },
  Nursery: {
    gameTitle: "دو حرفی الفاظ کی تخلیق",
    topicName: "دو حرفی الفاظ اور آوازیں (2-Letter Word Building)",
    description: "حروف کو جوڑ کر صحیح دو حرفی لفظ بنائیں!",
    rounds: [
      {
        prompt: "حرف 'ا' اور 'ب' مل کر کیا لفظ بناتے ہیں؟ (ا + ب = ?)",
        englishPrompt: "What 2-letter word is formed by joining Alif + Bay?",
        options: [
          { id: "ab", text: "اب (Ab - Now)", isCorrect: true },
          { id: "rab", text: "رب (Rab)", isCorrect: false },
          { id: "din", text: "دن (Din)", isCorrect: false },
        ],
        explanation: "زبردست! ا + ب = 'اب' (Now) بنتا ہے! 👏"
      },
      {
        prompt: "حرف 'ر' اور 'ب' مل کر کیا لفظ بناتے ہیں؟ (ر + ب = ?)",
        englishPrompt: "What word is formed by joining Ray + Bay?",
        options: [
          { id: "rab", text: "رب (Rab - Lord)", isCorrect: true },
          { id: "sach", text: "سچ (Sach)", isCorrect: false },
          { id: "tum", text: "تم (Tum)", isCorrect: false },
        ],
        explanation: "ماشاءاللہ! ر + ب = 'رب' (Lord) بنتا ہے! 🌟"
      },
      {
        prompt: "حرف 'س' اور 'چ' مل کر کیا لفظ بناتے ہیں؟ (س + چ = ?)",
        englishPrompt: "What word is formed by joining Sein + Chey?",
        options: [
          { id: "sach", text: "سچ (Sach - Truth)", isCorrect: true },
          { id: "khat", text: "خط (Khat)", isCorrect: false },
          { id: "dil", text: "دل (Dil)", isCorrect: false },
        ],
        explanation: "شاباش! س + چ = 'سچ' (Truth) بنتا ہے! ہمیشہ سچ بولیں! ✨"
      }
    ]
  },
  KG: {
    gameTitle: "تین حرفی الفاظ اور اردو گنتی",
    topicName: "الفاظ سازی اور گنتی (3-Letter Words & Urdu Numbers)",
    description: "صحیح لفظ اور اردو گنتی کا انتخاب کریں!",
    rounds: [
      {
        prompt: "اردو گنتی میں عدد '3' کو کیا کہتے ہیں؟",
        englishPrompt: "How do we write number 3 in Urdu words?",
        options: [
          { id: "teen", text: "تین (Teen - 3)", isCorrect: true },
          { id: "ek", text: "ایک (Ek - 1)", isCorrect: false },
          { id: "do", text: "دو (Do - 2)", isCorrect: false },
        ],
        explanation: "بہت خوب! 3 کو اردو میں 'تین' کہتے ہیں! 🔢"
      },
      {
        prompt: "خالی جگہ پر کریں: 'س _ ج' (آسمان میں چمکتا ہے ☀️)",
        englishPrompt: "Fill in the missing letter for Sooraj (Sun): S _ J",
        options: [
          { id: "waw", text: "و (سورج - Sun)", isCorrect: true },
          { id: "alif", text: "ا (سارج)", isCorrect: false },
          { id: "bay", text: "ب (سبج)", isCorrect: false },
        ],
        explanation: "زبردست! س + و + ر + ج = 'سورج' (Sun)! ☀️"
      },
      {
        prompt: "خالی جگہ پر کریں: 'ک _ ا' (وفادار جانور 🐶)",
        englishPrompt: "Fill in the missing letter for Kutta (Dog): K _ A",
        options: [
          { id: "tay", text: "ت (کتا - Dog)", isCorrect: true },
          { id: "seen", text: "س (کسا)", isCorrect: false },
          { id: "jeem", text: "ج (کجا)", isCorrect: false },
        ],
        explanation: "شاباش! ک + ت + ا = 'کتا' (Dog)! 🐶"
      }
    ]
  },
  'Class 1': {
    gameTitle: "الفاظ متضاد اور مذکر مؤنث لیب",
    topicName: "الفاظ متضاد و جنس (Opposites & Gender Pairs)",
    description: "صحیح متضاد (الٹ) اور مذکر مؤنث کا جوڑا ملائیں!",
    rounds: [
      {
        prompt: "لفظ 'دن' کا متضاد (الٹ) کیا ہے؟",
        englishPrompt: "What is the opposite of 'Din' (Day)?",
        options: [
          { id: "raat", text: "رات (Raat - Night)", isCorrect: true },
          { id: "sooraj", text: "سورج (Sun)", isCorrect: false },
          { id: "subah", text: "صبح (Morning)", isCorrect: false },
        ],
        explanation: "شاباش! 'دن' کا متضاد 'رات' ہے! (Day ↔ Night) 🌙"
      },
      {
        prompt: "لفظ 'لڑکا' (مذکر) کا مؤنث کیا ہے؟",
        englishPrompt: "What is the feminine (مؤنث) form of 'Larka' (Boy)?",
        options: [
          { id: "larki", text: "لڑکی (Larki - Girl)", isCorrect: true },
          { id: "ammi", text: "امی (Mother)", isCorrect: false },
          { id: "baji", text: "باجی (Sister)", isCorrect: false },
        ],
        explanation: "بہت خوب! 'لڑکا' کا مؤنث 'لڑکی' ہے! 👧"
      },
      {
        prompt: "لفظ 'گرم' کا متضاد (الٹ) کیا ہے؟",
        englishPrompt: "What is the opposite of 'Garam' (Hot)?",
        options: [
          { id: "thanda", text: "ٹھنڈا (Thanda - Cold)", isCorrect: true },
          { id: "meetha", text: "میٹھا (Sweet)", isCorrect: false },
          { id: "aag", text: "آگ (Fire)", isCorrect: false },
        ],
        explanation: "ماشاءاللہ! 'گرم' کا متضاد 'ٹھنڈا' ہے! 🧊"
      }
    ]
  },
  'Class 2': {
    gameTitle: "واحد جمع اور قواعدِ زبان",
    topicName: "واحد / جمع اور اسم، فعل، صفت (Plurals & Parts of Speech)",
    description: "واحد کی جمع اور قواعد کی اقسام پہچانیں!",
    rounds: [
      {
        prompt: "لفظ 'کتاب' (واحد) کی جمع کیا ہے؟",
        englishPrompt: "What is the plural (جمع) of 'Kitaab' (Book)?",
        options: [
          { id: "kutub", text: "کتب / کتابیں (Kutub / Kitaabain)", isCorrect: true },
          { id: "kaaghaz", text: "کاغذ (Paper)", isCorrect: false },
          { id: "qalam", text: "قلم (Pen)", isCorrect: false },
        ],
        explanation: "شاباش! 'کتاب' کی جمع 'کتابیں / کتب' ہے! 📚"
      },
      {
        prompt: "جملے میں لفظ 'دوڑنا' قواعد کی لحاظ سے کیا ہے؟ ('احمد تیز دوڑتا ہے')",
        englishPrompt: "What part of speech is 'Daurna' (Running)?",
        options: [
          { id: "feal", text: "فعل (Verb - Action)", isCorrect: true },
          { id: "ism", text: "اسم (Noun)", isCorrect: false },
          { id: "sifat", text: "صفت (Adjective)", isCorrect: false },
        ],
        explanation: "بہت خوب! کام یا عمل کو قواعد میں 'فعل' (Verb) کہتے ہیں! 🏃"
      },
      {
        prompt: "لفظ 'خوبصورت' قواعد کی رو سے کیا ہے؟ ('خوبصورت پھول')",
        englishPrompt: "What part of speech is 'Khoobsurat' (Beautiful)?",
        options: [
          { id: "sifat", text: "صفت (Adjective - Quality)", isCorrect: true },
          { id: "ism", text: "اسم (Noun)", isCorrect: false },
          { id: "feal", text: "فعل (Verb)", isCorrect: false },
        ],
        explanation: "ماشاءاللہ! کسی چیز کی خوبی یا خامی بتانے والے لفظ کو 'صفت' (Adjective) کہتے ہیں! 🌸"
      }
    ]
  },
  'Class 3': {
    gameTitle: "اردو ادب، مترادفات اور محاورے",
    topicName: "مترادفات و محاورات (Synonyms & Urdu Idioms)",
    description: "مترادف الفاظ اور مشہور محاوروں کے معنی تلاش کریں!",
    rounds: [
      {
        prompt: "لفظ 'آفتاب' کا مترادف (ہم معنی) لفظ کیا ہے؟",
        englishPrompt: "What is the synonym (ہم معنی) of 'Aftab'?",
        options: [
          { id: "sooraj", text: "سورج (Sun)", isCorrect: true },
          { id: "chand", text: "چاند (Moon)", isCorrect: false },
          { id: "taara", text: "تارا (Star)", isCorrect: false },
        ],
        explanation: "شاباش! 'آفتاب' اور 'سورج' دونوں کا مطلب ایک ہی ہے! ☀️"
      },
      {
        prompt: "محاورہ 'نو دو گیارہ ہونا' کا کیا مطلب ہے؟",
        englishPrompt: "What does the idiom 'Nau Do Gyarah Hona' mean?",
        options: [
          { id: "bhaag", text: "بھاگ جانا (To run away quickly)", isCorrect: true },
          { id: "ginna", text: "گنتی گننا (Counting)", isCorrect: false },
          { id: "sona", text: "سو جانا (Sleeping)", isCorrect: false },
        ],
        explanation: "بہت خوب! 'نو دو گیارہ ہونا' کا مطلب 'تیزی سے بھاگ جانا' ہے! 🏃‍♂️💨"
      },
      {
        prompt: "محاورہ 'آنکھوں کا تارا ہونا' کا کیا مطلب ہے؟",
        englishPrompt: "What does the idiom 'Aankhon ka Taara hona' mean?",
        options: [
          { id: "pyara", text: "بہت پیارا اور عزیز ہونا (Very beloved)", isCorrect: true },
          { id: "aasmaan", text: "آسمان دیکھنا (Looking at sky)", isCorrect: false },
          { id: "andhera", text: "اندھیرا ہونا (Darkness)", isCorrect: false },
        ],
        explanation: "ماشاءاللہ! 'آنکھوں کا تارا ہونا' کا مطلب 'بہت پیارا ہونا' ہے! ⭐💖"
      }
    ]
  }
};

export default function UrduCurriculumGame({ studentClass }: UrduCurriculumGameProps) {
  const content = urduClassContent[studentClass] || urduClassContent["Class 1"];
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const { toast } = useToast();

  const currentRound = content.rounds[currentRoundIdx % content.rounds.length];

  const playVoiceAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ur-PK';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelectOption = (opt: { id: string; text: string; isCorrect: boolean }) => {
    if (isAnswered) return;
    setSelectedOptionId(opt.id);
    setIsAnswered(true);

    if (opt.isCorrect) {
      setScore(prev => prev + 10);
      toast({
        title: "بہت خوب! (Correct!) 🌟",
        description: currentRound.explanation,
      });
      playVoiceAudio(opt.text);
    } else {
      toast({
        variant: "destructive",
        title: "دوبارہ کوشش کریں! (Try Again)",
        description: "شاباش! سبق سیکھ کر اگلا سوال حل کریں!",
      });
    }
  };

  const handleNextRound = () => {
    setIsAnswered(false);
    setSelectedOptionId(null);
    setCurrentRoundIdx(prev => prev + 1);
  };

  return (
    <Card className="border border-[#A8E6CF]/30 shadow-lg rounded-2xl bg-white overflow-hidden">
      <CardHeader className="bg-[#f8faf7] border-b border-[#bfc9c3]/30 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold font-urdu text-[#2D3436] flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#2c6956]" />
              {content.gameTitle} ({studentClass})
            </CardTitle>
            <span className="text-xs font-bold text-[#2c6956] bg-[#A8E6CF]/30 px-3 py-0.5 rounded-full inline-block mt-1">
              نصاب: {content.topicName}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-[#FFF9C4] px-4 py-1.5 rounded-full border border-[#795836]/20">
            <Star className="w-4 h-4 fill-[#795836] text-[#795836]" />
            <span className="font-bold text-sm text-[#795836]">اسکور: {score}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Question Header Card */}
        <div className="bg-gradient-to-br from-[#f2f4f1] to-[#f8faf7] p-8 rounded-2xl border border-[#bfc9c3]/40 text-center space-y-3 shadow-inner">
          <span className="text-xs font-extrabold text-[#2c6956] uppercase tracking-wider block">
            سوال #{currentRoundIdx + 1}
          </span>
          <h3 className="text-2xl md:text-4xl font-extrabold text-[#2D3436] font-urdu leading-relaxed">
            "{currentRound.prompt}"
          </h3>
          <p className="text-xs md:text-sm text-[#636E72] font-body italic">
            ({currentRound.englishPrompt})
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentRound.options.map(opt => {
            const isSelected = selectedOptionId === opt.id;
            let btnClass = "bg-white border-[#bfc9c3]/40 text-[#2D3436] hover:bg-[#f8faf7]";

            if (isAnswered) {
              if (opt.isCorrect) {
                btnClass = "bg-[#A8E6CF]/50 border-[#2c6956] text-[#2c6956] font-extrabold shadow-md scale-105";
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
                  "p-6 rounded-2xl border-2 text-center transition-all duration-200 squishy-btn flex flex-col items-center justify-center gap-2",
                  btnClass
                )}
              >
                <span className="text-xl md:text-2xl font-bold font-urdu">{opt.text}</span>
                {opt.detail && <span className="text-xs font-semibold text-[#636E72]">{opt.detail}</span>}
              </button>
            );
          })}
        </div>

        {/* Lesson Feedback Box */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-[#FFF9C4]/40 p-5 rounded-2xl border border-[#795836]/20 space-y-3"
            >
              <div className="flex items-center gap-2 text-[#795836] font-bold text-sm">
                <Sparkles className="w-5 h-5" />
                تعلیمی سبق (Educational Insight):
              </div>
              <p className="text-base text-[#2D3436] font-urdu leading-relaxed">
                {currentRound.explanation}
              </p>
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleNextRound}
                  className="bg-[#2c6956] hover:bg-[#1e4b3d] text-white font-bold rounded-xl px-6 squishy-btn"
                >
                  اگلا سوال <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
