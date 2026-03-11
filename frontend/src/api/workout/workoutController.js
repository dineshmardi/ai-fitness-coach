import { getCurrentExercise, nextExercise, resetWorkout } from "./workoutQueue";

let workoutActive = false;


// START WORKOUT
export function startWorkout() {

    workoutActive = true;

    const exercise = getCurrentExercise();

    console.log("Workout started");

    return exercise;
}


// CHECK IF TARGET COMPLETED
export function checkExerciseCompletion(reps, time) {

    if (!workoutActive) return null;

    const current = getCurrentExercise();

    if (!current) return null;


    // REP BASED EXERCISE
    if (current.target && reps >= current.target) {

        console.log("Exercise completed:", current.type);

        return nextExercise();
    }


    // TIME BASED EXERCISE
    if (current.duration && time >= current.duration) {

        console.log("Exercise completed:", current.type);

        return nextExercise();
    }

    return current;
}


// END WORKOUT
export function finishWorkout() {

    workoutActive = false;

    resetWorkout();

    console.log("Workout finished");
}