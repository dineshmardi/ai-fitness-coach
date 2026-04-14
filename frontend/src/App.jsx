import { useState } from "react";
import CameraView from "./components/CameraView";
import WorkoutBuilder from "./components/WorkoutBuilder";
import HomeScreen from "./components/HomeScreen";
import Dashboard from "./components/Dashboard";
import WorkoutSummary from "./components/WorkoutSummary";

function App() {

    const [mode, setMode] = useState(null);
    const [workoutQueue, setWorkoutQueue] = useState(null);
    const [summary, setSummary] = useState(null);

    function startWorkout(queue) {
        console.log("Workout queue:", queue);
        setWorkoutQueue(queue);
        setMode("guided");
    }

    function startManual() {
        setMode("manual");
    }

    function finishWorkout(data) {
        setSummary(data);
        setMode("summary");
    }

    return (

        <div
            style={{
                minHeight: "100vh",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                fontFamily: "Inter, system-ui, sans-serif",
                textAlign: "center",
                position: "relative",
                padding: "20px"
            }}
        >

            {/* HOME SCREEN */}

            {!mode && (
                <HomeScreen
                    startManual={startManual}
                    openBuilder={() => setMode("builder")}
                    openDashboard={() => setMode("dashboard")}
                />
            )}

            {/* WORKOUT BUILDER */}

            {mode === "builder" && (
                <WorkoutBuilder onStartWorkout={startWorkout} />
            )}

            {/* MANUAL CAMERA */}

            {mode === "manual" && (
                <CameraView
                    workoutQueue={null}
                    onFinish={finishWorkout}
                />
            )}

            {/* GUIDED CAMERA */}

            {mode === "guided" && (
                <CameraView
                    workoutQueue={workoutQueue}
                    onFinish={finishWorkout}
                />
            )}

            {/* DASHBOARD */}

            {mode === "dashboard" && (
                <Dashboard />
            )}

            {/* SUMMARY */}

            {mode === "summary" && (
                <WorkoutSummary
                    summary={summary}
                    goHome={() => {
                        setMode(null);
                        setSummary(null);
                    }}
                />
            )}

        </div>

    );
}

export default App;