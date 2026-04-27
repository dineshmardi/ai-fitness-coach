import { calculateAngle } from "../utils/angleUtils";
import { smooth } from "../utils/smoothing";

const THRESHOLDS = {
    DOWN: 160,
    UP: 95,
    LEG_STRAIGHT: 160,
    BODY_FLAT: 0.12,
    BACK_LIFT: 0.18,     // cheat detection
    MIN_REP_TIME: 800,   // ms
    MAX_REP_TIME: 4000   // ms
};

let stage = "DOWN";
let reps = 0;
let repStartTime = null;

export function resetLegRaise() {
    stage = "DOWN";
    reps = 0;
    repStartTime = null;
}

export function analyzeLegRaise(landmarks) {
    if (!landmarks) return null;

    // =========================
    // LANDMARKS
    // =========================

    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];

    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    // =========================
    // AVERAGE POINTS
    // =========================

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

    const ankle = {
        x: (leftAnkle.x + rightAnkle.x) / 2,
        y: (leftAnkle.y + rightAnkle.y) / 2
    };

    // =========================
    // ANGLES
    // =========================

    let torsoLegAngle = calculateAngle(shoulder, hip, ankle);
    torsoLegAngle = smooth("legraise_torso", torsoLegAngle);

    let legStraightAngle = calculateAngle(hip, knee, ankle);
    legStraightAngle = smooth("legraise_leg", legStraightAngle);
    let feedback = "Good";

    // =========================
    // POSITION CHECK
    // =========================

    const bodyFlat = Math.abs(shoulder.y - hip.y) < THRESHOLDS.BODY_FLAT;

    if (!bodyFlat) {
        stage = "DOWN";
        return {
            reps,
            stage: "INVALID",
            torsoLegAngle,
            feedback: "Lie flat on ground"
        };
    }

    // =========================
    // LOWER BACK CHEAT
    // =========================

    const backLift = Math.abs(shoulder.y - hip.y);

    if (backLift > THRESHOLDS.BACK_LIFT) {
        return {
            reps,
            stage: "CHEATING",
            torsoLegAngle,
            feedback: "Keep lower back on ground"
        };
    }

    // =========================
    // LEG STRAIGHT CHECK
    // =========================

    if (legStraightAngle < THRESHOLDS.LEG_STRAIGHT) {
        return {
            reps,
            stage: "BAD_FORM",
            torsoLegAngle,
            feedback: "Keep legs straight"
        };
    }

    // =========================
    // STATE MACHINE
    // =========================

    if (stage === "DOWN" && torsoLegAngle < 150) {
        stage = "MOVING_UP";
        repStartTime = Date.now(); // start timing
    }

    if (stage === "MOVING_UP" && torsoLegAngle < THRESHOLDS.UP) {
        stage = "UP";
    }

    if (stage === "UP" && torsoLegAngle > 110) {
        stage = "MOVING_DOWN";
    }

    // =========================
    // REP COMPLETE + SPEED CHECK
    // =========================

    if (stage === "MOVING_DOWN" && torsoLegAngle > THRESHOLDS.DOWN) {

        const repTime = Date.now() - repStartTime;

        reps++;
        feedback = `Rep counted ${reps}`;
        stage = "DOWN";

        if (repTime < THRESHOLDS.MIN_REP_TIME) {
            feedback = "Too fast, slow down";
        } else if (repTime > THRESHOLDS.MAX_REP_TIME) {
            feedback = "Too slow, keep steady";
        } else {
            feedback = "Good Rep";
        }

        return {
            reps,
            stage,
            torsoLegAngle,
            feedback
        };
    }

    // ======================
    // COACHING FEEDBACK
    // ======================

    if (stage === "DOWN" && torsoLegAngle > 150) {
        feedback = "Lift your legs up";
    }

    else if (stage === "MOVING_UP" && torsoLegAngle > 120) {
        feedback = "Lift more";
    }

    else if (stage === "MOVING_UP" && torsoLegAngle < 110) {
        feedback = "Good, keep going";
    }

    else if (stage === "UP") {
        feedback = "Nice, now lower slowly";
    }

    else if (stage === "MOVING_DOWN" && torsoLegAngle > 130) {
        feedback = "Control the movement";
    }

    return {
        reps,
        stage,
        torsoLegAngle,
        feedback
    };
}