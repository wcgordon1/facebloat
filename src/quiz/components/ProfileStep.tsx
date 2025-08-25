import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Select } from '@/ui/select';
import { cn } from '@/utils/misc';
import { useQuiz } from '../context';

export function ProfileStep() {
  const { profile, setProfile, goToStep, quiz } = useQuiz();

  const handleFieldChange = (fieldId: string, value: string) => {
    setProfile({
      ...profile,
      [fieldId]: value,
    });
  };

  const canProceed = () => {
    // Optional step - can always proceed
    return true;
  };

  const proceedToQuiz = () => {
    goToStep('quiz');
  };

  return (
    <Card className="w-full max-w-md md:max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Quick Profile Setup</CardTitle>
          <CardDescription>
            Help us personalize your Face Bloat analysis. This information helps us provide more accurate insights.
            <br />
            <span className="text-sm text-muted-foreground mt-2 block">
              All fields are optional and used only for personalization.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Fields */}
          {quiz.profile.fields.map((field) => (
            <div key={field.id} className="space-y-3">
              <fieldset>
                <legend className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {field.label}
                </legend>
                
                {field.type === 'select' && field.options && (
                  <div className="mt-3 space-y-2">
                    {field.options.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={field.id}
                          value={option.value}
                          checked={(profile[field.id as keyof typeof profile] as string) === option.value}
                          onChange={() => handleFieldChange(field.id, option.value)}
                          className="h-4 w-4 text-primary focus:ring-primary border-border"
                        />
                        <span className="text-sm text-foreground">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </fieldset>
            </div>
          ))}

          {/* Optional BMI Calculator Section */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Optional: Basic Measurements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Height</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Height"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={profile.height || ""}
                    onChange={(e) => setProfile({ ...profile, height: parseFloat(e.target.value) || undefined })}
                  />
                  <Select
                    value={profile.heightUnit || "cm"}
                    onValueChange={(value: "cm" | "ft") => setProfile({ ...profile, heightUnit: value })}
                  >
                    <option value="cm">cm</option>
                    <option value="ft">ft</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Weight</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Weight"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={profile.weight || ""}
                    onChange={(e) => setProfile({ ...profile, weight: parseFloat(e.target.value) || undefined })}
                  />
                  <Select
                    value={profile.weightUnit || "kg"}
                    onValueChange={(value: "kg" | "lbs") => setProfile({ ...profile, weightUnit: value })}
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-md">
            <strong>Privacy:</strong> This information is stored locally in your browser and is not sent to any server. 
            It's used only to personalize your quiz experience and provide more relevant insights.
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={proceedToQuiz}
              disabled={!canProceed()}
              className="flex-1"
            >
              Start Face Bloat Quiz →
            </Button>
          </div>
        </CardContent>
    </Card>
  );
}
