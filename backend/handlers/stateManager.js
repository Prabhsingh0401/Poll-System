import Poll from "../models/Poll.js";

/**
 * State Manager - Manages application state (polls, responses, history)
 * Keeps state separate from socket handlers
 */

class StateManager {
  constructor() {
    this.activePoll = null;
    this.studentResponses = {};
    this.pollHistory = [];
  }

  /**
   * Set the active poll
   * @param {Object} poll - Poll object
   */
  setActivePoll(poll) {
    this.activePoll = poll;
  }

  /**
   * Get the active poll
   * @returns {Object|null}
   */
  getActivePoll() {
    return this.activePoll;
  }

  /**
   * Reset student responses (for new question)
   */
  resetStudentResponses() {
    this.studentResponses = {};
  }

  /**
   * Get student responses
   * @returns {Object}
   */
  getStudentResponses() {
    return this.studentResponses;
  }

  /**
   * Add poll to history
   * @param {Object} poll - Poll to add
   */
  addToPollHistory(poll) {
    if (poll && poll.question) {
      this.pollHistory.push({
        question: poll.question,
        options: poll.options,
        responses: { ...poll.responses },
        correctAnswer: poll.correctAnswer ?? null,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get poll history
   * @returns {Array}
   */
  getPollHistory() {
    return this.pollHistory;
  }

  /**
   * Load poll history from database
   * @returns {Promise<Array>}
   */
  async loadPollHistory() {
    try {
      const dbPolls = await Poll.getAll();

      // Combine database polls with in-memory history
      const allPolls = [...this.pollHistory, ...dbPolls];

      // Remove duplicates
      const uniquePolls = allPolls.reduce((acc, poll) => {
        const exists = acc.find(
          (p) => p.question === poll.question && p.timestamp === poll.timestamp,
        );
        if (!exists) acc.push(poll);
        return acc;
      }, []);

      return uniquePolls;
    } catch (error) {
      console.error("Error loading poll history from DB:", error);
      // Fallback to in-memory history
      return this.pollHistory;
    }
  }

  /**
   * End the current poll session
   */
  endPollSession() {
    this.activePoll = null;
    this.studentResponses = {};
    this.pollHistory = [];
  }

  /**
   * Clear all state (for testing/reset)
   */
  clear() {
    this.activePoll = null;
    this.studentResponses = {};
    this.pollHistory = [];
  }
}

export default StateManager;
