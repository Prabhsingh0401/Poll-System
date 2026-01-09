import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPoll } from "../../redux/pollSlice";
import { socket } from "../../services/socket";
import { usePollTimer } from "../../hooks/usePollTimer";
import { useSocket } from "../../hooks/useSocket";

import CreatePollForm from "./components/CreatePollForm";
import LivePollDashboard from "./components/LivePollDashboard";
import DisconnectedState from "./components/DisconnectedState";
import PollHistory from "./components/PollHistory";

/* -------------------- Types -------------------- */

interface Poll {
  question: string;
  options: string[];
  type: "mcq";
  duration?: number;
  responses?: Record<string, number>;
}

interface RootState {
  poll: Poll;
}

type ConnectionStatus = "connecting" | "connected" | "disconnected";

/* -------------------- Component -------------------- */

const Teacher: React.FC = () => {
  const dispatch = useDispatch();
  const poll = useSelector((state: RootState) => state.poll);

  const [question, setQuestion] = useState<string>("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [pollActive, setPollActive] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [pollDuration, setPollDuration] = useState<number>(30);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [connectedStudents, setConnectedStudents] = useState<string[]>([]);
  const [allStudentsAnswered, setAllStudentsAnswered] =
    useState<boolean>(false);
  const [showNextQuestionForm, setShowNextQuestionForm] =
    useState<boolean>(false);
  const [pollHistory, setPollHistory] = useState<Poll[]>([]);
  const [showPollHistory, setShowPollHistory] = useState<boolean>(false);

  const { remainingTime, setRemainingTime, resetTimer, clearTimer } =
    usePollTimer(null);

  useEffect(() => {
    try {
      const savedTeacherData = localStorage.getItem("teacherPollData");
      if (savedTeacherData) {
        const teacherData: {
          pollActive: boolean;
          question: string;
          options: string[];
          pollDuration: number;
        } = JSON.parse(savedTeacherData);

        if (teacherData.pollActive) {
          setPollActive(teacherData.pollActive);
          setQuestion(teacherData.question);
          setOptions(teacherData.options);
          setPollDuration(teacherData.pollDuration);
        }
      }
    } catch (error) {
      console.error("Error loading teacher data:", error);
    }
  }, []);

  useEffect(() => {
    try {
      const teacherData = {
        pollActive,
        question,
        options,
        pollDuration,
      };
      localStorage.setItem("teacherPollData", JSON.stringify(teacherData));
    } catch (error) {
      console.error("Error saving teacher data:", error);
    }
  }, [pollActive, question, options, pollDuration]);

  /* -------------------- Socket Callbacks -------------------- */

  const onConnect = useCallback((): void => {
    setConnectionStatus("connected");
    socket.emit("join", { role: "teacher" });
    socket.emit("requestStudentList");
    socket.emit("requestPollHistory");
  }, []);

  const onDisconnect = useCallback((): void => {
    setConnectionStatus("disconnected");
  }, []);

  const onPollCreated = useCallback(
    (newPoll: Poll): void => {
      dispatch(setPoll(newPoll));
      setPollActive(true);
      setAllStudentsAnswered(false);
      if (newPoll.duration !== undefined) {
        resetTimer(newPoll.duration);
      }
    },
    [dispatch, resetTimer],
  );

  const onPollUpdated = useCallback(
    (updatedPoll: Poll): void => {
      dispatch(setPoll(updatedPoll));
      if (updatedPoll.responses && connectedStudents.length > 0) {
        const answeredCount = Object.keys(updatedPoll.responses).length;

        if (answeredCount >= connectedStudents.length && answeredCount > 0) {
          setAllStudentsAnswered(true);
        }
      }
    },
    [dispatch, connectedStudents.length],
  );

  const onPollResults = useCallback(
    (finalPoll: Poll): void => {
      dispatch(setPoll(finalPoll));
      setPollActive(false);
      clearTimer();
      setQuestion("");
      setOptions(["", ""]);
    },
    [dispatch, clearTimer],
  );

  const onPollTimeUpdate = useCallback(
    (timeRemaining: number): void => {
      setRemainingTime(timeRemaining);
    },
    [setRemainingTime],
  );

  const onStudentList = useCallback((students: string[]): void => {
    setConnectedStudents(students);
  }, []);

  const onStudentJoined = useCallback((student: string): void => {
    setConnectedStudents((prev) => [...prev, student]);
  }, []);

  const onStudentLeft = useCallback((student: string): void => {
    setConnectedStudents((prev) => prev.filter((s) => s !== student));
  }, []);

  const onStudentKicked = useCallback((studentId: string): void => {
    setConnectedStudents((prev) => prev.filter((s) => s !== studentId));
  }, []);

  const onError = useCallback((error: { message: string }): void => {
    alert(error.message);
  }, []);

  const onPollHistoryReceived = useCallback((history: Poll[]): void => {
    setPollHistory(history);
  }, []);

  const onPollHistoryUpdated = useCallback((history: Poll[]): void => {
    setPollHistory(history);
  }, []);

  /* -------------------- Socket Bindings -------------------- */

  useSocket("connect", onConnect);
  useSocket("disconnect", onDisconnect);
  useSocket("pollCreated", onPollCreated);
  useSocket("pollUpdated", onPollUpdated);
  useSocket("pollResults", onPollResults);
  useSocket("pollTimeUpdate", onPollTimeUpdate);
  useSocket("studentList", onStudentList);
  useSocket("studentJoined", onStudentJoined);
  useSocket("studentLeft", onStudentLeft);
  useSocket("studentKicked", onStudentKicked);
  useSocket("error", onError);
  useSocket("pollHistory", onPollHistoryReceived);
  useSocket("pollHistoryUpdated", onPollHistoryUpdated);

  /* -------------------- Local Handlers -------------------- */

  const handleOptionChange = (index: number, value: string): void => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = (): void => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number): void => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const createPoll = (): void => {
    const validOptions = options.filter((opt) => opt.trim() !== "");

    if (question.trim() && validOptions.length >= 2) {
      const correctAnswer =
        correctIndex !== null && validOptions[correctIndex]
          ? validOptions[correctIndex]
          : undefined;

      socket.emit("createPoll", {
        question,
        options: validOptions,
        type: "mcq",
        duration: pollDuration,
        correctAnswer,
      });
    }
  };

  const endPoll = (): void => {
    socket.emit("endPoll");
  };

  const askNextQuestion = (): void => {
    const validOptions = options.filter((opt) => opt.trim() !== "");

    if (question.trim() && validOptions.length >= 2) {
      socket.emit("preparingNextQuestion");

      setTimeout(() => {
        const correctAnswer =
          correctIndex !== null && validOptions[correctIndex]
            ? validOptions[correctIndex]
            : undefined;

        socket.emit("nextQuestion", {
          question,
          options: validOptions,
          type: "mcq",
          duration: pollDuration,
          correctAnswer,
        });

        setQuestion("");
        setOptions(["", ""]);
        setCorrectIndex(null);
        setShowNextQuestionForm(false);
      }, 300);
    }
  };

  const forceBroadcast = (): void => {
    socket.emit("forceBroadcast");
  };

  const createNewPoll = (): void => {
    socket.emit("endPoll");
    setQuestion("");
    setOptions(["", ""]);
    setPollActive(false);
    setAllStudentsAnswered(false);
    localStorage.removeItem("teacherPollData");
  };

  const kickStudent = (studentId: string): void => {
    if (
      window.confirm(
        `Are you sure you want to remove ${studentId} from the classroom?`,
      )
    ) {
      socket.emit("kickStudent", studentId);
    }
  };

  const getStudentList = (): void => {
    socket.emit("requestStudentList");
  };

  const viewPollHistory = (): void => {
    socket.emit("requestPollHistory");
    setShowPollHistory(true);
  };

  /* -------------------- UI -------------------- */

  if (connectionStatus === "disconnected") {
    return <DisconnectedState />;
  }

  if (showPollHistory) {
    return (
      <PollHistory
        history={pollHistory}
        onClose={() => setShowPollHistory(false)}
      />
    );
  }

  return (
    <div className="min-h-screen p-4">
      {!pollActive ? (
        <CreatePollForm
          question={question}
          setQuestion={setQuestion}
          options={options}
          setOptions={setOptions}
          pollDuration={pollDuration}
          setPollDuration={setPollDuration}
          createPoll={createPoll}
          handleOptionChange={handleOptionChange}
          addOption={addOption}
          removeOption={removeOption}
          correctIndex={correctIndex}
          setCorrectIndex={setCorrectIndex}
        />
      ) : showNextQuestionForm ? (
        <CreatePollForm
          question={question}
          setQuestion={setQuestion}
          options={options}
          setOptions={setOptions}
          pollDuration={pollDuration}
          setPollDuration={setPollDuration}
          createPoll={askNextQuestion}
          handleOptionChange={handleOptionChange}
          addOption={addOption}
          removeOption={removeOption}
          correctIndex={correctIndex}
          setCorrectIndex={setCorrectIndex}
        />
      ) : (
        <LivePollDashboard
          poll={poll}
          remainingTime={remainingTime}
          allStudentsAnswered={allStudentsAnswered}
          endPoll={endPoll}
          forceBroadcast={forceBroadcast}
          createNewPoll={createNewPoll}
          askNextQuestion={() => setShowNextQuestionForm(true)}
          connectedStudents={connectedStudents}
          getStudentList={getStudentList}
          kickStudent={kickStudent}
          viewPollHistory={viewPollHistory}
          connectionStatus={connectionStatus}
        />
      )}
    </div>
  );
};

export default Teacher;
