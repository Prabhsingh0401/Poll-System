import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

const DB_NAME = "polling_system";
const POLLS_COLLECTION = "polls";

let db = null;
let client = null;

const connectDB = async () => {
  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log("✅ Connected to MongoDB");

    // Create indexes for better query performance
    const pollsCollection = db.collection(POLLS_COLLECTION);
    await pollsCollection.createIndex({ createdAt: -1 });
    console.log("✅ Indexes created");

    return db;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error("Database not connected. Call connectDB() first.");
  }
  return db;
};

const closeDB = async () => {
  if (client) {
    await client.close();
    console.log("✅ MongoDB connection closed");
  }
};

// Poll operations
const savePoll = async (pollData) => {
  try {
    const collection = getDB().collection(POLLS_COLLECTION);
    const result = await collection.insertOne({
      ...pollData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`✅ Poll saved to DB with ID: ${result.insertedId}`);
    return result.insertedId;
  } catch (error) {
    console.error("❌ Error saving poll:", error.message);
    throw error;
  }
};

const getPollHistory = async () => {
  try {
    const collection = getDB().collection(POLLS_COLLECTION);
    const polls = await collection.find({}).sort({ createdAt: -1 }).toArray();
    console.log(`✅ Retrieved ${polls.length} polls from DB`);
    return polls;
  } catch (error) {
    console.error("❌ Error fetching poll history:", error.message);
    throw error;
  }
};

const deletePollHistory = async () => {
  try {
    const collection = getDB().collection(POLLS_COLLECTION);
    const result = await collection.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} polls from DB`);
    return result.deletedCount;
  } catch (error) {
    console.error("❌ Error deleting poll history:", error.message);
    throw error;
  }
};

export {
  connectDB,
  getDB,
  closeDB,
  savePoll,
  getPollHistory,
  deletePollHistory,
};
