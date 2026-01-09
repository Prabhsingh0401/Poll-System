import React, { useState } from "react";

/* -------------------- Types -------------------- */

interface Poll {
  question: string;
  options: string[];
  responses?: Record<string, number>;
}

type ConnectionStatus = "connecting" | "connected" | "disconnected";

interface LivePollDashboardProps {
  poll: Poll;
  remainingTime: number | null;
  allStudentsAnswered: boolean;
  endPoll: () => void;
  forceBroadcast: () => void;
  createNewPoll: () => void;
  askNextQuestion: () => void;
  viewPollHistory: () => void;
  connectedStudents: string[];
  getStudentList: () => void;
  kickStudent: (studentId: string) => void;
  connectionStatus: ConnectionStatus;
}

/* -------------------- Component -------------------- */

const LivePollDashboard: React.FC<LivePollDashboardProps> = ({
  poll,
  remainingTime,
  allStudentsAnswered,
  endPoll,
  askNextQuestion,
  viewPollHistory,
  connectedStudents,
  getStudentList,
  kickStudent,
}) => {
  const [showStudents, setShowStudents] = useState<boolean>(false);

  const totalVotes: number = poll.responses
    ? Object.values(poll.responses).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="min-h-screen relative">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-4">
          {remainingTime !== null && (
            <div
              className={`text-xl font-bold ${
                remainingTime < 10 ? "text-red-500" : "text-[#4D0ACD]"
              }`}
            >
              00:{remainingTime < 10 ? `0${remainingTime}` : remainingTime}
            </div>
          )}

          <button
            onClick={() => {
              setShowStudents(!showStudents);
              getStudentList();
            }}
            className="px-4 py-2 rounded-full bg-white text-sm
                       border border-gray-200 shadow-sm hover:bg-gray-50"
          >
            Students ({connectedStudents.length})
          </button>
        </div>

        <button
          onClick={viewPollHistory}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-[#7565D9] to-[#4D0ACD]
                     text-white text-sm font-medium shadow-md hover:shadow-lg transition-shadow flex items-center gap-2"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          View Poll History
        </button>
      </div>

      {/* Center Content */}
      <div className="max-w-xl mx-auto mt-8 px-4">
        {/* Question */}
        <div className="text-xs font-medium mb-2">Question</div>

        <div className="border border-gray-200 rounded-xl pb-3">
          <div className="px-3 py-4 rounded-t-xl bg-black/80 text-lg font-semibold text-white">
            {poll.question}
          </div>

          {/* Options */}
          <div className="px-2 space-y-3 mt-2">
            {poll.options?.map((option: string, index: number) => {
              const votes: number = poll.responses?.[option] ?? 0;
              const percentage: number =
                totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

              return (
                <div key={index} className="relative">
                  {/* Progress */}
                  <div className="absolute inset-0 rounded-lg overflow-hidden bg-gray-100">
                    <div
                      className="h-full bg-purple-200 transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {/* Content */}
                  <div
                    className="relative flex items-center gap-3
                               p-2 border border-gray-200
                               bg-transparent rounded-lg"
                  >
                    <div
                      className="w-7 h-7 rounded-full bg-white
                                 border border-gray-200
                                 flex items-center justify-center
                                 text-sm font-bold text-[#6C63FF]"
                    >
                      {index + 1}
                    </div>

                    <div className="flex-1 text-sm font-medium text-gray-900">
                      {option}
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-[#4D0ACD]">
                        {percentage}%
                      </div>
                      <div className="text-xs text-gray-500">{votes} votes</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex justify-center">
          {remainingTime === 0 ? (
            <div className="flex gap-3">
              <button
                onClick={askNextQuestion}
                className="px-8 py-3 rounded-full
                           bg-[#4D0ACD] text-white
                           text-sm font-medium shadow-md hover:bg-[#3d08a5]"
              >
                + Ask Next Question
              </button>
              <button
                onClick={endPoll}
                className="px-8 py-3 rounded-full
                           bg-red-100 text-red-600
                           text-sm font-medium hover:bg-red-200"
              >
                End Poll
              </button>
            </div>
          ) : allStudentsAnswered ? (
            <button
              onClick={askNextQuestion}
              className="px-8 py-3 rounded-full
                         bg-[#4D0ACD] text-white
                         text-sm font-medium shadow-md hover:bg-[#3d08a5]"
            >
              + Ask a new question
            </button>
          ) : (
            <button
              onClick={endPoll}
              className="px-8 py-3 rounded-full
                         bg-red-100 text-red-600
                         text-sm font-medium hover:bg-red-200"
            >
              Stop Poll
            </button>
          )}
        </div>
      </div>

      {/* Students Drawer */}
      {showStudents && (
        <div className="absolute top-0 right-0 h-[50vh] border border-gray-200 rounded-lg w-72 bg-white z-50">
          <div className="px-4 py-3 border-b border-gray-200 font-semibold text-gray-700">
            Connected Students
          </div>
          <div className="p-3 space-y-1 overflow-y-auto">
            {connectedStudents.length > 0 ? (
              connectedStudents.map((student: string, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center
                             px-3 py-2 rounded-md hover:bg-gray-50"
                >
                  <span className="text-sm text-gray-700">{student}</span>
                  <button
                    onClick={() => kickStudent(student)}
                    className="text-xs text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-400 text-center py-6">
                No students connected
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LivePollDashboard;
