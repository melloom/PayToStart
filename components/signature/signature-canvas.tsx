"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SignatureCanvasProps {
  onSignatureChange: (signatureDataUrl: string | null) => void;
  value?: string | null;
}

export function SignatureCanvas({ onSignatureChange, value }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!value);

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Make canvas responsive - use container width
    const container = canvas.parentElement;
    const containerWidth = container?.clientWidth || 600;
    const aspectRatio = 3; // 3:1 ratio (width:height)
    
    // Set canvas size with high DPI for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = Math.min(containerWidth - 32, 600); // Account for padding, max 600px
    const displayHeight = Math.max(150, Math.min(250, displayWidth / aspectRatio));
    
    // Save current signature before resizing if it exists
    let currentSignatureData: string | null = null;
    if (canvas.width > 0 && canvas.height > 0 && hasSignature) {
      currentSignatureData = canvas.toDataURL();
    }
    
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    // Set canvas styling with high DPI support
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = "#1f2937"; // Dark gray for better visibility
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, displayWidth, displayHeight);
    }

    // Load existing signature if provided
    if (value) {
      const img = new Image();
      img.onload = () => {
        if (ctx) {
          ctx.clearRect(0, 0, displayWidth, displayHeight);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, displayWidth, displayHeight);
          ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
        }
        setHasSignature(true);
      };
      img.src = value;
    } else if (currentSignatureData) {
      // Restore signature after resize
      const img = new Image();
      img.onload = () => {
        if (ctx) {
          ctx.clearRect(0, 0, displayWidth, displayHeight);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, displayWidth, displayHeight);
          ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
        }
      };
      img.src = currentSignatureData;
    }
  };

  useEffect(() => {
    setupCanvas();
    
    // Handle window resize
    const handleResize = () => {
      setupCanvas();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [value]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();

    // Update signature status
    if (!hasSignature) {
      setHasSignature(true);
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      updateSignature();
    }
  };

  const updateSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    onSignatureChange(dataUrl);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSignatureChange(null);
  };

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 p-4 sm:p-6 relative transition-colors hover:border-gray-400 dark:hover:border-gray-500">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full cursor-crosshair touch-none block mx-auto"
          style={{ 
            minHeight: "150px",
            maxHeight: "250px",
            aspectRatio: "3/1"
          }}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4">
            <svg 
              className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
              />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center font-medium">
              Draw your signature here
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
              Works with mouse or touch
            </p>
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        {hasSignature && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearSignature}
            className="w-full sm:w-auto sm:flex-shrink-0"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Signature
          </Button>
        )}
        <p className="text-xs text-gray-600 dark:text-gray-400 flex-1 text-center sm:text-left">
          <span className="font-medium">Optional:</span> Draw your signature above, or just use your typed name below.
        </p>
      </div>
    </div>
  );
}

