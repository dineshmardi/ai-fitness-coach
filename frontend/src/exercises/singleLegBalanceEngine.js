import { calculateAngle } from "../utils/angleUtils";
import { smooth } from "../utils/smoothing";

// =====================
const BODY_ALIGN = 130;
const ARM_WARN = 60;
const TORSO_DROP_MIN = 0.03;
const HOLD_TIME = 10;

// detection
const LIFT_DIFF = 0.04;
const STAND_TOL = 0.08;   // 🔥 relaxed

// =====================
let stage = "ENTRY";
let holdStart = null;
let reps = 0;
let lastFeedback = "";
let activeLeg = null;
let prevLeg = null;

// =====================
export function resetSingleLegBalance() {
    stage = "ENTRY";
    holdStart = null;
    reps = 0;
    lastFeedback = "";
    activeLeg = null;
    prevLeg = null;
}

// =====================
export function analyzeSingleLegBalance(landmarks) {
    if (!landmarks) return;

    const lShoulder = landmarks[11];
    const lElbow = landmarks[13];
    const lHip = landmarks[23];
    const lAnkle = landmarks[27];

    const rShoulder = landmarks[12];
    const rElbow = landmarks[14];
    const rHip = landmarks[24];
    const rAnkle = landmarks[28];

    // =====================
    // ANGLES
    // =====================
    const bodyAngle = smooth(
        "body",
        (calculateAngle(lShoulder, lHip, lAnkle) +
            calculateAngle(rShoulder, rHip, rAnkle)) / 2
    );

    const armAngle =
        (calculateAngle(lShoulder, lElbow, lHip) +
            calculateAngle(rShoulder, rElbow, rHip)) / 2;

    // =====================
    // LEG DETECTION
    // =====================
    const leftLifted = lAnkle.y < rAnkle.y - LIFT_DIFF;
    const rightLifted = rAnkle.y < lAnkle.y - LIFT_DIFF;

    let currentLeg = null;
    if (leftLifted && !rightLifted) currentLeg = "LEFT";
    if (rightLifted && !leftLifted) currentLeg = "RIGHT";

    // =====================
    // RELAXED STANDING
    // =====================
    const isStanding =
        Math.abs(lAnkle.y - rAnkle.y) < STAND_TOL;

    const hip = currentLeg === "LEFT" ? lHip : rHip;
    const ankle = currentLeg === "LEFT" ? lAnkle : rAnkle;

    const legHeightDiff = hip && ankle ? Math.abs(hip.y - ankle.y) : null;
    const torsoDrop = Math.abs(lShoulder.y - lHip.y);

    console.log({ stage, isStanding, currentLeg });

    // =====================
    // ENTRY (FIXED)
    // =====================
    if (stage === "ENTRY") {

        // ❌ remove aggressive "stand straight"
        if (!currentLeg) {
            return output("Lift one leg");
        }

        activeLeg = currentLeg;
        stage = "ALIGN";
        lastFeedback = "";
        return output("Bend forward and extend your leg");
    }

    // =====================
    // ALIGN
    // =====================
    if (stage === "ALIGN") {

        if (!currentLeg) {
            stage = "ENTRY";
            return output("Lift your leg again");
        }

        if (armAngle < ARM_WARN) return output("Extend your arms");
        if (bodyAngle < BODY_ALIGN) return output("Lean forward more");
        if (torsoDrop < TORSO_DROP_MIN) return output("Lower your chest");

        if (legHeightDiff && legHeightDiff > 0.25) {
            return output("Lift your leg higher");
        }

        stage = "HOLD";
        holdStart = Date.now();
        lastFeedback = "";
        return output("Good hold");
    }

    // =====================
    // HOLD
    // =====================
    if (stage === "HOLD") {

        const remaining = HOLD_TIME - (Date.now() - holdStart) / 1000;

        if (!currentLeg) {
            stage = "ENTRY";
            return output("Lift your leg again");
        }

        if (remaining > 1) {
            return { stage, feedback: `Hold for ${Math.ceil(remaining)} seconds`, reps };
        }

        if (remaining > 0) {
            return { stage, feedback: "Hold for 1 second", reps };
        }

        stage = "RETURN";
        lastFeedback = "";
        return { stage, feedback: "Come back to standing position", reps };
    }

    // =====================
    // RETURN
    // =====================
    if (stage === "RETURN") {

        if (!isStanding) {
            return { stage, feedback: "Bring your leg down slowly", reps };
        }

        reps++;
        prevLeg = activeLeg;
        activeLeg = null;

        stage = "SWITCH";
        lastFeedback = "";
        return { stage, feedback: "Now switch leg", reps };
    }

    // =====================
    // SWITCH (FIXED)
    // =====================
    if (stage === "SWITCH") {

        if (!currentLeg) {
            return output("Lift the other leg");
        }

        if (currentLeg !== prevLeg) {
            activeLeg = currentLeg;
            stage = "ALIGN";
            lastFeedback = "";
            return output("Good. Repeat");
        }

        return output("Switch to the other leg");
    }

    return null;

    function output(msg) {
        if (msg === lastFeedback && stage !== "HOLD") {
            return { stage, feedback: "", reps };
        }
        lastFeedback = msg;
        return { stage, feedback: msg, reps };
    }
}