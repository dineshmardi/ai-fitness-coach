import { calculateAngle } from "../utils/angleUtils";
import { smooth } from "../utils/smoothing";

// =====================
const PLANK_MIN = 150;

const KNEE_DRIVE = 100;
const LEG_STRAIGHT = 150;

// hip control
const HIP_HIGH = -0.12;
const HIP_LOW = 0.15;

// =====================
let stage = "PLANK";
let lastLeg = null;
let reps = 0;
let lastFeedback = "";

// =====================
export function resetMountainClimber() {
  stage = "PLANK";
  lastLeg = null;
  reps = 0;
  lastFeedback = "";
}

// =====================
export function analyzeMountainClimber(landmarks) {
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
  const leftKnee = smooth("mc_lk", calculateAngle(lHip, lKnee, lAnkle));
  const rightKnee = smooth("mc_rk", calculateAngle(rHip, rKnee, rAnkle));

  const leftBody = smooth("mc_lb", calculateAngle(lShoulder, lHip, lAnkle));
  const rightBody = smooth("mc_rb", calculateAngle(rShoulder, rHip, rAnkle));

  const bodyAngle = (leftBody + rightBody) / 2;

  // =====================
  // HIP CONTROL
  // =====================
  const avgHipY = (lHip.y + rHip.y) / 2;
  const avgShoulderY = (lShoulder.y + rShoulder.y) / 2;

  const hipDelta = avgHipY - avgShoulderY;

  const hipsTooHigh = hipDelta < HIP_HIGH;
  const hipsTooLow = hipDelta > HIP_LOW;

  // =====================
  // 🔥 GLOBAL CHECK (FIXED)
  // =====================
  if (bodyAngle < 120) {
    stage = "PLANK";
    lastLeg = null;
    return output("Get into plank position");
  }

  // =====================
  // PLANK QUALITY
  // =====================
  if (bodyAngle < PLANK_MIN) {
    return output("Keep your body straight");
  }

  if (hipsTooHigh) {
    return output("Lower your hips");
  }

  if (hipsTooLow) {
    return output("Lift your hips slightly");
  }

  // =====================
  // KNEE DRIVE
  // =====================
  const leftDrive = leftKnee < KNEE_DRIVE && rightKnee > LEG_STRAIGHT;
  const rightDrive = rightKnee < KNEE_DRIVE && leftKnee > LEG_STRAIGHT;

  console.log("stage:", stage, "body:", bodyAngle);

  // =====================
  // START
  // =====================
  if (stage === "PLANK") {

    if (leftDrive) {
      stage = "RUN";
      lastLeg = "LEFT";
      return output("Good, now switch legs");
    }

    if (rightDrive) {
      stage = "RUN";
      lastLeg = "RIGHT";
      return output("Good, now switch legs");
    }

    return output("Bring one knee forward");
  }

  // =====================
  // RUN
  // =====================
  if (stage === "RUN") {

    if (leftDrive && lastLeg === "RIGHT") {
      reps++;
      lastLeg = "LEFT";
      return output(`Rep ${reps}`);
    }

    if (rightDrive && lastLeg === "LEFT") {
      reps++;
      lastLeg = "RIGHT";
      return output(`Rep ${reps}`);
    }

    if (!leftDrive && !rightDrive) {
      return output("Drive your knees forward");
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