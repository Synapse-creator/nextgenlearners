"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, Trash2, Link as LinkIcon, Plus } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Worksheet {
    id: string;
    title: string;
    link: string;
    createdAt?: string;
}

interface WorksheetsViewProps {
    selectedClass: string;
    subject: string;
}

const formSchema = z.object({
    title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
    link: z.string().url({ message: 'Please enter a valid URL.' }),
});

export default function WorksheetsView({ selectedClass, subject }: WorksheetsViewProps) {
    const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            link: '',
        },
    });

    const fetchWorksheets = async () => {
        try {
            const { data, error } = await supabase
                .from('worksheets')
                .select('*')
                .eq('class_name', selectedClass)
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

    useEffect(() => {
        fetchWorksheets();

        const subscription = supabase
            .channel('public:worksheets')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'worksheets' }, () => {
                fetchWorksheets();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [selectedClass, subject]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const { error } = await supabase.from('worksheets').insert([
                {
                    title: values.title,
                    file_url: values.link,
                    class_name: selectedClass,
                    subject: subject,
                },
            ]);

            if (error) throw error;

            toast({ title: 'Worksheet added successfully!' });
            form.reset();
            fetchWorksheets();
        } catch (error: any) {
            toast({ variant: 'destructive', title: error.message || 'Error adding worksheet.' });
            console.error(error);
        }
    };
    
    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase.from('worksheets').delete().eq('id', id);
            if (error) throw error;

            toast({ title: 'Worksheet deleted successfully!' });
            setWorksheets(prev => prev.filter(w => w.id !== id));
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error deleting worksheet.' });
            console.error(error);
        }
    };

    return (
        <>
        <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Worksheets for {subject}</DialogTitle>
            <DialogDescription>Manage worksheets for {selectedClass}.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 my-4 p-4 border rounded-lg bg-secondary/20">
                <h4 className="font-semibold text-sm">Add New Worksheet</h4>
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Addition Practice Sheet" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Worksheet Link (PDF/Google Drive)</FormLabel>
                            <FormControl>
                                <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" size="sm" className="btn-bounce">
                    <Plus className="w-4 h-4 mr-2" /> Add Worksheet
                </Button>
            </form>
        </Form>

        <div className="space-y-3 my-4">
            {loading ? (
                <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : worksheets.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-4">No worksheets added yet.</p>
            ) : (
                worksheets.map((worksheet) => (
                    <div key={worksheet.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/40">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-primary" />
                            <div>
                                <p className="font-semibold text-sm">{worksheet.title}</p>
                                <a href={worksheet.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                    <LinkIcon className="w-3 h-3" /> View Document
                                </a>
                            </div>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Worksheet?</AlertDialogTitle>
                                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(worksheet.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                ))
            )}
        </div>
        </>
    );
}
