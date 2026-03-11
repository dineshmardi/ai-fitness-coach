import express from "express";
import WorkoutSession from "../models/WorkoutSession.js";

const router = express.Router();


// SAVE WORKOUT SESSION
router.post("/save-workout", async (req, res) => {

    try {

        const workout = new WorkoutSession(req.body);

        await workout.save();

        res.json({
            message: "Workout saved successfully",
            data: workout
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});


// GET ALL WORKOUT SESSIONS
router.get("/workouts", async (req, res) => {

    try {

        const sessions = await WorkoutSession.find().sort({ createdAt: -1 });

        res.json(sessions);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});


export default router;