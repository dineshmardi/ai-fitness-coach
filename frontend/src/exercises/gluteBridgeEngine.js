import { calculateAngle } from "../utils/angleUtils";
import { smooth } from "../utils/smoothing";

const THRESHOLDS = {
  BODY_HORIZONTAL: 0.15,

  KNEE_MIN: 50,
  KNEE_MAX: 130,

  HIP_LIFT_START: 0.08,   // start lift
  HIP_LIFT_TOP: 0.12,     // top detection

  STRAIGHT_LINE: 150,
  HOLD_TIME: 2000
};

let stage = "SETUP";
let reps = 0;

let holdStart = null;
let lastFeedback = "";

export function resetGluteBridge() {
  stage = "SETUP";
  reps = 0;
  holdStart = null;
  lastFeedback = "";
}

export function analyzeGluteBridge(landmarks) {
  if (!landmarks) return null;

  // LEFT SIDE
  const shoulder = landmarks[11];
  const hip = landmarks[23];
  const knee = landmarks[25];
  const ankle = landmarks[27];

  // ANGLES
  let kneeAngle = smooth("knee", calculateAngle(hip, knee, ankle));
  let bodyAngle = smooth("body", calculateAngle(shoulder, hip, knee));

  const horizontalDiff = Math.abs(shoulder.y - hip.y);
  const hipLift = Math.abs(shoulder.y - hip.y);

  console.log(
    "Stage:", stage,
    "Knee:", Math.round(kneeAngle),
    "Body:", Math.round(bodyAngle),
    "HipLift:", hipLift.toFixed(2)
  );

  // =========================
  // STAGE MACHINE
  // =========================

  // -------- SETUP --------
  if (stage === "SETUP") {

    if (horizontalDiff > THRESHOLDS.BODY_HORIZONTAL) {
      return output("Lie down on your back");
    }

    if (kneeAngle > 150) {
      return output("Bend your knees and keep feet flat");
    }

    if (kneeAngle < THRESHOLDS.KNEE_MIN || kneeAngle > THRESHOLDS.KNEE_MAX) {
      return output("Adjust your knee position");
    }

    // move to UP stage
    stage = "UP";
    return output("Lift your hips");
  }

  // -------- UP --------
  if (stage === "UP") {

    if (hipLift < THRESHOLDS.HIP_LIFT_START) {
      return output("Lift your hips");
    }

    if (bodyAngle < THRESHOLDS.STRAIGHT_LINE) {
      return output("Lift higher, make a straight line");
    }

    // reached top → go HOLD
    stage = "HOLD";
    holdStart = Date.now();
    return output("Perfect, hold this position");
  }

  // -------- HOLD --------
  if (stage === "HOLD") {

    const holdTime = Date.now() - holdStart;

    if (holdTime < THRESHOLDS.HOLD_TIME) {
      return output(""); // no spam
    }

    // go DOWN
    stage = "DOWN";
    return output("Good, now lower slowly");
  }

  // -------- DOWN --------
  if (stage === "DOWN") {

    if (hipLift > THRESHOLDS.HIP_LIFT_START) {
      return output(""); // just lowering, no instructions
    }

    // reached bottom → rep complete
    reps++;
    stage = "SETUP";
    holdStart = null;

    return output(`Rep counted ${reps}`);
  }

  return null;

  // =========================
  // OUTPUT CONTROL
  // =========================
  function output(msg) {
    if (!msg || msg === lastFeedback) {
      return { reps, stage, feedback: "" };
    }

    lastFeedback = msg;

    return {
      reps,
      stage,
      feedback: msg,
      kneeAngle,
      bodyAngle
    };
  }
}