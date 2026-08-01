"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Eraser, RotateCcw, Sparkles, Download, Check, Star, Brush } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface CreativeCanvasProps {
  studentClass: string;
  studentId: string;
  subject: string;
}

const colorPalette = [
  "#2c6956", "#ba1a1a", "#795836", "#2563eb", "#d97706",
  "#7c3aed", "#db2777", "#059669", "#ffffff", "#000000"
];

const colorMixes = [
  { c1: "#ba1a1a", c2: "#d97706", result: "#ea580c", name1: "Red", name2: "Yellow", resName: "Orange" },
  { c1: "#2563eb", c2: "#d97706", result: "#059669", name1: "Blue", name2: "Yellow", resName: "Green" },
  { c1: "#ba1a1a", c2: "#2563eb", result: "#7c3aed", name1: "Red", name2: "Blue", resName: "Purple" },
  { c1: "#ba1a1a", c2: "#ffffff", result: "#db2777", name1: "Red", name2: "White", resName: "Pink" },
];

export default function CreativeCanvas({ studentClass, studentId, subject }: CreativeCanvasProps) {
  const [activeTab, setActiveTab] = useState<"draw" | "mix">("draw");
  const [brushColor, setBrushColor] = useState("#2c6956");
  const [brushSize, setBrushSize] = useState(6);
  const [isErasing, setIsErasing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { toast } = useToast();

  // Color Mix Lab state
  const [mixIndex, setMixIndex] = useState(0);
  const [selectedColor1, setSelectedColor1] = useState<string | null>(null);
  const [selectedColor2, setSelectedColor2] = useState<string | null>(null);
  const [mixResult, setMixResult] = useState<string | null>(null);
  const [mixScore, setMixScore] = useState(0);

  const currentTargetMix = colorMixes[mixIndex % colorMixes.length];

  useEffect(() => {
    if (activeTab === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [activeTab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.strokeStyle = isErasing ? "#ffffff" : brushColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleMixClick = (color: string) => {
    if (!selectedColor1) {
      setSelectedColor1(color);
    } else if (!selectedColor2) {
      setSelectedColor2(color);
    }
  };

  const evaluateMix = () => {
    if (!selectedColor1 || !selectedColor2) return;
    
    const isCorrect =
      (selectedColor1 === currentTargetMix.c1 && selectedColor2 === currentTargetMix.c2) ||
      (selectedColor1 === currentTargetMix.c2 && selectedColor2 === currentTargetMix.c1);

    if (isCorrect) {
      setMixResult(currentTargetMix.result);
      setMixScore(prev => prev + 10);
      toast({
        title: `Magical Color Created! 🎨`,
        description: `${currentTargetMix.name1} + ${currentTargetMix.name2} = ${currentTargetMix.resName}!`,
      });
      setTimeout(() => {
        setSelectedColor1(null);
        setSelectedColor2(null);
        setMixResult(null);
        setMixIndex(prev => prev + 1);
      }, 1500);
    } else {
      toast({
        variant: "destructive",
        title: "Oops! Try another mix!",
        description: `Try mixing colors to create ${currentTargetMix.resName}!`,
      });
      setSelectedColor1(null);
      setSelectedColor2(null);
    }
  };

  return (
    <Card className="border border-[#A8E6CF]/30 shadow-lg rounded-2xl bg-white overflow-hidden">
      <CardHeader className="bg-[#f8faf7] border-b border-[#bfc9c3]/30 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold font-headline text-[#2D3436] flex items-center gap-2">
              <Palette className="w-6 h-6 text-[#2c6956]" />
              Art & Color Studio ({studentClass})
            </CardTitle>
            <p className="text-xs text-[#636E72] font-body mt-1">
              Topic: Color Mixing & Creative Drawing
            </p>
          </div>
          <div className="flex bg-[#eceeeb] p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveTab("draw")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "draw"
                  ? "bg-[#2c6956] text-white shadow-sm"
                  : "text-[#404945] hover:bg-white/50"
              }`}
            >
              🎨 Free Drawing
            </button>
            <button
              onClick={() => setActiveTab("mix")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "mix"
                  ? "bg-[#2c6956] text-white shadow-sm"
                  : "text-[#404945] hover:bg-white/50"
              }`}
            >
              🧪 Color Mix Lab
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {activeTab === "draw" ? (
          <div className="space-y-4">
            {/* Drawing Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#f2f4f1] rounded-xl border border-[#bfc9c3]/30">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#404945]">Colors:</span>
                <div className="flex flex-wrap gap-1.5">
                  {colorPalette.map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        setBrushColor(color);
                        setIsErasing(false);
                      }}
                      style={{ backgroundColor: color }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform squishy-btn ${
                        brushColor === color && !isErasing ? "border-[#2c6956] scale-110 shadow-sm" : "border-white"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#404945]">Size:</span>
                {[3, 6, 12, 20].map(size => (
                  <button
                    key={size}
                    onClick={() => setBrushSize(size)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold border transition-transform ${
                      brushSize === size ? "bg-[#2c6956] text-white border-[#2c6956]" : "bg-white text-[#404945]"
                    }`}
                  >
                    {size}
                  </button>
                ))}

                <Button
                  variant={isErasing ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsErasing(!isErasing)}
                  className="ml-2 font-bold text-xs"
                >
                  <Eraser className="w-3.5 h-3.5 mr-1" />
                  Eraser
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCanvas}
                  className="font-bold text-xs text-red-600 hover:text-red-700"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Canvas Surface */}
            <div className="relative border-2 border-dashed border-[#bfc9c3]/50 rounded-2xl overflow-hidden bg-white shadow-inner flex justify-center items-center">
              <canvas
                ref={canvasRef}
                width={700}
                height={400}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
                className="w-full h-[350px] sm:h-[400px] cursor-crosshair touch-none"
              />
            </div>
          </div>
        ) : (
          /* Color Mix Lab */
          <div className="space-y-6 max-w-xl mx-auto py-4">
            <div className="bg-[#FFF9C4] p-4 rounded-xl border border-[#795836]/20 text-center">
              <span className="text-xs font-bold text-[#795836] uppercase tracking-wider block mb-1">
                Challenge Goal
              </span>
              <h4 className="text-xl font-bold text-[#2D3436]">
                Mix two colors to create <span className="text-[#2c6956] font-extrabold underline">{currentTargetMix.resName}</span>!
              </h4>
            </div>

            {/* Beaker / Mixing Station */}
            <div className="flex items-center justify-center gap-4 py-4">
              <div
                style={{ backgroundColor: selectedColor1 || "#e2e8f0" }}
                className="w-20 h-20 rounded-2xl border-4 border-white shadow-md flex items-center justify-center font-bold text-xs transition-all"
              >
                {!selectedColor1 && "Color 1"}
              </div>
              <span className="text-2xl font-bold text-[#404945]">+</span>
              <div
                style={{ backgroundColor: selectedColor2 || "#e2e8f0" }}
                className="w-20 h-20 rounded-2xl border-4 border-white shadow-md flex items-center justify-center font-bold text-xs transition-all"
              >
                {!selectedColor2 && "Color 2"}
              </div>
              <span className="text-2xl font-bold text-[#404945]">=</span>
              <div
                style={{ backgroundColor: mixResult || "#e2e8f0" }}
                className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center font-bold text-sm text-white transition-all transform hover:scale-105"
              >
                {mixResult ? currentTargetMix.resName : "Result"}
              </div>
            </div>

            {/* Color Select Palette */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-center text-[#636E72]">
                Select 2 primary colors to mix:
              </p>
              <div className="flex justify-center gap-3">
                {[
                  { hex: "#ba1a1a", name: "Red" },
                  { hex: "#2563eb", name: "Blue" },
                  { hex: "#d97706", name: "Yellow" },
                  { hex: "#ffffff", name: "White" },
                ].map(c => (
                  <button
                    key={c.hex}
                    onClick={() => handleMixClick(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-14 h-14 rounded-2xl border-2 border-white shadow-md flex flex-col items-center justify-end p-1 text-[10px] font-bold squishy-btn ${
                      c.hex === "#ffffff" ? "text-black border-gray-300" : "text-white"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mix Action & Reset */}
            <div className="flex justify-center gap-3 pt-2">
              <Button
                onClick={evaluateMix}
                disabled={!selectedColor1 || !selectedColor2}
                className="bg-[#2c6956] hover:bg-[#1e4b3d] text-white font-bold rounded-xl px-8 squishy-btn"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Mix Colors!
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedColor1(null);
                  setSelectedColor2(null);
                }}
                className="rounded-xl font-bold"
              >
                Reset
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
