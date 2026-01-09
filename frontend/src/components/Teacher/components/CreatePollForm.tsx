import React from "react";

/* -------------------- Types -------------------- */

interface CreatePollFormProps {
  question: string;
  setQuestion: React.Dispatch<React.SetStateAction<string>>;
  options: string[];
  setOptions: React.Dispatch<React.SetStateAction<string[]>>;
  pollDuration: number;
  setPollDuration: React.Dispatch<React.SetStateAction<number>>;
  createPoll: () => void;
  handleOptionChange: (index: number, value: string) => void;
  addOption: () => void;
  removeOption: (index: number) => void;
  correctIndex: number | null;
  setCorrectIndex: React.Dispatch<React.SetStateAction<number | null>>;
}

/* -------------------- Component -------------------- */

const CreatePollForm: React.FC<CreatePollFormProps> = ({
  question,
  setQuestion,
  options,
  pollDuration,
  setPollDuration,
  createPoll,
  handleOptionChange,
  addOption,
  removeOption,
  correctIndex,
  setCorrectIndex,
}) => {
  const validOptionCount = options.filter((o) => o.trim()).length;
  const isDisabled = !question.trim() || validOptionCount < 2;
  return (
    <>
      <div className="w-full mx-auto relative h-[85vh] px-4">
        {/* Header Badge */}
        <div className="flex mb-2">
          <div
            className="flex items-center gap-2 px-4 py-2
                       bg-gradient-to-r from-[#7565D9] to-[#4D0ACD]
                       text-white rounded-full text-xs font-medium"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 2l1.9 5.1L19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 2z" />
            </svg>
            Intervue Poll
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">
          Let’s Get Started
        </h2>
        <p className="text-sm text-gray-500 mb-4 max-w-xl">
          You’ll have the ability to create and manage polls, ask questions, and
          monitor your students’ responses in real-time.
        </p>

        {/* Question Input */}
        <div className="mb-2 w-1/2">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              Enter your question
            </label>

            {/* Duration Dropdown */}
            <div className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer relative">
              <select
                value={pollDuration}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setPollDuration(Number(e.target.value))
                }
                className="outline-none cursor-pointer bg-gray-100 py-1.5 pl-3 pr-8 rounded-md text-gray-700 text-xs font-medium appearance-none"
                style={{ backgroundImage: "none" }}
              >
                <option value={30}>30 seconds</option>
                <option value={60}>60 seconds</option>
              </select>
              <span className="text-[#4D0ACD] absolute right-2 pointer-events-none text-[10px]">
                ▼
              </span>
            </div>
          </div>

          <input
            type="text"
            value={question}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuestion(e.target.value)
            }
            placeholder="Rahul Bajaj"
            className="w-full px-4 py-3 rounded-lg bg-gray-100
                       border border-transparent focus:border-[#6C63FF]
                       focus:ring-2 focus:ring-[#6C63FF]/30 outline-none"
          />
          <div className="text-right text-xs text-gray-400 mt-1">0/100</div>
        </div>

        {/* Options */}
        <div className="w-1/2">
          <div className="flex justify-between text-sm font-medium text-gray-700 mb-3 pr-2">
            <span>Edit Options</span>
            <span>Is it Correct?</span>
          </div>

          <div className="max-h-[190px] overflow-y-auto pr-2 custom-scrollbar">
            {options.map((option: string, index: number) => (
              <div key={index} className="flex items-center gap-3 mb-3">
                {/* Option bullet */}
                <div
                  className="w-6 h-6 flex-shrink-0 flex items-center justify-center
                             rounded-full bg-[#EEF0FF] text-[#6C63FF]
                             text-xs font-semibold"
                >
                  {index + 1}
                </div>

                {/* Option Input */}
                <input
                  type="text"
                  value={option}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleOptionChange(index, e.target.value)
                  }
                  placeholder="Rahul Bajaj"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100
                             border border-transparent focus:border-[#6C63FF]
                             focus:ring-2 focus:ring-[#6C63FF]/30 outline-none"
                />

                {/* Correct Toggle (UI only) */}
                <div className="flex items-center text-xs text-gray-600 flex-shrink-0">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name={`correct`}
                      checked={correctIndex === index}
                      onChange={() => setCorrectIndex(index)}
                      className="accent-[#4D0ACD]"
                    />
                    Correct
                  </label>
                </div>

                {/* Remove */}
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(index)}
                    className="text-gray-400 hover:text-red-500 flex-shrink-0"
                    type="button"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {options.length < 6 && (
            <button
              onClick={addOption}
              className="text-[#6C63FF] text-sm font-medium mt-2 border rounded-md p-2"
              type="button"
            >
              + Add More option
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full mx-auto border-t border-gray-200 flex justify-end p-2 relative z-50">
        <button
          onClick={createPoll}
          disabled={isDisabled}
          className={`px-6 py-2.5 rounded-full relative z-50 pointer-events-auto
            text-sm font-medium transition
            ${
              isDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed mt-2"
                : "bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-white cursor-pointer"
            }`}
          type="button"
        >
          Ask Question
        </button>
      </div>
    </>
  );
};

export default CreatePollForm;
