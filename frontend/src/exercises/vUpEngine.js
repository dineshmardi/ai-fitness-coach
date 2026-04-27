import { calculateAngle } from "../utils/angleUtils";

// =====================
const BODY_UP_ANGLE = 140;
const BODY_DOWN_ANGLE = 165;
const LEG_UP_DIFF = 0.06;
const SHOULDER_LIFT = 0.03;

// =====================
let stage = "ENTRY";
let reps = 0;
let lastFeedback = "";
let exerciseStarted = false; // 🔥 lock

// =====================
export function resetVUp() {
  stage = "ENTRY";
  reps = 0;
  lastFeedback = "";
  exerciseStarted = false;
}

// =====================
export function analyzeVUp(landmarks) {
  if (!landmarks) return;

  const lShoulder = landmarks[11];
  const lHip = landmarks[23];
  const lKnee = landmarks[25];
  const lAnkle = landmarks[27];

  const rShoulder = landmarks[12];
  const rHip = landmarks[24];
  const rKnee = landmarks[26];
  const rAnkle = landmarks[28];

  // =====================
  // ANGLE
  // =====================
  const bodyAngle =
    (calculateAngle(lShoulder, lHip, lKnee) +
     calculateAngle(rShoulder, rHip, rKnee)) / 2;

  // =====================
  // CONDITIONS
  // =====================
  const isLying =
    Math.abs(lShoulder.y - lHip.y) < 0.15 &&
    Math.abs(rShoulder.y - rHip.y) < 0.15;

  const shouldersUp =
    Math.abs(lShoulder.y - lHip.y) > SHOULDER_LIFT;

  const legsUp =
    lAnkle.y < lHip.y - LEG_UP_DIFF &&
    rAnkle.y < rHip.y - LEG_UP_DIFF;

  const bodyUp = bodyAngle < BODY_UP_ANGLE;
  const bodyDown = bodyAngle > BODY_DOWN_ANGLE;

  console.log({ stage, isLying, shouldersUp, legsUp, bodyAngle, reps });

  // =====================
  // 🔥 ONLY CHECK LYING BEFORE START
  // =====================
  if (!exerciseStarted) {
    if (!isLying) {
      return output("Lie down on the floor");
    }
  }

  // =====================
  // ENTRY
  // =====================
  if (stage === "ENTRY") {

    if (!shouldersUp) {
      return output("Lift your shoulders slightly");
    }

    stage = "UP";
    exerciseStarted = true; // 🔥 lock starts here
    return output("Lift your legs and upper body together");
  }

  // =====================
  // UP
  // =====================
  if (stage === "UP") {

    if (!(shouldersUp && legsUp)) {
      return output("Lift both legs and upper body");
    }

    if (bodyUp) {
      stage = "TOP";
      return output("Good, now go down slowly");
    }

    return output("");
  }

  // =====================
  // TOP HOLD (prevents early count)
  // =====================
  if (stage === "TOP") {

    if (!bodyUp) {
      stage = "DOWN";
    }

    return output("");
  }

  // =====================
  // DOWN
  // =====================
  if (stage === "DOWN") {

    if (!bodyDown) {
      return output("Lower your body fully");
    }

    // ✅ FULL REP ONLY HERE
    reps++;
    stage = "UP";

    return output(`Good rep ${reps}`);
  }

  return null;

  function output(msg) {
    if (msg === lastFeedback) {
      return { stage, feedback: "", reps };
    }

    lastFeedback = msg;
    return { stage, feedback: msg, reps };
  }
}