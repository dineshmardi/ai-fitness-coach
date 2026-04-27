import { calculateAngle } from "../utils/angleUtils";

// =====================
const LEG_DIFF = 0.06;
const KNEE_STRAIGHT = 150;
const SHOULDER_LIFT = 0.02;
const HOLD_TIME = 10;

// =====================
let stage = "STANDING";
let reps = 0;
let lastLeg = null;
let holdStart = null;
let lastFeedback = "";

// =====================
export function resetFlutterKicks() {
  stage = "STANDING";
  reps = 0;
  lastLeg = null;
  holdStart = null;
  lastFeedback = "";
}

// =====================
export function analyzeFlutterKicks(landmarks) {
  if (!landmarks) return;

  // LEFT
  const lShoulder = landmarks[11];
  const lHip = landmarks[23];
  const lKnee = landmarks[25];
  const lAnkle = landmarks[27];

  // RIGHT
  const rShoulder = landmarks[12];
  const rHip = landmarks[24];
  const rKnee = landmarks[26];
  const rAnkle = landmarks[28];

  // =====================
  // ANGLES
  // =====================
  const leftKneeAngle = calculateAngle(lHip, lKnee, lAnkle);
  const rightKneeAngle = calculateAngle(rHip, rKnee, rAnkle);

  // =====================
  // POSTURE DETECTION
  // =====================
  const isLying =
    Math.abs(lShoulder.y - lHip.y) < 0.05 &&
    Math.abs(rShoulder.y - rHip.y) < 0.05;

  const shouldersUp =
    Math.abs(lShoulder.y - lHip.y) > SHOULDER_LIFT ||
    Math.abs(rShoulder.y - rHip.y) > SHOULDER_LIFT;

  // =====================
  // LEG MOVEMENT
  // =====================
  const legDiff = lAnkle.y - rAnkle.y;

  const leftUp =
    legDiff < -LEG_DIFF && leftKneeAngle > KNEE_STRAIGHT;

  const rightUp =
    legDiff > LEG_DIFF && rightKneeAngle > KNEE_STRAIGHT;

  // =====================
  console.log({
    stage,
    isLying,
    shouldersUp,
    leftUp,
    rightUp,
    reps
  });

  // =====================
  // GLOBAL SAFETY (VERY IMPORTANT)
  // =====================
  if (!isLying) {
    stage = "STANDING";
    holdStart = null;
    lastLeg = null;
    return output("Lie down on the floor");
  }

  // =====================
  // STANDING → SETUP
  // =====================
  if (stage === "STANDING") {
    reps = 0;
    lastLeg = null;
    holdStart = null;

    stage = "SETUP";
    return output("Lift your shoulders slightly");
  }

  // =====================
  // SETUP → SHOULDER CHECK
  // =====================
  if (stage === "SETUP") {

    if (!shouldersUp) {
      return output("Lift your shoulders a little");
    }

    stage = "START";
    holdStart = null;
    return output("Feel your core and lift one leg straight");
  }

  // =====================
  // START → MAIN EXERCISE
  // =====================
  if (stage === "START") {

    if (!shouldersUp) {
      stage = "SETUP";
      holdStart = null;
      return output("Keep your shoulders lifted");
    }

    // start hold timer ONLY when movement begins
    if (!holdStart && (leftUp || rightUp)) {
      holdStart = Date.now();
    }

    // =====================
    // HOLD CHECK
    // =====================
    if (holdStart) {
      const time = (Date.now() - holdStart) / 1000;

      if (time >= HOLD_TIME) {
        stage = "RESTART";
        holdStart = null;
        return output("Nice hold bravo");
      }
    }

    // =====================
    // REP COUNTING
    // =====================
    if (leftUp) {
      if (lastLeg !== "LEFT") {
        reps++;
        lastLeg = "LEFT";
        return output(`Rep ${reps}`);
      }
    }

    if (rightUp) {
      if (lastLeg !== "RIGHT") {
        reps++;
        lastLeg = "RIGHT";
        return output(`Rep ${reps}`);
      }
    }

    // =====================
    // FEEDBACK
    // =====================
    if (!leftUp && !rightUp) {
      return output("Lift one leg straight");
    }

    return output("");
  }

  // =====================
  // RESTART FLOW
  // =====================
  if (stage === "RESTART") {

    if (!shouldersUp) {
      return output("Lift your shoulders and start again");
    }

    stage = "START";
    holdStart = null;
    return output("Continue flutter kicks");
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