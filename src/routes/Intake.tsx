import { useState } from 'react';
import { QuestionAnswer, RecommendationResult } from '../types';
import { getQuestion, getRecommendation, getDisclaimer } from '../lib/rules/recommender';
import { generatePDF } from '../lib/pdf';

export default function Intake() {
  const [currentQuestion, setCurrentQuestion] = useState('Q1');
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [result, setResult] = useState<RecommendationResult | null>(null);

  const question = result ? null : getQuestion(currentQuestion);

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers, { questionId: currentQuestion, answer: value }];
    setAnswers(newAnswers);

    const q = getQuestion(currentQuestion);
    const selectedOption = q?.options.find(opt => opt.value === value);

    if (selectedOption) {
      if ('result' in selectedOption) {
        // 結果に到達
        const recommendation = getRecommendation(newAnswers);
        setResult(recommendation);
      } else if ('next' in selectedOption) {
        // 次の質問へ
        setCurrentQuestion(selectedOption.next);
      }
    }
  };

  const handleReset = () => {
    setCurrentQuestion('Q1');
    setAnswers([]);
    setResult(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePDF = async () => {
    await generatePDF('result-content', `toothbrush-recommendation-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (result) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div id="result-content" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">✨</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              推奨結果
            </h1>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
              <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
                おすすめの歯ブラシタイプ
              </h2>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {result.brushType}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                推奨理由
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {result.reason}
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-700">
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                使用上の注意点
              </h3>
              <p className="text-yellow-800 dark:text-yellow-200">
                {result.notes}
              </p>
            </div>

            {result.marketExamples && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                  市販品の例
                </h3>
                <p className="text-green-800 dark:text-green-200 text-sm">
                  {result.marketExamples}
                </p>
              </div>
            )}

            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {getDisclaimer()}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center space-x-4 no-print">
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            🖨️ 印刷
          </button>
          <button
            onClick={handlePDF}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            📄 PDF保存
          </button>
          <button
            onClick={handleReset}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            🔄 最初から
          </button>
        </div>
      </div>
    );
  }

  if (!question) {
    return <div className="text-center py-12">読み込み中...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            歯ブラシ選択の問診
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            質問 {answers.length + 1}
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((answers.length + 1) / 4) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          {question.text}
        </h2>

        <div className="space-y-4">
          {question.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              className="w-full text-left bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/30 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-lg p-6 transition-all"
            >
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {answers.length > 0 && (
        <div className="mt-6 text-center no-print">
          <button
            onClick={handleReset}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline"
          >
            最初からやり直す
          </button>
        </div>
      )}
    </div>
  );
}
