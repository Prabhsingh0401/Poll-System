import React from "react";

/* -------------------- Types -------------------- */

interface Poll {
  question: string;
  options: string[];
  responses?: Record<string, number>;
}

interface ResultsViewProps {
  poll: Poll;
  selectedOption: string;
  name?: string;
  connectionStatus?: string;
  onLogout?: () => void;
}

/* -------------------- Component -------------------- */

const ResultsView: React.FC<ResultsViewProps> = ({ poll, selectedOption }) => {
  const totalVotes: number = poll.responses
    ? Object.values(poll.responses).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="min-h-[90vh] relative bg-white flex flex-col">
      {/* Center Content */}
      <div className="flex-1 flex flex-col justify-center py-8">
        <div className="max-w-xl mx-auto w-full px-4">
          {/* Question Label */}
          <div className="text-xs font-medium mb-2 text-gray-500 uppercase tracking-wide">
            Question
          </div>

          {/* Main Card */}
          <div className="border border-gray-200 rounded-xl pb-3 bg-white shadow-sm">
            {/* Question Header */}
            <div className="px-5 py-4 rounded-t-xl bg-black/80 text-xl font-semibold text-white leading-relaxed">
              {poll.question}
            </div>

            {/* Options Results */}
            <div className="px-3 space-y-3 mt-4 mb-2">
              {poll.options.map((option: string, index: number) => {
                const votes: number = poll.responses?.[option] ?? 0;
                const percentage: number =
                  totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                const isSelected: boolean = selectedOption === option;

                return (
                  <div key={index} className="relative">
                    {/* Progress Bar Background */}
                    <div className="absolute inset-0 rounded-lg overflow-hidden bg-gray-50 mx-3">
                      <div
                        className="h-full bg-purple-200 transition-all duration-700 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* Content Layer */}
                    <div
                      className={`
                        relative flex items-center gap-4 p-3 rounded-lg border transition-all mx-3 my-1
                        ${
                          isSelected
                            ? "border-[#4D0ACD] bg-transparent ring-1 ring-[#4D0ACD]"
                            : "border-transparent bg-transparent"
                        }
                      `}
                    >
                      {/* Option Number */}
                      <div
                        className="w-8 h-8 flex-shrink-0 flex items-center justify-center
                                   rounded-full text-sm font-bold bg-white
                                   border border-gray-200 text-[#6C63FF] shadow-sm"
                      >
                        {index + 1}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate pr-2">
                          {option}
                        </div>
                        {isSelected && (
                          <div className="text-[10px] font-semibold text-[#4D0ACD] uppercase tracking-wider">
                            Your Answer
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold text-[#4D0ACD]">
                          {percentage}%
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                          {votes} votes
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Message */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Wait for the teacher to ask a new question
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
