import React from "react";

interface ErrorStateProps {
  type: "kicked" | "disconnected";
}

const ErrorState: React.FC<ErrorStateProps> = ({ type }) => {
  const isKicked = type === "kicked";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      {/* Badge */}
      <div
        className="flex items-center gap-2 px-4 py-1.5 mb-6
                   bg-gradient-to-r from-[#7565D9] to-[#4D0ACD]
                   text-white rounded-full text-xs font-medium"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M12 2l1.9 5.1L19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 2z" />
        </svg>
        Intervue Poll
      </div>

      <h1 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
        {isKicked ? "You’ve been kicked out !" : "Connection lost"}
      </h1>

      <p className="text-center text-gray-500 max-w-md leading-relaxed">
        {isKicked
          ? "Looks like the teacher had removed you from the poll system. Please try again sometime."
          : "You have been disconnected from the server. Please try reconnecting."}
      </p>

      {!isKicked && (
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2.5 rounded-full
                     bg-gradient-to-r from-[#7565D9] to-[#4D0ACD]
                     text-white text-sm font-medium"
        >
          Reconnect
        </button>
      )}
    </div>
  );
};

export default ErrorState;
