import { useState, useEffect } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '../button';
import { Link } from "@tanstack/react-router";

interface FaceScanningVisualizationProps {
  progress: number;
  isComplete: boolean;
  signupProcessing: boolean;
  signupProcessingText: string;
  userPhoto?: string | null;
  onSignupClick: () => void;
}

export function FaceScanningVisualization({ 
  progress, 
  isComplete, 
  signupProcessing, 
  signupProcessingText, 
  userPhoto,
  onSignupClick 
}: FaceScanningVisualizationProps) {
  // Cycling analysis text
  const analysisTexts = [
    "Normalizing lighting and camera angle…",
    "Locating key facial landmarks…",
    "Measuring jawline definition and angles…",
    "Checking left–right symmetry…",
    "Estimating under-eye puffiness…",
    "Analyzing cheekbone prominence…",
    "Scoring submental (under-chin) fullness…",
    "Detecting color and skin-tone shifts…",
    "Mapping texture and shine patterns…",
    "Spotting signs of a high-sodium day…",
    "Screening for sleep-debt cues…",
    "Estimating bloat amplification from camera angle…",
    "Simulating quick-fix lighting improvements…",
    "Projecting platform-fit scores (LinkedIn, IG, Zoom)…",
    "Finalizing your Bloat Fingerprint…"
  ];

  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [textState, setTextState] = useState<'showing' | 'striking' | 'swiping'>('showing');

  // Cycle through analysis texts
  useEffect(() => {
    if (isComplete) return;

    const interval = setInterval(() => {
      // Strike through current text
      setTextState('striking');
      
      setTimeout(() => {
        // Swipe out effect
        setTextState('swiping');
        
        setTimeout(() => {
          // Move to next text and show
          setCurrentTextIndex((prev) => (prev + 1) % analysisTexts.length);
          setTextState('showing');
        }, 300); // Swipe duration
      }, 800); // Strike-through duration
    }, 2500); // Total cycle time

    return () => clearInterval(interval);
  }, [isComplete, analysisTexts.length]);
  if (isComplete) {
    return (
      <div className="bg-muted/30 rounded-lg p-6 border-2 border-dashed border-primary/20">
        <div className="text-center space-y-6 py-8">
          <div className="space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto animate-pulse" />
            <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">Analysis Complete!</h3>
            <p className="text-green-700 dark:text-green-300">
              Your personalized FaceBloat report is ready
            </p>
          </div>
          
          <div className="max-w-sm mx-auto space-y-3">
            <Link to="/signup">
              <Button 
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                onClick={onSignupClick}
              >
                {signupProcessing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {signupProcessingText || 'Processing...'}
                  </div>
                ) : (
                  <>
                    🎉 UNLOCK NOW - FREE
                  </>
                )}
              </Button>
            </Link>
            
            <p className="text-xs text-green-600 dark:text-green-400">
              Private • No spam • Magic link login
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 rounded-lg p-6 border-2 border-dashed border-primary/20">
      <div className="flex items-center justify-center space-x-4">
        <div className="relative">
          {userPhoto ? (
            /* User's Photo - Made Bigger */
            <div className="w-32 h-40 rounded-full relative overflow-hidden border-2 border-primary/30">
              <img 
                src={userPhoto} 
                alt="Your face scan" 
                className="w-full h-full object-cover"
              />
              {/* Scanning line effect over photo */}
              <div 
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"
                style={{ 
                  top: `${(progress / 100) * 80 + 10}%`,
                  transition: 'top 0.5s ease-out'
                }}
              />
            </div>
          ) : (
            /* Fallback artificial face */
            <div className="w-24 h-32 bg-gradient-to-b from-primary/20 to-primary/5 rounded-full relative overflow-hidden">
              {/* Scanning line effect */}
              <div 
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"
                style={{ 
                  top: `${(progress / 100) * 80 + 10}%`,
                  transition: 'top 0.5s ease-out'
                }}
              />
              {/* Face outline - more human-like */}
              <div className="absolute inset-2 border-2 border-primary/30 rounded-full" />
              
              {/* Forehead */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-primary/10 rounded-full" />
              
              {/* Eyes */}
              <div className="absolute top-8 left-6 w-2 h-2 bg-primary/50 rounded-full" />
              <div className="absolute top-8 right-6 w-2 h-2 bg-primary/50 rounded-full" />
              
              {/* Eyebrows */}
              <div className="absolute top-7 left-6 w-2 h-0.5 bg-primary/40 rounded-full" />
              <div className="absolute top-7 right-6 w-2 h-0.5 bg-primary/40 rounded-full" />
              
              {/* Nose */}
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-1 h-3 bg-primary/40 rounded-full" />
              <div className="absolute top-14 left-1/2 transform -translate-x-1/2 -ml-1 w-2 h-1 bg-primary/30 rounded-full" />
              
              {/* Mouth */}
              <div className="absolute top-18 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-primary/40 rounded-full" />
              
              {/* Chin */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-primary/20 rounded-full" />
              
              {/* Cheeks */}
              <div className="absolute top-11 left-4 w-3 h-3 bg-primary/15 rounded-full" />
              <div className="absolute top-11 right-4 w-3 h-3 bg-primary/15 rounded-full" />
            </div>
          )}
        </div>
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3 text-primary">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-base font-medium">Scanning Active</span>
          </div>
          <div className="text-sm text-muted-foreground h-5 overflow-hidden">
            <div 
              className={`transition-all duration-300 ${
                textState === 'striking' ? 'line-through opacity-60' : 
                textState === 'swiping' ? 'transform translate-x-[-100%] opacity-0' : 
                'transform translate-x-0 opacity-100'
              }`}
            >
              {analysisTexts[currentTextIndex]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
