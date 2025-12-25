import mongoose from "mongoose";

async function connectedDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
}

export default connectedDB;
