
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BookCopy, Download, Share2, ExternalLink } from 'lucide-react';

const syllabusMap: { [key: string]: string } = {
  PG: '/documents/PG_Syllabus.pdf',
  Nursery: '/documents/Nursery_Syllabus.pdf',
  KG: '/documents/KG_Syllabus.pdf',
  'Class 1': '/documents/Grade 1_Syllabus.pdf',
  'Class 2': '/documents/Grade 2_Syllabus.pdf',
  'Class 3': '/documents/Grade 3_Syllabus.pdf',
};

const classesWithSyllabus = Object.keys(syllabusMap);

export default function SyllabusView() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const { toast } = useToast();

  const syllabusUrl = selectedClass ? syllabusMap[selectedClass] : null;

  const handleShare = async () => {
    if (!syllabusUrl) return;
    try {
      const fullUrl = window.location.origin + syllabusUrl;
      await navigator.clipboard.writeText(fullUrl);
      toast({
        title: "Link Copied!",
        description: "The syllabus link has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: "Failed to Copy",
        description: "Could not copy the link. Please try again.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookCopy className="w-6 h-6" />
          Syllabus Center
        </CardTitle>
        <CardDescription>
          View, share, and manage the curriculum for each class.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-w-xs mb-6">
          <Select onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select a class to view syllabus..." />
            </SelectTrigger>
            <SelectContent>
              {classesWithSyllabus.map((className) => (
                <SelectItem key={className} value={className}>
                  {className}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {syllabusUrl ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
              <a href={syllabusUrl} target="_blank" rel="noopener noreferrer" className="sm:hidden">
                <Button className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Syllabus (New Tab)
                </Button>
              </a>
              <a href={syllabusUrl} download>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Download Syllabus
                </Button>
              </a>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share Link
              </Button>
            </div>
            <div className="hidden sm:block aspect-video w-full rounded-lg overflow-hidden border">
              <iframe
                src={syllabusUrl}
                className="w-full h-full"
                title={`${selectedClass} Syllabus`}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-muted/50 rounded-lg border-dashed">
            <div className="bg-primary/20 p-4 rounded-full mb-4">
              <BookCopy className="w-12 h-12 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold font-headline">Select a Class</h3>
            <p className="text-muted-foreground">Choose a class from the dropdown to view its syllabus.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
