import { calculateAngle } from "../utils/angleUtils";

let stage = "ENTRY";
let holdStart = null;
let reps = 0;
let lastFeedback = "";

export function resetReverseTabletop() {
  stage = "ENTRY";
  holdStart = null;
  reps = 0;
  lastFeedback = "";
}

export function analyzeReverseTabletop(landmarks) {
  if (!landmarks) return;

  // LEFT SIDE
  const shoulder = landmarks[11];
  const elbow = landmarks[13];
  const wrist = landmarks[15];
  const hip = landmarks[23];
  const knee = landmarks[25];
  const ankle = landmarks[27];

  // ANGLES
  const kneeAngle = calculateAngle(hip, knee, ankle);
  const armAngle = calculateAngle(shoulder, elbow, wrist);
  const bodyAngle = calculateAngle(shoulder, hip, knee);

  // =====================
  // 🔥 GLOBAL STANDING RESET (FIXED BUG)
  // =====================
  const isStanding =
    kneeAngle > 160 &&       // legs straight
    hip.y > shoulder.y;      // normal upright

  if (isStanding) {
    stage = "ENTRY";
    holdStart = null;

    return output("Sit down");
  }

  // =====================
  // CONDITIONS
  // =====================
  const isSitting = kneeAngle < 120;
  const kneesBent = kneeAngle > 70 && kneeAngle < 120;

  const handsBehind = wrist.x < shoulder.x;

  const hipsRaised = bodyAngle > 130;
  const hipsHigh = bodyAngle > 160;

  const armsStraight = armAngle > 150;

  console.log("STAGE:", stage, "knee:", kneeAngle, "body:", bodyAngle);

  // =====================
  // ENTRY → SIT
  // =====================
  if (stage === "ENTRY") {
    if (!isSitting) {
      return output("Sit down");
    }

    stage = "SETUP";
    return output("Bend your knees and place hands behind");
  }

  // =====================
  // SETUP
  // =====================
  if (stage === "SETUP") {

    if (!kneesBent) {
      return output("Bend your knees properly");
    }

    if (!handsBehind) {
      return output("Place your hands behind you");
    }

    if (armAngle < 130) {
      return output("Keep your arms ready behind");
    }

    stage = "LIFT";
    return output("Lift your hips up");
  }

  // =====================
  // LIFT (PROGRESSIVE)
  // =====================
  if (stage === "LIFT") {

    if (!hipsRaised) {
      return output("Lift your hips");
    }

    if (!armsStraight) {
      return output("Straighten your arms");
    }

    if (!hipsHigh) {
      return output("Lift your hips higher");
    }

    stage = "HOLD";
    holdStart = Date.now();

    return output("Perfect hold this position");
  }

  // =====================
  // HOLD
  // =====================
  if (stage === "HOLD") {

    const time = (Date.now() - holdStart) / 1000;

    if (!hipsHigh) {
      stage = "LIFT";
      return output("Keep your hips up");
    }

    if (time < 10) {
      return output(`Hold ${Math.floor(10 - time)} seconds`);
    }

    stage = "DOWN";
    return output("Slowly go down");
  }

  // =====================
  // DOWN
  // =====================
  if (stage === "DOWN") {

    if (hipsRaised) {
      return output("Lower your hips slowly");
    }

    reps++;
    stage = "LIFT";

    return output(`Good. Rep ${reps}. Lift again`);
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