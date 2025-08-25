import { useState, useEffect, useCallback } from 'react';
import { fakeAnalysisScript, type DemoConfig } from './fake-analysis-script';
import { DemoStepTimer, getPhaseInterval } from './demo-animation-utils';

export interface DemoState {
  // Step progression
  currentStep: number;
  currentItemIndex: number;
  progress: number;
  isComplete: boolean;
  completedSteps: Set<string>;
  
  // Live counters
  analysisCount: number;
  referenceScans: number;
  precisionRate: number;
  
  // Demo phases
  finalProcessing: boolean;
  finalProcessingText: string;
  
  // User input collection
  sleepHours: string;
  yesterdayVibe: string;
  stressLevel: string;
  waterIntake: string;
  dairyConsumption: string;
  grainsBloating: string;
  artificialSweeteners: string;
  isProcessingInput: boolean;
  
  // Signup flow
  signupProcessing: boolean;
  signupProcessingText: string;
}

export interface DemoActions {
  handleUserInput: (type: 'sleep' | 'vibe' | 'stress' | 'water' | 'dairy' | 'grains' | 'sweeteners', value: string) => void;
  startSignupFlow: () => void;
  startDemo: () => void;
  resetDemo: () => void;
}

export function useFakeAnalysisDemo(config: DemoConfig = fakeAnalysisScript): [DemoState, DemoActions] {
  // Demo control state
  const [demoStarted, setDemoStarted] = useState(false);
  
  // Step progression state
  const [currentStep, setCurrentStep] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  
  // Live counters
  const [analysisCount, setAnalysisCount] = useState(config.counters.facialPoints.start);
  const [referenceScans, setReferenceScans] = useState(config.counters.referenceScans.start);
  const [precisionRate, setPrecisionRate] = useState(config.counters.precisionRate.start);
  
  // Demo phases
  const [finalProcessing, setFinalProcessing] = useState(false);
  const [finalProcessingText, setFinalProcessingText] = useState('');
  
  // User input collection
  const [sleepHours, setSleepHours] = useState<string>('');
  const [yesterdayVibe, setYesterdayVibe] = useState<string>('');
  const [stressLevel, setStressLevel] = useState<string>('');
  const [waterIntake, setWaterIntake] = useState<string>('');
  const [dairyConsumption, setDairyConsumption] = useState<string>('');
  const [grainsBloating, setGrainsBloating] = useState<string>('');
  const [artificialSweeteners, setArtificialSweeteners] = useState<string>('');
  const [isProcessingInput, setIsProcessingInput] = useState(false);
  
  // Signup flow
  const [signupProcessing, setSignupProcessing] = useState(false);
  const [signupProcessingText, setSignupProcessingText] = useState('');

  // Demo timing manager
  const [stepTimer] = useState(() => new DemoStepTimer());

  // Animated counters synchronized with progress bar
  useEffect(() => {
    if (isComplete || progress >= 100) {
      // Final values when complete
      setReferenceScans(config.counters.referenceScans.end);
      setPrecisionRate(config.counters.precisionRate.end);
      return;
    }

    const interval = setInterval(() => {
      // Calculate target values based on progress (0-92% during analysis)
      const analysisProgress = Math.min(progress / config.timing.paywalTriggerProgress, 1);
      
      // Reference Scans: 0 → 12,438 based on progress
      const targetRefScans = Math.floor(config.counters.referenceScans.end * analysisProgress);
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
      const precisionRange = config.counters.precisionRate.end - config.counters.precisionRate.start;
      const targetPrecision = config.counters.precisionRate.start + (precisionRange * analysisProgress);
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
  }, [progress, isComplete, config]);

  // Step progression logic
  useEffect(() => {
    if (!demoStarted || isComplete) return;

    const step = config.analysisSteps[currentStep];
    if (!step) return;

    const baseInterval = getPhaseInterval(step.phase);
    
    stepTimer.scheduleStep(() => {
      if (currentItemIndex < step.items.length - 1) {
        setCurrentItemIndex(prev => prev + 1);
        setAnalysisCount(prev => prev + Math.floor(Math.random() * 50) + 20);
      } else {
        // Mark step as complete
        setCompletedSteps(prev => new Set([...prev, step.id]));
        
        if (currentStep < config.analysisSteps.length - 1) {
          setCurrentStep(prev => prev + 1);
          setCurrentItemIndex(0);
        } else {
          setIsComplete(true);
        }
      }
    }, baseInterval);

    return () => stepTimer.clearAll();
  }, [currentStep, currentItemIndex, demoStarted, isComplete, config, stepTimer]);

  // Progress calculation
  useEffect(() => {
    if (isComplete) {
      setProgress(100);
      return;
    }

    const totalSteps = config.analysisSteps.length;
    const stepProgress = currentStep / totalSteps;
    const itemProgress = currentItemIndex / (config.analysisSteps[currentStep]?.items.length || 1);
    const currentStepProgress = stepProgress + (itemProgress / totalSteps);
    
    const newProgress = Math.min(currentStepProgress * 100, config.timing.paywalTriggerProgress);
    setProgress(newProgress);

    // Show final processing at configured trigger point
    if (newProgress >= config.timing.paywalTriggerProgress && !isComplete && !finalProcessing) {
      setFinalProcessing(true);
      
      let textIndex = 0;
      const textInterval = setInterval(() => {
        if (textIndex < config.finalProcessingTexts.length) {
          setFinalProcessingText(config.finalProcessingTexts[textIndex]);
          textIndex++;
        } else {
          clearInterval(textInterval);
          setTimeout(() => {
            setFinalProcessing(false);
            setIsComplete(true);
          }, 800);
        }
      }, config.timing.finalProcessingInterval);
    }
  }, [currentStep, currentItemIndex, isComplete, config, finalProcessing]);

  // Actions
  const handleUserInput = useCallback((type: 'sleep' | 'vibe' | 'stress' | 'water' | 'dairy' | 'grains' | 'sweeteners', value: string) => {
    setIsProcessingInput(true);
    
    setTimeout(() => {
      if (type === 'sleep') {
        setSleepHours(value);
      } else if (type === 'vibe') {
        setYesterdayVibe(value);
      } else if (type === 'stress') {
        setStressLevel(value);
      } else if (type === 'water') {
        setWaterIntake(value);
      } else if (type === 'dairy') {
        setDairyConsumption(value);
      } else if (type === 'grains') {
        setGrainsBloating(value);
      } else if (type === 'sweeteners') {
        setArtificialSweeteners(value);
      }
      setIsProcessingInput(false);
    }, config.timing.userInputProcessingDelay);
  }, [config.timing.userInputProcessingDelay]);

  const startSignupFlow = useCallback(() => {
    setSignupProcessing(true);
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < config.signupProcessingTexts.length) {
        setSignupProcessingText(config.signupProcessingTexts[index]);
        index++;
      } else {
        clearInterval(interval);
        // Navigate to Clerk signup
        window.location.href = '/signup';
      }
    }, config.timing.signupProcessingInterval);
  }, [config]);

  const resetDemo = useCallback(() => {
    stepTimer.clearAll();
    setDemoStarted(false);
    setCurrentStep(0);
    setCurrentItemIndex(0);
    setProgress(0);
    setIsComplete(false);
    setCompletedSteps(new Set());
    setAnalysisCount(config.counters.facialPoints.start);
    setReferenceScans(config.counters.referenceScans.start);
    setPrecisionRate(config.counters.precisionRate.start);
    setFinalProcessing(false);
    setFinalProcessingText('');
    setSleepHours('');
    setYesterdayVibe('');
    setStressLevel('');
    setWaterIntake('');
    setDairyConsumption('');
    setGrainsBloating('');
    setArtificialSweeteners('');
    setIsProcessingInput(false);
    setSignupProcessing(false);
    setSignupProcessingText('');
  }, [config, stepTimer]);

  // Start demo function
  const startDemo = useCallback(() => {
    setDemoStarted(true);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stepTimer.clearAll();
  }, [stepTimer]);

  const state: DemoState = {
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
    waterIntake,
    dairyConsumption,
    grainsBloating,
    artificialSweeteners,
    isProcessingInput,
    signupProcessing,
    signupProcessingText
  };

  const actions: DemoActions = {
    handleUserInput,
    startSignupFlow,
    startDemo,
    resetDemo
  };

  return [state, actions];
}
