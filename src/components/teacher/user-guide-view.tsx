
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookUser, CheckCircle2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const guideSections = [
    {
        title: "1. Getting Started: Sign Up & Login",
        content: [
            { heading: "Sign Up", text: "When creating your account, make sure to select the “Teacher” role." },
            { heading: "Login", text: "Access your dashboard through the main login page. You'll be directed to your teacher-specific view." }
        ]
    },
    {
        title: "2. Navigating the Teacher Dashboard",
        content: [
            "Your sidebar is packed with powerful tools:",
            { heading: "Students", text: "Your main student roster. View all registered students, assign them to a class, and access their individual detail pages." },
            { heading: "Subjects", text: "Manage all learning content here. Select a class to view its subjects, then add worksheets and create AI-powered quizzes." },
            { heading: "Timetable", text: "Create and manage the weekly schedule for all classes. Add or remove sessions, and the changes will instantly appear on your students' calendars." },
            { heading: "Lesson Planner", text: "Your AI assistant for curriculum planning! Select a class, subject, and a topic from the syllabus, and the AI will generate a complete lesson plan." },
            { heading: "Syllabus", text: "View, download, and share the official syllabus PDF for any class." },
            { heading: "Leads", text: "View and manage new enrollment applications submitted through the website." }
        ]
    },
    {
        title: "3. Managing Your Students",
        content: [
            {
                heading: "Student Roster",
                text: "This is your central hub for student management. Click 'Add Student' to create a profile, and use the dropdown to assign a class. This is crucial for giving them access to the right materials."
            },
            {
                heading: "Individual Student Page",
                text: "Click on any student's name to go to their detailed page. Here you can award badges, generate AI progress reports based on their performance, and view their scores."
            }
        ]
    },
    {
        title: "4. Creating an AI-Powered Quiz",
        content: [
            "Our platform makes it easy to generate fun quizzes in seconds.",
            { heading: "Navigate to Subjects", text: "Click on the 'Subjects' tab in the sidebar." },
            { heading: "Select a Class", text: "Choose the class you want to create a quiz for." },
            { heading: "Manage Quizzes", text: "Find the relevant subject and click the 'Manage Quizzes' button." },
            { heading: "Create & Prompt", text: "In the dialog, click 'Create New Quiz' and give the AI a clear prompt (e.g., 'A 5-question quiz about summer fruits for KG')." },
            { heading: "Generate & Save", text: "Click 'Generate Quiz.' Review the questions, and if you're happy, click 'Save Quiz' to make it available to your students." }
        ]
    },
    {
        title: "5. Adding Worksheets/Assignments",
        content: [
            "You can easily link to external worksheets from Google Docs or other online resources.",
            { heading: "Navigate to Subjects", text: "Go to the 'Subjects' tab." },
            { heading: "Select a Class", text: "Choose the relevant class." },
            { heading: "Manage Worksheets", text: "Find the subject and click 'Manage Worksheets'." },
            { heading: "Add Worksheet", text: "In the dialog, give your worksheet a Title and paste the publicly accessible Link (e.g., a Google Drive link) into the URL field." },
            { heading: "Save", text: "Click 'Add Worksheet.' It will now appear in the student's subject view." }
        ]
    },
     {
        title: "6. Scheduling a Live Class",
        content: [
            "Easily schedule your live classes and provide the join link.",
            { heading: "Go to Timetable", text: "Navigate to the 'Timetable' section from your sidebar." },
            { heading: "Fill in Details", text: "Select the class, subject, day, and time for your session." },
            { heading: "Add the Class Link", text: "Paste the URL for your online class (e.g., Google Meet, Zoom) into the 'Class Link' field." },
            { heading: "Add Session", text: "Click 'Add Session'. The class is now on the schedule for both you and your students." },
            { heading: "Starting a Class", text: "At the time of the class, a 'Join Class' button will become active in your timetable and on the relevant subject card for easy access." }
        ]
    }
];

export default function UserGuideView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-2xl">
          <BookUser /> For Teachers
        </CardTitle>
        <CardDescription>This section covers all the tools available in the Teacher Dashboard to help you manage your digital classroom.</CardDescription>
      </CardHeader>
      <CardContent>
         <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
            {guideSections.map((section, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-bold text-lg">{section.title}</AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground space-y-4">
                        {section.content.map((item, itemIndex) => {
                            if (typeof item === 'string') {
                                return <p key={itemIndex}>{item}</p>
                            }
                            return (
                                <div key={itemIndex} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0"/>
                                    <div>
                                        <p className="font-semibold text-foreground">{item.heading}</p>
                                        <p className="text-sm">{item.text}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
