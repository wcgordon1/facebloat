import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { 
  Quiz, 
  Question, 
  Answers, 
  ProfileState, 
  DerivedProfile, 
  ScoreResult, 
  Letter 
} from './types';
import { validateQuiz } from './types';
import { getQuestions, deriveProfile, scoreQuiz } from './logic';
import quizData from './facebloat.quiz.json';

interface QuizContextValue {
  // Data
  quiz: Quiz;
  profile: ProfileState;
  route: "male" | "female";
  questions: Question[];
  answers: Answers;
  result: ScoreResult | null;
  
  // State
  currentStep: 'profile' | 'quiz' | 'results';
  currentQuestionIndex: number;
  isLoading: boolean;
  
  // Actions
  setProfile: (profile: ProfileState) => void;
  setAnswer: (questionId: string, answer: Letter) => void;
  clearAnswers: () => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submit: () => void;
  reset: () => void;
  goToStep: (step: 'profile' | 'quiz' | 'results') => void;
}

const QuizContext = createContext<QuizContextValue | null>(null);

interface QuizProviderProps {
  children: React.ReactNode;
}

export function QuizProvider({ children }: QuizProviderProps) {
  // Validate and load quiz data
  const [quiz] = useState<Quiz>(() => {
    try {
      return validateQuiz(quizData);
    } catch (error) {
      console.error('Failed to load quiz data:', error);
      throw error;
    }
  });

  // State
  const [profile, setProfileState] = useState<ProfileState>({});
  const [answers, setAnswersState] = useState<Answers>({});
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [currentStep, setCurrentStep] = useState<'profile' | 'quiz' | 'results'>('profile');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Derived state
  const derivedProfile = deriveProfile(profile);
  const route = derivedProfile.route;
  const questions = getQuestions(quiz, route);

  // Storage keys
  const getStorageKey = (key: string) => `facebloat:${key}:v${quiz.version}`;

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(getStorageKey('profile'));
      if (savedProfile) {
        setProfileState(JSON.parse(savedProfile));
      }

      const savedAnswers = localStorage.getItem(getStorageKey('answers'));
      if (savedAnswers) {
        setAnswersState(JSON.parse(savedAnswers));
      }

      const savedStep = localStorage.getItem(getStorageKey('currentStep'));
      if (savedStep && ['profile', 'quiz', 'results'].includes(savedStep)) {
        setCurrentStep(savedStep as 'profile' | 'quiz' | 'results');
      }

      const savedQuestionIndex = localStorage.getItem(getStorageKey('questionIndex'));
      if (savedQuestionIndex) {
        setCurrentQuestionIndex(parseInt(savedQuestionIndex, 10) || 0);
      }
    } catch (error) {
      console.warn('Failed to load quiz state from localStorage:', error);
    }
  }, [quiz.version]);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey('profile'), JSON.stringify(profile));
    } catch (error) {
      console.warn('Failed to save profile to localStorage:', error);
    }
  }, [profile, quiz.version]);

  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey('answers'), JSON.stringify(answers));
    } catch (error) {
      console.warn('Failed to save answers to localStorage:', error);
    }
  }, [answers, quiz.version]);

  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey('currentStep'), currentStep);
    } catch (error) {
      console.warn('Failed to save current step to localStorage:', error);
    }
  }, [currentStep, quiz.version]);

  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey('questionIndex'), currentQuestionIndex.toString());
    } catch (error) {
      console.warn('Failed to save question index to localStorage:', error);
    }
  }, [currentQuestionIndex, quiz.version]);

  // Actions
  const setProfile = useCallback((newProfile: ProfileState) => {
    setProfileState(newProfile);
  }, []);

  const setAnswer = useCallback((questionId: string, answer: Letter) => {
    setAnswersState(prev => ({ ...prev, [questionId]: answer }));
  }, []);

  const clearAnswers = useCallback(() => {
    setAnswersState({});
    setResult(null);
    setCurrentQuestionIndex(0);
  }, []);

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setIsLoading(true);
      // Simulate "thinking" delay before moving to next question
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setIsLoading(false);
        // Scroll to position title just below the nav
        const titleElement = document.getElementById('quiz-title');
        if (titleElement) {
          const titleRect = titleElement.getBoundingClientRect();
          const currentScrollY = window.scrollY;
          const titleTopRelativeToDocument = titleRect.top + currentScrollY;
          const navHeight = 120; // Space for nav + some padding
          const targetScrollPosition = titleTopRelativeToDocument - navHeight;
          window.scrollTo({ top: Math.max(0, targetScrollPosition), behavior: 'smooth' });
        }
      }, 800);
    }
  }, [currentQuestionIndex, questions.length]);

  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const submit = useCallback(() => {
    try {
      setIsLoading(true);
      
      // Simulate processing delay
      setTimeout(() => {
        const scoreResult = scoreQuiz(quiz, answers, route);
        setResult(scoreResult);
        setCurrentStep('results');
        setIsLoading(false);
        // Scroll to position title just below the nav
        const titleElement = document.getElementById('quiz-title');
        if (titleElement) {
          const titleRect = titleElement.getBoundingClientRect();
          const currentScrollY = window.scrollY;
          const titleTopRelativeToDocument = titleRect.top + currentScrollY;
          const navHeight = 120; // Space for nav + some padding
          const targetScrollPosition = titleTopRelativeToDocument - navHeight;
          window.scrollTo({ top: Math.max(0, targetScrollPosition), behavior: 'smooth' });
        }
      }, 1200); // Longer delay for final processing
    } catch (error) {
      console.error('Failed to score quiz:', error);
      setIsLoading(false);
    }
  }, [quiz, answers, route]);

  const reset = useCallback(() => {
    setProfileState({});
    setAnswersState({});
    setResult(null);
    setCurrentStep('profile');
    setCurrentQuestionIndex(0);
    
    // Scroll to position title just below the nav
    setTimeout(() => {
      const titleElement = document.getElementById('quiz-title');
      if (titleElement) {
        const titleRect = titleElement.getBoundingClientRect();
        const currentScrollY = window.scrollY;
        const titleTopRelativeToDocument = titleRect.top + currentScrollY;
        const navHeight = 120; // Space for nav + some padding
        const targetScrollPosition = titleTopRelativeToDocument - navHeight;
        window.scrollTo({ top: Math.max(0, targetScrollPosition), behavior: 'smooth' });
      }
    }, 100);
    
    // Clear localStorage
    try {
      ['profile', 'answers', 'currentStep', 'questionIndex'].forEach(key => {
        localStorage.removeItem(getStorageKey(key));
      });
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }, [quiz.version]);

  const goToStep = useCallback((step: 'profile' | 'quiz' | 'results') => {
    setCurrentStep(step);
    if (step === 'quiz') {
      setCurrentQuestionIndex(0);
    }
  }, []);

  const value: QuizContextValue = {
    // Data
    quiz,
    profile,
    route,
    questions,
    answers,
    result,
    
    // State
    currentStep,
    currentQuestionIndex,
    isLoading,
    
    // Actions
    setProfile,
    setAnswer,
    clearAnswers,
    nextQuestion,
    previousQuestion,
    submit,
    reset,
    goToStep,
  };

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}
