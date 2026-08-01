"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, BookOpen, Lightbulb, Compass, HelpCircle, Star } from "lucide-react";
import { generateReadingPassage } from "@/ai/flows/generate-reading-passage-flow";

interface WordExplorerProps {
  studentName?: string;
}

const presetTopics = [
  { name: "🚀 Space & Stars", topic: "Outer Space, Planets and Stars" },
  { name: "🦁 Animals & Jungle", topic: "Wild Animals and Forest Nature" },
  { name: "🦖 Dinosaurs", topic: "Prehistoric Dinosaurs" },
  { name: "🌊 Ocean World", topic: "Sea Creatures and Ocean Life" },
  { name: "🤖 Robots & Tech", topic: "Robots and Future Inventions" },
  { name: "🌱 Plant Kingdom", topic: "How Flowers and Trees Grow" },
];

export default function WordExplorer({ studentName }: WordExplorerProps) {
  const [topicInput, setTopicInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [explorerResult, setExplorerResult] = useState<{
    topic: string;
    passage: string;
  } | null>(null);
  const { toast } = useToast();

  const handleExplore = async (selectedTopic: string) => {
    if (!selectedTopic.trim()) {
      toast({ variant: "destructive", title: "Please select or type a topic to explore!" });
      return;
    }

    setIsLoading(true);
    setExplorerResult(null);

    try {
      const result = await generateReadingPassage({
        studentClass: "Class 3",
        topic: selectedTopic,
      });

      setExplorerResult({
        topic: selectedTopic,
        passage: result.passage,
      });
      toast({
        title: "Knowledge Discovered! 🚀",
        description: `Here is your fun learning guide for ${selectedTopic}!`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Explorer Encountered a Hitch",
        description: "Please try another topic!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-[#A8E6CF]/40 shadow-xl rounded-2xl bg-white overflow-hidden">
      <CardHeader className="bg-[#f8faf7] border-b border-[#bfc9c3]/30 pb-4">
        <CardTitle className="text-xl font-bold font-headline text-[#2D3436] flex items-center gap-2">
          <Compass className="w-6 h-6 text-[#2c6956]" />
          AI Word & Knowledge Explorer
        </CardTitle>
        <CardDescription className="text-xs text-[#636E72]">
          Discover fun facts, exciting stories, and new words about any topic!
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* Preset Topic Buttons */}
        <div>
          <span className="text-xs font-bold text-[#404945] block mb-2">
            Choose an exciting topic to explore:
          </span>
          <div className="flex flex-wrap gap-2">
            {presetTopics.map((t) => (
              <button
                key={t.name}
                onClick={() => {
                  setTopicInput(t.topic);
                  handleExplore(t.topic);
                }}
                disabled={isLoading}
                className="px-3 py-1.5 bg-[#f2f4f1] hover:bg-[#A8E6CF]/30 border border-[#bfc9c3]/40 rounded-xl text-xs font-bold text-[#2D3436] transition-all squishy-btn"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Topic Search Input */}
        <div className="flex gap-2 pt-2">
          <Input
            placeholder="Or type a topic (e.g. Rainbows, Honeybees, Kindness)..."
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExplore(topicInput)}
            className="bg-white border-[#bfc9c3]/40 rounded-xl text-sm"
          />
          <Button
            onClick={() => handleExplore(topicInput)}
            disabled={isLoading || !topicInput.trim()}
            className="bg-[#2c6956] hover:bg-[#1e4b3d] text-white font-bold rounded-xl px-5 squishy-btn"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Explore"}
          </Button>
        </div>

        {/* Results Container */}
        {isLoading && (
          <div className="flex items-center justify-center p-8 text-[#636E72] text-sm">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-[#2c6956]" />
            Exploring topic knowledge...
          </div>
        )}

        {explorerResult && !isLoading && (
          <div className="mt-4 p-5 bg-[#CAF0F8]/30 border border-[#2563eb]/20 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#2563eb] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> Topic: {explorerResult.topic}
              </span>
              <span className="text-xs font-bold text-[#2c6956] bg-[#A8E6CF]/40 px-3 py-0.5 rounded-full">
                Knowledge Discovery
              </span>
            </div>

            <p className="text-sm md:text-base text-[#2D3436] leading-relaxed font-body whitespace-pre-line">
              {explorerResult.passage}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
