'use server';

import { askGroq } from '@/ai/groq';

export type IslamicGameQuestion = {
  topic: string;
  scenario: string;
  options: string[];
  correct: number;
  explanation: string;
};

export type GenerateIslamicGameOutput = {
  questions: IslamicGameQuestion[];
};

export async function generateIslamicGame(studentClass: string, topic?: string): Promise<GenerateIslamicGameOutput> {
  try {
    const systemPrompt = `You are an Islamic Studies curriculum developer for primary school children. Generate 3 engaging, age-appropriate moral choices and Islamic learning questions for grade ${studentClass} on topic "${topic || 'Islamic Ethics & Beliefs'}".
Return JSON format:
{
  "questions": [
    {
      "topic": "Topic Name",
      "scenario": "Bilingual (English/Urdu) scenario description",
      "options": ["Option 1 (Right Choice) 🤲", "Option 2 (Wrong Choice) ❌"],
      "correct": 0,
      "explanation": "Moral and Hadith/Quranic lesson explanation"
    }
  ]
}`;

    const userPrompt = `Grade: ${studentClass}\nTopic: ${topic || 'Islamic Values, Duas & Manners'}`;
    const rawJson = await askGroq(systemPrompt, userPrompt, true);
    const parsed = JSON.parse(rawJson);

    if (parsed.questions && parsed.questions.length > 0) {
      return { questions: parsed.questions };
    }
  } catch (err) {
    console.error('Error generating Islamic game questions via Groq:', err);
  }

  return getFallbackIslamicQuestions(studentClass);
}

function getFallbackIslamicQuestions(studentClass: string): GenerateIslamicGameOutput {
  const fallbackPool: Record<string, IslamicGameQuestion[]> = {
    PG: [
      { topic: "Kindness & Help (نیکی اور مدد)", scenario: "You see a friend fall down on the playground. (دوست کھیل میں گر گیا)", options: ["Help them up with a smile (پیار سے اٹھائیں) 🤝", "Laugh at them ❌"], correct: 0, explanation: "Helping friends up with a smile is a Sunnah and a wonderful good deed!" },
      { topic: "Gratitude (شکر گزاری)", scenario: "Your teacher gives you a nice sticker. (استاد نے تحفہ دیا)", options: ["Say 'Thank You / JazakAllah!' (جزاک اللہ کہیں) 😊", "Take it without saying anything ❌"], correct: 0, explanation: "Saying 'JazakAllah Khair' shows politeness and gratitude!" }
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

  return { questions: fallbackPool[studentClass] || fallbackPool['Class 1'] };
}
