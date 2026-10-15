import mongoose from "mongoose";

const uri = process.env.MONGODB_URI ?? "";
let cached = (global as unknown as { __sociraMongoose?: Promise<typeof mongoose> }).__sociraMongoose;

export async function dbConnect() {
  if (!uri) throw new Error("MONGODB_URI is not configured. See .env.example.");
  if (!cached) {
    cached = mongoose.connect(uri, { maxPoolSize: 10 });
    (global as unknown as { __sociraMongoose?: Promise<typeof mongoose> }).__sociraMongoose = cached;
  }
  return cached;
}

export function dbReady() {
  return Boolean(uri) && mongoose.connection.readyState === 1;
}
