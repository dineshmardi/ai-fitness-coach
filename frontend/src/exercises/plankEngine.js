import { calculateAngle } from "../utils/angleUtils";

let startTime = null;
let plankTime = 0;

export function resetPlank() {
    startTime = null;
    plankTime = 0;
}

export function analyzePlank(landmarks) {

    const shoulder = landmarks[11];
    const hip = landmarks[23];
    const ankle = landmarks[27];
    const wrist = landmarks[15];

    const bodyAngle = calculateAngle(shoulder, hip, ankle);

    // =====================
    // POSITION CHECKS
    // =====================

    const bodyHorizontal = Math.abs(shoulder.y - ankle.y) < 0.25;
    const handsBelowShoulder = wrist.y > shoulder.y;

    const validPlankPosition =
        bodyHorizontal &&
        handsBelowShoulder;

    // DEBUG LOGS
    console.log(
        "PLANK DEBUG →",
        "angle:", Math.round(bodyAngle),
        "horizontal:", bodyHorizontal,
        "handsBelow:", handsBelowShoulder,
        "timer:", plankTime
    );

    if (!validPlankPosition) {

        startTime = null;
        plankTime = 0;

        console.log("PLANK STAGE → INVALID POSITION");

        return {
            plankTime,
            bodyAngle,
            stage: "INVALID_POSITION",
            feedback: "Get into plank position"
        };
    }

    // =====================
    // BODY STRAIGHT CHECK
    // =====================

    if (bodyAngle > 160) {

        if (!startTime) {
            startTime = Date.now();
        }

        plankTime = Math.floor((Date.now() - startTime) / 1000);

        console.log("PLANK STAGE → HOLDING", "time:", plankTime);

        return {
            plankTime,
            bodyAngle,
            stage: "HOLDING",
            feedback: "Hold steady"
        };

    } else {

        startTime = null;
        plankTime = 0;

        console.log("PLANK STAGE → BAD FORM");

        return {
            plankTime,
            bodyAngle,
            stage: "BAD_FORM",
            feedback: "Keep body straight"
        };

    }

}