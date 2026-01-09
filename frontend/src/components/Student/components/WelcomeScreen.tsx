import React from "react";

/* -------------------- Types -------------------- */

interface WelcomeScreenProps {
  nameInput: string;
  setNameInput: React.Dispatch<React.SetStateAction<string>>;
  handleJoin: () => void;
}

/* -------------------- Component -------------------- */

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  nameInput,
  setNameInput,
  handleJoin,
}) => {
  return (
    <div className="w-full max-w-2xl flex flex-col justify-center items-center rounded-2xl p-12">
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

      <h2 className="text-4xl font-bold text-gray-900 text-center mb-3">
        Let's Get Started
      </h2>

      <p className="text-center text-gray-600 mb-8 leading-relaxed">
        If you are a student, you'll be able to{" "}
        <span className="font-semibold text-gray-800">submit your answers</span>
        , participate in live polls, and see how your responses compare with
        your classmates
      </p>

      <div className="flex flex-col items-center w-full max-w-md">
        <label className="w-full text-left text-sm font-medium text-gray-700 mb-2">
          Enter your Name
        </label>

        <input
          type="text"
          placeholder="Rahul Rajdy"
          value={nameInput}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNameInput(e.target.value)
          }
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") handleJoin();
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500
                     focus:border-transparent bg-white text-gray-900
                     placeholder-gray-400"
        />

        <button
          onClick={handleJoin}
          disabled={!nameInput.trim()}
          type="button"
          className={`mt-6 px-10 py-3 rounded-full font-medium transition ${
            !nameInput.trim()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
