import express from "express";
import WorkoutSession from "../models/WorkoutSession.js";
import { optionalAuth, requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();


// Save workout
router.post("/save-workout", optionalAuth, async (req, res) => {
    try {
        const sessionData = {
            ...req.body,
            userId: req.user?.id || req.body.userId || "guest"
        };

        const session = new WorkoutSession(sessionData);

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
router.get("/workouts", requireAuth, async (req, res) => {

    try {

        const workouts = await WorkoutSession.find({ userId: req.user.id })
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