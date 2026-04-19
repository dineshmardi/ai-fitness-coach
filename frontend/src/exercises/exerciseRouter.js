import { analyzeSquat, resetSquat } from "./squatEngine";
import { analyzePushup, resetPushup } from "./pushupEngine";
import { analyzePlank, resetPlank } from "./plankEngine";
import { analyzeCrunch, resetCrunch } from "./crunchEngine";
import { analyzeLunge, resetLunge } from "./lungeEngine";

let currentExercise = "squat";

export function setExercise(name) {

    currentExercise = name;

    // reset correct engine
    if (name === "squat") resetSquat();
    if (name === "pushup") resetPushup();
    if (name === "plank") resetPlank();
    if (name === "crunch") resetCrunch();
    if (name === "lunge") resetLunge();
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
    if (currentExercise === "crunch") {
        return analyzeCrunch(landmarks);
    }
    if (currentExercise === "lunge") {
        return analyzeLunge(landmarks);
    }

    return null;
}