"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Video, Maximize2, Minimize2, ExternalLink, ShieldCheck } from 'lucide-react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ZoomMeetingProps {
  meetingId: string;
  passcode?: string;
  topic?: string;
  userName?: string;
  onClose: () => void;
}

export default function ZoomMeeting({
  meetingId,
  passcode = '',
  topic = 'NextGen Learners Live Class',
  userName = 'Student',
  onClose,
}: ZoomMeetingProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const cleanMeetingId = meetingId.replace(/\s+/g, '');

  // Zoom Web Client Join URL with audio/video iframe permissions
  const zoomEmbedUrl = `https://zoom.us/wc/${cleanMeetingId}/join?prefer=1&un=${encodeURIComponent(userName)}${passcode ? `&pwd=${encodeURIComponent(passcode)}` : ''}`;

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto bg-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/30">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Video className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-lg text-white flex items-center gap-2">
              {topic}
              <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Live Class Active
              </span>
            </h3>
            <p className="text-xs text-slate-400">Meeting ID: {cleanMeetingId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={zoomEmbedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-700/60 px-3 py-1.5 rounded-lg border border-slate-600 transition-colors"
          >
            Open in Zoom Tab <ExternalLink className="w-3 h-3" />
          </a>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onClose}
            className="rounded-lg font-bold"
          >
            <X className="w-4 h-4 mr-1" /> Leave Class
          </Button>
        </div>
      </div>

      {/* Embedded Meeting Player Canvas */}
      <div className={`relative w-full ${isFullscreen ? 'h-[80vh]' : 'h-[550px]'} bg-black`}>
        <iframe
          src={zoomEmbedUrl}
          title="Zoom Live Classroom"
          className="w-full h-full border-0"
          allow="camera; microphone; display-capture; autoplay; fullscreen"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-modals"
        />
      </div>

      {/* Footer Instructions */}
      <div className="p-3 bg-slate-800/80 border-t border-slate-700/50 text-xs text-slate-400 flex items-center justify-between">
        <p>💡 Tip: Ensure your camera and microphone permissions are allowed in your browser.</p>
        <p className="font-semibold text-primary">NextGen Learners Interactive Classroom</p>
      </div>
    </div>
  );
}
