import express from "express";
import {
  getPollStatus,
  createPoll,
  getAllPolls,
  getPollById,
} from "../controllers/pollController.js";

const router = express.Router();

// GET /api/polls/status - Check API status
router.get("/status", getPollStatus);

// GET /api/polls - Get all polls from database
router.get("/", getAllPolls);

// GET /api/polls/:id - Get poll by ID
router.get("/:id", getPollById);

// POST /api/polls/create - Create new poll
router.post("/create", createPoll);

export default router;
