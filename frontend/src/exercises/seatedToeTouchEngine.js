import { calculateAngle } from "../utils/angleUtils";
import { smooth } from "../utils/smoothing";

// =====================
const KNEE_STRAIGHT = 150;
const TOUCH_DIST = 0.12;
const HOLD_TIME = 10;

// =====================
let stage = "SIT";
let reps = 0;
let holdStart = null;
let lastFeedback = "";

// =====================
export function resetSeatedToeTouch() {
    stage = "SIT";
    reps = 0;
    holdStart = null;
    lastFeedback = "";
}

// =====================
export function analyzeSeatedToeTouch(landmarks) {
    if (!landmarks) return;

    // LEFT
    const lShoulder = landmarks[11];
    const lHip = landmarks[23];
    const lKnee = landmarks[25];
    const lAnkle = landmarks[27];
    const lWrist = landmarks[15];

    // RIGHT
    const rShoulder = landmarks[12];
    const rHip = landmarks[24];
    const rKnee = landmarks[26];
    const rAnkle = landmarks[28];
    const rWrist = landmarks[16];

    // =====================
    // HELPERS
    // =====================
    const dist = (a, b) =>
        Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

    // =====================
    // TOE PROJECTION (NEW)
    // =====================
    const getToePoint = (ankle, knee) => {
        const dx = ankle.x - knee.x;
        const dy = ankle.y - knee.y;

        const length = Math.sqrt(dx * dx + dy * dy);

        const nx = dx / length;
        const ny = dy / length;

        return {
            x: ankle.x + nx * 0.08,
            y: ankle.y + ny * 0.08
        };
    };
    // =====================
    // POSITION CHECKS
    // =====================
    const sitScore = smooth(
        "seat_pos",
        (Math.abs(lHip.y - lKnee.y) + Math.abs(rHip.y - rKnee.y)) / 2
    );

    const isSitting = sitScore < 0.1;

    const isStanding =
        lHip.y < lKnee.y && rHip.y < rKnee.y;

    const leftKneeAngle = calculateAngle(lHip, lKnee, lAnkle);
    const rightKneeAngle = calculateAngle(rHip, rKnee, rAnkle);

    const legsStraight =
        leftKneeAngle > KNEE_STRAIGHT &&
        rightKneeAngle > KNEE_STRAIGHT;

    
    // TOE-BASED TOUCH (UPDATED)
    // =====================
    const lToe = getToePoint(lAnkle, lKnee);
    const rToe = getToePoint(rAnkle, rKnee);

    const leftDist = smooth("seat_l", dist(lWrist, lToe));
    const rightDist = smooth("seat_r", dist(rWrist, rToe));

    const touchingToes =
        leftDist < TOUCH_DIST ||
        rightDist < TOUCH_DIST;

    console.log({
        stage,
        isSitting,
        legsStraight,
        touchingToes,
        reps
    });

    // =====================
    // GLOBAL CHECK (VERY IMPORTANT)
    // =====================
    if (isStanding) {
        stage = "SIT";
        holdStart = null;
        return output("Sit down on the floor");
    }

    // =====================
    // SIT PHASE
    // =====================
    if (stage === "SIT") {

        if (!isSitting) {
            return output("Sit properly on the ground");
        }

        stage = "LEG";
        return output("Keep your legs straight");
    }

    // =====================
    // LEG STRAIGHT
    // =====================
    if (stage === "LEG") {

        if (!legsStraight) {
            return output("Keep your legs straight");
        }

        stage = "TOUCH";
        return output("Now touch your toes");
    }

    // =====================
    // TOUCH
    // =====================
    if (stage === "TOUCH") {

        if (!touchingToes) {
            return output("Reach your toes without bending knees");
        }

        stage = "HOLD";
        holdStart = Date.now();
        return output("Hold the position");
    }

    // =====================
    // HOLD (FIXED - NO SILENCE)
    // =====================
    if (stage === "HOLD") {

        if (!touchingToes) {
            stage = "TOUCH";
            holdStart = null;
            return output("Hold your toes");
        }

        const time = (Date.now() - holdStart) / 1000;
        const seconds = Math.floor(time);

        // 🔥 ALWAYS return (no blank frame)
        if (seconds < HOLD_TIME) {
            return {
                stage,
                feedback: `${seconds} seconds`,
                reps
            };
        }

        // 🔥 EXACT TRANSITION (no skip)
        stage = "RELAX";
        holdStart = null;

        return {
            stage,
            feedback: "Great job now come back up slowly",
            reps
        };
    }
    // =====================
    // RELAX
    // =====================
    if (stage === "RELAX") {

        if (touchingToes) {
            return {
                stage,
                feedback: "Sit back up straight",
                reps
            };
        }

        reps++;
        stage = "TOUCH";

        return {
            stage,
            feedback: `Good rep ${reps} now touch your toes again`,
            reps
        };
    }

    return null;

    // =====================
    function output(msg) {
        // 🔥 DO NOT block HOLD stage
        if (msg === lastFeedback && stage !== "HOLD") {
            return { stage, feedback: "", reps };
        }

        lastFeedback = msg;
        return { stage, feedback: msg, reps };
    }
}