"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, Link as LinkIcon, Send, CheckCircle } from 'lucide-react';

interface Worksheet {
    id: string;
    title: string;
    link: string;
    createdAt?: string;
}

interface StudentWorksheetsViewProps {
    studentClass: string;
    subject: string;
    studentId: string;
}

export default function StudentWorksheetsView({ studentClass, subject, studentId }: StudentWorksheetsViewProps) {
    const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
    const [submissionLinks, setSubmissionLinks] = useState<{ [worksheetId: string]: string }>({});
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchWorksheets = async () => {
            try {
                const { data, error } = await supabase
                    .from('worksheets')
                    .select('*')
                    .eq('class_name', studentClass)
                    .eq('subject', subject);

                if (error) throw error;

                if (data) {
                    setWorksheets(data.map((w: any) => ({
                        id: w.id,
                        title: w.title,
                        link: w.file_url || w.link || '',
                        createdAt: w.created_at,
                    })));
                }
            } catch (error) {
                console.error("Error fetching worksheets:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWorksheets();
    }, [studentClass, subject]);

    const handleLinkChange = (worksheetId: string, link: string) => {
        setSubmissionLinks(prev => ({ ...prev, [worksheetId]: link }));
    };

    const handleSubmit = async (worksheetId: string, worksheetTitle: string) => {
        const submittedLink = submissionLinks[worksheetId];
        if (!submittedLink) {
            toast({ variant: 'destructive', title: 'Please enter a link.' });
            return;
        }

        toast({ title: 'Worksheet link noted!', description: 'Great job completing your assignment.' });
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-4 py-2">
            <h3 className="font-headline text-lg font-bold flex items-center gap-2">
                <FileText className="text-primary" /> Worksheets for {subject}
            </h3>
            {worksheets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6 border rounded-lg border-dashed">
                    No worksheets assigned yet. Check back soon!
                </p>
            ) : (
                <div className="space-y-3">
                    {worksheets.map((ws) => (
                        <div key={ws.id} className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card hover:bg-secondary/20">
                            <div className="space-y-1">
                                <p className="font-semibold text-sm">{ws.title}</p>
                                {ws.link && (
                                    <a href={ws.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                        <LinkIcon className="w-3 h-3" /> Download / View Worksheet
                                    </a>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="Paste completed work link..."
                                    value={submissionLinks[ws.id] || ''}
                                    onChange={(e) => handleLinkChange(ws.id, e.target.value)}
                                    className="text-xs h-8 sm:w-48"
                                />
                                <Button size="sm" onClick={() => handleSubmit(ws.id, ws.title)} className="btn-bounce h-8">
                                    <Send className="w-3 h-3 mr-1" /> Submit
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
