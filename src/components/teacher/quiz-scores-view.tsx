"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Quiz {
  id: string;
  title: string;
}

interface StudentScore {
    studentName: string;
    score: number;
    total: number;
    percentage: number;
}

interface QuizScoresViewProps {
  quiz: Quiz;
  onBack: () => void;
}

export default function QuizScoresView({ quiz, onBack }: QuizScoresViewProps) {
  const [scores, setScores] = useState<StudentScore[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const { data, error } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('quiz_id', quiz.id);

        if (error) throw error;

        if (data) {
          const scoresData: StudentScore[] = data.map((r: any) => {
            const total = r.total_questions || 5;
            return {
              studentName: r.student_name || "Student",
              score: r.score,
              total: total,
              percentage: Math.round((r.score / total) * 100),
            };
          });
          setScores(scoresData.sort((a, b) => b.score - a.score));
        }
      } catch (error: any) {
        console.error("Error fetching scores:", error);
        toast({
          variant: "destructive",
          title: "Failed to load scores",
          description: "There was a problem fetching the quiz scores.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [quiz.id, toast]);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-headline text-2xl">Scores for "{quiz.title}"</DialogTitle>
        <DialogDescription>See how students performed on this quiz.</DialogDescription>
      </DialogHeader>
      <div className="my-4 min-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : scores.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scores.map((score, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{score.studentName}</TableCell>
                  <TableCell className="text-right">{score.score} / {score.total}</TableCell>
                  <TableCell className="text-right">{score.percentage}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            No students have taken this quiz yet.
          </div>
        )}
      </div>
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Quizzes
      </Button>
    </>
  );
}
