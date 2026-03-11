import mongoose from "mongoose";

const ExerciseSchema = new mongoose.Schema({
    type: String,        // squat, pushup, plank
    reps: Number,        // for squat/pushup
    duration: Number     // for plank (seconds)
});

const WorkoutSessionSchema = new mongoose.Schema({
    userId: {
        type: String,
        default: "guest"
    },

    exercises: [ExerciseSchema],

    totalCalories: Number,

    totalDuration: Number, // seconds

    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("WorkoutSession", WorkoutSessionSchema);