
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-2xl sm:text-3xl font-bold font-headline text-slate-800 border-b pb-2 mb-4">{title}</h2>
    <div className="space-y-4 text-slate-600 font-body">{children}</div>
  </section>
);

const SubSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="mt-6">
    <h3 className="text-xl font-bold font-headline text-slate-700 mb-2">{title}</h3>
    <div className="space-y-2 text-sm sm:text-base">{children}</div>
  </div>
);

export default function TermsAndConditionsPage() {
  return (
    <div className="bg-background min-h-screen py-8 sm:py-12 px-4">
      <div className="container mx-auto max-w-4xl bg-card p-6 sm:p-10 rounded-2xl shadow-lg border">
        
        <Link href="/" className="inline-block mb-6">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold font-headline text-slate-800">Terms and Conditions</h1>
          <p className="text-lg text-muted-foreground mt-2">NextGen Learners Online Education</p>
        </div>

        <div className="space-y-8">
          <Section title="1. Welcome to NextGen Learners">
            <p>
              Thank you for choosing NextGen Learners – Pakistan’s trusted platform for fun online learning and educational games for kids. By enrolling your child with us, you agree to these Terms and Conditions. Please review them carefully to understand our mutual expectations.
            </p>
          </Section>

          <Section title="2. Enrollment and Payment">
            <SubSection title="How to Get Started">
              <ul className="list-disc list-inside space-y-1">
                <li>Complete the registration forms and submit required documents.</li>
                <li>Pay the registration fee at the time of enrollment.</li>
                <li><strong>Good news:</strong> If you’re not satisfied, we’ll refund 50% of the registration fee.</li>
              </ul>
            </SubSection>
            <SubSection title="Tuition Fees & Online School Fees">
               <ul className="list-disc list-inside space-y-1">
                <li>Tuition fees must be paid in advance, either monthly or by term.</li>
                <li><strong>Important:</strong> Fees are non-refundable except in special cases determined by the school.</li>
                <li>Late or unpaid fees may result in suspension of your child’s access to online classes.</li>
              </ul>
            </SubSection>
             <SubSection title="Study Materials">
               <p>Workbooks and study packs are provided separately and charged in addition to tuition.</p>
            </SubSection>
          </Section>

          <Section title="3. School Calendar – Academic Year 2025–26">
             <ul className="list-disc list-inside space-y-1">
                <li>Classes run from October 1 to June 2026.</li>
                <li>We observe official holidays, including the December break and Eid celebrations.</li>
                <li>The syllabus will be shared only after registration is complete.</li>
              </ul>
          </Section>

          <Section title="4. Online Classes – Learning Structure">
            <SubSection title="Class Schedule">
               <ul className="list-disc list-inside space-y-1">
                <li>Students will attend 3 online classes per week.</li>
                <li>Timely attendance is required as per schedule.</li>
                <li>Class links will be shared through our learning platform.</li>
              </ul>
            </SubSection>
            <SubSection title="Missed Classes">
               <ul className="list-disc list-inside space-y-1">
                <li>Recorded lessons are available upon request (parents must email us to access).</li>
                <li>We are not responsible for disruptions caused by internet or device issues.</li>
              </ul>
            </SubSection>
          </Section>

           <Section title="5. Academic Expectations & Assessments">
            <SubSection title="Skills Required">
               <p>Students in Grades 1–3 should have basic Microsoft Word skills for assignments.</p>
            </SubSection>
            <SubSection title="Learning and Assessment">
               <ul className="list-disc list-inside space-y-1">
                <li>Classes include interactive learning, educational games, and hands-on activities.</li>
                <li>Homework must be submitted on time.</li>
                <li>Progress is evaluated through assignments, quizzes, and projects.</li>
                <li>Certificates are awarded at the end of each term or year upon meeting academic requirements.</li>
              </ul>
            </SubSection>
          </Section>
          
           <Section title="6. Code of Conduct – Student and Parent Guidelines">
            <SubSection title="Student Behavior">
               <ul className="list-disc list-inside space-y-1">
                <li>Respectful behavior is required during online classes.</li>
                <li>Inappropriate language or disruptive behavior will not be tolerated.</li>
                <li>Misuse of chat or camera features may lead to disciplinary action.</li>
              </ul>
            </SubSection>
             <SubSection title="Parental Support">
               <p>Parents should provide a quiet and supportive environment for effective online learning.</p>
            </SubSection>
          </Section>

          <Section title="7. Intellectual Property – Learning Materials">
            <p>All worksheets, presentations, and resources are the property of NextGen Learners. Copying, sharing, or selling these materials without permission is prohibited.</p>
          </Section>

           <Section title="8. Privacy Policy – Protecting Your Child Online">
             <ul className="list-disc list-inside space-y-1">
                <li>We keep your child’s personal information and class recordings confidential.</li>
                <li>Recordings may be used internally to improve teaching quality.</li>
                <li>Your data will never be shared without explicit consent.</li>
              </ul>
          </Section>

          <Section title="9. Technology Requirements for Online Learning">
             <SubSection title="What You’ll Need">
               <ul className="list-disc list-inside space-y-1">
                <li>A working device (computer or tablet).</li>
                <li>A stable internet connection.</li>
                <li>Required software and apps.</li>
              </ul>
            </SubSection>
             <SubSection title="Technology Guidelines">
               <ul className="list-disc list-inside space-y-1">
                <li>Recording or screenshots of classes are not allowed.</li>
                <li>Sharing class content without authorization is prohibited.</li>
                <li>NextGen Learners is not liable for misuse of technology outside our platform.</li>
              </ul>
            </SubSection>
          </Section>
          
          <Section title="10. Termination of Enrollment">
             <p>Enrollment may be discontinued if:</p>
               <ul className="list-disc list-inside space-y-1">
                <li>Tuition fees remain unpaid.</li>
                <li>Rules are repeatedly violated.</li>
                <li>School materials or platform are misused.</li>
              </ul>
          </Section>

          <Section title="11. Updates to Terms and Conditions">
             <ul className="list-disc list-inside space-y-1">
                <li>These Terms may be updated periodically.</li>
                <li>Parents will be notified in advance of significant changes.</li>
              </ul>
          </Section>

        </div>
        
        <div className="mt-12 text-center border-t pt-6">
            <p className="text-sm text-slate-700">
              By enrolling with NextGen Learners, you confirm that you have read, understood, and agreed to these Terms and Conditions for online learning and educational games in Pakistan.
            </p>
            <p className="text-xs text-muted-foreground mt-2">Last updated: September 1, 2025</p>
        </div>
      </div>
    </div>
  );
}
