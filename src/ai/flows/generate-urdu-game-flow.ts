'use server';

import { askGroq } from '@/ai/groq';

export type UrduGameQuestion = {
  prompt: string;
  englishPrompt: string;
  options: { id: string; text: string; isCorrect: boolean; detail?: string }[];
  explanation: string;
};

export type GenerateUrduGameOutput = {
  gameTitle: string;
  topicName: string;
  questions: UrduGameQuestion[];
};

export async function generateUrduGame(studentClass: string, topic?: string): Promise<GenerateUrduGameOutput> {
  try {
    const systemPrompt = `You are an expert Urdu primary school curriculum designer for Pakistan LMS. Generate 3 age-appropriate dynamic Urdu learning questions for grade ${studentClass} on topic "${topic || 'Urdu Syllabus'}".
Return JSON format:
{
  "gameTitle": "Urdu Game Title in Urdu",
  "topicName": "Topic Name",
  "questions": [
    {
      "prompt": "Question in Urdu text",
      "englishPrompt": "English translation or hint",
      "options": [
        {"id": "a", "text": "Option 1 (Urdu)", "isCorrect": true, "detail": "Optional hint"},
        {"id": "b", "text": "Option 2 (Urdu)", "isCorrect": false},
        {"id": "c", "text": "Option 3 (Urdu)", "isCorrect": false}
      ],
      "explanation": "Urdu educational explanation"
    }
  ]
}`;

    const userPrompt = `Grade: ${studentClass}\nTopic: ${topic || 'Urdu Language & Literature'}`;
    const rawJson = await askGroq(systemPrompt, userPrompt, true);
    const parsed = JSON.parse(rawJson);

    if (parsed.questions && parsed.questions.length > 0) {
      return {
        gameTitle: parsed.gameTitle || `اردو تعلیمی کھیل (${studentClass})`,
        topicName: parsed.topicName || (topic || "اردو قواعد و ادب"),
        questions: parsed.questions,
      };
    }
  } catch (err) {
    console.error('Error generating Urdu game questions via Groq:', err);
  }

  // Fallback dynamic generator with diverse seed questions per class
  return getFallbackUrduQuestions(studentClass);
}

function getFallbackUrduQuestions(studentClass: string): GenerateUrduGameOutput {
  const seedPool: Record<string, GenerateUrduGameOutput> = {
    PG: {
      gameTitle: "حروف کی پہچان اور تصویری کھیل",
      topicName: "حروفِ تہجی اور آوازیں",
      questions: [
        {
          prompt: "تصویر میں '🍎 انار' ہے۔ یہ کس حرف سے شروع ہوتا ہے؟",
          englishPrompt: "Anar (Pomegranate) starts with which letter?",
          options: [
            { id: "alif", text: "ا (الف)", isCorrect: true, detail: "ا سے انار 🍎" },
            { id: "bay", text: "ب (بے)", isCorrect: false, detail: "ب سے بلی 🐱" },
            { id: "pay", text: "پ (پے)", isCorrect: false, detail: "پ سے پودا 🍃" },
          ],
          explanation: "شاباش! 'ا' سے انار ہوتا ہے! 🍎"
        },
        {
          prompt: "تصویر میں '🐱 بلی' ہے۔ یہ کس حرف سے شروع ہوتا ہے؟",
          englishPrompt: "Billi (Cat) starts with which letter?",
          options: [
            { id: "bay", text: "ب (بے)", isCorrect: true, detail: "ب سے بلی 🐱" },
            { id: "tay", text: "ت (تے)", isCorrect: false, detail: "ت سے تتلی 🦋" },
            { id: "jeem", text: "ج (جیم)", isCorrect: false, detail: "ج سے جہاز ✈️" },
          ],
          explanation: "بہت خوب! 'ب' سے بلی ہوتی ہے! 🐱"
        },
        {
          prompt: "تصویر میں '🦋 تتلی' ہے۔ یہ کس حرف سے شروع ہوتا ہے؟",
          englishPrompt: "Titli (Butterfly) starts with which letter?",
          options: [
            { id: "tay", text: "ت (تے)", isCorrect: true, detail: "ت سے تتلی 🦋" },
            { id: "pay", text: "پ (پے)", isCorrect: false, detail: "پ سے پتنگ 🪁" },
            { id: "sein", text: "س (سین)", isCorrect: false, detail: "س سے سورج ☀️" },
          ],
          explanation: "شاباش! 'ت' سے تتلی ہوتی ہے! 🦋"
        }
      ]
    },
    Nursery: {
      gameTitle: "دو حرفی الفاظ کی تخلیق",
      topicName: "دو حرفی الفاظ اور آوازیں",
      questions: [
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
          explanation: "شاباش! س + چ = 'سچ' (Truth) بنتا ہے! 💫"
        }
      ]
    },
    KG: {
      gameTitle: "تین حرفی الفاظ اور اردو گنتی",
      topicName: "الفاظ سازی اور گنتی",
      questions: [
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
        }
      ]
    },
    'Class 1': {
      gameTitle: "الفاظ متضاد اور مذکر مؤنث لیب",
      topicName: "الفاظ متضاد و جنس",
      questions: [
        {
          prompt: "لفظ 'دن' کا متضاد (الٹ) کیا ہے؟",
          englishPrompt: "What is the opposite of 'Din' (Day)?",
          options: [
            { id: "raat", text: "رات (Raat - Night)", isCorrect: true },
            { id: "sooraj", text: "سورج (Sun)", isCorrect: false },
            { id: "subah", text: "صبح (Morning)", isCorrect: false },
          ],
          explanation: "شاباش! 'دن' کا متضاد 'رات' ہے! 🌙"
        },
        {
          prompt: "لفظ 'لڑکا' (مذکر) کا مؤنث کیا ہے؟",
          englishPrompt: "What is the feminine form of 'Larka' (Boy)?",
          options: [
            { id: "larki", text: "لڑکی (Larki - Girl)", isCorrect: true },
            { id: "ammi", text: "امی (Mother)", isCorrect: false },
            { id: "baji", text: "باجی (Sister)", isCorrect: false },
          ],
          explanation: "بہت خوب! 'لڑکا' کا مؤنث 'لڑکی' ہے! 👧"
        }
      ]
    },
    'Class 2': {
      gameTitle: "واحد جمع اور قواعدِ زبان",
      topicName: "واحد / جمع اور اسم، فعل، صفت",
      questions: [
        {
          prompt: "لفظ 'کتاب' (واحد) کی جمع کیا ہے؟",
          englishPrompt: "What is the plural of 'Kitaab' (Book)?",
          options: [
            { id: "kutub", text: "کتب / کتابیں", isCorrect: true },
            { id: "kaaghaz", text: "کاغذ", isCorrect: false },
            { id: "qalam", text: "قلم", isCorrect: false },
          ],
          explanation: "شاباش! 'کتاب' کی جمع 'کتابیں / کتب' ہے! 📚"
        },
        {
          prompt: "جملے میں لفظ 'دوڑنا' قواعد کی لحاظ سے کیا ہے؟ ('احمد تیز دوڑتا ہے')",
          englishPrompt: "What part of speech is 'Daurna' (Running)?",
          options: [
            { id: "feal", text: "فعل (Verb)", isCorrect: true },
            { id: "ism", text: "اسم (Noun)", isCorrect: false },
            { id: "sifat", text: "صفت (Adjective)", isCorrect: false },
          ],
          explanation: "بہت خوب! کام یا عمل کو قواعد میں 'فعل' کہتے ہیں! 🏃"
        }
      ]
    },
    'Class 3': {
      gameTitle: "اردو ادب، مترادفات اور محاورے",
      topicName: "مترادفات و محاورات",
      questions: [
        {
          prompt: "لفظ 'آفتاب' کا مترادف (ہم معنی) لفظ کیا ہے؟",
          englishPrompt: "What is the synonym of 'Aftab'?",
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
            { id: "bhaag", text: "بھاگ جانا (To run away)", isCorrect: true },
            { id: "ginna", text: "گنتی گننا", isCorrect: false },
            { id: "sona", text: "سو جانا", isCorrect: false },
          ],
          explanation: "بہت خوب! 'نو دو گیارہ ہونا' کا مطلب 'تیزی سے بھاگ جانا' ہے! 🏃‍♂️"
        }
      ]
    }
  };

  return seedPool[studentClass] || seedPool['Class 1'];
}
