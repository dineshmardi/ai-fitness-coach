import { calculateAngle } from "../utils/angleUtils";
import { smooth } from "../utils/smoothing";
// =====================
// CONFIG
// =====================
const LEG_WIDTH = 0.25;        // feet apart threshold
const KNEE_STRAIGHT = 150;    // leg straight
const TOUCH_DIST = 0.12;      // hand-foot distance

// =====================
let stage = "STANCE"; // STANCE → READY → TOUCH
let reps = 0;
let lastSide = null;
let lastFeedback = "";

// =====================
export function resetStandingToeTouch() {
    stage = "STANCE";
    reps = 0;
    lastSide = null;
    lastFeedback = "";
}

// =====================
export function analyzeStandingToeTouch(landmarks) {
    if (!landmarks) return;

    // LEFT
    const lShoulder = landmarks[11];
    const lElbow = landmarks[13];
    const lWrist = landmarks[15];
    const lHip = landmarks[23];
    const lKnee = landmarks[25];
    const lAnkle = landmarks[27];

    // RIGHT
    const rShoulder = landmarks[12];
    const rElbow = landmarks[14];
    const rWrist = landmarks[16];
    const rHip = landmarks[24];
    const rKnee = landmarks[26];
    const rAnkle = landmarks[28];

    // =====================
    // DISTANCE
    // =====================
    const dist = (a, b) =>
        Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

    // =====================
    // STANCE CHECK (WIDE LEGS)
    // =====================
    const legWidth = Math.abs(lAnkle.x - rAnkle.x);
    const wideEnough = legWidth > LEG_WIDTH;

    // =====================
    // KNEE STRAIGHT
    // =====================
    const leftKneeAngle = calculateAngle(lHip, lKnee, lAnkle);
    const rightKneeAngle = calculateAngle(rHip, rKnee, rAnkle);

    const legsStraight =
        leftKneeAngle > KNEE_STRAIGHT &&
        rightKneeAngle > KNEE_STRAIGHT;

    // =====================
    // TOUCH DETECTION
    // =====================
    const rightDist = smooth("stt_r", dist(rWrist, lAnkle));
    const leftDist = smooth("stt_l", dist(lWrist, rAnkle));

    const rightTouch = rightDist < TOUCH_DIST;
    const leftTouch = leftDist < TOUCH_DIST;

    // =====================
    console.log({
        stage,
        wideEnough,
        leftKneeAngle,
        rightKneeAngle,
        rightTouch,
        leftTouch,
        reps
    });

    // =====================
    // STANCE PHASE
    // =====================
    if (stage === "STANCE") {

        if (!wideEnough) {
            return output("Stand with your legs wide apart");
        }

        if (!legsStraight) {
            return output("Keep your legs straight");
        }

        stage = "READY";
        return output("Now touch opposite hand to foot");
    }

    // =====================
    // READY / ACTIVE
    // =====================
    if (stage === "READY") {

        if (!wideEnough) {
            stage = "STANCE";
            return output("Keep your legs wide apart");
        }

        if (!legsStraight) {
            return output("Keep your legs straight");
        }

        // RIGHT SIDE
        if (rightTouch) {
            if (lastSide !== "RIGHT") {
                reps++;
                lastSide = "RIGHT";
                return output(`Rep ${reps}`);
            }
        }

        // LEFT SIDE
        if (leftTouch) {
            if (lastSide !== "LEFT") {
                reps++;
                lastSide = "LEFT";
                return output(`Rep ${reps}`);
            }
        }

        // FEEDBACK
        if (!rightTouch && !leftTouch) {
            return output("Touch opposite hand to foot");
        }

        return output("");
    }

    return null;

    // =====================
    function output(msg) {
        if (msg === lastFeedback) {
            return { stage, feedback: "", reps };
        }

        lastFeedback = msg;
        return { stage, feedback: msg, reps };
    }
}