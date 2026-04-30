import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: ""
  },
  fullName: {
    type: String,
    trim: true,
    default: ""
  },
  phone: {
    type: String,
    trim: true,
    default: "",
    match: [/^$|^[+\d][\d\s().-]{7,20}$/, "Invalid phone"]
  },
  goal: {
    type: String,
    trim: true,
    default: "",
    enum: ["", "fat_loss", "strength", "mobility", "endurance"]
  },
  height: {
    type: Number,
    default: null,
    min: 50,
    max: 250
  },
  weight: {
    type: Number,
    default: null,
    min: 20,
    max: 300
  },
  experienceLevel: {
    type: String,
    trim: true,
    default: "",
    enum: ["", "beginner", "intermediate", "advanced"]
  },
  units: {
    type: String,
    trim: true,
    default: "metric",
    enum: ["metric", "imperial"]
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  avatarUrl: {
    type: String,
    default: ""
  },
  passwordHash: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("User", UserSchema);
