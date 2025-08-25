import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/misc';
import { useQuiz } from '../context';
import type { Letter } from '../types';

export function QuizStep() {
  const {
    questions,
    answers,
    currentQuestionIndex,
    isLoading,
    setAnswer,
    nextQuestion,
    previousQuestion,
    submit,
    goToStep,
  } = useQuiz();

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const answeredQuestions = Object.keys(answers).length;
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (!currentQuestion) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">No questions available for your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAnswerSelect = (letter: Letter) => {
    if (isLoading) return;
    setAnswer(currentQuestion.id, letter);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      submit();
    } else {
      nextQuestion();
    }
  };

  const canProceed = currentAnswer !== undefined;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Progress Text */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
        <span>{answeredQuestions} answered</span>
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {currentQuestion.text}
          </CardTitle>
          <CardDescription>
            Select the option that best describes your situation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Answer Options or Loading */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16 animate-in fade-in duration-300">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Processing your answer...</p>
              </div>
            </div>
          ) : (
            <fieldset className="space-y-3">
              <legend className="sr-only">{currentQuestion.text}</legend>
              {currentQuestion.options.map((option) => {
                const isSelected = currentAnswer === option.letter;
                
                return (
                  <label
                    key={option.letter}
                    className={cn(
                      "relative flex cursor-pointer rounded-lg border p-4 transition-all duration-200",
                      "hover:bg-muted/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                      isSelected 
                        ? "border-primary bg-primary/5 ring-1 ring-primary" 
                        : "border-border"
                    )}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option.letter}
                      checked={isSelected}
                      onChange={() => handleAnswerSelect(option.letter)}
                      className="sr-only"
                    />
                    
                    <div className="flex items-start gap-3 w-full">
                      {/* Letter Badge */}
                      <div className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold shrink-0",
                        isSelected 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {option.letter}
                      </div>
                      
                      {/* Option Text */}
                      <div className="flex-1">
                        <p className={cn(
                          "text-sm font-medium leading-relaxed",
                          isSelected ? "text-primary" : "text-foreground"
                        )}>
                          {option.title}
                        </p>
                      </div>
                      
                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="flex h-5 w-5 items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </fieldset>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={() => goToStep('profile')}
              disabled={isLoading}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Profile
            </Button>

            <div className="flex gap-2">
              {currentQuestionIndex > 0 && (
                <Button
                  variant="outline"
                  onClick={previousQuestion}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
              )}

              <Button
                onClick={handleNext}
                disabled={!canProceed || isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : isLastQuestion ? (
                  "Get My Results →"
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Category Indicator */}
      <div className="text-center">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
          {currentQuestion.categoryId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
        </span>
      </div>
    </div>
  );
}
