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
        <div className="space-y-6 py-4">
          {/* User Photo with Success Overlay - Made Bigger */}
          <div className="flex justify-center">
            <div className="relative">
              {userPhoto ? (
                <div className="w-28 h-32 rounded-full overflow-hidden border-3 border-green-500 shadow-lg">
                  <img 
                    src={userPhoto} 
                    alt="Your analysis complete" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-28 h-32 bg-gradient-to-b from-primary/20 to-primary/5 rounded-full border-3 border-green-500 shadow-lg" />
              )}
              {/* Green check overlay - Same size */}
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Your FaceBloat Score: <span className="blur-[2px] select-none">7.23</span></span>
              </div>
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">7 Primary Bloat Triggers Identified</span>
              </div>
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Personalized Bloat Recovery Timeline</span>
              </div>
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">24 Custom Recommendations Generated</span>
              </div>
            </div>

            {/* Side-by-side layout on desktop, stacked on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Locked Insights */}
              <div className="bg-muted/50 rounded-lg p-4 border border-muted-foreground/20 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🔒</span>
                  <span className="text-sm font-semibold text-foreground">EXCLUSIVE INSIGHTS LOCKED:</span>
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Advanced bloat pattern analysis</li>
                  <li>• Day-by-day optimization schedule</li>
                  <li>• Photo-specific improvement tactics</li>
                  <li>• Weekly progress tracking system</li>
                </ul>
              </div>

              {/* Urgency Section */}
              <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800 shadow-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300">
                    <span className="text-base">⚠️</span>
                    <span className="text-sm font-semibold">DON'T LET ANOTHER MONTH PASS LOOKING PUFFY</span>
                  </div>
                  <div className="space-y-1 text-xs text-orange-700 dark:text-orange-400">
                    <div className="flex items-center gap-2">
                      <span>😤</span>
                      <span>While you wait, your bloat patterns get worse</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📸</span>
                      <span>Stop avoiding cameras and mirrors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🎯</span>
                      <span>Join 2,000+ people who took action this month</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="space-y-3">
            <Link to="/signup">
              <Button 
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg shadow-xl transform hover:scale-105 transition-all duration-200 text-base"
                onClick={onSignupClick}
              >
                {signupProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{signupProcessingText || 'Processing...'}</span>
                  </div>
                ) : (
                  <>
                    🎉 UNLOCK ANALYSIS
                  </>
                )}
              </Button>
            </Link>
            
            <p className="text-xs text-center text-muted-foreground">
              Private • Secure • No spam 
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 rounded-lg p-6 border-2 border-dashed border-primary/20">
      {/* Mobile: Vertical layout, Desktop: Horizontal layout */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-8 space-y-6 md:space-y-0">
        
        {/* Face scan oval - Centered on mobile, left on desktop */}
        <div className="flex justify-center md:justify-start flex-shrink-0">
          {userPhoto ? (
            /* User's Photo - Responsive sizing */
            <div className="w-40 h-48 md:w-44 md:h-52 rounded-full relative overflow-hidden border-2 border-primary/30 flex items-center justify-center">
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
            <div className="w-40 h-48 md:w-44 md:h-52 bg-gradient-to-b from-primary/20 to-primary/5 rounded-full relative overflow-hidden">
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
        
        {/* Scanning status - Below image on mobile, right side on desktop */}
        <div className="flex-1 flex flex-col justify-center items-center md:items-start space-y-4">
          <div className="flex items-center gap-3 text-primary">
            {/* Green pulse: same size on mobile, 3x bigger on desktop */}
            <div className="w-4 h-4 md:w-12 md:h-12 bg-green-500 rounded-full animate-pulse" />
            {/* Scanning Active text: same size on mobile, 3x bigger on desktop */}
            <span className="text-lg md:text-5xl font-medium">Scanning Active</span>
          </div>
          
          {/* Fixed height container for cycling text - Match analysis steps size */}
          <div className="relative h-8 md:h-6 overflow-hidden text-center md:text-left w-full">
            <div 
              className={`absolute inset-0 flex items-center justify-center md:justify-start text-sm text-muted-foreground transition-all duration-300 ${
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
