import { calculateAngle } from "../utils/angleUtils";
import { smooth } from "../utils/smoothing";

// =====================
// CONFIG (tune if needed)
// =====================
const MIN_WIDTH = 0.25;   // too narrow
const IDEAL_WIDTH = 0.35; // good
const MAX_WIDTH = 0.55;   // too wide

const BEND_START = 140;   // detect bending
const BEND_DEEP = 100;    // good depth
const STRAIGHT = 160;     // straight leg

// =====================
let stage = "STAND";
let side = null; // "LEFT" | "RIGHT"
let reps = 0;
let lastFeedback = "";

// =====================
export function resetSideLunge() {
  stage = "STAND";
  side = null;
  reps = 0;
  lastFeedback = "";
}

// =====================
export function analyzeSideLunge(landmarks) {
  if (!landmarks) return;

  // LEFT
  const lHip = landmarks[23];
  const lKnee = landmarks[25];
  const lAnkle = landmarks[27];

  // RIGHT
  const rHip = landmarks[24];
  const rKnee = landmarks[26];
  const rAnkle = landmarks[28];

  // -------- ANGLES (SMOOTHED) --------
  const leftKnee = smooth(
    "sl_l",
    calculateAngle(lHip, lKnee, lAnkle)
  );

  const rightKnee = smooth(
    "sl_r",
    calculateAngle(rHip, rKnee, rAnkle)
  );

  // -------- WIDTH --------
  const width = Math.abs(lAnkle.x - rAnkle.x);

  console.log("STAGE:", stage, "L:", leftKnee, "R:", rightKnee, "W:", width);

  // =====================
  // STAGE: STAND (setup width)
  // =====================
  if (stage === "STAND") {

    if (width < MIN_WIDTH) {
      return output("Step your feet wider");
    }

    if (width < IDEAL_WIDTH) {
      return output("Little bit more wider");
    }

    if (width > MAX_WIDTH) {
      return output("Bring your feet slightly closer");
    }

    // width correct → wait for movement
    if (leftKnee < BEND_START && rightKnee > STRAIGHT) {
      side = "LEFT";
      stage = "DOWN";
      return output("Go down on left leg");
    }

    if (rightKnee < BEND_START && leftKnee > STRAIGHT) {
      side = "RIGHT";
      stage = "DOWN";
      return output("Go down on right leg");
    }

    return output("Good stance, now bend one side");
  }

  // =====================
  // STAGE: DOWN
  // =====================
  if (stage === "DOWN") {

    // keep width during movement
    if (width < MIN_WIDTH) {
      stage = "STAND";
      return output("Keep your feet wide");
    }

    if (side === "LEFT") {

      if (leftKnee > BEND_START) {
        return output("Bend your left knee");
      }

      if (rightKnee < STRAIGHT) {
        return output("Keep right leg straight");
      }

      if (leftKnee < BEND_DEEP) {
        stage = "UP";
        return output("Good depth, now come up");
      }
    }

    if (side === "RIGHT") {

      if (rightKnee > BEND_START) {
        return output("Bend your right knee");
      }

      if (leftKnee < STRAIGHT) {
        return output("Keep left leg straight");
      }

      if (rightKnee < BEND_DEEP) {
        stage = "UP";
        return output("Good depth, now come up");
      }
    }

    return output("");
  }

  // =====================
  // STAGE: UP
  // =====================
  if (stage === "UP") {

    if (leftKnee > STRAIGHT && rightKnee > STRAIGHT) {
      reps++;
      stage = "STAND";
      side = null;

      return output(`Rep ${reps}. Now go to other side`);
    }

    return output("Come back up");
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