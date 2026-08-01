
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookUser, CheckCircle2, ShieldCheck, Video, Users, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const adminGuideSections = [
    {
        title: "👑 1. Admin Teacher Capabilities & Privileges",
        content: [
            { heading: "Exclusive Roster Authority", text: "Only Admin Teachers (e.g. admin@nextgenlearners.com) can create new student accounts, create new teacher accounts, and assign/change student class rosters." },
            { heading: "Enrollment Leads Inquiries", text: "Admin Teachers have full access to the 'Leads Inquiries' tab to manage all website enrollment form submissions." }
        ]
    },
    {
        title: "🍎 2. Adding Teachers & Students",
        content: [
            { heading: "Add Teacher Account", text: "Go to 'Students Roster', click '+ Add Teacher', and enter their full name, email, and password." },
            { heading: "Add Student Account", text: "Click '+ Add Student', enter student and parent details, and assign their initial class." },
            { heading: "Assigning Roster", text: "Use the 'Assign Class' dropdown on any student's row to update their class enrollment instantly." }
        ]
    }
];

const teacherGuideSections = [
    {
        title: "1. Navigating the Teacher Dashboard",
        content: [
            { heading: "Students", text: "View assigned student roster and access individual student detail pages." },
            { heading: "Subjects", text: "Manage class worksheets and create AI-powered quizzes for your subjects." },
            { heading: "Timetable & Embedded Zoom", text: "Schedule live classes and provide Zoom Meeting IDs for internal embedded classes." },
            { heading: "Lesson Planner", text: "Generate complete AI lesson plans based on class, subject, and topic." },
            { heading: "Syllabus", text: "View and share official syllabus documents." }
        ]
    },
    {
        title: "2. Creating AI Quizzes & Worksheets",
        content: [
            { heading: "AI Quizzes", text: "Go to Subjects → Select Class → Manage Quizzes → Enter prompt and click Generate Quiz." },
            { heading: "Worksheets", text: "Go to Subjects → Select Class → Manage Worksheets → Add Title and URL link." }
        ]
    }
];

const zoomGuideSections = [
    {
        title: "🎥 1. Internal Embedded Zoom Live Classes",
        content: [
            { heading: "No External Redirection", text: "Zoom live classes open directly inside an embedded player modal right within NextGen Learners." },
            { heading: "Joining a Meeting", text: "Click 'Join Live Class' in the Timetable or Subject view. The embedded window will load with full camera, microphone, screen share, and chat controls." },
            { heading: "Browser Permissions", text: "Make sure to allow camera and microphone access when prompted by your browser." }
        ]
    }
];

export default function UserGuideView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-2xl">
          <BookUser className="w-6 h-6 text-primary" /> Platform User Guide
        </CardTitle>
        <CardDescription>Comprehensive guide for Admin Teachers, Instructors, and Students.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="admin" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="admin" className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Admin Guide
            </TabsTrigger>
            <TabsTrigger value="teacher" className="font-bold flex items-center gap-1">
              <Users className="w-4 h-4" /> Teacher Guide
            </TabsTrigger>
            <TabsTrigger value="zoom" className="font-bold flex items-center gap-1">
              <Video className="w-4 h-4" /> Embedded Zoom Guide
            </TabsTrigger>
          </TabsList>

          <TabsContent value="admin">
            <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
              {adminGuideSections.map((section, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-bold text-lg">{section.title}</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground space-y-4">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0"/>
                        <div>
                          <p className="font-semibold text-foreground">{item.heading}</p>
                          <p className="text-sm">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="teacher">
            <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
              {teacherGuideSections.map((section, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-bold text-lg">{section.title}</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground space-y-4">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0"/>
                        <div>
                          <p className="font-semibold text-foreground">{item.heading}</p>
                          <p className="text-sm">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="zoom">
            <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
              {zoomGuideSections.map((section, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-bold text-lg">{section.title}</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground space-y-4">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0"/>
                        <div>
                          <p className="font-semibold text-foreground">{item.heading}</p>
                          <p className="text-sm">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
