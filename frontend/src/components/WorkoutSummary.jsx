export default function WorkoutSummary({ summary, goHome }) {

    if (!summary) return null;

    return (

        <div
            style={{
                maxWidth: "600px",
                margin: "0 auto",
                textAlign: "center",
                padding: "40px"
            }}
        >

            <h1>Workout Complete 🎉</h1>

            <h2 style={{ marginTop: "20px" }}>Exercises</h2>

            <ul style={{ listStyle: "none", padding: 0 }}>
                {summary.exercises.map((ex, i) => (

                    <li key={i} style={{ margin: "10px 0" }}>

                        {ex.type} —

                        {ex.reps !== undefined
                            ? ` ${ex.reps} reps`
                            : ` ${ex.duration}s`}

                    </li>

                ))}
            </ul>

            <h3 style={{ marginTop: "20px" }}>
                Calories: {Math.round(summary.totalCalories)}
            </h3>

            <h3>
                Duration: {summary.totalDuration}s
            </h3>

            <button
                onClick={goHome}
                style={{
                    marginTop: "30px",
                    padding: "12px 24px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#4ade80",
                    fontWeight: "600",
                    cursor: "pointer"
                }}
            >
                Back to Home
            </button>

        </div>

    );

}