import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { SocialShare } from '@/ui/social-share';
import { DownloadModal, createTextDownloadOption, createImageDownloadOption, createPDFDownloadOption } from '@/ui/download-modal';
import { formatResultsAsText, downloadTextFile } from '../utils/resultsFormatter';
import { RotateCcw, Download, Share2, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/misc';
import { useQuiz } from '../context';

export function ResultsStep() {
  const { result, reset, quiz } = useQuiz();
  const [showShare, setShowShare] = useState(false);
  const [showDownload, setShowDownload] = useState(false);

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

  // Download functions
  const handleTextDownload = () => {
    const textContent = formatResultsAsText(result, {
      includeHeader: true,
      includeTimestamp: true,
      includeCoaching: true,
      includeActionPlans: true,
    });
    
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const filename = `face-bloat-results-${timestamp}.txt`;
    
    downloadTextFile(textContent, filename);
  };

  const handleImageDownload = () => {
    // Placeholder for future image download functionality
    console.log('Image download not yet implemented');
  };

  const handlePDFDownload = () => {
    // Placeholder for future PDF download functionality
    console.log('PDF download not yet implemented');
  };

  // Create download options
  const downloadOptions = [
    createTextDownloadOption(handleTextDownload),
    createImageDownloadOption(handleImageDownload, true), // disabled for now
    createPDFDownloadOption(handlePDFDownload, true), // disabled for now
  ];

  return (
    <div className="w-full space-y-4 md:space-y-6">
      {/* Score Overview */}
      <Card className={cn("w-full max-w-md md:max-w-4xl mx-auto border-2", getScoreBgColor(result.score))}>
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl md:text-2xl">Your Face Bloat Risk Score</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Based on your responses to {result.answerContexts.length} questions
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-3 md:space-y-4">
          <div className="space-y-1 md:space-y-2">
            <div className={cn("text-4xl md:text-6xl font-bold", getScoreColor(result.score))}>
              {result.score}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">out of 100</div>
          </div>
          
          <Badge 
            variant="secondary" 
            className={cn("text-base md:text-lg px-3 md:px-4 py-1 md:py-2", getScoreColor(result.score))}
          >
            {result.band.label}
          </Badge>
          
          <p className="text-sm md:text-base text-muted-foreground max-w-sm md:max-w-md mx-auto leading-relaxed px-2">
            {result.band.blurb}
          </p>
        </CardContent>
      </Card>

      {/* Top Drivers */}
      <Card className="w-full max-w-md md:max-w-4xl mx-auto">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
            Your Top Risk Factors
          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            The categories contributing most to your face bloat risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            {result.topDrivers.map((driver, index) => (
              <div 
                key={driver.categoryId}
                className="flex items-center justify-between p-3 md:p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                  <div className={cn(
                    "w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold shrink-0",
                    index === 0 ? "bg-red-500/20 text-red-600" :
                    index === 1 ? "bg-orange-500/20 text-orange-600" :
                    "bg-yellow-500/20 text-yellow-600"
                  )}>
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm md:text-base truncate">{driver.label}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground hidden md:block">
                      Primary contributor to facial puffiness
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-base md:text-lg font-semibold">{driver.pct}%</div>
                  <div className="text-xs text-muted-foreground hidden md:block">contribution</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Answer Insights */}
      <Card className="w-full max-w-md md:max-w-4xl mx-auto">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg md:text-xl">Your Responses & Coaching</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Personalized insights based on your answers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 md:space-y-6">
            {result.answerContexts.map((answer) => {
              const category = quiz.categories.find(cat => cat.id === answer.categoryId);
              const isHighRisk = answer.choice >= "F";
              
              return (
                <div 
                  key={answer.questionId}
                  className="border rounded-lg p-3 md:p-4 space-y-2 md:space-y-3"
                >
                  <div className="flex items-start justify-between gap-2 md:gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm md:text-base leading-tight">
                        {answer.questionText}
                      </h4>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {category?.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 shrink-0">
                      {isHighRisk && (
                        <AlertCircle className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                      )}
                      <Badge 
                        variant={isHighRisk ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {answer.choice}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-md p-2 md:p-3">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1">
                      Your choice: {answer.choiceTitle}
                    </p>
                    <p className="text-xs md:text-sm leading-relaxed">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-md md:max-w-4xl mx-auto">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Today's Action Plan</CardTitle>
            <CardDescription className="text-sm">
              Immediate steps you can take right now
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-xs md:text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                <span>Drink 16oz of water with a pinch of sea salt</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                <span>Elevate your head 10-20° for tonight's sleep</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                <span>Avoid adding salt to your meals today</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                <span>Set a bedtime alarm for 8+ hours of sleep</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">7-Day Plan</CardTitle>
            <CardDescription className="text-sm">
              Sustainable changes for lasting results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-xs md:text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                <span>Establish consistent 7.5-8 hour sleep schedule</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                <span>Replace one processed meal daily with fresh ingredients</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                <span>Drink 2+ liters of water, evenly spaced</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                <span>Add potassium-rich foods (banana, spinach) daily</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <Card className="bg-muted/50 max-w-md md:max-w-4xl mx-auto">
        <CardContent className="p-3 md:p-4">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            <strong>Important:</strong> This quiz is for educational purposes only and is not medical advice. 
            Results are based on lifestyle factors and should not replace professional medical consultation. 
            If you have persistent facial swelling or health concerns, please consult with a healthcare provider.
          </p>
        </CardContent>
      </Card>

      {/* Download Modal */}
      {showDownload && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowDownload(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <DownloadModal
              title="Save Your Results"
              downloadOptions={downloadOptions}
              onClose={() => setShowDownload(false)}
            />
          </div>
        </div>
      )}

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
      <div className="flex flex-wrap gap-2 md:gap-3 justify-center max-w-md md:max-w-4xl mx-auto">
        <Button onClick={reset} variant="outline" className="gap-2 text-sm">
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">Take Quiz Again</span>
          <span className="sm:hidden">Retake</span>
        </Button>
        
        <Button onClick={() => setShowDownload(true)} variant="outline" className="gap-2 text-sm">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Save Results</span>
          <span className="sm:hidden">Save</span>
        </Button>
        
        <Button onClick={() => setShowShare(true)} variant="outline" className="gap-2 text-sm">
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share Results</span>
          <span className="sm:hidden">Share</span>
        </Button>
      </div>
    </div>
  );
}
