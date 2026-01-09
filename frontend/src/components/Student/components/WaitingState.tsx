import React from "react";

/* -------------------- Types -------------------- */

type ConnectionStatus = "connecting" | "connected" | "disconnected";

interface WaitingStateProps {
  name: string;
  connectionStatus: ConnectionStatus;
  onLogout: () => void;
}

/* -------------------- Component -------------------- */

const WaitingState: React.FC<WaitingStateProps> = () => {
  return (
    <div className="min-h-screen relative bg-white flex flex-col">
      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center py-8 px-4">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div
            className="flex items-center gap-2 px-4 py-1.5 mb-6
                       bg-gradient-to-r from-[#7565D9] to-[#4D0ACD]
                       text-white rounded-full text-sm font-medium"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M12 2l1.9 5.1L19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 2z" />
            </svg>
            <span>Intervue Poll</span>
          </div>

          {/* Loader */}
          <div className="mb-6">
            <div
              className="w-14 h-14 border-4 border-[#E4E0FB] border-t-[#6C63FF]
                         rounded-full animate-spin"
            />
          </div>

          {/* Text */}
          <h2 className="text-lg font-semibold text-gray-900">
            Wait for the teacher to ask questions..
          </h2>
        </div>
      </div>
    </div>
  );
};

export default WaitingState;
