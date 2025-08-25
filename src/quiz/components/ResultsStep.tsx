import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { SocialShare } from '@/ui/social-share';
import { RotateCcw, Download, Share2, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/misc';
import { useQuiz } from '../context';

export function ResultsStep() {
  const { result, reset, quiz } = useQuiz();
  const [showShare, setShowShare] = useState(false);

  if (!result) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">No results available. Please complete the quiz first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score < 20) return "text-green-600 dark:text-green-400";
    if (score < 40) return "text-yellow-600 dark:text-yellow-400";
    if (score < 60) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score < 20) return "bg-green-500/10 border-green-500/20";
    if (score < 40) return "bg-yellow-500/10 border-yellow-500/20";
    if (score < 60) return "bg-orange-500/10 border-orange-500/20";
    return "bg-red-500/10 border-red-500/20";
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Score Overview */}
      <Card className={cn("border-2", getScoreBgColor(result.score))}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Your Face Bloat Risk Score</CardTitle>
          <CardDescription>
            Based on your responses to {result.answerContexts.length} questions
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <div className={cn("text-6xl font-bold", getScoreColor(result.score))}>
              {result.score}
            </div>
            <div className="text-sm text-muted-foreground">out of 100</div>
          </div>
          
          <Badge 
            variant="secondary" 
            className={cn("text-lg px-4 py-2", getScoreColor(result.score))}
          >
            {result.band.label}
          </Badge>
          
          <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            {result.band.blurb}
          </p>
        </CardContent>
      </Card>

      {/* Top Drivers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Your Top Risk Factors
          </CardTitle>
          <CardDescription>
            The categories contributing most to your face bloat risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {result.topDrivers.map((driver, index) => (
              <div 
                key={driver.categoryId}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    index === 0 ? "bg-red-500/20 text-red-600" :
                    index === 1 ? "bg-orange-500/20 text-orange-600" :
                    "bg-yellow-500/20 text-yellow-600"
                  )}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium">{driver.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      Primary contributor to facial puffiness
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{driver.pct}%</div>
                  <div className="text-xs text-muted-foreground">contribution</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Answer Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Your Responses & Coaching</CardTitle>
          <CardDescription>
            Personalized insights based on your answers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {result.answerContexts.map((answer) => {
              const category = quiz.categories.find(cat => cat.id === answer.categoryId);
              const isHighRisk = answer.choice >= "F";
              
              return (
                <div 
                  key={answer.questionId}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {answer.questionText}
                      </h4>
                      <Badge variant="outline" className="mt-1">
                        {category?.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {isHighRisk && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <Badge 
                        variant={isHighRisk ? "destructive" : "secondary"}
                        className="shrink-0"
                      >
                        {answer.choice}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Your choice: {answer.choiceTitle}
                    </p>
                    <p className="text-sm leading-relaxed">
                      {answer.context}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Plans */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Action Plan</CardTitle>
            <CardDescription>
              Immediate steps you can take right now
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                <span>Drink 16oz of water with a pinch of sea salt</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                <span>Elevate your head 10-20° for tonight's sleep</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                <span>Avoid adding salt to your meals today</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                <span>Set a bedtime alarm for 8+ hours of sleep</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">7-Day Plan</CardTitle>
            <CardDescription>
              Sustainable changes for lasting results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                <span>Establish consistent 7.5-8 hour sleep schedule</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                <span>Replace one processed meal daily with fresh ingredients</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                <span>Drink 2+ liters of water, evenly spaced</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                <span>Add potassium-rich foods (banana, spinach) daily</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Important:</strong> This quiz is for educational purposes only and is not medical advice. 
            Results are based on lifestyle factors and should not replace professional medical consultation. 
            If you have persistent facial swelling or health concerns, please consult with a healthcare provider.
          </p>
        </CardContent>
      </Card>

      {/* Social Share Modal */}
      {showShare && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowShare(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <SocialShare
              title={`I scored ${result.score}/100 on my Face Bloat Risk Assessment!`}
              description={`My risk level is "${result.band.label}". ${result.band.blurb}`}
              hashtags={["FaceBloat", "Health", "Wellness", "SelfCare"]}
              onClose={() => setShowShare(false)}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={reset} variant="outline" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Take Quiz Again
        </Button>
        
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Save Results
        </Button>
        
        <Button onClick={() => setShowShare(true)} variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Results
        </Button>
      </div>
    </div>
  );
}
