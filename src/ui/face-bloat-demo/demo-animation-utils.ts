/**
 * Utilities for creating realistic counter animations and demo timing
 */

export interface CounterAnimationConfig {
  start: number;
  end: number;
  updateInterval: number;
  pauseChance: number; // 0-1, chance to pause on each update
}

export interface CounterState {
  current: number;
  target: number;
  lastUpdate: number;
}

/**
 * Calculate realistic increment for counter animation based on distance to target
 */
export function calculateCounterIncrement(
  current: number, 
  target: number, 
  isDecimal: boolean = false
): number {
  const diff = target - current;
  if (Math.abs(diff) <= (isDecimal ? 0.1 : 1)) return target;

  let increment: number;
  
  if (isDecimal) {
    // For precision rate (decimal values)
    if (diff > 2) increment = (Math.random() * 0.8) + 0.2; // Big jumps when far behind
    else if (diff > 0.5) increment = (Math.random() * 0.3) + 0.1; // Medium jumps  
    else increment = (Math.random() * 0.1) + 0.05; // Small increments when close
  } else {
    // For reference scans (integer values)
    if (diff > 1000) increment = Math.floor(Math.random() * 200) + 50; // Big jumps when far behind
    else if (diff > 100) increment = Math.floor(Math.random() * 50) + 10; // Medium jumps
    else increment = Math.floor(Math.random() * 10) + 1; // Small increments when close
  }
  
  return Math.min(current + increment, target);
}

/**
 * Calculate target value based on progress (0-92% during analysis)
 */
export function calculateProgressTarget(
  progress: number,
  startValue: number,
  endValue: number,
  maxProgress: number = 92
): number {
  const analysisProgress = Math.min(progress / maxProgress, 1);
  return startValue + ((endValue - startValue) * analysisProgress);
}

/**
 * Determines if counter should pause (simulate processing)
 */
export function shouldPauseCounter(pauseChance: number): boolean {
  return Math.random() < pauseChance;
}

/**
 * Get timing interval based on analysis phase
 */
export function getPhaseInterval(phase: 1 | 2 | 3): number {
  const baseInterval = phase === 1 ? 800 : phase === 2 ? 1200 : 700;
  return baseInterval + Math.random() * 200;
}

/**
 * Demo timing engine for step progression
 */
export class DemoStepTimer {
  private timeouts: Set<NodeJS.Timeout> = new Set();
  private intervals: Set<NodeJS.Timeout> = new Set();

  scheduleStep(callback: () => void, delay: number): void {
    const timeout = setTimeout(() => {
      this.timeouts.delete(timeout);
      callback();
    }, delay);
    this.timeouts.add(timeout);
  }

  scheduleRepeating(callback: () => void, interval: number): () => void {
    const intervalId = setInterval(callback, interval);
    this.intervals.add(intervalId);
    
    return () => {
      clearInterval(intervalId);
      this.intervals.delete(intervalId);
    };
  }

  clearAll(): void {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.intervals.forEach(interval => clearInterval(interval));
    this.timeouts.clear();
    this.intervals.clear();
  }
}

/**
 * Manages realistic counter animations with pauses and variable speeds
 */
export class CounterAnimationManager {
  private animationFrame?: number;
  private lastUpdate = 0;
  private readonly UPDATE_INTERVAL = 200; // ms

  constructor(
    private onUpdate: (referenceScans: number, precisionRate: number) => void
  ) {}

  start(
    progress: number,
    isComplete: boolean,
    currentRef: number,
    currentPrecision: number
  ): void {
    if (this.animationFrame) return; // Already running

    const animate = () => {
      const now = Date.now();
      
      if (now - this.lastUpdate >= this.UPDATE_INTERVAL) {
        if (isComplete || progress >= 100) {
          // Final values when complete
          this.onUpdate(12438, 95.8);
          return;
        }

        // Calculate targets based on progress
        const targetRefScans = Math.floor(calculateProgressTarget(progress, 0, 12438));
        const targetPrecision = calculateProgressTarget(progress, 81, 95.8);

        // Update reference scans
        let newRefScans = currentRef;
        if (!shouldPauseCounter(0.2)) { // 20% pause chance
          newRefScans = calculateCounterIncrement(currentRef, targetRefScans, false);
        }

        // Update precision rate
        let newPrecision = currentPrecision;
        if (!shouldPauseCounter(0.25)) { // 25% pause chance
          newPrecision = calculateCounterIncrement(currentPrecision, targetPrecision, true);
        }

        this.onUpdate(newRefScans, newPrecision);
        this.lastUpdate = now;
      }

      this.animationFrame = requestAnimationFrame(animate);
    };

    animate();
  }

  stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = undefined;
    }
  }
}
