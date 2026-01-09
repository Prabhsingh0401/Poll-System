import PollService from "../services/pollService.js";

/**
 * Poll Socket Handler - Manages poll-specific socket events
 * Contains all socket listeners for poll operations
 */

class PollSocketHandler {
  constructor(io, socketHandler, stateManager) {
    this.io = io;
    this.socketHandler = socketHandler;
    this.stateManager = stateManager;
  }

  /**
   * Register all poll socket listeners on a socket
   * @param {Socket} socket - Socket.io socket instance
   */
  registerListeners(socket) {
    socket.on("createPoll", (data) => this.handleCreatePoll(socket, data));
    socket.on("submitAnswer", (data) => this.handleSubmitAnswer(socket, data));
    socket.on("nextQuestion", (data) => this.handleNextQuestion(socket, data));
    socket.on("endPoll", () => this.handleEndPoll(socket));
    socket.on("preparingNextQuestion", () =>
      this.handlePreparingNextQuestion(socket),
    );
    socket.on("requestPollHistory", () =>
      this.handleRequestPollHistory(socket),
    );
    socket.on("requestStudentList", () =>
      this.handleRequestStudentList(socket),
    );
    socket.on("kickStudent", (studentId) =>
      this.handleKickStudent(socket, studentId),
    );
    socket.on("forceBroadcast", () => this.handleForceBroadcast(socket));
  }

  /**
   * Handle create poll event
   */
  async handleCreatePoll(socket, data) {
    if (this.stateManager.getActivePoll()) {
      socket.emit("error", { message: "A poll is already active" });
      return;
    }

    console.log(`Teacher ${socket.id} created poll:`, data);

    const activePoll = PollService.createActivePoll(data);
    this.stateManager.setActivePoll(activePoll);
    this.stateManager.resetStudentResponses();

    const formattedPoll = PollService.formatPollForEmission(activePoll);
    this.io.emit("pollCreated", formattedPoll);

    // Load historical polls in background
    try {
      const history = await this.stateManager.loadPollHistory();
      this.io.emit("pollHistory", history);
    } catch (error) {
      console.error("Error loading poll history:", error);
    }
  }

  /**
   * Handle submit answer event
   */
  handleSubmitAnswer(socket, data) {
    const activePoll = this.stateManager.getActivePoll();
    const studentResponses = this.stateManager.getStudentResponses();

    if (!activePoll) {
      socket.emit("error", { message: "No active poll" });
      return;
    }

    const result = PollService.recordAnswer({
      studentId: data.studentId,
      answer: data.answer,
      studentResponses,
      activePoll,
    });

    if (!result.success) {
      socket.emit("error", { message: result.message });
      return;
    }

    console.log(`Student ${data.studentId} submitted answer: ${data.answer}`);
    this.io.emit("pollUpdated", activePoll);
    this.emitStats();
  }

  /**
   * Handle next question event
   */
  async handleNextQuestion(socket, data) {
    const activePoll = this.stateManager.getActivePoll();

    if (!activePoll) {
      socket.emit("error", { message: "No active poll session" });
      return;
    }

    console.log(`Teacher ${socket.id} asked next question:`, data);

    // Save current poll to database
    try {
      await PollService.savePollToDatabase(activePoll);
      this.stateManager.addToPollHistory(activePoll);
    } catch (error) {
      console.error("Failed to save poll:", error);
    }

    // Create new poll
    const newPoll = PollService.createActivePoll(data);
    this.stateManager.setActivePoll(newPoll);
    this.stateManager.resetStudentResponses();

    const formattedPoll = PollService.formatPollForEmission(newPoll);
    this.io.emit("pollCreated", formattedPoll);
    this.io.emit("pollHistoryUpdated", this.stateManager.getPollHistory());

    console.log(
      `Next question broadcasted to ${this.io.engine.clientsCount} clients`,
    );
  }

  /**
   * Handle end poll event
   */
  async handleEndPoll(socket) {
    const activePoll = this.stateManager.getActivePoll();

    if (!activePoll) {
      socket.emit("error", { message: "No active poll to end" });
      return;
    }

    console.log(`Teacher ${socket.id} ended poll`);

    // Save final poll to database
    try {
      await PollService.finalizePoll(activePoll);
      this.stateManager.addToPollHistory(activePoll);
    } catch (error) {
      console.error("Failed to finalize poll:", error);
    }

    this.io.emit("pollResults", activePoll);
    this.stateManager.endPollSession();
    this.emitStats();
  }

  /**
   * Handle preparing next question event
   */
  handlePreparingNextQuestion(socket) {
    const activePoll = this.stateManager.getActivePoll();

    if (activePoll) {
      console.log("Teacher is preparing next question");
      this.io.emit("preparingNextQuestion");
    }
  }

  /**
   * Handle request poll history event
   */
  async handleRequestPollHistory(socket) {
    console.log(`Teacher ${socket.id} requested poll history`);

    try {
      const history = await this.stateManager.loadPollHistory();
      socket.emit("pollHistory", history);
    } catch (error) {
      console.error("Error fetching poll history:", error);
      socket.emit("pollHistory", this.stateManager.getPollHistory());
    }
  }

  /**
   * Handle request student list event
   */
  handleRequestStudentList(socket) {
    console.log(`Teacher ${socket.id} requested student list`);
    const students = this.socketHandler.getConnectedStudents();
    socket.emit("studentList", students);
  }

  /**
   * Handle kick student event
   */
  handleKickStudent(socket, studentId) {
    if (!this.socketHandler.isTeacher(socket.id)) {
      socket.emit("error", { message: "Only teachers can kick students" });
      return;
    }

    console.log(`Teacher kicked student: ${studentId}`);

    const studentSocketId = this.socketHandler.kickStudent(studentId);

    if (studentSocketId) {
      this.io.to(studentSocketId).emit("kicked");
      this.broadcastStudentList();
    }
  }

  /**
   * Handle force broadcast event
   */
  handleForceBroadcast(socket) {
    if (!this.socketHandler.isTeacher(socket.id)) {
      return;
    }

    console.log("Teacher forced broadcast of current poll");
    const activePoll = this.stateManager.getActivePoll();

    if (activePoll) {
      const formattedPoll = PollService.formatPollForEmission(activePoll);
      this.io.emit("pollCreated", formattedPoll);
    }
  }

  /**
   * Broadcast current poll to new connection
   */
  broadcastCurrentPoll(socket) {
    const activePoll = this.stateManager.getActivePoll();

    if (activePoll) {
      console.log(`Sending active poll to new client ${socket.id}`);
      const formattedPoll = PollService.formatPollForEmission(activePoll);
      socket.emit("pollCreated", formattedPoll);
    }
  }

  /**
   * Broadcast student list to all teachers
   */
  broadcastStudentList() {
    const students = this.socketHandler.getConnectedStudents();
    const teacherSockets = Object.keys(this.socketHandler.userRoles).filter(
      (id) => this.socketHandler.isTeacher(id),
    );

    teacherSockets.forEach((id) => {
      this.io.to(id).emit("studentList", students);
    });
  }

  /**
   * Emit statistics to all clients
   */
  emitStats() {
    const activePoll = this.stateManager.getActivePoll();
    const responseCount = activePoll
      ? Object.keys(activePoll.responses).length
      : 0;
    const stats = this.socketHandler.getStats(responseCount);
    this.io.emit("stats", stats);
  }
}

export default PollSocketHandler;
