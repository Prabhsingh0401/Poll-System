import { getDB } from "../db.js";

const POLLS_COLLECTION = "polls";

class Poll {
  static async create(pollData) {
    try {
      const collection = getDB().collection(POLLS_COLLECTION);
      const result = await collection.insertOne({
        question: pollData.question,
        options: pollData.options,
        responses: pollData.responses || {},
        correctAnswer: pollData.correctAnswer || null,
        timestamp: new Date().toISOString(),
        isFinal: pollData.isFinal || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return result.insertedId;
    } catch (error) {
      console.error("❌ Error creating poll:", error.message);
      throw error;
    }
  }

  static async getAll() {
    try {
      const collection = getDB().collection(POLLS_COLLECTION);
      const polls = await collection.find({}).sort({ createdAt: -1 }).toArray();
      console.log(`✅ Retrieved ${polls.length} polls from DB`);
      return polls;
    } catch (error) {
      console.error("❌ Error fetching polls:", error.message);
      throw error;
    }
  }

  static async getById(pollId) {
    try {
      const collection = getDB().collection(POLLS_COLLECTION);
      const poll = await collection.findOne({ _id: pollId });
      return poll;
    } catch (error) {
      console.error("❌ Error fetching poll by ID:", error.message);
      throw error;
    }
  }

  static async updateResponses(pollId, responses) {
    try {
      const collection = getDB().collection(POLLS_COLLECTION);
      const result = await collection.findOneAndUpdate(
        { _id: pollId },
        {
          $set: {
            responses,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" },
      );
      return result.value;
    } catch (error) {
      console.error("❌ Error updating poll responses:", error.message);
      throw error;
    }
  }

  static async markAsFinal(pollId) {
    try {
      const collection = getDB().collection(POLLS_COLLECTION);
      const result = await collection.findOneAndUpdate(
        { _id: pollId },
        {
          $set: {
            isFinal: true,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" },
      );
      return result.value;
    } catch (error) {
      console.error("❌ Error marking poll as final:", error.message);
      throw error;
    }
  }
}

export default Poll;
