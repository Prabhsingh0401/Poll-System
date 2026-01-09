import React from "react";

/* -------------------- Types -------------------- */

interface Poll {
  question: string;
  options: string[];
  correctAnswer?: string | null;
}

type StudentAnswers = Record<number, string>;

type ConnectionStatus = "connecting" | "connected" | "disconnected";

interface FinalResultsProps {
  pollHistory: Poll[];
  studentAnswers: StudentAnswers;
  name: string;
  connectionStatus: ConnectionStatus;
  onLogout: () => void;
}

/* -------------------- Component -------------------- */

const FinalResults: React.FC<FinalResultsProps> = ({
  pollHistory,
  studentAnswers,
}) => {
  if (!pollHistory || pollHistory.length === 0) {
    return (
      <div className="min-h-screen relative bg-white flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">No poll data available</p>
        </div>
      </div>
    );
  }

  /* -------------------- Score Calculation -------------------- */

  let correctCount = 0;
  let wrongCount = 0;

  pollHistory.forEach((poll, index) => {
    const studentAnswer = studentAnswers[index];
    if (studentAnswer) {
      const pollCorrect = (poll as any).correctAnswer;

      if (typeof pollCorrect !== "undefined" && pollCorrect != null) {
        if (studentAnswer === pollCorrect) {
          correctCount++;
        } else {
          wrongCount++;
        }
      } else {
        // Fallback: if no correctAnswer provided, treat any answered option as correct
        // (previous behaviour considered membership in options as 'correct')
        if (poll.options.includes(studentAnswer)) {
          correctCount++;
        } else {
          wrongCount++;
        }
      }
    }
  });

  const totalQuestions = pollHistory.length;
  const percentage =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  /* -------------------- UI -------------------- */

  return (
    <div className="min-h-screen relative bg-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center py-8">
        <div className="max-w-xl mx-auto w-full px-4">
          {/* Header */}
          <div className="text-xs font-medium mb-4 text-gray-500 uppercase tracking-wide">
            Poll Results
          </div>

          {/* Score Card */}
          <div className="border border-gray-200 rounded-xl pb-3 bg-white shadow-sm mb-6">
            <div className="px-5 py-4 rounded-t-xl bg-gradient-to-r from-[#7565D9] to-[#4D0ACD]">
              <div className="text-white text-center">
                <div className="text-5xl font-bold mb-2">{percentage}%</div>
                <div className="text-lg font-semibold">Your Score</div>
              </div>
            </div>

            <div className="px-5 py-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Correct */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-green-600"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-green-600 font-medium uppercase">
                        Correct
                      </div>
                      <div className="text-2xl font-bold text-green-700">
                        {correctCount}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Wrong */}
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-200 flex items-center justify-center">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-red-600"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-red-600 font-medium uppercase">
                        Wrong
                      </div>
                      <div className="text-2xl font-bold text-red-700">
                        {wrongCount}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">
                    Total Questions
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {totalQuestions}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Review */}
          <div className="text-xs font-medium mb-4 text-gray-500 uppercase tracking-wide">
            Questions Review
          </div>

          <div className="space-y-4">
            {pollHistory.map((poll, index) => {
              const studentAnswer = studentAnswers[index];
              const pollCorrect = (poll as any).correctAnswer;
              const isCorrect = !!studentAnswer
                ? typeof pollCorrect !== "undefined" && pollCorrect != null
                  ? studentAnswer === pollCorrect
                  : poll.options.includes(studentAnswer)
                : false;

              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg pb-3 bg-white"
                >
                  <div className="px-5 py-3 bg-black/80 rounded-t-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-white/70 mb-1">
                          Question {index + 1}
                        </div>
                        <div className="text-base font-semibold text-white leading-relaxed">
                          {poll.question}
                        </div>
                      </div>

                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isCorrect ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {isCorrect ? (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3">
                    <div className="text-xs font-medium text-gray-500 uppercase mb-2">
                      Your Answer
                    </div>
                    <div
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        isCorrect
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {studentAnswer || "Not answered"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center mb-8">
            <p className="text-gray-500 text-sm">
              Poll session has ended. Thank you for participating!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalResults;
