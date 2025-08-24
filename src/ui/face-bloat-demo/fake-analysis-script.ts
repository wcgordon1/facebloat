export interface AnalysisStep {
  id: string;
  title: string;
  items: string[];
  duration: number;
  phase: 1 | 2 | 3;
}

export interface DemoConfig {
  analysisSteps: AnalysisStep[];
  finalProcessingTexts: string[];
  signupProcessingTexts: string[];
  microCommitmentQuestions: {
    sleep: {
      question: string;
      options: string[];
    };
    vibe: {
      question: string;
      options: string[];
    };
    stress: {
      question: string;
      options: string[];
    };
  };
  timing: {
    paywalTriggerProgress: number; // 92%
    finalProcessingInterval: number; // 1200ms
    signupProcessingInterval: number; // 800ms
    userInputProcessingDelay: number; // 1000ms
  };
  counters: {
    referenceScans: {
      start: number;
      end: number;
    };
    precisionRate: {
      start: number;
      end: number;
    };
    facialPoints: {
      start: number;
    };
  };
}

export const fakeAnalysisScript: DemoConfig = {
  analysisSteps: [
    {
      id: 'initialization',
      title: 'System Initialization',
      items: [
        'Calibrating facial recognition algorithms',
        'Adjusting for lighting conditions and shadows',
        'Locating 68 facial landmarks and contours',
        'Establishing baseline measurements',
        'Initializing neural network processing'
      ],
      duration: 4000,
      phase: 1
    },
    {
      id: 'measurement',
      title: 'Facial Contour Analysis',
      items: [
        'Measuring jawline definition and angles',
        'Analyzing cheekbone prominence levels',
        'Calculating facial width-to-height ratios',
        'Detecting asymmetrical features',
        'Mapping bone structure density'
      ],
      duration: 3800,
      phase: 2
    },
    {
      id: 'bloat-detection',
      title: 'Bloat Pattern Recognition',
      items: [
        'Estimating regional fullness levels',
        'Identifying water retention patterns',
        'Mapping inflammation indicators',
        'Analyzing skin texture variations',
        'Detecting puffiness gradients'
      ],
      duration: 3500,
      phase: 2
    },
    {
      id: 'social-analysis',
      title: 'Social Impact Assessment',
      items: [
        'Evaluating professional appearance factors',
        'Analyzing camera angle optimization needs',
        'Measuring photogenic potential scores',
        'Calculating confidence impact metrics',
        'Assessing lighting compatibility'
      ],
      duration: 3200,
      phase: 2
    },
    {
      id: 'synthesis',
      title: 'AI Synthesis & Recovery Planning',
      items: [
        'Synthesizing face-shape & social signals',
        'Generating personalized recovery protocols',
        'Creating platform-specific optimization tips',
        'Finalizing bloat fingerprint analysis',
        'Compiling actionable recommendations'
      ],
      duration: 3500,
      phase: 3
    }
  ],

  finalProcessingTexts: [
    'Cross-referencing data structures',
    'Adding external dependencies for review',
    'Calibrating personalization algorithms',
    'Your complete FaceBloat analysis is ready!',
    'Create a free account to view your results →'
  ],

  signupProcessingTexts: [
    'Preparing your report...',
    'Securing your data...',
    'Almost ready...'
  ],

  microCommitmentQuestions: {
    sleep: {
      question: 'Typical sleep last night?',
      options: ['5h', '6h', '7h', '8h+']
    },
    vibe: {
      question: "Yesterday's vibe?",
      options: ['High sodium', 'High carbs', 'Low water', 'Stressed']
    },
    stress: {
      question: 'Current stress level?',
      options: ['Very low', 'Moderate', 'High', 'Overwhelmed']
    }
  },

  timing: {
    paywalTriggerProgress: 92,
    finalProcessingInterval: 1200,
    signupProcessingInterval: 800,
    userInputProcessingDelay: 1000
  },

  counters: {
    referenceScans: {
      start: 0,
      end: 12438
    },
    precisionRate: {
      start: 81,
      end: 95.8
    },
    facialPoints: {
      start: 126
    }
  }
};
