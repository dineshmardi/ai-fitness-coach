import { useState } from "react";

export default function WorkoutBuilder({ onStartWorkout }) {

    const [exerciseType, setExerciseType] = useState("squat");
    const [value, setValue] = useState("");
    const [queue, setQueue] = useState([]);

    // ======================
    // ALL EXERCISES (SAFE LIST)
    // ======================
    const exerciseOptions = [

        // ===== REP BASED =====
        { name: "squat", type: "rep" },
        { name: "lunge", type: "rep" },
        { name: "pushup", type: "rep" },
        { name: "diamondpushup", type: "rep" },
        { name: "pikepushup", type: "rep" },

        { name: "crunch", type: "rep" },
        { name: "legraise", type: "rep" },
        { name: "vup", type: "rep" },
        { name: "flutterkicks", type: "rep" },

        { name: "mountainclimber", type: "rep" },
        { name: "sidelunge", type: "rep" },
        { name: "standingtoetouch", type: "rep" },
        { name: "touchtoes", type: "rep" },

        // ===== HOLD (TIME) =====
        { name: "plank", type: "time" },
        { name: "sideplank", type: "time" },
        { name: "headstand", type: "time" },
        { name: "childpose", type: "time" },
        { name: "glutebridge", type: "time" },
        { name: "reverseTabletop", type: "time" },
        { name: "singlelegbalance", type: "time" },
        { name: "seatedtoetouch", type: "time" }

    ];

    const currentType =
        exerciseOptions.find(ex => ex.name === exerciseType)?.type;

    // ======================
    // ADD EXERCISE
    // ======================
    function addExercise() {

        const num = Number(value);

        // 🔥 VALIDATION
        if (!num || num <= 0) {
            alert("Enter valid value");
            return;
        }

        const exercise =
            currentType === "time"
                ? { type: exerciseType, duration: num }
                : { type: exerciseType, target: num };

        setQueue(prev => [...prev, exercise]);
        setValue("");
    }

    // ======================
    // REMOVE
    // ======================
    function removeExercise(index) {
        setQueue(prev => prev.filter((_, i) => i !== index));
    }

    // ======================
    // MOVE UP / DOWN
    // ======================
    function moveUp(index) {
        if (index === 0) return;

        const newQueue = [...queue];
        [newQueue[index - 1], newQueue[index]] =
            [newQueue[index], newQueue[index - 1]];

        setQueue(newQueue);
    }

    function moveDown(index) {
        if (index === queue.length - 1) return;

        const newQueue = [...queue];
        [newQueue[index + 1], newQueue[index]] =
            [newQueue[index], newQueue[index + 1]];

        setQueue(newQueue);
    }

    // ======================
    // TOTALS
    // ======================
    const totalReps = queue.reduce((sum, ex) => sum + (ex.target || 0), 0);
    const totalTime = queue.reduce((sum, ex) => sum + (ex.duration || 0), 0);

    // ======================
    // START
    // ======================
    function startWorkout() {
        if (queue.length === 0) return;
        onStartWorkout(queue);
    }

    return (

        <div style={{
            maxWidth: "650px",
            width: "100%",
            padding: "30px",
            background: "#111",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
        }}>

            <h2 style={{ marginBottom: "20px" }}>
                Build Your Workout
            </h2>

            {/* ======================
                SELECT + INPUT
            ====================== */}
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
                    {exerciseOptions.map(ex => (
                        <option key={ex.name} value={ex.name}>
                            {ex.name}
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    placeholder={currentType === "time" ? "Seconds" : "Reps"}
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

            {/* ======================
                QUEUE LIST
            ====================== */}
            <h3>Workout Plan</h3>

            <ul style={{ textAlign: "left", paddingLeft: "10px" }}>
                {queue.map((ex, index) => (

                    <li key={index} style={{
                        marginBottom: "10px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>

                        <span>
                            {ex.type} - {ex.target
                                ? `${ex.target} reps`
                                : `${ex.duration} sec`}
                        </span>

                        <div style={{ display: "flex", gap: "5px" }}>

                            <button onClick={() => moveUp(index)}>⬆️</button>
                            <button onClick={() => moveDown(index)}>⬇️</button>
                            <button onClick={() => removeExercise(index)}>❌</button>

                        </div>

                    </li>

                ))}
            </ul>

            {/* ======================
                TOTALS
            ====================== */}
            <div style={{ marginTop: "15px" }}>
                <div>Total Reps: {totalReps}</div>
                <div>Total Time: {totalTime} sec</div>
            </div>

            {/* ======================
                START
            ====================== */}
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