import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPoll, resetPoll } from "../../redux/pollSlice";
import type { PollState } from "../../redux/pollSlice";
import { socket } from "../../services/socket";
import { usePollTimer } from "../../hooks/usePollTimer";
import { useSocket } from "../../hooks/useSocket";

import WelcomeScreen from "./components/WelcomeScreen";
import WaitingState from "./components/WaitingState";
import ActivePoll from "./components/ActivePoll.tsx";
import ResultsView from "./components/Result.tsx";
import ErrorState from "./components/ErrorState";
import WaitingForNextQuestion from "./components/WaitingForNextQuestion.tsx";
import FinalResults from "./components/FinalResults.tsx";

/* -------------------- Types -------------------- */

interface RootState {
  poll: PollState;
}

type ConnectionStatus = "connecting" | "connected" | "disconnected";

type StudentAnswers = Record<number, string>;

interface PollHistoryItem extends PollState {
  pollStartTime?: number;
  serverTime?: number;
}

/* -------------------- Constants -------------------- */

const getPersistentTabId = (): string => {
  try {
    let id = localStorage.getItem("studentTabId");
    if (!id) {
      id = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("studentTabId", id);
    }
    return id;
  } catch (err) {
    return Math.random().toString(36).substring(2, 15);
  }
};

const TAB_ID: string = getPersistentTabId();

/* -------------------- Component -------------------- */

const Student: React.FC = () => {
  const dispatch = useDispatch();
  const poll = useSelector((state: RootState) => state.poll);

  const [name, setName] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [kicked, setKicked] = useState<boolean>(false);
  const [waitingForNextQuestion, setWaitingForNextQuestion] =
    useState<boolean>(false);
  const [pollHistory, setPollHistory] = useState<PollHistoryItem[]>([]);
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswers>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [pollEnded, setPollEnded] = useState<boolean>(false);

  const { remainingTime, setRemainingTime, resetTimer, clearTimer } =
    usePollTimer(null);

  /* -------------------- Session Restore -------------------- */

  useEffect(() => {
    try {
      const savedSessionData = localStorage.getItem("studentSessionData");
      if (savedSessionData) {
        const sessionData: {
          name: string;
          tabId: string;
        } = JSON.parse(savedSessionData);

        if (sessionData.tabId === TAB_ID && sessionData.name) {
          setName(sessionData.name);
        }
      }

      const savedPollData = localStorage.getItem("studentPollData");
      if (savedPollData) {
        const pollData: {
          poll: PollState;
          submitted: boolean;
          selectedOption: string;
          remainingTime: number | null;
          waitingForNextQuestion: boolean;
          pollEnded: boolean;
          pollHistory: PollHistoryItem[];
          studentAnswers: StudentAnswers;
          currentQuestionIndex?: number;
        } = JSON.parse(savedPollData);

        dispatch(setPoll(pollData.poll));
        setSubmitted(pollData.submitted);
        setSelectedOption(pollData.selectedOption);
        setRemainingTime(pollData.remainingTime);
        setWaitingForNextQuestion(pollData.waitingForNextQuestion);
        setPollEnded(pollData.pollEnded);
        setPollHistory(pollData.pollHistory ?? []);
        setStudentAnswers(pollData.studentAnswers ?? {});
        setCurrentQuestionIndex(
          typeof pollData.currentQuestionIndex === "number"
            ? pollData.currentQuestionIndex
            : pollData.pollHistory
              ? pollData.pollHistory.length
              : 0,
        );
      }
    } catch (error) {
      console.error("Error loading saved session:", error);
    }
  }, [dispatch, setRemainingTime]);

  /* -------------------- Socket Callbacks -------------------- */

  const onConnect = useCallback((): void => {
    setConnectionStatus("connected");
    if (name) {
      socket.emit("join", { role: "student", name });
    }
  }, [name]);

  const onDisconnect = useCallback((): void => {
    setConnectionStatus("disconnected");
  }, []);

  const onPollCreated = useCallback(
    (newPoll: PollHistoryItem): void => {
      if (newPoll?.question) {
        dispatch(setPoll({ ...newPoll, options: newPoll.options ?? [] }));
        setSubmitted(false);
        setSelectedOption("");
        setWaitingForNextQuestion(false);
        setPollEnded(false);

        // Update pollHistory and set currentQuestionIndex to the index where this poll will be added
        setPollHistory((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.question === newPoll.question) return prev;
          // Poll will be added at index prev.length
          setCurrentQuestionIndex(prev.length);
          return [...prev, newPoll];
        });

        if (newPoll.pollStartTime && newPoll.serverTime && newPoll.duration) {
          resetTimer(newPoll.duration);
        } else if (newPoll.duration !== undefined) {
          resetTimer(newPoll.duration);
        }
      }
    },
    [dispatch, resetTimer],
  );

  // Restore currentQuestionIndex on page load if not already set
  useEffect(() => {
    if (
      pollHistory.length > 0 &&
      currentQuestionIndex === 0 &&
      pollHistory[0].question
    ) {
      // This might be a fresh page load, currentQuestionIndex should match pollHistory length
      // But only if we haven't already set it (to avoid overwriting the callback's setting)
      return;
    }
  }, []);

  const onPollUpdated = useCallback(
    (updatedPoll: PollState): void => {
      dispatch(setPoll(updatedPoll));
    },
    [dispatch],
  );

  const onPollResults = useCallback(
    (finalPoll: PollState): void => {
      dispatch(setPoll(finalPoll));
      clearTimer();
      setPollEnded(true);
    },
    [dispatch, clearTimer],
  );

  const onPollTimeUpdate = useCallback(
    (timeRemaining: number): void => {
      setRemainingTime(timeRemaining);
    },
    [setRemainingTime],
  );

  const onPreparingNextQuestion = useCallback((): void => {
    setWaitingForNextQuestion(true);
  }, []);

  const onPollHistory = useCallback((history: PollHistoryItem[]): void => {
    setPollHistory(history);
  }, []);

  const onPollHistoryUpdated = useCallback(
    (history: PollHistoryItem[]): void => {
      setPollHistory(history);
    },
    [],
  );

  const onKicked = useCallback((): void => {
    setKicked(true);
    socket.disconnect();
    localStorage.removeItem("studentSessionData");
  }, []);

  const onError = useCallback((error: { message: string }): void => {
    alert(error.message);
  }, []);

  const onNoActivePoll = useCallback((): void => {
    dispatch(resetPoll());
    setSubmitted(false);
    setSelectedOption("");
    setWaitingForNextQuestion(false);
    clearTimer();
  }, [dispatch, clearTimer]);

  /* -------------------- Socket Bindings -------------------- */

  useSocket("connect", onConnect, [name]);
  useSocket("disconnect", onDisconnect);
  useSocket("noActivePoll", onNoActivePoll, [dispatch, clearTimer]);
  useSocket("pollCreated", onPollCreated, [dispatch, resetTimer]);
  useSocket("pollUpdated", onPollUpdated, [dispatch]);
  useSocket("pollResults", onPollResults, [dispatch, clearTimer]);
  useSocket("pollTimeUpdate", onPollTimeUpdate, [setRemainingTime]);
  useSocket("preparingNextQuestion", onPreparingNextQuestion);
  useSocket("pollHistory", onPollHistory);
  useSocket("pollHistoryUpdated", onPollHistoryUpdated);
  useSocket("kicked", onKicked);
  useSocket("error", onError);

  useEffect(() => {
    try {
      if (socket && !socket.connected) {
        socket.connect();
      }
    } catch (err) {
      console.error("Error connecting socket:", err);
    }
  }, []);

  /* -------------------- Persist Poll State -------------------- */

  useEffect(() => {
    try {
      const pollData = {
        poll,
        submitted,
        selectedOption,
        remainingTime,
        waitingForNextQuestion,
        pollEnded,
        pollHistory,
        studentAnswers,
        currentQuestionIndex,
      };
      localStorage.setItem("studentPollData", JSON.stringify(pollData));
    } catch (error) {
      console.error("Error saving poll data:", error);
    }
  }, [
    poll,
    submitted,
    selectedOption,
    remainingTime,
    waitingForNextQuestion,
    pollEnded,
    pollHistory,
    studentAnswers,
    currentQuestionIndex,
  ]);

  /* -------------------- Handlers -------------------- */

  const handleJoin = (): void => {
    if (!nameInput.trim()) return;

    const studentName = nameInput.trim();
    setName(studentName);

    localStorage.setItem(
      "studentSessionData",
      JSON.stringify({
        name: studentName,
        tabId: TAB_ID,
        timestamp: Date.now(),
      }),
    );

    socket.emit("join", { role: "student", name: studentName });
  };

  const submitAnswer = (): void => {
    if (!selectedOption || !name) return;

    setStudentAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: selectedOption,
    }));

    socket.emit("submitAnswer", {
      studentId: name,
      answer: selectedOption,
    });

    setSubmitted(true);
  };

  const handleLogout = (): void => {
    localStorage.removeItem("studentSessionData");
    localStorage.removeItem("studentPollData");
    setName("");
    setNameInput("");
    setSelectedOption("");
    setSubmitted(false);
  };

  /* -------------------- UI -------------------- */

  if (kicked) return <ErrorState type="kicked" />;
  if (connectionStatus === "disconnected")
    return <ErrorState type="disconnected" />;

  return (
    <div className="flex flex-col min-h-screen p-4">
      {!name ? (
        <div className="flex-1 flex items-center justify-center">
          <WelcomeScreen
            nameInput={nameInput}
            setNameInput={setNameInput}
            handleJoin={handleJoin}
          />
        </div>
      ) : pollEnded ? (
        <FinalResults
          pollHistory={pollHistory}
          studentAnswers={studentAnswers}
          name={name}
          connectionStatus={connectionStatus}
          onLogout={handleLogout}
        />
      ) : !poll.question ? (
        <WaitingState
          name={name}
          connectionStatus={connectionStatus}
          onLogout={handleLogout}
        />
      ) : waitingForNextQuestion ? (
        <WaitingForNextQuestion
          previousQuestion={poll.question}
          selectedAnswer={selectedOption}
          name={name}
          connectionStatus={connectionStatus}
          onLogout={handleLogout}
        />
      ) : submitted ? (
        <ResultsView
          poll={poll}
          selectedOption={selectedOption}
          name={name}
          connectionStatus={connectionStatus}
          onLogout={handleLogout}
        />
      ) : (
        <ActivePoll
          poll={poll}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          submitAnswer={submitAnswer}
          remainingTime={remainingTime}
          name={name}
          connectionStatus={connectionStatus}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default Student;
