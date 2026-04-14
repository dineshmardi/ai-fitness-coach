import { useState } from "react";

export default function WorkoutBuilder({ onStartWorkout }) {

    const [exerciseType, setExerciseType] = useState("squat");
    const [value, setValue] = useState("");
    const [queue, setQueue] = useState([]);

    function addExercise() {

        if (!value) return;

        const exercise =
            exerciseType === "plank"
                ? { type: exerciseType, duration: Number(value) }
                : { type: exerciseType, target: Number(value) };

        setQueue([...queue, exercise]);
        setValue("");
    }

    function startWorkout() {

        if (queue.length === 0) return;

        onStartWorkout(queue);
    }

    return (

        <div
            style={{
                maxWidth: "600px",
                width: "100%",
                padding: "30px",
                background: "#111",
                borderRadius: "16px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
            }}
        >

            <h2 style={{ marginBottom: "20px" }}>
                Build Your Workout
            </h2>

            {/* exercise selection */}

            <div style={{ marginBottom: "15px" }}>

                <select
                    value={exerciseType}
                    onChange={(e) => setExerciseType(e.target.value)}
                    style={{
                        padding: "10px",
                        borderRadius: "8px",
                        marginRight: "10px"
                    }}
                >
                    <option value="squat">Squat</option>
                    <option value="pushup">Pushup</option>
                    <option value="plank">Plank</option>
                </select>

                <input
                    type="number"
                    placeholder={exerciseType === "plank" ? "Seconds" : "Reps"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    style={{
                        padding: "10px",
                        borderRadius: "8px",
                        width: "120px"
                    }}
                />

                <button
                    onClick={addExercise}
                    style={{
                        marginLeft: "10px",
                        padding: "10px 16px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#4ade80",
                        fontWeight: "600",
                        cursor: "pointer"
                    }}
                >
                    Add
                </button>

            </div>

            {/* queue preview */}

            <h3>Workout Plan</h3>

            <ul style={{ textAlign: "left", paddingLeft: "20px" }}>
                {queue.map((ex, index) => (

                    <li key={index} style={{ marginBottom: "6px" }}>
                        {ex.type} - {ex.target ? `${ex.target} reps` : `${ex.duration} sec`}
                    </li>

                ))}
            </ul>

            {/* start button */}

            <button
                onClick={startWorkout}
                style={{
                    marginTop: "20px",
                    padding: "12px 22px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#22c55e",
                    fontWeight: "600",
                    cursor: "pointer"
                }}
            >
                Start Workout
            </button>

        </div>

    );
}