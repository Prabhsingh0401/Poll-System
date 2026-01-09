import React from "react";

/* -------------------- Types -------------------- */

type ConnectionStatus = "connecting" | "connected" | "disconnected";

interface WaitingForNextQuestionProps {
  previousQuestion: string;
  selectedAnswer: string;
  name: string;
  connectionStatus: ConnectionStatus;
  onLogout: () => void;
}

/* -------------------- Component -------------------- */

const WaitingForNextQuestion: React.FC<WaitingForNextQuestionProps> = ({
  previousQuestion,
  selectedAnswer,
  name,
  onLogout,
}) => {
  return (
    <div className="min-h-screen relative bg-white flex flex-col">
      {/* Top Bar */}
      <div className="flex justify-end items-center px-6 py-4 flex-shrink-0">
        <button
          onClick={onLogout}
          type="button"
          className="px-4 py-2 rounded-full bg-white text-sm font-medium
                     border border-gray-200 shadow-sm
                     hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          Logout ({name})
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center py-8">
        <div className="max-w-xl mx-auto w-full px-4 text-center">
          {/* Spinner */}
          <div className="mb-8">
            <div
              className="w-14 h-14 border-4 border-[#E4E0FB]
                         border-t-[#4D0ACD] rounded-full
                         animate-spin mx-auto"
            />
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Preparing Next Question...
          </h2>
          <p className="text-sm text-gray-500 mb-12">
            Please wait while the teacher sets up the next poll.
          </p>

          {/* Previous Summary */}
          <div className="text-left">
            {previousQuestion && (
              <>
                <div className="text-xs font-medium mb-2 tracking-wide text-gray-400 uppercase">
                  Previous Poll Summary
                </div>

                <div className="border border-gray-100 rounded-xl bg-gray-50 overflow-hidden shadow-sm">
                  <div
                    className="px-4 py-3 bg-black/5 text-gray-700
                               font-medium border-b border-gray-200"
                  >
                    {previousQuestion}
                  </div>

                  <div className="px-4 py-3 text-sm text-gray-500">
                    You selected:{" "}
                    <span className="font-bold text-[#4D0ACD]">
                      {selectedAnswer || "No answer"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingForNextQuestion;
