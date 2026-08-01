"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Gamepad2, Trash2, PlusCircle, BarChart2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export interface Quiz {
  id: string;
  title: string;
  allowRetake?: boolean;
  createdAt?: any;
}

interface QuizzesListProps {
  selectedClass: string;
  subject: string;
  onCreateClick: () => void;
  onViewScoresClick: (quiz: Quiz) => void;
}

export default function QuizzesList({ selectedClass, subject, onCreateClick, onViewScoresClick }: QuizzesListProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('class_name', selectedClass)
        .eq('subject', subject);

      if (error) throw error;
      if (data) {
        setQuizzes(data.map((q: any) => ({
          id: q.id,
          title: q.title,
          createdAt: q.created_at,
        })));
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();

    const subscription = supabase
      .channel('public:quizzes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quizzes' }, () => {
        fetchQuizzes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [selectedClass, subject]);

  const handleDelete = async (quizId: string) => {
    try {
      // Delete associated quiz results and quiz doc
      await supabase.from('quiz_results').delete().eq('quiz_id', quizId);
      const { error } = await supabase.from('quizzes').delete().eq('id', quizId);

      if (error) throw error;
      
      toast({
        title: "Quiz Deleted",
        description: "The quiz and all its scores have been removed.",
      });
      setQuizzes(prev => prev.filter(q => q.id !== quizId));
    } catch (error: any) {
      console.error("Error deleting quiz:", error);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "Could not delete the quiz.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-lg flex items-center gap-2">
          <Gamepad2 /> Quizzes for {subject}
        </h3>
        <Button onClick={onCreateClick} size="sm" className="btn-bounce">
          <PlusCircle className="mr-2 h-4 w-4" /> Create AI Quiz
        </Button>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-8 border rounded-lg border-dashed">
          <p className="text-muted-foreground text-sm">No quizzes created for this subject yet.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/40 transition-colors">
              <div>
                <p className="font-semibold text-sm">{quiz.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onViewScoresClick(quiz)}>
                  <BarChart2 className="w-4 h-4 mr-1" /> Scores
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Quiz?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{quiz.title}" and all student submissions for it.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(quiz.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
