import { useState, useEffect } from 'react';
import { Button } from './button';
import { Card } from './card';
import { cn } from '@/utils/misc';
import { CheckCircle2, Loader2, Target, Zap } from 'lucide-react';
import { Link } from "@tanstack/react-router";

interface AnalysisStep {
  id: string;
  title: string;
  items: string[];
  duration: number;
  phase: 1 | 2 | 3;
}

const analysisSteps: AnalysisStep[] = [
  {
    id: 'initialization',
    title: 'System Initialization',
    items: [
      'Calibrating facial recognition algorithms',
      'Adjusting for lighting conditions and shadows',
      'Locating 68 facial landmarks and contours',
      'Establishing baseline measurements',
      'Initializing neural network processing'
    ],
    duration: 4000,
    phase: 1
  },
  {
    id: 'measurement',
    title: 'Facial Contour Analysis',
    items: [
      'Measuring jawline definition and angles',
      'Analyzing cheekbone prominence levels',
      'Calculating facial width-to-height ratios',
      'Detecting asymmetrical features',
      'Mapping bone structure density'
    ],
    duration: 3800,
    phase: 2
  },
  {
    id: 'bloat-detection',
    title: 'Bloat Pattern Recognition',
    items: [
      'Estimating regional fullness levels',
      'Identifying water retention patterns',
      'Mapping inflammation indicators',
      'Analyzing skin texture variations',
      'Detecting puffiness gradients'
    ],
    duration: 3500,
    phase: 2
  },
  {
    id: 'social-analysis',
    title: 'Social Impact Assessment',
    items: [
      'Evaluating professional appearance factors',
      'Analyzing camera angle optimization needs',
      'Measuring photogenic potential scores',
      'Calculating confidence impact metrics',
      'Assessing lighting compatibility'
    ],
    duration: 3200,
    phase: 2
  },
  {
    id: 'synthesis',
    title: 'AI Synthesis & Recovery Planning',
    items: [
      'Synthesizing face-shape & social signals',
      'Generating personalized recovery protocols',
      'Creating platform-specific optimization tips',
      'Finalizing bloat fingerprint analysis',
      'Compiling actionable recommendations'
    ],
    duration: 3500,
    phase: 3
  }
];

interface FaceBloatAnalyzerProps {
  onClose: () => void;
}

export function FaceBloatAnalyzer({ onClose }: FaceBloatAnalyzerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [analysisCount, setAnalysisCount] = useState(126);

  const [finalProcessing, setFinalProcessing] = useState(false);
  const [finalProcessingText, setFinalProcessingText] = useState('');
  const [signupProcessing, setSignupProcessing] = useState(false);
  const [signupProcessingText, setSignupProcessingText] = useState('');
  const [sleepHours, setSleepHours] = useState<string>('');
  const [yesterdayVibe, setYesterdayVibe] = useState<string>('');
  const [stressLevel, setStressLevel] = useState<string>('');
  const [isProcessingInput, setIsProcessingInput] = useState(false);
  const [referenceScans, setReferenceScans] = useState(0);
  const [precisionRate, setPrecisionRate] = useState(81);

  // Animated counters synchronized with progress bar
  useEffect(() => {
    if (isComplete || progress >= 100) {
      // Final values when complete
      setReferenceScans(12438);
      setPrecisionRate(95.8);
      return;
    }

    const interval = setInterval(() => {
      // Calculate target values based on progress (0-92% during analysis)
      const analysisProgress = Math.min(progress / 92, 1); // Scale to 0-1 for 0-92% range
      
      // Reference Scans: 0 → 12,438 based on progress
      const targetRefScans = Math.floor(12438 * analysisProgress);
      setReferenceScans(prev => {
        const diff = targetRefScans - prev;
        if (Math.abs(diff) <= 1) return targetRefScans;
        
        // Sometimes pause (20% chance), sometimes jump forward
        const rand = Math.random();
        if (rand < 0.2) return prev; // 20% chance to pause (working hard)
        
        // Variable increments based on how far behind we are
        let increment;
        if (diff > 1000) increment = Math.floor(Math.random() * 200) + 50; // Big jumps when far behind
        else if (diff > 100) increment = Math.floor(Math.random() * 50) + 10; // Medium jumps
        else increment = Math.floor(Math.random() * 10) + 1; // Small increments when close
        
        return Math.min(prev + increment, targetRefScans);
      });

      // Precision Rate: 81 → 95.8 based on progress
      const targetPrecision = 81 + (14.8 * analysisProgress); // 81 + 14.8 = 95.8
      setPrecisionRate(prev => {
        const diff = targetPrecision - prev;
        if (Math.abs(diff) <= 0.1) return targetPrecision;
        
        // Sometimes pause (25% chance), sometimes jump forward
        const rand = Math.random();
        if (rand < 0.25) return prev; // 25% chance to pause (processing)
        
        // Variable increments based on how far behind we are
        let increment;
        if (diff > 2) increment = (Math.random() * 0.8) + 0.2; // Big jumps when far behind
        else if (diff > 0.5) increment = (Math.random() * 0.3) + 0.1; // Medium jumps  
        else increment = (Math.random() * 0.1) + 0.05; // Small increments when close
        
        return Math.min(prev + increment, targetPrecision);
      });
    }, 200); // Update every 200ms for realistic timing

    return () => clearInterval(interval);
  }, [progress, isComplete]);

  useEffect(() => {
    if (isComplete) return;

    const step = analysisSteps[currentStep];
    if (!step) return;


    const baseInterval = step.phase === 1 ? 800 : step.phase === 2 ? 1200 : 700;
    
    const timer = setTimeout(() => {
      if (currentItemIndex < step.items.length - 1) {
        setCurrentItemIndex(prev => prev + 1);
        setAnalysisCount(prev => prev + Math.floor(Math.random() * 50) + 20);
      } else {
        // Mark step as complete
        setCompletedSteps(prev => new Set([...prev, step.id]));
        
        if (currentStep < analysisSteps.length - 1) {
          setCurrentStep(prev => prev + 1);
          setCurrentItemIndex(0);
        } else {
          setIsComplete(true);
        }
      }
    }, baseInterval + Math.random() * 200);

    return () => clearTimeout(timer);
  }, [currentStep, currentItemIndex, isComplete]);

  // Progress calculation
  useEffect(() => {
    if (isComplete) {
      setProgress(100);
      return;
    }

    const totalSteps = analysisSteps.length;
    const stepProgress = currentStep / totalSteps;
    const itemProgress = currentItemIndex / (analysisSteps[currentStep]?.items.length || 1);
    const currentStepProgress = stepProgress + (itemProgress / totalSteps);
    
    const newProgress = Math.min(currentStepProgress * 100, 92);
    setProgress(newProgress);

    // Show final processing at 92%
    if (newProgress >= 92 && !isComplete && !finalProcessing) {
      setFinalProcessing(true);
      
      const finalTexts = [
        'Cross-referencing data structures',
        'Adding external dependencies for review',
        'Calibrating personalization algorithms',
        'Your complete FaceBloat analysis is ready!',
        'Create a free account to view your results →'
      ];
      
      let textIndex = 0;
      const textInterval = setInterval(() => {
        if (textIndex < finalTexts.length) {
          setFinalProcessingText(finalTexts[textIndex]);
          textIndex++;
        } else {
          clearInterval(textInterval);
          setTimeout(() => {
            setFinalProcessing(false);
            setIsComplete(true);
          }, 800);
        }
      }, 1200);
    }
  }, [currentStep, currentItemIndex, isComplete]);

  // Auto-scroll the analysis steps container to show current step
  useEffect(() => {
    if (isComplete || finalProcessing) return;
    
    const container = document.getElementById('analysis-steps-container');
    const currentStepElement = document.getElementById(`step-${currentStep}`);
    
    if (container && currentStepElement) {
      currentStepElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentStep, isComplete, finalProcessing]);

  // Handle escape key to close popup
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && finalProcessing) {
        setFinalProcessing(false);
        setSignupProcessing(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [finalProcessing]);

  const handleUserInput = (type: 'sleep' | 'vibe' | 'stress', value: string) => {
    setIsProcessingInput(true);
    
    setTimeout(() => {
      if (type === 'sleep') {
        setSleepHours(value);
      } else if (type === 'vibe') {
        setYesterdayVibe(value);
      } else if (type === 'stress') {
        setStressLevel(value);
      }
      setIsProcessingInput(false);
    }, 1000);
  };







  const currentStepData = analysisSteps[currentStep];
  const currentItem = currentStepData?.items[currentItemIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-card border-2 border-primary/20 shadow-2xl">
        <div className="p-8 space-y-8">


          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-primary">Analysis Progress</span>
              <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transition-all duration-500 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                <div className="absolute right-0 top-0 h-full w-2 bg-white/60 animate-pulse" />
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Initializing</span>
              <span>Scanning</span>
              <span>Synthesizing</span>
            </div>
          </div>

          {/* Final Processing Display */}
          {finalProcessing && (
            <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-8 text-center">
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
                <h3 className="text-xl font-semibold text-primary">Finalizing Analysis</h3>
                <p className="text-muted-foreground animate-pulse">
                  {finalProcessingText}
                </p>
              </div>
            </div>
          )}

          {/* Scanning Visualization or Analysis Complete CTA */}
          {!finalProcessing && (
            <div className="bg-muted/30 rounded-lg p-6 border-2 border-dashed border-primary/20">
              {!isComplete ? (
                <div className="flex items-center justify-center space-x-4">
                  <div className="relative">
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
                  </div>
                  <div className="text-center space-y-2">
                    <div className="flex items-center gap-2 text-primary">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium">Scanning Active</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      AI analyzing facial geometry in real-time
                    </p>
                  </div>
                </div>
              ) : (
                /* Analysis Complete CTA */
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
                        onClick={() => {
                          setSignupProcessing(true);
                          const processingTexts = [
                            'Preparing your report...',
                            'Securing your data...',
                            'Almost ready...'
                          ];
                          
                          let index = 0;
                          const interval = setInterval(() => {
                            if (index < processingTexts.length) {
                              setSignupProcessingText(processingTexts[index]);
                              index++;
                            } else {
                              clearInterval(interval);
                              // Navigate to Clerk signup
                              window.location.href = '/signup';
                            }
                          }, 800);
                        }}
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
              )}
            </div>
          )}

          {/* Analysis Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Analysis - Fixed Height Scrollable */}
            <div className="space-y-4">
              <span className="text-sm font-medium text-primary flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Current Analysis
              </span>
              
              <div id="analysis-steps-container" className="h-80 overflow-y-auto pr-2 space-y-4 border border-border/50 rounded-lg p-4 bg-muted/20">
                {analysisSteps.map((step, index) => (
                  <div key={step.id} id={`step-${index}`} className="space-y-2">
                    <div className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-all duration-300",
                      index === currentStep ? "bg-primary/10 border border-primary/20" : 
                      completedSteps.has(step.id) ? "bg-muted/50" : "opacity-50"
                    )}>
                      <div className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold",
                        completedSteps.has(step.id) ? "bg-green-500 text-white" :
                        index === currentStep ? "bg-primary text-primary-foreground animate-pulse" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {completedSteps.has(step.id) ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className={cn(
                          "font-medium",
                          completedSteps.has(step.id) ? "line-through text-muted-foreground" : "text-foreground"
                        )}>
                          {step.title}
                        </h4>
                        {index === currentStep && currentItem && (
                          <p className="text-sm text-primary animate-pulse">
                            {currentItem}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Step Items */}
                    {(index === currentStep || completedSteps.has(step.id)) && (
                      <div className="ml-9 space-y-1">
                        {step.items.map((item, itemIndex) => (
                          <div key={itemIndex} className={cn(
                            "text-sm flex items-center gap-2 transition-all duration-300",
                            completedSteps.has(step.id) ? "line-through text-muted-foreground" :
                            index === currentStep && itemIndex <= currentItemIndex ? "text-foreground" :
                            "text-muted-foreground opacity-50"
                          )}>
                            <div className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              completedSteps.has(step.id) || (index === currentStep && itemIndex <= currentItemIndex) ? 
                              "bg-green-500" : "bg-muted-foreground"
                            )} />
                            {item}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Live Stats */}
            <div className="space-y-6">
              <div className="space-y-4">
                <span className="text-sm font-medium text-primary flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Live Analysis Data
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-3 bg-muted/50 border-l-4 border-l-purple-500 animate-pulse">
                    <div className="text-xl font-bold text-primary animate-pulse">{analysisCount}</div>
                    <div className="text-xs text-muted-foreground">Facial Points Scanned</div>
                  </Card>
                  <Card className="p-3 bg-muted/50 border-l-4 border-l-purple-400 animate-pulse">
                    <div className="text-xl font-bold text-primary">{Math.round(progress * 3.01)}</div>
                    <div className="text-xs text-muted-foreground">Neural Calculations</div>
                  </Card>
                  <Card className="p-3 bg-muted/50 border-l-4 border-l-purple-600 animate-pulse">
                    <div className="text-xl font-bold text-primary">{referenceScans.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Reference Scans</div>
                  </Card>
                  <Card className="p-3 bg-muted/50 border-l-4 border-l-purple-300 animate-pulse">
                    <div className="text-xl font-bold text-primary">{precisionRate.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Precision Rate</div>
                  </Card>
                </div>
              </div>

              {/* Micro-commitments */}
              {progress > 30 && !stressLevel && (
                <div className="space-y-3">
                  <h4 className="font-medium text-primary">Quick question while we analyze:</h4>
                  
                  {isProcessingInput && (
                    <div className="flex items-center gap-2 text-primary">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Adding to analysis for better calculation...</span>
                    </div>
                  )}
                  
                  {!sleepHours && !isProcessingInput && (
                    <>
                      <p className="text-sm text-muted-foreground">Typical sleep last night?</p>
                      <div className="grid grid-cols-2 gap-2">
                        {['5h', '6h', '7h', '8h+'].map((option) => (
                          <Button
                            key={option}
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserInput('sleep', option)}
                            className="text-xs"
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    </>
                  )}

                  {sleepHours && !yesterdayVibe && !isProcessingInput && (
                    <>
                      <p className="text-sm text-muted-foreground">Yesterday's vibe?</p>
                      <div className="grid grid-cols-2 gap-2">
                        {['High sodium', 'High carbs', 'Low water', 'Stressed'].map((option) => (
                          <Button
                            key={option}
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserInput('vibe', option)}
                            className="text-xs"
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    </>
                  )}

                  {yesterdayVibe && !stressLevel && !isProcessingInput && (
                    <>
                      <p className="text-sm text-muted-foreground">Current stress level?</p>
                      <div className="grid grid-cols-2 gap-2">
                        {['Very low', 'Moderate', 'High', 'Overwhelmed'].map((option) => (
                          <Button
                            key={option}
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserInput('stress', option)}
                            className="text-xs"
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>







          {/* Close button (only show if not in final processing) */}
          {!finalProcessing && !isComplete && (
            <div className="flex justify-center">
              <Button variant="ghost" onClick={onClose} className="text-muted-foreground">
                Cancel Analysis
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
