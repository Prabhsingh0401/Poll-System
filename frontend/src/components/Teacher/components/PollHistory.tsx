import React from "react";

/* -------------------- Types -------------------- */

interface Poll {
  question: string;
  options: string[];
  responses?: Record<string, number>;
}

interface PollHistoryProps {
  history: Poll[];
  onClose: () => void;
}

/* -------------------- Component -------------------- */

const PollHistory: React.FC<PollHistoryProps> = ({ history, onClose }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white flex-shrink-0">
        <div className="mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            View Poll History
          </h1>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-[#4D0ACD] text-white font-medium hover:bg-[#3d08a5] transition-colors"
          >
            Back to Poll
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-6">
          {history && history.length > 0 ? (
            <div className="space-y-6">
              {history.map((poll, index) => {
                const totalVotes = Object.values(poll.responses ?? {}).reduce(
                  (a, b) => a + b,
                  0,
                );

                return (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg pb-3"
                  >
                    {/* Question Header */}
                    <div className="px-4 py-2 bg-black/80 rounded-t-lg">
                      <div className="text-sm font-medium text-white/70 mb-1">
                        Question {index + 1}
                      </div>
                      <div className="text-xl font-semibold text-white leading-relaxed">
                        {poll.question}
                      </div>
                    </div>

                    {/* Options */}
                    <div className="px-4 space-y-3 mt-4">
                      {poll.options?.map((option, optIndex) => {
                        const votes = poll.responses?.[option] ?? 0;
                        const percentage =
                          totalVotes > 0
                            ? Math.round((votes / totalVotes) * 100)
                            : 0;

                        return (
                          <div key={optIndex} className="relative">
                            {/* Progress Bar */}
                            <div className="absolute inset-0 rounded-lg overflow-hidden bg-gray-100">
                              <div
                                className="h-full bg-purple-200 transition-all duration-700"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>

                            {/* Content */}
                            <div className="relative flex items-center gap-3 p-2 border border-gray-200 bg-transparent rounded-lg">
                              <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm font-bold text-[#6C63FF] flex-shrink-0">
                                {optIndex + 1}
                              </div>

                              <div className="flex-1 text-sm font-medium text-gray-900">
                                {option}
                              </div>

                              <div className="text-right flex-shrink-0">
                                <div className="text-sm font-bold text-[#4D0ACD]">
                                  {percentage}%
                                </div>
                                <div className="text-xs text-gray-500">
                                  {votes} votes
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 flex items-center justify-center min-h-64">
              <p className="text-gray-500 text-lg">No poll history yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollHistory;
