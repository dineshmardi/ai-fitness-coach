import { calculateAngle } from "../utils/angleUtils";

let stage = "UP";
let reps = 0;

export function resetPushup() {
    stage = "UP";
    reps = 0;
}

export function analyzePushup(landmarks) {

    const shoulder = landmarks[11];
    const elbow = landmarks[13];
    const wrist = landmarks[15];

    const hip = landmarks[23];
    const knee = landmarks[25];
    const ankle = landmarks[27];

    // ======================
    // ANGLES
    // ======================

    const elbowAngle = calculateAngle(shoulder, elbow, wrist);
    const bodyAngle = calculateAngle(shoulder, hip, ankle);

    // ======================
    // PUSHUP POSITION CHECK
    // ======================

    const shoulderHipDiff = Math.abs(shoulder.y - hip.y);
    const handsBelowShoulder = wrist.y > shoulder.y;

    const validPushupPosition =
        bodyAngle > 150 &&
        shoulderHipDiff < 0.15 &&
        handsBelowShoulder;

    if (!validPushupPosition) {
        return {
            reps,
            stage: "INVALID_POSITION",
            elbowAngle,
            feedback: "Get into push-up position"
        };
    }

    let feedback = "";

    // ======================
    // STATE MACHINE
    // ======================

    if (stage === "UP" && elbowAngle < 150) {
        stage = "MOVING_DOWN";
    }

    if (stage === "MOVING_DOWN" && elbowAngle < 90) {
        stage = "BOTTOM";
    }

    if (stage === "BOTTOM" && elbowAngle > 110) {
        stage = "MOVING_UP";
    }

    if (stage === "MOVING_UP" && elbowAngle > 160) {
        stage = "UP";
        reps++;
    }

    // ======================
    // FEEDBACK
    // ======================

    if (bodyAngle < 160) {
        feedback = "Keep body straight";
    } else if (stage === "MOVING_DOWN" && elbowAngle > 110) {
        feedback = "Go lower";
    } else {
        feedback = "Good";
    }

    return {
        reps,
        stage,
        elbowAngle,
        bodyAngle,
        feedback

    };
}