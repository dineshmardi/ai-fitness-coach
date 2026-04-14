import express from "express";
import WorkoutSession from "../models/WorkoutSession.js";

const router = express.Router();


// Save workout
router.post("/save-workout", async (req, res) => {
    try {

        const session = new WorkoutSession(req.body);

        await session.save();

        res.json({
            message: "Workout saved successfully",
            session
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to save workout"
        });

    }
});


// Get workouts for dashboard
router.get("/workouts", async (req, res) => {

    try {

        const workouts = await WorkoutSession.find()
            .sort({ createdAt: -1 });

        res.json(workouts);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to fetch workouts"
        });

    }

});

export default router;