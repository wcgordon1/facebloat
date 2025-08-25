import type { 
  Quiz, 
  Question, 
  GenderRoute, 
  Answers, 
  ScoreResult, 
  ProfileState, 
  DerivedProfile,
  AnswerContext,
  TopDriver
} from './types';

/**
 * Filter questions based on gender route
 */
export function getQuestions(quiz: Quiz, route: GenderRoute): Question[] {
  return quiz.questions.filter(question => 
    question.appliesTo === "all" || question.appliesTo === route
  );
}

/**
 * Derive profile information and gender route
 */
export function deriveProfile(profileState: ProfileState): DerivedProfile {
  // Determine gender route based on menstruation response
  let route: GenderRoute = "male"; // default
  if (profileState.menstruates === "yes") {
    route = "female";
  }

  // Calculate derived metrics
  const metrics: DerivedProfile["metrics"] = {};

  // BMI calculation
  if (profileState.height && profileState.weight) {
    let heightInM = profileState.height;
    let weightInKg = profileState.weight;

    // Convert height to meters
    if (profileState.heightUnit === "ft") {
      heightInM = profileState.height * 30.48; // feet to cm
    }
    heightInM = heightInM / 100; // cm to meters

    // Convert weight to kg
    if (profileState.weightUnit === "lbs") {
      weightInKg = profileState.weight * 0.453592; // lbs to kg
    }

    metrics.bmi = weightInKg / (heightInM * heightInM);
  }

  // Waist to height ratio
  if (profileState.waist && profileState.height) {
    let waistInCm = profileState.waist;
    let heightInCm = profileState.height;

    // Convert waist to cm
    if (profileState.waistUnit === "in") {
      waistInCm = profileState.waist * 2.54; // inches to cm
    }

    // Convert height to cm
    if (profileState.heightUnit === "ft") {
      heightInCm = profileState.height * 30.48; // feet to cm
    }

    metrics.waistToHeight = waistInCm / heightInCm;
  }

  return { route, metrics };
}

/**
 * Score the quiz based on answers and gender route
 */
export function scoreQuiz(quiz: Quiz, answers: Answers, route: GenderRoute): ScoreResult {
  const validQuestions = getQuestions(quiz, route);
  const answeredQuestions = validQuestions.filter(q => answers[q.id]);
  
  if (answeredQuestions.length === 0) {
    throw new Error("No questions answered");
  }

  // Calculate category scores
  const categoryScores: Record<string, number> = {};
  const categoryWeights: Record<string, number> = {};
  const answerContexts: AnswerContext[] = [];

  // Group answered questions by category
  const questionsByCategory: Record<string, Question[]> = {};
  answeredQuestions.forEach(question => {
    if (!questionsByCategory[question.categoryId]) {
      questionsByCategory[question.categoryId] = [];
    }
    questionsByCategory[question.categoryId].push(question);
  });

  // Calculate weighted average for each category
  Object.entries(questionsByCategory).forEach(([categoryId, questions]) => {
    let weightedSum = 0;
    let totalWeight = 0;

    questions.forEach(question => {
      const answer = answers[question.id];
      const option = question.options.find(opt => opt.letter === answer);
      
      if (option) {
        // Get question weight within category (default to 1)
        const questionWeight = question.withinCategoryWeight?.[route] ?? 1;
        
        // Add to weighted sum (points are 0-7, convert to 0-100 scale)
        const normalizedPoints = (option.points / 7) * 100;
        weightedSum += normalizedPoints * questionWeight;
        totalWeight += questionWeight;

        // Collect answer context for results
        const category = quiz.categories.find(cat => cat.id === categoryId);
        answerContexts.push({
          questionId: question.id,
          questionText: question.text,
          categoryId,
          choice: answer,
          choiceTitle: option.title,
          context: option.context,
        });
      }
    });

    if (totalWeight > 0) {
      categoryScores[categoryId] = weightedSum / totalWeight;
    }
  });

  // Apply category weights and calculate final score
  const routeWeights = quiz.categoryWeights[route];
  let weightedFinalScore = 0;
  let usedWeightTotal = 0;

  Object.entries(categoryScores).forEach(([categoryId, score]) => {
    const categoryWeight = routeWeights[categoryId] || 0;
    weightedFinalScore += (score * categoryWeight) / 100;
    usedWeightTotal += categoryWeight;
    categoryWeights[categoryId] = categoryWeight;
  });

  // Renormalize if not all categories were answered
  if (usedWeightTotal > 0 && usedWeightTotal < 100) {
    weightedFinalScore = (weightedFinalScore * 100) / usedWeightTotal;
  }

  // Round to nearest integer
  const finalScore = Math.round(Math.max(0, Math.min(100, weightedFinalScore)));

  // Find appropriate score band
  const band = quiz.scoreBands.find(band => 
    finalScore >= band.min && finalScore <= band.max
  );

  if (!band) {
    throw new Error(`No score band found for score: ${finalScore}`);
  }

  // Calculate top drivers (categories contributing most to score)
  const topDrivers: TopDriver[] = Object.entries(categoryScores)
    .map(([categoryId, score]) => {
      const category = quiz.categories.find(cat => cat.id === categoryId);
      const weight = categoryWeights[categoryId] || 0;
      const contribution = (score * weight) / 100;
      
      return {
        categoryId,
        label: category?.label || categoryId,
        pct: Math.round(contribution),
      };
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3); // Top 3 drivers

  return {
    score: finalScore,
    band,
    topDrivers,
    answerContexts,
  };
}
