
import * as Icons from '@/components/icons';
import type { ElementType } from 'react';
import Image from 'next/image';

export const classes = [
    "PG",
    "Nursery",
    "KG",
    "Class 1",
    "Class 2",
    "Class 3"
];

export const subjectsByClass: { [key: string]: string[] } = {
    "PG": [
        "LANGUAGE AND LETTER FUN",
        "MATHS ADVENTURE",
        "حروف کی دنیا",
        "COLORS AND CREATIONS"
    ],
    "Nursery": [
        "ABC EXPLORERS",
        "MATHS MAGIC",
        "“ا” “ب” کا سفر",
        "COLORS AND CREATION",
        "MY LITTLE WORLD"
    ],
    "KG": [
        "ENGLISH EXPLORERS",
        "MATHS MASTER",
        "“ا” “ب” کے ماہر",
        "MY BIG WORLD",
        "FAITH AND MANNERS"
    ],
    "Class 1": [
        "WORD BUILDERS",
        "NUMBER NINJAS",
        "LITTLE SCIENTISTS",
        "“ا” “ب” کی دنیا",
        "میرا دین"
    ],
    "Class 2": [
        "STORY BUILDERS",
        "NUMBER WORLD",
        "EXPLORE AND DISCOVER",
        "کہانی اور الفاظ",
        "دین و ادب"
    ],
    "Class 3": [
        "YOUNG AUTHORS",
        "NUMBER WIZARDS",
        "SCIENCE SAFARI",
        "الفاظ کا سفر",
        "روشن راہیں"
    ]
};

export const subjectIcons: { [key: string]: string } = {
    "LANGUAGE AND LETTER FUN": "BookIcon",
    "MATHS ADVENTURE": "NotebookIcon",
    "حروف کی دنیا": "BookIcon",
    "COLORS AND CREATIONS": "CrayonIcon",
    "ABC EXPLORERS": "BookIcon",
    "MATHS MAGIC": "NotebookIcon",
    "“ا” “ب” کا سفر": "BookIcon",
    "COLORS AND CREATION": "CrayonIcon",
    "MY LITTLE WORLD": "StarIcon",
    "ENGLISH EXPLORERS": "BookIcon",
    "MATHS MASTER": "NotebookIcon",
    "“ا” “ب” کے ماہر": "BookIcon",
    "MY BIG WORLD": "StarIcon",
    "FAITH AND MANNERS": "StarIcon",
    "WORD BUILDERS": "BookIcon",
    "NUMBER NINJAS": "NotebookIcon",
    "LITTLE SCIENTISTS": "StarIcon",
    "“ا” “ب” کی دنیا": "BookIcon",
    "میرا دین": "StarIcon",
    "STORY BUILDERS": "BookIcon",
    "NUMBER WORLD": "NotebookIcon",
    "EXPLORE AND DISCOVER": "StarIcon",
    "کہانی اور الفاظ": "BookIcon",
    "دین و ادب": "StarIcon",
    "YOUNG AUTHORS": "BookIcon",
    "NUMBER WIZARDS": "NotebookIcon",
    "SCIENCE SAFARI": "StarIcon",
    "الفاظ کا سفر": "BookIcon",
    "روشن راہیں": "StarIcon",
    default: "BackpackIcon",
};

export const subjectImages: { [key: string]: string } = {
    "COLORS AND CREATIONS": "/subjects/art.gif",
    "COLORS AND CREATION": "/subjects/art.gif",
    "LANGUAGE AND LETTER FUN": "/subjects/abc.gif",
    "ABC EXPLORERS": "/subjects/abc.gif",
    "ENGLISH EXPLORERS": "/subjects/abc.gif",
    "WORD BUILDERS": "/subjects/abc.gif",
    "STORY BUILDERS": "/subjects/abc.gif",
    "YOUNG AUTHORS": "/subjects/abc.gif",
    "MATHS ADVENTURE": "/subjects/maths.gif",
    "MATHS MAGIC": "/subjects/maths.gif",
    "MATHS MASTER": "/subjects/maths.gif",
    "NUMBER NINJAS": "/subjects/maths.gif",
    "NUMBER WORLD": "/subjects/maths.gif",
    "NUMBER WIZARDS": "/subjects/maths.gif",
    "LITTLE SCIENTISTS": "/subjects/science.gif",
    "EXPLORE AND DISCOVER": "/subjects/science.gif",
    "SCIENCE SAFARI": "/subjects/science.gif",
    "حروف کی دنیا": "/subjects/urdu.png",
    "“ا” “ب” کا سفر": "/subjects/urdu.png",
    "“ا” “ب” کے ماہر": "/subjects/urdu.png",
    "“ا” “ب” کی دنیا": "/subjects/urdu.png",
    "کہانی اور الفاظ": "/subjects/urdu.png",
    "الفاظ کا سفر": "/subjects/urdu.png",
    "MY LITTLE WORLD": "/subjects/gk.gif",
    "MY BIG WORLD": "/subjects/gk.gif",
    "میرا دین": "/subjects/islamiat.gif",
    "دین و ادب": "/subjects/islamiat.gif",
    "روشن راہیں": "/subjects/islamiat.gif",
    "FAITH AND MANNERS": "/subjects/manners.png"
};

export const getIcon = (subjectName: string): { type: 'icon' | 'image', component: ElementType | string } => {
    if (subjectImages[subjectName]) {
        return { type: 'image', component: subjectImages[subjectName] };
    }
    const iconName = subjectIcons[subjectName] as keyof typeof Icons;
    const iconComponent = Icons[iconName] || Icons.BackpackIcon;
    return { type: 'icon', component: iconComponent };
};

export const isUrdu = (text: string): boolean => {
    const urduRegex = /[\u0600-\u06FF]/;
    return urduRegex.test(text);
};

export const isLanguageSubject = (subjectName: string): boolean => {
    const englishKeywords = ['LANGUAGE', 'ABC', 'ENGLISH', 'WORD', 'STORY', 'AUTHORS'];
    const urduKeywords = ['حروف', '“ا” “ب”', 'کہانی', 'الفاظ', 'سفر'];
    
    if (isUrdu(subjectName)) {
        return urduKeywords.some(keyword => subjectName.includes(keyword));
    }
    
    return englishKeywords.some(keyword => subjectName.toUpperCase().includes(keyword));
};

export const isMathSubject = (subjectName: string): boolean => {
    const mathKeywords = ['MATHS', 'NUMBER'];
    return mathKeywords.some(keyword => subjectName.toUpperCase().includes(keyword));
}

export const isArtSubject = (subjectName: string): boolean => {
    const artKeywords = ['COLORS', 'CREATIONS', 'CREATION'];
    return artKeywords.some(keyword => subjectName.toUpperCase().includes(keyword));
};

export const isGkScienceSubject = (subjectName: string): boolean => {
    const gkKeywords = ['WORLD', 'SCIENTISTS', 'EXPLORE', 'DISCOVER', 'SAFARI'];
    return gkKeywords.some(keyword => subjectName.toUpperCase().includes(keyword));
};

export const isIslamiatSubject = (subjectName: string): boolean => {
    const islamiatKeywords = ['FAITH', 'MANNERS', 'دین', 'ادب', 'راہیں'];
    return islamiatKeywords.some(keyword => subjectName.includes(keyword));
};
