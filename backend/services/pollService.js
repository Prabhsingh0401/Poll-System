import Poll from "../models/Poll.js";

class PollService {
  /**
   * Create and start a new poll
   * @param {Object} pollData - { question, options, duration }
   * @returns {Object} - Active poll object
   */
  static createActivePoll(pollData) {
    return {
      question: pollData.question,
      duration: Number(pollData.duration),
      options: pollData.options || [],
      correctAnswer: pollData.correctAnswer,
      responses: {},
      startTime: Date.now(),
    };
  }

  /**
   * Calculate remaining time for a poll
   * @param {Object} poll - Poll object with startTime and duration
   * @returns {number} - Remaining time in seconds
   */
  static calculateRemainingTime(poll) {
    if (!poll) return 0;
    const elapsed = (Date.now() - poll.startTime) / 1000;
    return Math.max(0, Math.ceil(poll.duration - elapsed));
  }

  /**
   * Save a completed poll to database
   * @param {Object} poll - Poll object to save
   * @returns {Promise<string>} - Saved poll ID
   */
  static async savePollToDatabase(poll) {
    if (!poll || !poll.question) {
      console.log("⚠️  No valid poll to save");
      return null;
    }

    try {
      const pollId = await Poll.create({
        question: poll.question,
        options: poll.options,
        responses: poll.responses,
        correctAnswer: poll.correctAnswer,
        isFinal: false,
      });
      console.log(`✅ Poll saved to DB with ID: ${pollId}`);
      return pollId;
    } catch (error) {
      console.error("❌ Failed to save poll to DB:", error);
      throw error;
    }
  }

  /**
   * Finalize and save a poll
   * @param {Object} poll - Poll object to finalize
   * @returns {Promise<string>} - Saved poll ID
   */
  static async finalizePoll(poll) {
    if (!poll || !poll.question) {
      console.log("⚠️  No valid poll to finalize");
      return null;
    }

    try {
      const pollId = await Poll.create({
        question: poll.question,
        options: poll.options,
        responses: poll.responses,
        correctAnswer: poll.correctAnswer,
        isFinal: true,
      });
      console.log(`✅ Final poll saved to DB with ID: ${pollId}`);
      return pollId;
    } catch (error) {
      console.error("❌ Failed to finalize poll:", error);
      throw error;
    }
  }

  /**
   * Get all polls from database
   * @returns {Promise<Array>} - Array of polls
   */
  static async getPollHistory() {
    try {
      const polls = await Poll.getAll();
      return polls;
    } catch (error) {
      console.error("❌ Failed to get poll history:", error);
      throw error;
    }
  }

  /**
   * Record a student's answer
   * @param {Object} params - { studentId, answer, studentResponses, activePoll }
   * @returns {Object} - { success, message, updatedResponses }
   */
  static recordAnswer(params) {
    const { studentId, answer, studentResponses, activePoll } = params;

    // Check if student already answered
    if (studentResponses[studentId]) {
      return {
        success: false,
        message: "You have already submitted an answer",
        error: true,
      };
    }

    // Check if poll is active
    if (!activePoll || !activePoll.question) {
      return {
        success: false,
        message: "No active poll",
        error: true,
      };
    }

    // Record the response
    activePoll.responses[answer] = (activePoll.responses[answer] || 0) + 1;
    studentResponses[studentId] = true;

    return {
      success: true,
      message: "Answer recorded successfully",
      updatedResponses: activePoll.responses,
    };
  }

  /**
   * Check if all students have answered
   * @param {Object} params - { studentCount, responseCount }
   * @returns {boolean}
   */
  static hasAllStudentsAnswered(params) {
    const { studentCount, responseCount } = params;
    return (
      studentCount > 0 && responseCount >= studentCount && responseCount > 0
    );
  }

  /**
   * Format poll for emission
   * @param {Object} poll - Poll object
   * @returns {Object} - Formatted poll
   */
  static formatPollForEmission(poll) {
    const remaining = this.calculateRemainingTime(poll);
    return {
      ...poll,
      duration: remaining,
      pollStartTime: poll.startTime,
      serverTime: Date.now(),
    };
  }

  /**
   * Calculate poll statistics
   * @param {Object} poll - Poll object
   * @returns {Object} - Statistics including percentages
   */
  static calculateStatistics(poll) {
    if (!poll || !poll.responses) {
      return {};
    }

    const totalVotes = Object.values(poll.responses).reduce((a, b) => a + b, 0);
    const stats = {};

    poll.options.forEach((option) => {
      const votes = poll.responses[option] || 0;
      stats[option] = {
        votes,
        percentage: totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0,
      };
    });

    return stats;
  }
}

export default PollService;
