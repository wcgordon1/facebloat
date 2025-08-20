import * as React from "react";
import { useState, useCallback, useMemo } from "react";
import { cn } from "@/utils/misc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import { Switch } from "./switch";
import { Button } from "./button";

export interface BMIProps extends React.HTMLAttributes<HTMLDivElement> {}

interface BMIResult {
  bmi: number;
  category: string;
  description: string;
  color: string;
}

const BMI = React.forwardRef<HTMLDivElement, BMIProps>(
  ({ className, ...props }, ref) => {
    const [height, setHeight] = useState<string>("");
    const [weight, setWeight] = useState<string>("");
    const [isMetric, setIsMetric] = useState<boolean>(true);
    const [showResult, setShowResult] = useState<boolean>(false);

    const calculateBMI = useCallback((heightValue: number, weightValue: number, metric: boolean): number => {
      if (metric) {
        // Metric: BMI = weight (kg) / [height (m)]^2
        // Convert cm to m by dividing by 100
        const heightInMeters = heightValue / 100;
        return weightValue / (heightInMeters * heightInMeters);
      } else {
        // Imperial: BMI = 703 × weight (lb) / [height (in)]^2
        return (703 * weightValue) / (heightValue * heightValue);
      }
    }, []);

    const getBMICategory = useCallback((bmi: number): BMIResult => {
      if (bmi < 18.5) {
        return {
          bmi,
          category: "Underweight",
          description: "May be associated with nutritional or health issues if unintentional. Consider discussing with a clinician.",
          color: "text-blue-600 dark:text-blue-400"
        };
      } else if (bmi >= 18.5 && bmi <= 24.9) {
        return {
          bmi,
          category: "Healthy Weight",
          description: "Often associated with lower risk of weight-related conditions; body composition and lifestyle still matter.",
          color: "text-green-600 dark:text-green-400"
        };
      } else if (bmi >= 25.0 && bmi <= 29.9) {
        return {
          bmi,
          category: "Overweight",
          description: "Above the healthy range; nutrition, activity, and sleep can help improve health markers.",
          color: "text-yellow-600 dark:text-yellow-400"
        };
      } else if (bmi >= 30.0 && bmi <= 34.9) {
        return {
          bmi,
          category: "Obesity (Class I)",
          description: "Higher risk for conditions such as type 2 diabetes and hypertension; personalized guidance can help.",
          color: "text-orange-600 dark:text-orange-400"
        };
      } else if (bmi >= 35.0 && bmi <= 39.9) {
        return {
          bmi,
          category: "Obesity (Class II)",
          description: "Elevated health risks; consider medical and lifestyle support.",
          color: "text-red-600 dark:text-red-400"
        };
      } else {
        return {
          bmi,
          category: "Obesity (Class III)",
          description: "Highest risk category; medical evaluation is advisable for tailored options.",
          color: "text-red-700 dark:text-red-500"
        };
      }
    }, []);

    const result = useMemo((): BMIResult | null => {
      const heightValue = parseFloat(height);
      const weightValue = parseFloat(weight);
      
      if (isNaN(heightValue) || isNaN(weightValue) || heightValue <= 0 || weightValue <= 0) {
        return null;
      }

      const bmi = calculateBMI(heightValue, weightValue, isMetric);
      return getBMICategory(bmi);
    }, [height, weight, isMetric, calculateBMI, getBMICategory]);

    const handleCalculate = () => {
      if (result) {
        setShowResult(true);
      }
    };

    const handleReset = () => {
      setHeight("");
      setWeight("");
      setShowResult(false);
    };

    const isValid = height.trim() !== "" && weight.trim() !== "" && result !== null;

    return (
      <div ref={ref} className={cn("w-full max-w-md mx-auto", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>BMI Calculator</CardTitle>
            <CardDescription>
              Calculate your Body Mass Index to assess your weight status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Unit System Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {isMetric ? "Metric" : "Imperial"} System
              </span>
              <div className="flex items-center space-x-2">
                <span className={cn("text-sm", isMetric ? "text-primary" : "text-muted-foreground")}>
                  Metric
                </span>
                <Switch
                  checked={!isMetric}
                  onCheckedChange={(checked) => {
                    setIsMetric(!checked);
                    setShowResult(false);
                  }}
                />
                <span className={cn("text-sm", !isMetric ? "text-primary" : "text-muted-foreground")}>
                  Imperial
                </span>
              </div>
            </div>

            {/* Height Input */}
            <div className="space-y-2">
              <label htmlFor="height" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Height ({isMetric ? "cm" : "inches"})
              </label>
              <Input
                id="height"
                type="number"
                placeholder={isMetric ? "Enter height in cm" : "Enter height in inches"}
                value={height}
                onChange={(e) => {
                  setHeight(e.target.value);
                  setShowResult(false);
                }}
                min="0"
                step="0.1"
              />
            </div>

            {/* Weight Input */}
            <div className="space-y-2">
              <label htmlFor="weight" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Weight ({isMetric ? "kg" : "lbs"})
              </label>
              <Input
                id="weight"
                type="number"
                placeholder={isMetric ? "Enter weight in kg" : "Enter weight in lbs"}
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value);
                  setShowResult(false);
                }}
                min="0"
                step="0.1"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button 
                onClick={handleCalculate} 
                disabled={!isValid}
                className="flex-1"
              >
                Calculate BMI
              </Button>
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="flex-1"
              >
                Reset
              </Button>
            </div>

            {/* Results */}
            {showResult && result && (
              <div className="space-y-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {result.bmi.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">BMI</div>
                </div>
                
                <div className="space-y-2">
                  <div className={cn("text-lg font-semibold", result.color)}>
                    {result.category}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {result.description}
                  </p>
                </div>

                <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-md">
                  <strong>Important:</strong> BMI is a screening tool, not a diagnosis. It doesn't directly measure body fat and can misclassify very muscular people, older adults, and some ethnic groups. Not medical advice. For children/teens, use BMI-for-age percentiles instead of the adult cutoffs.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
);

BMI.displayName = "BMI";

export { BMI };
