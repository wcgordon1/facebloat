import { useState } from 'react';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';

export function SwipeableInsights() {
  const insights = [
    "Advanced bloat pattern analysis",
    "Day-by-day optimization schedule", 
    "Photo-specific improvement tactics",
    "Weekly progress tracking system"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextInsight = () => {
    setCurrentIndex((prev) => (prev + 1) % insights.length);
  };

  const prevInsight = () => {
    setCurrentIndex((prev) => (prev - 1 + insights.length) % insights.length);
  };

  return (
    <div className="md:hidden bg-muted/50 rounded-lg p-4 border border-muted-foreground/20">
      <div className="flex items-center gap-2 mb-3">
        <Lock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">Locked Insights Preview</span>
      </div>
      
      <div className="relative">
        <div className="flex items-center justify-between">
          <button 
            onClick={prevInsight}
            className="p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Previous insight"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          
          <div className="flex-1 mx-3 text-center">
            <div className="text-xs text-muted-foreground min-h-[2.5rem] flex items-center justify-center blur-[1px] select-none">
              {insights[currentIndex]}
            </div>
          </div>
          
          <button 
            onClick={nextInsight}
            className="p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Next insight"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        
        {/* Dots indicator */}
        <div className="flex justify-center gap-1 mt-2">
          {insights.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
