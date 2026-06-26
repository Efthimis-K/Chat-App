import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const SEED_USERNAME = process.env.SEED_USERNAME || "admin";
const SEED_PASSWORD = process.env.SEED_PASSWORD || "admin123";

async function main() {
  if (!MONGO_URI) {
    console.error("MONGO_URI is required");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);

  const existing = await User.findOne({ username: SEED_USERNAME });
  if (existing) {
    console.log(`User "${SEED_USERNAME}" already exists, skipping.`);
  } else {
    await User.createUser(SEED_USERNAME, SEED_PASSWORD);
    console.log(`Created user "${SEED_USERNAME}"`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
