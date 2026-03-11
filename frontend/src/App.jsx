import { useState } from "react";
import CameraView from "./components/CameraView";
import WorkoutBuilder from "./components/WorkoutBuilder";

function App() {

    const [mode, setMode] = useState(null);
    const [workoutQueue, setWorkoutQueue] = useState(null);

    function startWorkout(queue) {

        console.log("Workout queue:", queue);

        setWorkoutQueue(queue);
        setMode("guided");
    }

    function startManual() {
        setMode("manual");
    }

    return (

        <div style={{ textAlign: "center", padding: "40px" }}>

            {/* HOME SCREEN */}

            {!mode && (

                <div>

                    <h1>AI Fitness Coach</h1>

                    <button
                        onClick={startManual}
                        style={{ margin: "10px", padding: "12px 25px" }}
                    >
                        Manual Workout
                    </button>

                    <button
                        onClick={() => setMode("builder")}
                        style={{ margin: "10px", padding: "12px 25px" }}
                    >
                        Guided Workout
                    </button>

                </div>

            )}

            {/* WORKOUT BUILDER */}

            {mode === "builder" && (
                <WorkoutBuilder onStartWorkout={startWorkout} />
            )}

            {/* MANUAL CAMERA */}

            {mode === "manual" && (
                <CameraView workoutQueue={null} />
            )}

            {/* GUIDED CAMERA */}

            {mode === "guided" && (
                <CameraView workoutQueue={workoutQueue} />
            )}

        </div>

    );
}

export default App;