import { calculateAngle } from "../utils/angleUtils";

let stage = "UP";
let reps = 0;

let prevKneeAngle = null;
let prevHipY = null;
let startHipY = null;

export function resetSquat() {
  stage = "UP";
  reps = 0;
  prevKneeAngle = null;
  prevHipY = null;
  startHipY = null;
}

export function analyzeSquat(landmarks) {

  // LEFT SIDE
  const leftShoulder = landmarks[11];
  const leftHip = landmarks[23];
  const leftKnee = landmarks[25];
  const leftAnkle = landmarks[27];

  // RIGHT SIDE
  const rightShoulder = landmarks[12];
  const rightHip = landmarks[24];
  const rightKnee = landmarks[26];
  const rightAnkle = landmarks[28];

  // =============================
  // KNEE ANGLES (both legs)
  // =============================

  const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

  let kneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

  // smoothing
  if (prevKneeAngle !== null) {
    kneeAngle = prevKneeAngle * 0.7 + kneeAngle * 0.3;
  }

  prevKneeAngle = kneeAngle;

  // =============================
  // HIP ANGLES
  // =============================

  const leftHipAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
  const rightHipAngle = calculateAngle(rightShoulder, rightHip, rightKnee);

  const hipAngle = (leftHipAngle + rightHipAngle) / 2;

  // =============================
  // BACK ANGLE
  // =============================

  const backLeft = calculateAngle(leftShoulder, leftHip, leftAnkle);
  const backRight = calculateAngle(rightShoulder, rightHip, rightAnkle);

  const backAngle = (backLeft + backRight) / 2;

  // =============================
  // HIP DEPTH
  // =============================

  const hipY = (leftHip.y + rightHip.y) / 2;

  if (startHipY === null) {
    startHipY = hipY;
  }

  const hipDrop = hipY - startHipY;

  // =============================
  // MOVEMENT DIRECTION
  // =============================

  let movingDown = false;
  let movingUp = false;

  if (prevHipY !== null) {

    if (hipY > prevHipY) movingDown = true;

    if (hipY < prevHipY) movingUp = true;

  }

  prevHipY = hipY;

  let feedback = "Stand Straight";

  // =============================
  // POSTURE CHECK
  // =============================

  if (backAngle < 140) {
    feedback = "Keep Back Straight";
  }

  // =============================
  // STATE MACHINE
  // =============================

  if (stage === "UP" && movingDown && kneeAngle < 165) {

    stage = "MOVING_DOWN";
    feedback = "Go Down";

  }

  if (stage === "MOVING_DOWN" && kneeAngle < 110 && hipDrop > 0.05) {

    stage = "BOTTOM";
    feedback = "Good Depth";

  }

  if (stage === "BOTTOM" && movingUp) {

    stage = "MOVING_UP";
    feedback = "Push Up";

  }

  // =============================
  // REP COUNT
  // =============================

  if (stage === "MOVING_UP" && kneeAngle > 170) {

    reps++;
    feedback = "Good Rep";

    stage = "UP";
    startHipY = hipY;

  }

  // =============================
  // SHALLOW SQUAT WARNING
  // =============================

  if (stage === "MOVING_DOWN" && kneeAngle > 130) {

    feedback = "Go Lower";

  }

  return {
    reps,
    kneeAngle,
    hipAngle,
    backAngle,
    hipDrop,
    stage,
    feedback
  };

}