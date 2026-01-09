import React from "react";

const DisconnectedState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">
        <div className="text-red-600 text-xl font-bold text-center mb-4">
          ⚠️ Connection Lost
        </div>
        <p className="text-gray-700 text-center mb-6">
          Disconnected from server. Please reconnect to continue.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-md hover:shadow-lg"
        >
          Reconnect
        </button>
      </div>
    </div>
  );
};

export default DisconnectedState;
