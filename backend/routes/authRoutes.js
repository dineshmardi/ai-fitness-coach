import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import WorkoutSession from "../models/WorkoutSession.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function buildStats(sessions) {
  const totalWorkouts = sessions.length;
  const totalCalories = sessions.reduce(
    (sum, session) => sum + (session.totalCalories || 0),
    0
  );
  const totalDuration = sessions.reduce(
    (sum, session) => sum + (session.totalDuration || 0),
    0
  );

  const dates = new Set(
    sessions.map((session) =>
      new Date(session.createdAt).toISOString().slice(0, 10)
    )
  );

  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (!dates.has(key)) {
      break;
    }
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    totalWorkouts,
    totalCalories,
    totalDuration,
    streak
  };
}

function validateProfileInput(payload) {
  const errors = [];
  const allowedGoals = new Set(["", "fat_loss", "strength", "mobility", "endurance"]);
  const allowedLevels = new Set(["", "beginner", "intermediate", "advanced"]);
  const allowedUnits = new Set(["metric", "imperial"]);

  if (payload.goal && !allowedGoals.has(payload.goal)) {
    errors.push("Invalid goal");
  }

  if (payload.experienceLevel && !allowedLevels.has(payload.experienceLevel)) {
    errors.push("Invalid experience level");
  }

  if (payload.units && !allowedUnits.has(payload.units)) {
    errors.push("Invalid units");
  }

  if (payload.phone && !/^$|^[+\d][\d\s().-]{7,20}$/.test(payload.phone)) {
    errors.push("Invalid phone");
  }

  if (payload.height !== null && payload.height !== undefined) {
    const heightValue = Number(payload.height);
    if (Number.isNaN(heightValue)) {
      errors.push("Invalid height");
    } else {
      const minHeight = payload.units === "imperial" ? 20 : 50;
      const maxHeight = payload.units === "imperial" ? 100 : 250;
      if (heightValue < minHeight || heightValue > maxHeight) {
        errors.push("Height out of range");
      }
    }
  }

  if (payload.weight !== null && payload.weight !== undefined) {
    const weightValue = Number(payload.weight);
    if (Number.isNaN(weightValue)) {
      errors.push("Invalid weight");
    } else {
      const minWeight = payload.units === "imperial" ? 50 : 20;
      const maxWeight = payload.units === "imperial" ? 700 : 300;
      if (weightValue < minWeight || weightValue > maxWeight) {
        errors.push("Weight out of range");
      }
    }
  }

  return errors;
}

router.post("/auth/register", async (req, res) => {
  try {
    const { name = "", email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        fullName: user.fullName || "",
        phone: user.phone || "",
        goal: user.goal || "",
        height: user.height ?? null,
        weight: user.weight ?? null,
        experienceLevel: user.experienceLevel || "",
        units: user.units || "metric",
        email: user.email,
        avatarUrl: user.avatarUrl || ""
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        fullName: user.fullName || "",
        phone: user.phone || "",
        goal: user.goal || "",
        height: user.height ?? null,
        weight: user.weight ?? null,
        experienceLevel: user.experienceLevel || "",
        units: user.units || "metric",
        email: user.email,
        avatarUrl: user.avatarUrl || ""
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Login failed" });
  }
});

router.get("/profile", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name fullName phone goal height weight experienceLevel units email avatarUrl"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const sessions = await WorkoutSession.find({ userId: req.user.id });
    const stats = buildStats(sessions);

    return res.json({
      id: user._id.toString(),
      name: user.name,
      fullName: user.fullName || "",
      phone: user.phone || "",
      goal: user.goal || "",
      height: user.height ?? null,
      weight: user.weight ?? null,
      experienceLevel: user.experienceLevel || "",
      units: user.units || "metric",
      email: user.email,
      avatarUrl: user.avatarUrl || "",
      stats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to load profile" });
  }
});

router.put("/profile", requireAuth, async (req, res) => {
  try {
    const {
      name = "",
      fullName = "",
      phone = "",
      goal = "",
      height = null,
      weight = null,
      experienceLevel = "",
      units = "metric",
      avatarUrl = ""
    } = req.body;

    const validationErrors = validateProfileInput({
      phone,
      goal,
      height,
      weight,
      experienceLevel,
      units
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({ error: "Invalid profile data", details: validationErrors });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        fullName,
        phone,
        goal,
        height,
        weight,
        experienceLevel,
        units,
        avatarUrl
      },
      { returnDocument: "after", runValidators: true }
    ).select("name fullName phone goal height weight experienceLevel units email avatarUrl");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      id: user._id.toString(),
      name: user.name,
      fullName: user.fullName || "",
      phone: user.phone || "",
      goal: user.goal || "",
      height: user.height ?? null,
      weight: user.weight ?? null,
      experienceLevel: user.experienceLevel || "",
      units: user.units || "metric",
      email: user.email,
      avatarUrl: user.avatarUrl || "",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

router.put("/profile/password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Missing password fields" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: "Password updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update password" });
  }
});

export default router;
