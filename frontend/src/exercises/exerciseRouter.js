import { analyzeSquat, resetSquat } from "./squatEngine";

let currentExercise = "squat";

export function setExercise(name) {
  currentExercise = name;

  // reset state when switching exercise
  if (name === "squat") resetSquat();
}

export function analyzeExercise(landmarks) {

  if (currentExercise === "squat") {
    return analyzeSquat(landmarks);
  }

  return {
    reps: 0,
    feedback: "Select Exercise",
    stage: "-"
  };

}