import React from 'react';
import { Card, CardContent } from '@/ui/card';
import { QuizProvider, useQuiz } from '../context';
import { ProfileStep } from './ProfileStep';
import { QuizStep } from './QuizStep';
import { ResultsStep } from './ResultsStep';

function QuizContent() {
  const { currentStep } = useQuiz();

  const renderStep = () => {
    switch (currentStep) {
      case 'profile':
        return <ProfileStep />;
      case 'quiz':
        return <QuizStep />;
      case 'results':
        return <ResultsStep />;
      default:
        return <ProfileStep />;
    }
  };

  return (
    <div className="w-full py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 id="quiz-title" className="text-4xl font-bold text-primary mb-2">
            Face Bloat Risk Assessment
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover what's causing your facial puffiness and get personalized strategies to reduce it
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[
              { key: 'profile', label: 'Profile', number: 1 },
              { key: 'quiz', label: 'Questions', number: 2 },
              { key: 'results', label: 'Results', number: 3 }
            ].map((step, index) => (
              <React.Fragment key={step.key}>
                <div className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                    ${currentStep === step.key 
                      ? 'bg-primary text-primary-foreground' 
                      : index < ['profile', 'quiz', 'results'].indexOf(currentStep)
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {step.number}
                  </div>
                  <span className={`
                    ml-2 text-sm font-medium hidden sm:inline
                    ${currentStep === step.key ? 'text-primary' : 'text-muted-foreground'}
                  `}>
                    {step.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`
                    w-8 h-0.5 transition-colors
                    ${index < ['profile', 'quiz', 'results'].indexOf(currentStep)
                      ? 'bg-primary'
                      : 'bg-muted'
                    }
                  `} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex justify-center">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}

export interface FaceBloatQuizProps {
  onClose?: () => void;
}

export function FaceBloatQuiz({ onClose }: FaceBloatQuizProps) {
  return (
    <QuizProvider>
      <div className="relative">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-muted transition-colors"
            aria-label="Close quiz"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
        
        <QuizContent />
      </div>
    </QuizProvider>
  );
}
