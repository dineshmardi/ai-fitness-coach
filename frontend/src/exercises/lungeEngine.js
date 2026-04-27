import { calculateAngle } from "../utils/angleUtils";
import { smooth } from "../utils/smoothing";

const THRESHOLDS = {
  FRONT_BENT: 110,
  FRONT_STRAIGHT: 160,
  BACK_BENT: 120,
  TORSO_UPRIGHT: 150
};

let stage = "UP";
let reps = 0;
let lastLeg = null; // track alternation

export function resetLunge() {
  stage = "UP";
  reps = 0;
  lastLeg = null;
}

export function analyzeLunge(landmarks) {
  if (!landmarks) return null;

  // =========================
  // LANDMARKS
  // =========================

  // LEFT
  const leftShoulder = landmarks[11];
  const leftHip = landmarks[23];
  const leftKnee = landmarks[25];
  const leftAnkle = landmarks[27];

  // RIGHT
  const rightShoulder = landmarks[12];
  const rightHip = landmarks[24];
  const rightKnee = landmarks[26];
  const rightAnkle = landmarks[28];

  // =========================
  // CENTER BODY
  // =========================

  const shoulder = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2
  };

  const hip = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2
  };

  // =========================
  // KNEE ANGLES
  // =========================

  let leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  leftKneeAngle = smooth("lunge_left_knee", leftKneeAngle);

  let rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
  rightKneeAngle = smooth("lunge_right_knee", rightKneeAngle);
  // Determine front leg (more bent)
  const isLeftFront = leftKneeAngle < rightKneeAngle;

  const frontKnee = isLeftFront ? leftKneeAngle : rightKneeAngle;
  const backKnee = isLeftFront ? rightKneeAngle : leftKneeAngle;

  const currentLeg = isLeftFront ? "left" : "right";

  // =========================
  // TORSO UPRIGHT CHECK
  // =========================

  const backLegKnee = isLeftFront ? rightKnee : leftKnee;

  let torsoAngle = calculateAngle(shoulder, hip, backLegKnee);
  torsoAngle = smooth("lunge_torso", torsoAngle);

  if (torsoAngle < THRESHOLDS.TORSO_UPRIGHT) {
    return {
      reps,
      stage: "BAD_POSTURE",
      feedback: "Keep your body upright"
    };
  }

  let feedback = "Good";

  // =========================
  // STATE MACHINE
  // =========================

  // Start going down
  if (stage === "UP" && frontKnee < 140) {
    stage = "MOVING_DOWN";
  }

  // Bottom position
  if (
    stage === "MOVING_DOWN" &&
    frontKnee < THRESHOLDS.FRONT_BENT &&
    backKnee < THRESHOLDS.BACK_BENT
  ) {
    stage = "DOWN";
  }

  // Going up
  if (stage === "DOWN" && frontKnee > 120) {
    stage = "MOVING_UP";
  }

  // Rep complete
  if (
    stage === "MOVING_UP" &&
    frontKnee > THRESHOLDS.FRONT_STRAIGHT
  ) {
    stage = "UP";

    // enforce alternating legs
    if (lastLeg !== currentLeg) {
      reps++;
      lastLeg = currentLeg;
      feedback = "Good Rep";
    } else {
      feedback = "Switch legs";
    }
  }

  // =========================
  // FEEDBACK
  // =========================

  if (frontKnee > 140) {
    feedback = "Go lower";
  } else if (backKnee > 140) {
    feedback = "Drop your back knee";
  } else if (frontKnee < 90) {
    feedback = "Too low";
  }

  return {
    reps,
    stage,
    frontKnee,
    backKnee,
    torsoAngle,
    feedback
  };
}