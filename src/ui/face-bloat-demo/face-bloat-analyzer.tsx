import { useEffect } from 'react';
import { Button } from '../button';
import { Card, CardContent } from '../card';
import { cn } from '@/utils/misc';
import { CheckCircle2, Loader2, Target, Zap } from 'lucide-react';
import { FaceScanningVisualization } from './face-scanning-visualization';
import { useFakeAnalysisDemo } from './use-fake-analysis-demo';
import { fakeAnalysisScript } from './fake-analysis-script';

interface FaceBloatAnalyzerProps {
  onClose: () => void;
}

export function FaceBloatAnalyzer({ onClose }: FaceBloatAnalyzerProps) {
  const [demoState, demoActions] = useFakeAnalysisDemo();
  
  const {
    currentStep,
    currentItemIndex,
    progress,
    isComplete,
    completedSteps,
    analysisCount,
    referenceScans,
    precisionRate,
    finalProcessing,
    finalProcessingText,
    sleepHours,
    yesterdayVibe,
    stressLevel,
    isProcessingInput,
    signupProcessing,
    signupProcessingText
  } = demoState;

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

  // Handle escape key to close analyzer
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const currentStepData = fakeAnalysisScript.analysisSteps[currentStep];
  const currentItem = currentStepData?.items[currentItemIndex];

  return (
    <div className="w-full max-w-md md:max-w-6xl mx-auto">
      <Card className="w-full bg-card border-2 border-primary/20 shadow-2xl">
        <CardContent className="pt-6 space-y-6">

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-primary">Face Bloat Analysis</span>
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

          {/* Face Scanning Visualization */}
          {!finalProcessing && (
            <FaceScanningVisualization
              progress={progress}
              isComplete={isComplete}
              signupProcessing={signupProcessing}
              signupProcessingText={signupProcessingText}
              onSignupClick={demoActions.startSignupFlow}
            />
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
                {fakeAnalysisScript.analysisSteps.map((step, index) => (
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
                  <h4 className="font-medium text-primary">Improve accuracy in your analysis:</h4>
                  
                  {isProcessingInput && (
                    <div className="flex items-center gap-2 text-primary">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Adding to analysis for better calculation...</span>
                    </div>
                  )}
                  
                  {!sleepHours && !isProcessingInput && (
                    <>
                      <p className="text-sm text-muted-foreground">Typical sleep in a night?</p>
                      <div className="grid grid-cols-2 gap-2">
                        {['5h', '6h', '7h', '8h+'].map((option) => (
                          <Button
                            key={option}
                            variant="outline"
                            size="sm"
                            onClick={() => demoActions.handleUserInput('sleep', option)}
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
                      <p className="text-sm text-muted-foreground">Yesterday you...</p>
                      <div className="grid grid-cols-2 gap-2">
                        {['High sodium', 'High carbs', 'Low water', 'Consumed alcohol'].map((option) => (
                          <Button
                            key={option}
                            variant="outline"
                            size="sm"
                            onClick={() => demoActions.handleUserInput('vibe', option)}
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
                            onClick={() => demoActions.handleUserInput('stress', option)}
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

          {/* Close button */}
          {!finalProcessing && !isComplete && (
            <div className="flex justify-end">
              <Button variant="ghost" onClick={onClose} className="text-muted-foreground">
                ← Exit Analysis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
