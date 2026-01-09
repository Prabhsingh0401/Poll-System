import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import Teacher from "./components/Teacher/Teacher";
import Student from "./components/Student/Student";

type Role = "student" | "teacher" | null;

const Home = () => {
  const [role, setRole] = useState<Role>(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (role === "student") navigate("/student");
    if (role === "teacher") navigate("/teacher");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F7F8FC]">
      <div className="flex flex-col items-center">
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

        {/* Heading */}
        <h1 className="text-4xl font-semibold text-gray-900 text-center mb-2">
          Welcome to the{" "}
          <span className="text-[#6C63FF]">Live Polling System</span>
        </h1>

        {/* Subtext */}
        <p className="text-center text-gray-500 mb-10 max-w-xl">
          Please select the role that best describes you to begin using the live
          polling system
        </p>

        {/* Role Cards */}
        <div className="flex gap-6 mb-10">
          {/* Student */}
          <div
            onClick={() => setRole("student")}
            className={`w-80 p-6 rounded-xl border cursor-pointer transition
              ${
                role === "student"
                  ? "border-[#6C63FF] shadow-md"
                  : "border-gray-200 hover:shadow-md"
              }
              bg-white`}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              I’m a Student
            </h3>
            <p className="text-sm text-gray-500">
              Join live polls and participate in real-time.
            </p>
          </div>

          {/* Teacher */}
          <div
            onClick={() => setRole("teacher")}
            className={`w-80 p-6 rounded-xl border cursor-pointer transition
              ${
                role === "teacher"
                  ? "border-[#6C63FF] shadow-md"
                  : "border-gray-200 hover:shadow-md"
              }
              bg-white`}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              I’m a Teacher
            </h3>
            <p className="text-sm text-gray-500">
              Submit answers and view live poll results.
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!role}
          className={`px-10 py-3 rounded-full font-medium transition
            ${
              role
                ? "bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="/student" element={<Student />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
