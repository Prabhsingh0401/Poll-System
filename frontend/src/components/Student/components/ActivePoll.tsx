import React from "react";

/* -------------------- Types -------------------- */

interface Poll {
  question: string;
  options: string[];
}

interface ActivePollProps {
  poll: Poll;
  selectedOption: string;
  setSelectedOption: React.Dispatch<React.SetStateAction<string>>;
  submitAnswer: () => void;
  remainingTime: number | null;
  name?: string;
  connectionStatus?: string;
  onLogout?: () => void;
}

/* -------------------- Component -------------------- */

const ActivePoll: React.FC<ActivePollProps> = ({
  poll,
  selectedOption,
  setSelectedOption,
  submitAnswer,
  remainingTime,
}) => {
  return (
    <div className="min-h-screen relative bg-white flex flex-col">
      {/* Center Content */}
      <div className="flex-1 flex flex-col justify-center py-8">
        <div className="max-w-xl mx-auto w-full px-4">
          {/* Question Heading Row */}
          <div className="flex justify-start items-end mb-2 space-x-4">
            <div className="text-xs font-medium tracking-wide text-gray-500 uppercase">
              Question
            </div>

            {remainingTime !== null && (
              <div className="text-red-600 font-bold text-xs flex items-center gap-1.5">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="text-lg">
                  00:{remainingTime < 10 ? `0${remainingTime}` : remainingTime}
                </span>
              </div>
            )}
          </div>

          {/* Main Card */}
          <div className="border border-gray-200 rounded-xl pb-3 bg-white shadow-sm">
            {/* Question Header */}
            <div className="px-5 py-4 rounded-t-xl bg-black/80">
              <div className="text-lg font-semibold text-white leading-relaxed">
                {poll.question}
              </div>
            </div>

            {/* Options */}
            <div className="px-3 space-y-3 mt-4 mb-2">
              {poll.options && poll.options.length > 0 ? (
                poll.options.map((option: string, index: number) => (
                  <div
                    key={index}
                    onClick={() => setSelectedOption(option)}
                    className={`
                      relative flex items-center gap-4 p-3 rounded-lg cursor-pointer border transition-all duration-200
                      ${
                        selectedOption === option
                          ? "border-[#4D0ACD] bg-[#F5F3FF] shadow-sm"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }
                    `}
                  >
                    {/* Option Number */}
                    <div
                      className={`
                        w-8 h-8 rounded-full border flex items-center justify-center
                        text-sm font-bold transition-colors
                        ${
                          selectedOption === option
                            ? "bg-[#4D0ACD] border-[#4D0ACD] text-white"
                            : "bg-white border-gray-200 text-gray-500"
                        }
                      `}
                    >
                      {index + 1}
                    </div>

                    {/* Option Text */}
                    <div
                      className={`flex-1 text-sm font-medium ${
                        selectedOption === option
                          ? "text-[#4D0ACD]"
                          : "text-gray-900"
                      }`}
                    >
                      {option}
                    </div>

                    {/* Selection Indicator */}
                    <div
                      className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center
                        ${
                          selectedOption === option
                            ? "border-[#4D0ACD]"
                            : "border-gray-300"
                        }
                      `}
                    >
                      {selectedOption === option && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#4D0ACD]" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                /* Text Input Fallback */
                <div className="px-2">
                  <input
                    type="text"
                    placeholder="Type your answer here..."
                    value={selectedOption}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSelectedOption(e.target.value)
                    }
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter" && selectedOption.trim()) {
                        submitAnswer();
                      }
                    }}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200
                               focus:border-[#4D0ACD] focus:bg-white focus:outline-none
                               transition-colors"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end mb-12">
            <button
              onClick={submitAnswer}
              disabled={!selectedOption}
              type="button"
              className={`
                px-12 py-3 rounded-full text-sm font-bold transition-all transform
                ${
                  !selectedOption
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#4D0ACD] text-white hover:bg-[#3d08a5] hover:scale-105 active:scale-95"
                }
              `}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivePoll;
