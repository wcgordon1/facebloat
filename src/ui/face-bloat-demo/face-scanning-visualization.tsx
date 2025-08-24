import { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '../button';
import { Link } from "@tanstack/react-router";
import { CountdownTimer } from './countdown-timer';
import { TrustBadges } from './trust-badges';
import { MobileProgressBar } from './mobile-progress-bar';
import { SwipeableInsights } from './swipeable-insights';

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
      <>
        {/* Mobile Progress Bar */}
        <MobileProgressBar />
        
      <div className="bg-muted/30 rounded-lg p-6 border-2 border-dashed border-primary/20">
          <div className="space-y-6 py-4">
            
            {/* Countdown Timer */}
            <div className="flex justify-center">
              <CountdownTimer initialMinutes={10} />
            </div>
          {/* User Photo with Dramatic Scanning Animation */}
          <div className="flex justify-center">
            <div className="relative">
              {userPhoto ? (
                <div className="w-44 h-48 md:w-52 md:h-56 rounded-full overflow-hidden border-4 border-green-500 shadow-2xl ring-4 ring-green-500/20 ring-offset-4 ring-offset-background">
                  <img 
                    src={userPhoto} 
                    alt="Your analysis complete" 
                    className="w-full h-full object-cover"
                  />
                  {/* Animated scanning lines - continues after analysis */}
                  <div className="absolute inset-0">
                    <div 
                      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                      style={{ 
                        top: '20%',
                        animation: 'scanLine 3s ease-in-out infinite'
                      }}
                    />
                    <div 
                      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent"
                      style={{ 
                        top: '60%',
                        animation: 'scanLine 3s ease-in-out infinite 1s'
                      }}
                    />
                  </div>
                  {/* Scanning overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-green-500/10 animate-pulse" />
                </div>
              ) : (
                <div className="w-44 h-48 md:w-52 md:h-56 bg-gradient-to-b from-primary/20 to-primary/5 rounded-full border-4 border-green-500 shadow-2xl ring-4 ring-green-500/20 ring-offset-4 ring-offset-background" />
              )}
              {/* Larger, more prominent success check */}
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-xl ring-4 ring-green-500/20 animate-bounce">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          {/* Results Summary - Exciting Analysis Reveal */}
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-xl p-5 border-2 border-green-200 dark:border-green-700 shadow-lg">
              <h3 className="text-lg font-bold text-center mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                🎯 YOUR ANALYSIS RESULTS
              </h3>
              
              <div className="space-y-3">
                {/* Score with dramatic reveal */}
                <div className="relative bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700 shadow-md">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <div className="relative">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">📊</span>
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse" />
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Your FaceBloat Score:</span>
                    </div>
                    <div className="relative self-center md:self-auto">
                      <span className="blur-[2px] select-none animate-pulse bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-black text-xl">7.23</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded px-2 py-1 opacity-20 animate-pulse" />
                    </div>
                  </div>
                  <div className="mt-2 bg-green-100 dark:bg-green-900/20 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full animate-pulse" style={{width: '73%'}} />
                  </div>
                </div>

                {/* Triggers with badge */}
                <div className="relative bg-white dark:bg-gray-800 rounded-lg p-4 border border-orange-200 dark:border-orange-700 shadow-md">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Bloat Triggers Identified:</span>
                    </div>
                    <div className="flex items-center gap-2 self-center md:self-auto">
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                        7 FOUND
                      </span>
                      <span className="text-xs text-red-600 animate-pulse">🔥 Critical</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-orange-600 dark:text-orange-400 text-center md:text-left">
                    <span className="blur-[1px]">High sodium, stress, poor sleep...</span> <span className="font-bold">+4 more</span>
                  </div>
                </div>

                {/* Timeline with progress */}
                <div className="relative bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700 shadow-md">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">📅</span>
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Recovery Timeline:</span>
                    </div>
                    <div className="text-center md:text-right self-center md:self-auto">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                        3-7 DAYS
                      </div>
                      <div className="text-xs text-blue-600 mt-1">✨ Personalized</div>
                    </div>
                  </div>
                </div>

                {/* Recommendations with count */}
                <div className="relative bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700 shadow-md">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">🎯</span>
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Custom Recommendations:</span>
                    </div>
                    <div className="text-center md:text-right self-center md:self-auto">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                        24 READY
                      </div>
                      <div className="text-xs text-purple-600 mt-1">⚡ AI-Generated</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Swipeable Insights */}
            <SwipeableInsights />

            {/* Side-by-side layout on desktop, stacked on mobile */}
            <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Premium Locked Content - Peek Behind Curtain */}
              <div className="relative bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-xl p-5 border-2 border-purple-200 dark:border-purple-700 shadow-xl overflow-hidden">
                {/* Premium background pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5" />
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-xl" />
                
                <div className="relative">
                  {/* Header with premium indicators */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold">🔒</span>
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-purple-800 dark:text-purple-300">PREMIUM INSIGHTS</h4>
                        <p className="text-xs text-purple-600 dark:text-purple-400">Unlock to reveal</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                        $67 VALUE
                      </div>
                    </div>
                  </div>

                  {/* Premium content previews */}
                  <div className="space-y-3">
                    {/* Advanced Analysis Preview */}
                    <div className="relative bg-white/70 dark:bg-gray-800/70 rounded-lg p-3 border border-purple-200 dark:border-purple-600">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">🧠</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Advanced Bloat Pattern Analysis</div>
                          <div className="text-xs text-gray-500 blur-[1px] select-none">Your asymmetry score: 3.2 (high impact on...</div>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-bold">
                          $23
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-white/80 dark:via-gray-800/80 dark:to-gray-800/80" />
                    </div>

                    {/* Schedule Preview */}
                    <div className="relative bg-white/70 dark:bg-gray-800/70 rounded-lg p-3 border border-purple-200 dark:border-purple-600">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">📅</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Day-by-Day Optimization Schedule</div>
                          <div className="text-xs text-gray-500 blur-[1px] select-none">Day 1: Morning routine + water timing...</div>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs font-bold">
                          $19
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-white/80 dark:via-gray-800/80 dark:to-gray-800/80" />
                    </div>

                    {/* Photo Tactics Preview */}
                    <div className="relative bg-white/70 dark:bg-gray-800/70 rounded-lg p-3 border border-purple-200 dark:border-purple-600">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">📸</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Photo-Specific Improvement Tactics</div>
                          <div className="text-xs text-gray-500 blur-[1px] select-none">Your angle: -15° adjustment needed...</div>
                        </div>
                        <div className="bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 px-2 py-1 rounded text-xs font-bold">
                          $15
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-white/80 dark:via-gray-800/80 dark:to-gray-800/80" />
                    </div>

                    {/* Progress System Preview */}
                    <div className="relative bg-white/70 dark:bg-gray-800/70 rounded-lg p-3 border border-purple-200 dark:border-purple-600">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">📊</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Weekly Progress Tracking System</div>
                          <div className="text-xs text-gray-500 blur-[1px] select-none">Week 1 target: 2.1 score improvement...</div>
                        </div>
                        <div className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded text-xs font-bold">
                          $10
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-white/80 dark:via-gray-800/80 dark:to-gray-800/80" />
                    </div>
                  </div>

                  {/* Bottom CTA */}
                  <div className="mt-4 text-center">
                    <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                      👀 Unlock to see your complete analysis
                    </div>
                  </div>
                </div>
              </div>

              {/* Urgency Section - Premium Styling Match */}
              <div className="relative bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-xl p-5 border-2 border-red-200 dark:border-red-700 shadow-xl overflow-hidden">
                {/* Premium background pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5" />
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-full blur-xl" />
                
                <div className="relative">
                  {/* Header with premium indicators */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                          <AlertTriangle className="h-5 w-5 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-red-800 dark:text-red-300">ACT NOW</h4>
                        <p className="text-xs text-red-600 dark:text-red-400">Get your game plan to fix face bloat</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                        URGENT
                      </div>
                    </div>
                  </div>

                  {/* Premium warning items */}
                  <div className="space-y-3">
                    {/* Patterns Getting Worse */}
                    <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-3 border border-red-200 dark:border-red-600">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">😔</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            While you wait, your <span className="font-bold text-red-600">PATTERNS GET WORSE</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Daily Delay */}
                    <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-3 border border-orange-200 dark:border-orange-600">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">⏰</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Every day of delay makes it harder to fix
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Camera Avoidance */}
                    <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-3 border border-amber-200 dark:border-amber-600">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">📸</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Stop avoiding cameras and mirrors
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Social Proof */}
                    <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-3 border border-green-200 dark:border-green-600">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">🎯</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Join <span className="font-bold text-green-600">2,000+ PEOPLE</span> who took action this month
                          </div>
                        </div>
                      </div>
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
            
            <TrustBadges />
          </div>
        </div>
        
        {/* Sticky CTA for Mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-lg z-50">
          <Link to="/signup">
            <Button 
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg shadow-xl text-base"
              onClick={onSignupClick}
            >
              🎉 UNLOCK ANALYSIS
            </Button>
          </Link>
        </div>
      </div>
      </>
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
