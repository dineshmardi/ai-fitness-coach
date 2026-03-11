import { analyzeSquat, resetSquat } from "./squatEngine";
import { analyzePushup, resetPushup } from "./pushupEngine";
import { analyzePlank, resetPlank } from "./plankEngine";

let currentExercise = "squat";

export function setExercise(name) {

    currentExercise = name;

    // reset correct engine
    if (name === "squat") resetSquat();
    if (name === "pushup") resetPushup();
    if (name === "plank") resetPlank();
}

export function analyzeExercise(landmarks) {

    if (currentExercise === "squat") {
        return analyzeSquat(landmarks);
    }

    if (currentExercise === "pushup") {
        return analyzePushup(landmarks);
    }

    if (currentExercise === "plank") {
        return analyzePlank(landmarks);
    }

    return null;
}