import { calculateAngle } from "../utils/angleUtils";
import { smooth } from "../utils/smoothing";

const THRESHOLDS = {
  ELBOW_DOWN: 95,
  ELBOW_UP: 155,

  HIP_MIN: 0.25,      // must lift hips enough
  BODY_TILT_MIN: 0.05 // must lean (not vertical)
};

let stage = "SETUP";
let reps = 0;
let ready = false;

export function resetPikePushup() {
  stage = "SETUP";
  reps = 0;
  ready = false;
}

export function analyzePikePushup(landmarks) {
  if (!landmarks) return null;

  // =========================
  // LANDMARKS
  // =========================
  const lS = landmarks[11], rS = landmarks[12];
  const lE = landmarks[13], rE = landmarks[14];
  const lW = landmarks[15], rW = landmarks[16];
  const lH = landmarks[23], rH = landmarks[24];

  // =========================
  // AVERAGE POINTS
  // =========================
  const shoulder = {
    x: (lS.x + rS.x) / 2,
    y: (lS.y + rS.y) / 2
  };

  const elbow = {
    x: (lE.x + rE.x) / 2,
    y: (lE.y + rE.y) / 2
  };

  const wrist = {
    x: (lW.x + rW.x) / 2,
    y: (lW.y + rW.y) / 2
  };

  const hip = {
    x: (lH.x + rH.x) / 2,
    y: (lH.y + rH.y) / 2
  };

  // =========================
  // ANGLE (SMOOTHED)
  // =========================
  let elbowAngle = calculateAngle(shoulder, elbow, wrist);
  elbowAngle = smooth("pike_elbow", elbowAngle);

  // =========================
  // POSITION METRICS
  // =========================
  const hipHeight = Math.abs(shoulder.y - hip.y);
  const bodyTilt = Math.abs(shoulder.x - hip.x);
  const handBelowShoulder = wrist.y > shoulder.y;

  // =========================
  // DEBUG (keep this ON)
  // =========================
  console.log(
    "Elbow:", Math.round(elbowAngle),
    "Hip:", hipHeight.toFixed(2),
    "Tilt:", bodyTilt.toFixed(2)
  );

  let feedback = "Move into position";

  // =========================
  // STRICT SETUP CHECKS
  // =========================

  // ❌ hands not on floor (sitting / standing cheat)
  if (!handBelowShoulder) {
    ready = false;
    return {
      reps,
      stage: "SETUP",
      feedback: "Place your hands on the floor"
    };
  }

  // ❌ body still vertical
  if (bodyTilt < THRESHOLDS.BODY_TILT_MIN) {
    ready = false;
    return {
      reps,
      stage: "SETUP",
      feedback: "Lean forward, don't stay upright"
    };
  }

  // ❌ hips not raised (no pike)
  if (hipHeight < THRESHOLDS.HIP_MIN) {
    ready = false;
    return {
      reps,
      stage: "SETUP",
      feedback: "Raise your hips to form a V shape"
    };
  }

  // =========================
  // READY LOCK
  // =========================
  if (!ready) {
    ready = true;
    stage = "READY";

    return {
      reps,
      stage,
      feedback: "Good posture, start push-ups"
    };
  }

  // =========================
  // REP LOGIC (ONLY AFTER READY)
  // =========================

  if (stage === "READY" && elbowAngle < 130) {
    stage = "DOWN";
    feedback = "Lower your head";
  }

  if (stage === "DOWN" && elbowAngle < THRESHOLDS.ELBOW_DOWN) {
    stage = "BOTTOM";
  }

  if (stage === "BOTTOM" && elbowAngle > 120) {
    stage = "UP";
    feedback = "Push back up";
  }

  if (stage === "UP" && elbowAngle > THRESHOLDS.ELBOW_UP) {
    reps++;
    stage = "READY";

    return {
      reps,
      stage,
      feedback: `Rep counted ${reps}`
    };
  }

  // =========================
  // CONTINUOUS FEEDBACK
  // =========================

  if (elbowAngle > 150) {
    feedback = "Go down";
  } else if (elbowAngle < 80) {
    feedback = "Don't go too low";
  }

  return {
    reps,
    stage,
    feedback
  };
}