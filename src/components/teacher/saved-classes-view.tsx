
"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoIcon } from "@/components/icons";

export default function SavedClassesView() {
  return (
    <Card className="flex flex-col items-center justify-center h-64 text-center p-8 bg-card rounded-xl shadow-sm border-dashed">
        <div className="bg-primary/20 p-4 rounded-full mb-4">
            <VideoIcon className="w-12 h-12 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold font-headline mb-2">No Saved Classes Yet</h2>
        <p className="text-muted-foreground">Your recorded live classes will appear here once they are completed.</p>
    </Card>
  );
}
