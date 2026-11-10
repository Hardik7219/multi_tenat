import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URL!;

if (!MONGODB_URI) {
    throw new Error("MONGODB_URL is not defined");
}

export async function connectDB() {
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    await mongoose.connect(MONGODB_URI);
}