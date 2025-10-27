import rules from './toothbrush_rules.json';
import { QuestionAnswer, RecommendationResult, ToothbrushType } from '../../types';

export function getRecommendation(answers: QuestionAnswer[]): RecommendationResult | null {
  const answerMap = new Map(answers.map(a => [a.questionId, a.answer]));
  
  const q1Answer = answerMap.get('Q1');
  
  if (q1Answer === 'yes') {
    // 3分以下 → Q2へ
    const q2Answer = answerMap.get('Q2');
    if (q2Answer === 'cavity') {
      return buildResult('複合植毛');
    } else if (q2Answer === 'periodontal') {
      return buildResult('大型・幅広・段差植毛');
    }
  } else if (q1Answer === 'no') {
    // 3分超え → Q3へ
    const q3Answer = answerMap.get('Q3');
    if (q3Answer === 'yes') {
      return buildResult('極細毛・スーパーテーパード毛');
    } else if (q3Answer === 'no') {
      return buildResult('小型・コンパクト');
    }
  }
  
  return null;
}

function buildResult(brushType: ToothbrushType): RecommendationResult {
  const rec = rules.recommendations[brushType];
  return {
    brushType,
    reason: rec.reason,
    notes: rec.notes,
    marketExamples: rec.marketExamples,
  };
}

export function getQuestion(questionId: string) {
  return rules.questions[questionId as keyof typeof rules.questions];
}

export function getDisclaimer() {
  return rules.disclaimer;
}
