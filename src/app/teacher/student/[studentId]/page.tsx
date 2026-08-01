
"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Award, BotIcon, StarIcon, Trash2, Gamepad2, FileText, Link as LinkIcon, Check, Edit } from 'lucide-react';
import { generateWeeklyProgressReport, GenerateWeeklyProgressReportInput } from '@/ai/flows/generate-weekly-progress-report';
import { Loader2 } from "lucide-react";
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface StudentBadge {
  title: string;
  date: string;
}

interface Student {
  uid: string;
  name: string;
  email: string;
  badges?: StudentBadge[];
}

interface QuizResult {
  quizTitle: string;
  score: number;
  total: number;
  percentage: number;
}

interface WorksheetSubmission {
  id: string;
  worksheetId: string;
  worksheetTitle: string;
  submittedLink: string;
  status: 'submitted' | 'graded';
  score?: number;
}

const availableBadges = [
  { title: 'Homework Hero' },
  { title: 'Perfect Attendance' },
  { title: 'Quiz Whiz' },
  { title: 'Reading Rockstar' },
  { title: 'Math Magician' },
  { title: 'Creative Genius' },
];

const avatarGifs = ['/avatars/avatar1.gif', '/avatars/avatar2.gif', '/avatars/avatar3.gif'];

export default function StudentDetailPage({ params }: { params: { studentId: string } }) {
  const { studentId } = params;
  const [student, setStudent] = useState<Student | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [worksheetSubmissions, setWorksheetSubmissions] = useState<WorksheetSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingScores, setLoadingScores] = useState(true);
  const [loadingWorksheets, setLoadingWorksheets] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [teacherRemarks, setTeacherRemarks] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [currentScore, setCurrentScore] = useState<number | string>('');

  const { toast } = useToast();

  useEffect(() => {
    const getRandomAvatar = () => avatarGifs[Math.floor(Math.random() * avatarGifs.length)];
    setAvatarUrl(getRandomAvatar());
  }, []);

  useEffect(() => {
    if (!studentId) return;

    const fetchAllData = async () => {
      // Fetch student profile
      const { data: studentData, error: studentErr } = await supabase
        .from('users')
        .select('*')
        .eq('uid', studentId)
        .single();

      if (studentErr || !studentData) {
        setError("Student not found.");
        setLoading(false);
        return;
      }
      setStudent({
        uid: studentData.uid,
        name: studentData.name,
        email: studentData.email,
        badges: studentData.badges || [],
      });
      setLoading(false);

      // Fetch quiz results
      try {
        const { data: quizResultsData } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('student_id', studentId);

        if (quizResultsData && quizResultsData.length > 0) {
          const resultsWithTitles = await Promise.all(quizResultsData.map(async (result: any) => {
            const { data: quizData } = await supabase
              .from('quizzes')
              .select('title')
              .eq('id', result.quiz_id)
              .single();
            const total = result.total_questions || 5;
            return {
              quizTitle: quizData?.title || 'Unknown Quiz',
              score: result.score,
              total,
              percentage: Math.round((result.score / total) * 100),
            };
          }));
          setQuizResults(resultsWithTitles);
        }
      } finally {
        setLoadingScores(false);
      }

      // Fetch worksheet submissions
      const { data: submissionsData } = await supabase
        .from('worksheet_submissions')
        .select('*')
        .eq('student_id', studentId);
      if (submissionsData) {
        setWorksheetSubmissions(submissionsData.map((s: any) => ({
          id: s.id,
          worksheetId: s.worksheet_id,
          worksheetTitle: s.worksheet_title || s.worksheetTitle,
          submittedLink: s.submitted_link || s.submittedLink,
          status: s.status,
          score: s.score,
        })));
      }
      setLoadingWorksheets(false);
    };

    fetchAllData();
  }, [studentId]);

  const handleAssignBadge = async (badgeTitle: string) => {
    if (!student) return;

    const newBadge = {
      title: badgeTitle,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
    const updatedBadges = [...(student.badges || []), newBadge];

    try {
      const { error } = await supabase
        .from('users')
        .update({ badges: updatedBadges })
        .eq('uid', student.uid);
      if (error) throw error;
      setStudent(prev => prev ? { ...prev, badges: updatedBadges } : prev);
      toast({ title: "Badge Assigned!", description: `${student.name} received the ${badgeTitle} badge.` });
    } catch (err) {
      console.error("Error assigning badge:", err);
      toast({ variant: "destructive", title: "Error", description: "Could not assign badge." });
    }
  };

  const handleRemoveBadge = async (badgeToRemove: StudentBadge) => {
    if (!student) return;
    const updatedBadges = (student.badges || []).filter(
      b => !(b.title === badgeToRemove.title && b.date === badgeToRemove.date)
    );
    try {
      const { error } = await supabase
        .from('users')
        .update({ badges: updatedBadges })
        .eq('uid', student.uid);
      if (error) throw error;
      setStudent(prev => prev ? { ...prev, badges: updatedBadges } : prev);
      toast({ title: "Badge Removed!", description: `The ${badgeToRemove.title} badge has been removed from ${student.name}.` });
    } catch (err) {
      console.error("Error removing badge:", err);
      toast({ variant: "destructive", title: "Error", description: "Could not remove badge." });
    }
  };

  const handleGenerateReport = async () => {
    if (!student) return;
    setIsGeneratingReport(true);
    setReport(null);
    try {
      const input: GenerateWeeklyProgressReportInput = {
        studentName: student.name,
        teacherRemarks: teacherRemarks || 'No specific remarks from the teacher this week.',
        quizScores: quizResults.map(q => ({
          quizTitle: q.quizTitle,
          score: `${q.score}/${q.total}`,
        })),
        badgesEarned: student.badges?.map(b => b.title) || [],
      };
      const result = await generateWeeklyProgressReport(input);
      setReport(result.report);

      const { error: insertErr } = await supabase.from('progress_reports').insert({
        student_id: student.uid,
        student_name: student.name,
        report_content: result.report,
        generated_at: new Date().toISOString(),
      });
      if (insertErr) throw insertErr;

      toast({
        title: "Report Generated & Saved! ✨",
        description: "The progress report is ready and has been saved for the student to view.",
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        variant: "destructive",
        title: "Uh oh!",
        description: "There was a problem generating the report.",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleSaveScore = async (submissionId: string) => {
    const score = parseFloat(String(currentScore));
    if (isNaN(score) || score < 0 || score > 10) {
      toast({ variant: "destructive", title: "Invalid Score", description: "Please enter a number between 0 and 10." });
      return;
    }
    try {
      const { error } = await supabase
        .from('worksheet_submissions')
        .update({ score, status: 'graded' })
        .eq('id', submissionId);
      if (error) throw error;
      setWorksheetSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, score, status: 'graded' } : s));
      toast({ title: "Score Saved!" });
      setEditingScoreId(null);
      setCurrentScore('');
    } catch (error) {
      toast({ variant: "destructive", title: "Error saving score." });
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader><Skeleton className="h-12 w-1/2" /></CardHeader>
          <CardContent><Skeleton className="h-24 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-destructive">{error}</div>;
  }

  if (!student) {
    return <div className="p-8 text-center text-muted-foreground">Student data not available.</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <Link href="/teacher" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to Student Roster
      </Link>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Avatar className="h-20 w-20 border-4 border-white shadow-md">
          <AvatarImage src={avatarUrl} alt={student.name} />
          <AvatarFallback>{student.name[0]}</AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold font-headline">{student.name}</h1>
          <p className="text-muted-foreground">{student.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-primary" /> Badge Assignment</CardTitle>
              <CardDescription>Award badges to {student.name} for their achievements.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {availableBadges.map(badge => {
                  const isAssigned = student.badges?.some(b => b.title === badge.title);
                  return (
                    <Button
                      key={badge.title}
                      variant={isAssigned ? "secondary" : "outline"}
                      onClick={() => handleAssignBadge(badge.title)}
                      disabled={isAssigned}
                      className="btn-bounce"
                    >
                      <StarIcon className="w-4 h-4 mr-2" />
                      {badge.title}
                    </Button>
                  );
                })}
              </div>
              <CardTitle className="mt-6 mb-2 text-lg">Assigned Badges</CardTitle>
              <ul className="space-y-2">
                {student.badges && student.badges.length > 0 ? student.badges.map((badge, index) => (
                  <li key={index} className="flex items-center justify-between gap-3 p-2 rounded-md bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-yellow-100 rounded-full">
                        <StarIcon className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{badge.title}</p>
                        <p className="text-xs text-muted-foreground">Awarded on {badge.date}</p>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently remove the "{badge.title}" badge from {student.name}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveBadge(badge)}>Remove Badge</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </li>
                )) : (
                  <p className="text-sm text-muted-foreground">No badges assigned yet.</p>
                )}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-primary" /> Quiz Scores</CardTitle>
              <CardDescription>Recent quiz performance for {student.name}.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingScores ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : quizResults.length > 0 ? (
                <ul className="space-y-4">
                  {quizResults.map((result, index) => (
                    <li key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-sm truncate">{result.quizTitle}</p>
                        <p className="font-semibold text-sm">{result.score}/{result.total} <span className="text-muted-foreground">({result.percentage}%)</span></p>
                      </div>
                      <Progress value={result.percentage} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-10">No quiz scores recorded yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BotIcon className="w-5 h-5 text-primary" /> AI Progress Report</CardTitle>
              <CardDescription>Generate and save a report card based on student data.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teacher-remarks">Teacher's Remarks (Optional)</Label>
                <Textarea
                  id="teacher-remarks"
                  placeholder={`e.g., "Had a great week, but needs to focus more during science class."`}
                  value={teacherRemarks}
                  onChange={(e) => setTeacherRemarks(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              {isGeneratingReport ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                  <p>Generating report...</p>
                </div>
              ) : report ? (
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground bg-secondary/30 p-4 rounded-md">
                  {report}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground p-4 text-center">Click the button to generate an AI-powered progress report for {student.name}.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleGenerateReport} disabled={isGeneratingReport} className="w-full">
                {isGeneratingReport ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Working on it...</> : "Generate New Report"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Worksheet Submissions</CardTitle>
              <CardDescription>Review and grade submitted worksheets.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingWorksheets ? (
                <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : worksheetSubmissions.length > 0 ? (
                <ul className="space-y-4">
                  {worksheetSubmissions.map(sub => (
                    <li key={sub.id} className="p-3 rounded-md bg-secondary/30">
                      <p className="font-semibold text-sm">{sub.worksheetTitle}</p>
                      <a href={sub.submittedLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline break-all flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" /> View Submission
                      </a>
                      <div className="mt-2">
                        {editingScoreId === sub.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={currentScore}
                              onChange={(e) => setCurrentScore(e.target.value)}
                              placeholder="Score / 10"
                              className="h-8"
                            />
                            <Button size="icon" className="h-8 w-8" onClick={() => handleSaveScore(sub.id)}><Check className="w-4 h-4" /></Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                              Score: {sub.score !== undefined ? `${sub.score}/10` : 'Not graded'}
                            </p>
                            <Button variant="ghost" size="sm" onClick={() => { setEditingScoreId(sub.id); setCurrentScore(sub.score || ''); }}>
                              <Edit className="w-4 h-4 mr-2" />
                              {sub.score !== undefined ? 'Edit' : 'Grade'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-10">No worksheets submitted yet.</p>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
