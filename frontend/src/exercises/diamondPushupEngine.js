import { calculateAngle } from "../utils/angleUtils";

let stage = "UP";
let reps = 0;

// ======================
const HAND_CLOSE_DIST = 0.08; // tweak if needed

// ======================
export function resetDiamondPushup() {
    stage = "UP";
    reps = 0;
}

// ======================
export function analyzeDiamondPushup(landmarks) {

    const shoulder = landmarks[11];
    const elbow = landmarks[13];
    const wrist = landmarks[15];

    const rShoulder = landmarks[12];
    const rElbow = landmarks[14];
    const rWrist = landmarks[16];

    const hip = landmarks[23];
    const ankle = landmarks[27];

    // ======================
    // HELPERS
    // ======================
    const dist = (a, b) =>
        Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

    // ======================
    // ANGLES
    // ======================
    const elbowAngle =
        (calculateAngle(shoulder, elbow, wrist) +
         calculateAngle(rShoulder, rElbow, rWrist)) / 2;

    const bodyAngle = calculateAngle(shoulder, hip, ankle);

    // ======================
    // DIAMOND HAND CHECK
    // ======================
    const handDistance = dist(wrist, rWrist);
    const handsClose = handDistance < HAND_CLOSE_DIST;

    // ======================
    // PUSHUP POSITION CHECK
    // ======================
    const shoulderHipDiff = Math.abs(shoulder.y - hip.y);
    const handsBelowShoulder = wrist.y > shoulder.y;

    const validPushupPosition =
        bodyAngle > 150 &&
        shoulderHipDiff < 0.15 &&
        handsBelowShoulder;

    // ======================
    // GLOBAL VALIDATION
    // ======================
    if (!validPushupPosition) {
        return {
            reps,
            stage: "INVALID_POSITION",
            feedback: "Get into push-up position"
        };
    }

    // 🔥 NEW CHECK (IMPORTANT)
    if (!handsClose) {
        return {
            reps,
            stage,
            feedback: "Bring your hands closer (diamond shape)"
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
        feedback = "Keep your body straight";
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
        handDistance,
        feedback
    };
}