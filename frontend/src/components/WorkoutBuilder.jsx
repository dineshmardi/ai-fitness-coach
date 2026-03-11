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

        <div style={{ marginBottom: "20px" }}>

            <h2>Build Workout</h2>

            <select
                value={exerciseType}
                onChange={(e) => setExerciseType(e.target.value)}
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
            />

            <button onClick={addExercise}>
                Add Exercise
            </button>

            <h3>Workout Plan</h3>

            <ul>
                {queue.map((ex, index) => (

                    <li key={index}>
                        {ex.type} - {ex.target ? `${ex.target} reps` : `${ex.duration} sec`}
                    </li>

                ))}
            </ul>

            <button onClick={startWorkout}>
                Start Workout
            </button>

        </div>

    );
}