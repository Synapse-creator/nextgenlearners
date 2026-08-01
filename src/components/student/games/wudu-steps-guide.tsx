"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import EnrollmentForm from '@/components/landing/enrollment-form';
import * as Icons from '@/components/icons';
import { cn } from '@/lib/utils';
import { ArrowRight, CheckCircle2, Download, Sparkles, Star, Package, XCircle, AlertTriangle, RefreshCw, Instagram, Lightbulb } from 'lucide-react';
import { classes, subjectsByClass, getIcon, isUrdu } from '@/lib/subjects';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import NameTranslator from '@/components/landing/name-translator';
import KindnessQuestGenerator from '@/components/landing/kindness-quest-generator';

const features = [
    {
        icon: <Image src="/playful.gif" alt="Playful Curriculum" width={40} height={40} unoptimized />,
        title: "Playful Curriculum",
        description: "Our curriculum turns learning into an adventure, making every lesson fun and memorable."
    },
    {
        icon: <Image src="/report.png" alt="AI-Powered Insights" width={40} height={40} />,
        title: "AI-Powered Insights",
        description: "Receive AI-generated progress reports to understand your child's journey and areas for growth."
    },
    {
        icon: <Image src="/activitiesen.gif" alt="Engaging Activities" width={40} height={40} unoptimized />,
        title: "Engaging Activities",
        description: "Interactive worksheets, quizzes, and digital badges keep students motivated and excited."
    },
    {
        icon: <Image src="/studypack.png" alt="Custom Study Packs" width={40} height={40} />,
        title: "Custom Study Packs",
        description: "Get custom study packs as a free PDF, or have a printed, bound version shipped for a small fee."
    },
];

const pricing = [
    { name: "PG", price: "PKR 12,000" },
    { name: "Nursery", price: "PKR 13,000" },
    { name: "KG", price: "PKR 14,000" },
    { name: "Class 1", price: "PKR 15,000" },
    { name: "Class 2", price: "PKR 16,000" },
    { name: "Class 3", price: "PKR 17,000" },
];

const discounts = [
    { label: "Quarterly", discount: "5%" },
    { label: "Bi-Annual", discount: "10%" },
    { label: "Annual", discount: "15%" }
]

const comparisonData = [
  { feature: "Target Audience", nextgen: "PG to Class 3 (ages 3–9), parents", competitors: ["Adult learners", "K–12 (mainly US)", "Ages 2–8", "Montessori families", "Pre-K to Grade 6"] },
  { feature: "Curriculum Format", nextgen: "Gamified, story-based, colorful", competitors: ["Course modules", "Structured, accredited", "Game-based, thematic", "Montessori, hands-on", "Game-based"] },
  { feature: "Live Teacher Support", nextgen: "✅ Yes – expert teachers", competitors: ["❌ No", "✅ Yes", "❌ No", "⚠️ Limited", "❌ No"] },
  { feature: "Progress Tracking", nextgen: "✅ AI-powered reports", competitors: ["❌ None", "✅ Standard assessments", "⚠️ Basic", "⚠️ Minimal", "❌ None"] },
  { feature: "Personalized Learning", nextgen: "✅ Adaptive AI paths", competitors: ["❌ No", "✅ Yes", "❌ No", "⚠️ Limited", "❌ No"] },
  { feature: "Parent Involvement Tools", nextgen: "✅ Insights, resources", competitors: ["❌ No", "✅ Limited", "⚠️ Printable worksheets", "⚠️ Parent guidance", "❌ No"] },
  { feature: "Offline Learning Kits", nextgen: "🔄 Planned / Optional", competitors: ["❌ No", "✅ Supplies sent", "✅ Printables", "✅ Hands-on kits", "❌ No"] },
  { feature: "Languages Offered", nextgen: "English, Urdu", competitors: ["English", "English", "English", "English", "English"] },
  { feature: "Cultural Localization", nextgen: "✅ Yes (Pakistan)", competitors: ["❌ No", "❌ No", "❌ No", "❌ No", "❌ No"] },
  { feature: "Gamification", nextgen: "✅ Full curriculum", competitors: ["❌ No", "⚠️ Some interactivity", "✅ Fully gamified", "❌ No", "✅ All games"] },
  { feature: "Pricing Transparency", nextgen: "✅ Transparent in PKR", competitors: ["❌ No", "✅ Public schools free", "✅ Fixed subscription", "⚠️ Not fully online", "✅ Free"] },
  { feature: "Mobile-Friendly", nextgen: "✅ Optimized", competitors: ["✅", "✅", "✅", "⚠️ Some parts", "✅"] },
  { feature: "Community / Social Learning", nextgen: "🔄 Virtual events planned", competitors: ["❌ No", "✅ Clubs, groups", "❌ No", "❌ No", "❌ No"] },
  { feature: "Certifications / Rewards", nextgen: "✅ Digital badges & rewards", competitors: ["❌ No", "✅ Formal certification", "✅ Certificates", "✅ Montessori badges", "❌ No"] },
  { feature: "Unique Value", nextgen: "AI + Play + Local relevance", competitors: ["Career skills", "Accredited school", "Rich content for kids", "Montessori method", "Free fun games"] },
];

const faqItems = [
    {
        question: "What age group is NextGen Learners for?",
        answer: "Our curriculum is designed for children from Playgroup (PG) to Class 3, which typically covers ages 3 to 9 years old."
    },
    {
        question: "How do the live classes work?",
        answer: "We offer interactive live classes with expert teachers via our online platform. Timetables are shared with enrolled students, and they can join with a simple click from their dashboard."
    },
    {
        question: "Is this a replacement for traditional school?",
        answer: "NextGen Learners can be used as a full-time online schooling solution or as a supplementary program to enhance your child's learning. Our comprehensive curriculum covers key subjects with a focus on fun and engagement."
    },
    {
        question: "What technology do we need?",
        answer: "All you need is a stable internet connection and a device like a computer, laptop, or tablet. Our platform is web-based, so no special software is required."
    },
    {
        question: "How can I track my child's progress?",
        answer: "Parents have access to a dashboard that tracks their child's activities. We also provide unique, AI-powered weekly progress reports that offer insights into your child's performance, strengths, and areas for improvement."
    },
    {
        question: "Can we try it before enrolling?",
        answer: "Yes! After the registration fees is paid one of our teachers will give you a brief demo of the platform. If you decide not to proceed after the demo, we offer a 50% refund on the one-time registration fee."
    }
];


const ComparisonCell = ({ content }: { content: string }) => {
    if (content.startsWith('✅')) return <span className="flex items-center gap-2 text-green-600"><CheckCircle2 className="w-5 h-5 flex-shrink-0" /> {content.replace('✅', '').trim()}</span>;
    if (content.startsWith('❌')) return <span className="flex items-center gap-2 text-red-500"><XCircle className="w-5 h-5 flex-shrink-0" /> {content.replace('❌', '').trim()}</span>;
    if (content.startsWith('⚠️')) return <span className="flex items-center gap-2 text-yellow-600"><AlertTriangle className="w-5 h-5 flex-shrink-0" /> {content.replace('⚠️', '').trim()}</span>;
    if (content.startsWith('🔄')) return <span className="flex items-center gap-2 text-blue-500"><RefreshCw className="w-5 h-5 flex-shrink-0" /> {content.replace('🔄', '').trim()}</span>;
    return <span>{content}</span>;
};

const Header = ({ onEnrollClick }: { onEnrollClick: () => void }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
            scrolled ? "bg-background/80 shadow-md backdrop-blur-sm" : "bg-transparent"
        )}>
            <div className="container mx-auto flex items-center justify-between p-4">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('hero-section')}>
                    <Image src="/logo.png" alt="NextGen Learners Logo" width={120} height={30} priority />
                </div>
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <button onClick={() => scrollToSection('features-section')} className="text-foreground/80 hover:text-primary transition-colors">Features</button>
                    <button onClick={() => scrollToSection('curriculum-section')} className="text-foreground/80 hover:text-primary transition-colors">Curriculum</button>
                    <button onClick={() => scrollToSection('pricing-section')} className="text-foreground/80 hover:text-primary transition-colors">Pricing</button>
                    <button onClick={() => scrollToSection('faq-section')} className="text-foreground/80 hover:text-primary transition-colors">FAQs</button>
                </nav>
                 <div className="flex items-center gap-2">
                    <Link href="/login">
                        <Button variant="ghost">Login</Button>
                    </Link>
                    <Button onClick={onEnrollClick} className="btn-bounce">
                        Enroll Now <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </header>
    )
}


export default function LandingPage() {
    const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<string | undefined>(undefined);

    const handleEnrollClick = (className?: string) => {
        setSelectedClass(className);
        setIsEnrollmentOpen(true);
    };

    return (
        <div className="bg-background text-foreground">
             <Dialog open={isEnrollmentOpen} onOpenChange={setIsEnrollmentOpen}>
                <Header onEnrollClick={() => handleEnrollClick()} />
                <DialogContent className="sm:max-w-[425px] md:max-w-2xl">
                    <EnrollmentForm setOpen={setIsEnrollmentOpen} preselectedClass={selectedClass} />
                </DialogContent>
            </Dialog>
            
            {/* Hero Section */}
            <section id="hero-section" className="relative pt-32 pb-16 md:pt-48 md:pb-24 overflow-hidden">
                 <div className="absolute inset-0 bg-primary/10 -z-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full translate-x-1/2 translate-y-1/2"></div>
                </div>
                <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline text-slate-800 leading-tight">
                            Fun Educational Games Online
                        </h1>
                        <p className="mt-6 text-lg text-slate-600 font-body max-w-lg mx-auto md:mx-0">
                            Explore our online learning games designed to make Math, English, and Urdu an adventure. Try our free learning game online now!
                        </p>
                        <div className="mt-8 flex flex-col items-center md:items-start gap-4">
                            <Button size="lg" className="btn-bounce rounded-full px-8 py-6 text-lg font-bold shadow-lg" onClick={() => handleEnrollClick()}>
                                Lets get started <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                            <a href="/documents/discoverymap.pdf" download="discoverymap.pdf" className="text-sm font-medium footer-link flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Download our schoolhouse discovery map
                            </a>
                        </div>
                         <div className="mt-6 flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <p>Loved by parents across the nation</p>
                         </div>
                    </div>
                    <div className="relative h-64 md:h-auto md:aspect-square">
                        <Image 
                            src="/hero.png" 
                            alt="Happy student learning online with fun educational games" 
                            fill
                            priority
                            className="rounded-3xl shadow-2xl object-cover"
                        />
                    </div>
                </div>
            </section>
            
            {/* Features Section */}
            <section id="features-section" className="py-16 lg:py-24 bg-background">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4 text-slate-800">Why NextGen Learners?</h2>
                    <p className="text-lg text-slate-600 font-body mb-12 max-w-2xl mx-auto">
                        We've built an online school experience that parents trust and children adore.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => {
                            const cardContent = (
                                <div className="bg-card p-6 rounded-2xl shadow-sm text-left hover:shadow-lg hover:-translate-y-1 transition-transform duration-300 h-full flex flex-col">
                                    <div className="p-3 bg-primary/10 rounded-full inline-block mb-4">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold font-headline mb-2 text-slate-700">{feature.title}</h3>
                                    <p className="text-muted-foreground font-body text-sm flex-grow">{feature.description}</p>
                                    {'link' in feature && (
                                        <div className="mt-4">
                                            <Button variant="link" className="p-0 h-auto text-primary">Try it now <ArrowRight className="w-4 h-4 ml-2" /></Button>
                                        </div>
                                    )}
                                </div>
                            );

                            return 'link' in feature && feature.link ? (
                                <Link key={index} href={feature.link} className="flex">
                                    {cardContent}
                                </Link>
                            ) : (
                                <div key={index}>
                                    {cardContent}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Interactive AI Section */}
            <section id="interactive-section" className="py-16 lg:py-24 bg-primary/5">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4 text-slate-800">Try Our Interactive AI Tools</h2>
                        <p className="text-lg text-slate-600 font-body max-w-2xl mx-auto">
                            Engage with our AI in fun, creative ways! Here are a couple of tools you and your child can try right now.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <NameTranslator />
                        <KindnessQuestGenerator />
                    </div>
                </div>
            </section>

            {/* Comparison Section */}
            <section id="comparison-section" className="py-16 lg:py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4 text-slate-800">How We Compare</h2>
                        <p className="text-lg text-slate-600 font-body max-w-2xl mx-auto">
                            See how NextGen Learners stands out from the crowd with features designed for modern families.
                        </p>
                    </div>
                    <div className="overflow-x-auto rounded-lg border shadow-lg">
                        <Table className="min-w-full bg-white">
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="w-1/4 font-bold text-slate-700 p-4">Feature / Platform</TableHead>
                                    <TableHead className="w-1/4 font-bold text-primary p-4 bg-primary/10">NextGen Learners</TableHead>
                                    <TableHead className="text-slate-600 p-4">NextGenLearning.org.uk</TableHead>
                                    <TableHead className="text-slate-600 p-4">K12.com</TableHead>
                                    <TableHead className="text-slate-600 p-4">ABCmouse</TableHead>
                                    <TableHead className="text-slate-600 p-4">Learn & Play Montessori</TableHead>
                                    <TableHead className="text-slate-600 p-4">ABCya</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {comparisonData.map((row, index) => (
                                    <TableRow key={index} className="border-t hover:bg-slate-50 transition-colors">
                                        <TableCell className="font-semibold text-slate-700 p-4">{row.feature}</TableCell>
                                        <TableCell className="font-medium bg-primary/5 p-4"><ComparisonCell content={row.nextgen} /></TableCell>
                                        {row.competitors.map((comp, i) => (
                                            <TableCell key={i} className="text-muted-foreground p-4"><ComparisonCell content={comp} /></TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </section>


             {/* Our Story Section */}
            <section id="our-story-section" className="py-16 lg:py-24 bg-primary/5">
                <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                    <div className="relative aspect-square">
                        <Image src="/tree.gif" alt="Our Story" fill objectFit="contain" unoptimized />
                    </div>
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4 text-slate-800">
                            Our Story: A Dream for Better Learning
                        </h2>
                        <p className="text-slate-600 font-body mb-6">
                            NextGen Learners was born from a dream to build something that truly facilitates both parents and children, making education not just effective but also fun and relaxing. Where traditional schools often rely on rote learning and pressure, we bring a fresh, joyful approach. Our online school turns every subject into an adventure — Math becomes a game, English transforms into stories, Urdu comes alive in colors, and Science sparks curiosity through discovery. We bridge the gaps by offering interactive presentations, smart worksheets, engaging activities, digital badges, progress tracking for parents, and a playful LMS that feels like a digital playground. At the heart of our vision is a simple belief: every child is unique, and learning should be a journey they love. With this dream, we’re raising thinkers, dreamers, and kind humans — while giving parents peace of mind that their child is learning in the best way possible. 🌈🚀
                        </p>
                    </div>
                </div>
            </section>

            {/* Curriculum Section */}
            <section id="curriculum-section" className="py-16 lg:py-24 bg-white">
                 <div className="container mx-auto px-4">
                    <div className="text-center">
                        <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4 text-slate-800">A World of Discovery</h2>
                        <p className="text-lg text-slate-600 font-body mb-12 max-w-2xl mx-auto">
                            Explore our rich and engaging curriculum, tailored for every stage of early learning.
                        </p>
                    </div>
                    <Tabs defaultValue={classes[0]} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-8">
                           {classes.map(c => <TabsTrigger key={c} value={c}>{c}</TabsTrigger>)}
                        </TabsList>

                        {classes.map(c => (
                             <TabsContent key={c} value={c}>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                {subjectsByClass[c].map((subjectName) => {
                                    const iconInfo = getIcon(subjectName);
                                    return (
                                    <div key={subjectName} className="flex flex-col items-center text-center gap-3">
                                        <div className="relative w-24 h-24 rounded-full flex items-center justify-center bg-primary/10 shadow-md transition-transform duration-300 hover:scale-110">
                                            {iconInfo.type === 'icon' && (
                                                <iconInfo.component className="w-12 h-12 text-primary" />
                                            )}
                                            {iconInfo.type === 'image' && (
                                                <Image src={iconInfo.component as string} alt={subjectName} width={60} height={60} className="rounded-md" />
                                            )}
                                        </div>
                                        <p className={cn("font-semibold text-sm text-foreground", isUrdu(subjectName) && "text-lg font-urdu")}>{subjectName}</p>
                                    </div>
                                    )
                                })}
                                </div>
                             </TabsContent>
                        ))}
                    </Tabs>
                 </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing-section" className="py-16 lg:py-24 bg-background">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4 text-slate-800">Simple, Transparent Pricing</h2>
                     <p className="text-lg text-slate-600 font-body mb-12 max-w-2xl mx-auto">
                        Choose a plan that fits your family. Full access, no hidden fees.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {pricing.map((plan) => (
                            <div key={plan.name} className="bg-card border p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-transform duration-300 flex flex-col">
                                <div className="flex-grow">
                                    <h3 className="text-xl font-bold font-headline text-slate-700 bg-primary/20 px-4 py-2 rounded-full inline-block">{plan.name}</h3>
                                    <p className="text-4xl sm:text-5xl font-bold my-6 text-slate-800">
                                        {plan.price}
                                        <span className="text-base font-normal text-muted-foreground">/mo</span>
                                    </p>
                                     <ul className="space-y-3 text-left mb-6">
                                        <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-green-500"/> Full Curriculum Access</li>
                                        <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-green-500"/> AI Progress Reports</li>
                                        <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-green-500"/> Live Teacher Support</li>
                                     </ul>
                                     <p className="text-xs text-muted-foreground text-left px-2 border-l-2 border-primary/20 mb-8">
                                        One time registration fee Pkr 5,000, after the demo if the parents do not want to proceed 50% of it is refundable.
                                     </p>
                                </div>
                                <Button size="lg" className="w-full mt-auto" onClick={() => handleEnrollClick(plan.name)}>Enroll in {plan.name}</Button>
                            </div>
                        ))}
                    </div>
                     <div className="mt-12">
                        <h3 className="text-2xl font-bold font-headline mb-4 text-slate-700">Payment Discounts</h3>
                        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                            {discounts.map(d => (
                                <div key={d.label} className="bg-card border border-primary/20 p-4 rounded-xl text-center shadow-sm w-36">
                                    <p className="text-primary font-bold text-2xl">{d.discount}</p>
                                    <p className="text-sm text-muted-foreground">{d.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

             {/* LMS Section */}
            <section id="lms-section" className="py-16 lg:py-24 text-foreground">
                <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                     <div>
                        <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4 text-slate-800">Our Magical Learning Dashboard</h2>
                        <p className="text-lg text-slate-600 font-body mb-8">
                             Our custom-built LMS is powered by AI to ensure every moment of screen time is well-spent. It's a magical portal to a world of fun and effective learning.
                        </p>
                        <Button size="lg" className="btn-bounce" onClick={() => handleEnrollClick()}>
                            Explore Features
                        </Button>
                    </div>
                    <div className="bg-slate-100 p-2 sm:p-4 rounded-xl shadow-2xl">
                         <Image src="/lmssnap.png" alt="AI LMS Dashboard" width={1000} height={500} className="rounded-lg mx-auto" />
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq-section" className="py-16 lg:py-24 bg-primary/5">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4 text-slate-800">Frequently Asked Questions</h2>
                        <p className="text-lg text-slate-600 font-body max-w-2xl mx-auto">
                            Have questions? We have answers. Here are some of the most common things parents ask.
                        </p>
                    </div>
                    <div className="max-w-3xl mx-auto">
                        <Accordion type="single" collapsible className="w-full">
                            {faqItems.map((item, index) => (
                                <AccordionItem key={index} value={`item-${index}`}>
                                    <AccordionTrigger className="text-left font-bold text-lg">{item.question}</AccordionTrigger>
                                    <AccordionContent className="text-base text-muted-foreground">
                                        {item.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </section>


             {/* Footer */}
            <footer className="py-8 px-4 text-center text-muted-foreground bg-primary/5">
                 <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <Image src="/logo.png" alt="NextGen Learners Logo" width={140} height={35} />
                    <p className="text-xs sm:text-sm">&copy; {new Date().getFullYear()} NextGen Learners. All Rights Reserved.</p>
                    <nav className="flex items-center gap-6 text-sm font-medium">
                        <Link href="/login" className="footer-link">Login</Link>
                        <Link href="/terms" className="footer-link">Terms & Conditions</Link>
                        <a href="https://instagram.com/nextgenlms" target="_blank" rel="noopener noreferrer" className="footer-link">
                            <Instagram className="w-5 h-5" />
                        </a>
                    </nav>
                 </div>
            </footer>
        </div>
    );
}