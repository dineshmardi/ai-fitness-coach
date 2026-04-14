export default function WorkoutHUD({
    exercise,
    reps,
    targetReps,
    feedback,
    restTime,
    isGuidedMode,
    workoutQueue,
    queueIndex
}) {

    return (
        <div
            style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                background: "rgba(40,40,40,0.55)",
                backdropFilter: "blur(10px)",
                padding: "12px 18px",
                borderRadius: "10px",
                color: "white",
                minWidth: "160px",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: "14px",
                lineHeight: "1.4"
            }}
        >

            {/* Exercise Name */}
            <div style={{ fontSize: "18px", fontWeight: "600" }}>
                {exercise}
            </div>

            {/* Rep Counter */}
            <div style={{ marginTop: "8px", fontSize: "13px" }}>
                {isGuidedMode
                    ? `${reps} / ${targetReps}`
                    : `${reps} reps`}
            </div>

            {/* Progress Bar */}
            <div
                style={{
                    marginTop: "6px",
                    width: "160px",
                    height: "6px",
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: "4px",
                    overflow: "hidden"
                }}
            >
                <div
                    style={{
                        width: `${Math.min((reps / targetReps) * 100, 100)}%`,
                        height: "100%",
                        background: "#4ade80",
                        transition: "width 0.3s ease"
                    }}
                />
            </div>

            {/* Feedback */}
            <div
                style={{
                    marginTop: "6px",
                    fontWeight: "500",
                    color:
                        feedback === "Good Rep"
                            ? "#4ade80"
                            : feedback === "Go Lower"
                                ? "#facc15"
                                : "#e5e5e5"
                }}
            >
                {feedback}
            </div>

            {/* Rest Timer */}
            {isGuidedMode && restTime > 0 && (
                <div style={{ marginTop: "6px", color: "#4ade80" }}>
                    Rest: {restTime}s
                </div>
            )}

            {/* Next Exercise */}
            {isGuidedMode &&
                workoutQueue &&
                queueIndex + 1 < workoutQueue.length && (
                    <div style={{ marginTop: "6px", opacity: 0.8 }}>
                        Next: {workoutQueue[queueIndex + 1].type}
                    </div>
                )}

        </div>
    );
}