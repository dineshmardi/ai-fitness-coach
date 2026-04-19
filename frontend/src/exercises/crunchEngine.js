import { calculateAngle } from "../utils/angleUtils";

const THRESHOLDS = {
    DOWN: 160,
    UP: 120,
    HORIZONTAL_TOLERANCE: 0.12,
    MIN_REP_TIME: 800,
    MAX_REP_TIME: 4000
};

let stage = "DOWN";
let reps = 0;
let hasReachedUp = false;
let repStartTime = null;

export function resetCrunch() {
    stage = "DOWN";
    reps = 0;
    hasReachedUp = false;
    repStartTime = null;
}

export function analyzeCrunch(landmarks) {
    if (!landmarks) return null;

    // =========================
    // AVERAGED BODY POINTS
    // =========================

    // LEFT
    const leftShoulder = landmarks[11];
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];

    // RIGHT
    const rightShoulder = landmarks[12];
    const rightHip = landmarks[24];
    const rightKnee = landmarks[26];

    // CENTER (AVERAGED)
    const shoulder = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2
    };

    const hip = {
        x: (leftHip.x + rightHip.x) / 2,
        y: (leftHip.y + rightHip.y) / 2
    };

    const knee = {
        x: (leftKnee.x + rightKnee.x) / 2,
        y: (leftKnee.y + rightKnee.y) / 2
    };

    // =========================
    // POSITION CHECK (LYING)
    // =========================

    const shoulderHipDiff = Math.abs(shoulder.y - hip.y);
    const isLying = shoulderHipDiff < THRESHOLDS.HORIZONTAL_TOLERANCE;

    if (!isLying) {
        stage = "DOWN";
        hasReachedUp = false;
        repStartTime = null;

        return {
            reps,
            stage: "INVALID_POSITION",
            torsoAngle: 0,
            feedback: "Lie down horizontally"
        };
    }

    // =========================
    // ANGLES
    // =========================

    const torsoAngle = calculateAngle(shoulder, hip, knee);

    // NECK (average ears)
    const leftEar = landmarks[7];
    const rightEar = landmarks[8];

    const ear = {
        x: (leftEar.x + rightEar.x) / 2,
        y: (leftEar.y + rightEar.y) / 2
    };

    const neckAngle = calculateAngle(ear, shoulder, hip);

    // DEBUG (optional)
    console.log(
        "Torso:", Math.round(torsoAngle),
        "Neck:", Math.round(neckAngle)
    );

    let feedback = "Good";

    // =========================
    // STATE MACHINE
    // =========================

    // DOWN → start moving up
    if (stage === "DOWN" && torsoAngle < 150) {
        stage = "MOVING_UP";
        repStartTime = Date.now();
    }

    // reach top
    if (stage === "MOVING_UP" && torsoAngle < THRESHOLDS.UP) {
        stage = "UP";
        hasReachedUp = true;
    }

    // going down
    if (stage === "UP" && torsoAngle > 130) {
        stage = "MOVING_DOWN";
    }

    // COMPLETE REP
    if (
        stage === "MOVING_DOWN" &&
        torsoAngle > THRESHOLDS.DOWN &&
        hasReachedUp
    ) {
        const repTime = Date.now() - repStartTime;

        reps++;
        stage = "DOWN";
        hasReachedUp = false;

        // SPEED CHECK
        if (repTime < THRESHOLDS.MIN_REP_TIME) {
            feedback = "Too fast, slow down";
        } else if (repTime > THRESHOLDS.MAX_REP_TIME) {
            feedback = "Too slow, keep steady pace";
        } else {
            feedback = "Good Rep";
        }

        return {
            reps,
            stage,
            torsoAngle,
            feedback
        };
    }

    // =========================
    // SMART FEEDBACK (ANGLE BASED)
    // =========================

    if (stage === "DOWN" || stage === "MOVING_UP") {

        if (torsoAngle > THRESHOLDS.DOWN) {
            feedback = "Lift your shoulders";
        }
        else if (torsoAngle > THRESHOLDS.UP) {

            const remaining = Math.round(torsoAngle - THRESHOLDS.UP);

            feedback = `Lift ${remaining}° more`;

        }

    }

    if (stage === "UP" || stage === "MOVING_DOWN") {

        if (torsoAngle < THRESHOLDS.UP) {
            feedback = "Don't over-crunch";
        }
        else if (torsoAngle < THRESHOLDS.DOWN) {

            const remaining = Math.round(THRESHOLDS.DOWN - torsoAngle);

            feedback = `Go down ${remaining}° more`;

        }

    }
    // =========================
    // NECK STRAIN CHECK
    // =========================

    if (neckAngle < 140) {
        feedback = "Don't pull your neck";
    }

    return {
        reps,
        stage,
        torsoAngle,
        feedback
    };
}