// Workout Queue System

let workoutQueue = [];

let currentIndex = 0;


// SET WORKOUT PLAN
export function setWorkoutQueue(queue) {
    workoutQueue = queue;
    currentIndex = 0;
}


// GET CURRENT STEP
export function getCurrentExercise() {
    return workoutQueue[currentIndex];
}


// MOVE TO NEXT STEP
export function nextExercise() {
    currentIndex++;

    if (currentIndex >= workoutQueue.length) {
        return null; // workout finished
    }

    return workoutQueue[currentIndex];
}


// RESET WORKOUT
export function resetWorkout() {
    workoutQueue = [];
    currentIndex = 0;
}