import Poll from "../models/Poll.js";
import PollService from "../services/pollService.js";

/**
 * Poll Controller - Handles HTTP endpoints for poll operations
 * Delegates business logic to PollService
 */

export const getPollStatus = (req, res) => {
  try {
    res.json({
      success: true,
      message: "Poll status endpoint is working",
    });
  } catch (error) {
    console.error("Error fetching poll status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch poll status",
    });
  }
};

export const createPoll = (req, res) => {
  try {
    const { question, options, duration } = req.body;

    if (!question || !options || options.length < 2) {
      return res.status(400).json({
        success: false,
        error: "Question and at least 2 options are required",
      });
    }

    const poll = PollService.createActivePoll({
      question,
      options,
      duration: duration || 30,
    });

    res.json({
      success: true,
      message: "Poll created successfully!",
      poll,
    });
  } catch (error) {
    console.error("Error creating poll:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create poll",
    });
  }
};

/**
 * Get all polls from database
 */
export const getAllPolls = async (req, res) => {
  try {
    const polls = await Poll.getAll();
    res.json({
      success: true,
      message: "Polls fetched successfully",
      polls,
    });
  } catch (error) {
    console.error("Error fetching polls:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch polls",
    });
  }
};

/**
 * Get poll by ID
 */
export const getPollById = async (req, res) => {
  try {
    const { id } = req.params;
    const poll = await Poll.getById(id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        error: "Poll not found",
      });
    }

    res.json({
      success: true,
      poll,
    });
  } catch (error) {
    console.error("Error fetching poll:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch poll",
    });
  }
};
