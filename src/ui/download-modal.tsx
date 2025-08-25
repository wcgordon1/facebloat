import * as React from "react";
import { useState } from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { 
  Download, 
  FileText, 
  Image, 
  FileDown,
  Copy,
  Check,
  X,
  Clock
} from "lucide-react";
import { cn } from "@/utils/misc";

export interface DownloadOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  badge?: string;
}

export interface DownloadModalProps {
  title?: string;
  downloadOptions: DownloadOption[];
  onClose?: () => void;
  className?: string;
}

export function DownloadModal({ 
  title = "Save Your Results",
  downloadOptions,
  onClose,
  className
}: DownloadModalProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [completedStates, setCompletedStates] = useState<Record<string, boolean>>({});

  const handleOptionClick = async (option: DownloadOption) => {
    if (option.disabled || loadingStates[option.id]) return;

    try {
      // Set loading state
      setLoadingStates(prev => ({ ...prev, [option.id]: true }));
      
      // Execute the download function
      await option.onClick();
      
      // Set completed state
      setCompletedStates(prev => ({ ...prev, [option.id]: true }));
      
      // Clear completed state after 2 seconds
      setTimeout(() => {
        setCompletedStates(prev => ({ ...prev, [option.id]: false }));
      }, 2000);
      
    } catch (error) {
      console.error(`Download failed for ${option.name}:`, error);
    } finally {
      // Clear loading state
      setLoadingStates(prev => ({ ...prev, [option.id]: false }));
    }
  };

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Download className="h-5 w-5" />
            {title}
          </CardTitle>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {downloadOptions.map((option) => {
          const isLoading = loadingStates[option.id];
          const isCompleted = completedStates[option.id];
          
          return (
            <Button
              key={option.id}
              onClick={() => handleOptionClick(option)}
              disabled={option.disabled || isLoading}
              variant="outline"
              className={cn(
                "w-full h-auto p-4 justify-start transition-all duration-200",
                "hover:bg-muted/50 hover:border-primary/20",
                isCompleted && "bg-green-50 border-green-200 text-green-700",
                option.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-3 w-full">
                {/* Icon */}
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
                  "bg-muted text-muted-foreground",
                  isCompleted && "bg-green-100 text-green-600",
                  isLoading && "bg-primary/10 text-primary"
                )}>
                  {isLoading ? (
                    <Clock className="h-5 w-5 animate-spin" />
                  ) : isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    option.icon
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {option.name}
                    </span>
                    {option.badge && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                        {option.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isLoading ? "Generating download..." : 
                     isCompleted ? "Download completed!" : 
                     option.description}
                  </p>
                </div>
              </div>
            </Button>
          );
        })}
        
        {/* Footer Note */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
          💡 Tip: Files will be saved to your Downloads folder
        </div>
      </CardContent>
    </Card>
  );
}

// Preset download option creators
export const createTextDownloadOption = (
  downloadFn: () => void | Promise<void>
): DownloadOption => ({
  id: 'text',
  name: 'Text Summary',
  description: 'Download a formatted text file with your complete results',
  icon: <FileText className="h-5 w-5" />,
  onClick: downloadFn,
});

export const createImageDownloadOption = (
  downloadFn: () => void | Promise<void>,
  disabled: boolean = true
): DownloadOption => ({
  id: 'image',
  name: 'Results Image',
  description: 'Save your results as a high-quality image (PNG)',
  icon: <Image className="h-5 w-5" />,
  onClick: downloadFn,
  disabled,
  badge: disabled ? 'Coming Soon' : undefined,
});

export const createPDFDownloadOption = (
  downloadFn: () => void | Promise<void>,
  disabled: boolean = true
): DownloadOption => ({
  id: 'pdf',
  name: 'PDF Report',
  description: 'Generate a professional PDF report of your results',
  icon: <FileDown className="h-5 w-5" />,
  onClick: downloadFn,
  disabled,
  badge: disabled ? 'Coming Soon' : undefined,
});
