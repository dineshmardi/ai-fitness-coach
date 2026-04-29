import { useState } from "react";
import { Button, Card, PageShell, SectionHeader } from "../ui";

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
    { name: "seatedtoetouch", type: "time" },
  ];

  const currentType = exerciseOptions.find(
    (ex) => ex.name === exerciseType,
  )?.type;

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

    setQueue((prev) => [...prev, exercise]);
    setValue("");
  }

  // ======================
  // REMOVE
  // ======================
  function removeExercise(index) {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }

  // ======================
  // MOVE UP / DOWN
  // ======================
  function moveUp(index) {
    if (index === 0) return;

    const newQueue = [...queue];
    [newQueue[index - 1], newQueue[index]] = [
      newQueue[index],
      newQueue[index - 1],
    ];

    setQueue(newQueue);
  }

  function moveDown(index) {
    if (index === queue.length - 1) return;

    const newQueue = [...queue];
    [newQueue[index + 1], newQueue[index]] = [
      newQueue[index],
      newQueue[index + 1],
    ];

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
    <PageShell maxWidth="760px">
      <Card variant="panel" padding="30px" style={{ width: "100%" }}>
        <SectionHeader title="Create Your Workout Plan" />

        <div style={{ marginBottom: "15px" }}>
          <label className="label" htmlFor="builder-exercise">
            Exercise
          </label>
          <select
            value={exerciseType}
            onChange={(e) => setExerciseType(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "8px",
              marginRight: "10px",
            }}
          >
            {exerciseOptions.map((ex) => (
              <option key={ex.name} value={ex.name}>
                {ex.name}
              </option>
            ))}
          </select>

          <label className="label" htmlFor="builder-target">
            {exerciseType === "plank" ? "Hold Time (sec)" : "Target Reps"}
          </label>
          <input
            type="number"
            placeholder={currentType === "time" ? "Seconds" : "Reps"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "8px",
              width: "120px",
            }}
          />

          <Button
            variant="primary"
            size="sm"
            onClick={addExercise}
            style={{ marginLeft: "10px" }}
          >Add Exercise</Button>
        </div>

        <h3 style={{ marginTop: 0 }}>Workout Plan</h3>

        <ul style={{ textAlign: "left", paddingLeft: "10px" }}>
          {queue.map((ex, index) => (
            <li
              key={index}
              style={{
                marginBottom: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>
                {ex.type} -{" "}
                {ex.target ? `${ex.target} reps` : `${ex.duration} sec`}
              </span>

              <div style={{ display: "flex", gap: "5px" }}>
                <Button
                  variant="surface"
                  size="sm"
                  onClick={() => moveUp(index)}
                >
                  ⬆️
                </Button>
                <Button
                  variant="surface"
                  size="sm"
                  onClick={() => moveDown(index)}
                >
                  ⬇️
                </Button>
                <Button
                  variant="surface"
                  size="sm"
                  onClick={() => removeExercise(index)}
                >
                  ❌
                </Button>
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
        <Button
          variant="primary"
          size="lg"
          onClick={startWorkout}
          style={{ marginTop: "20px" }}
        >
          Start Guided Session
        </Button>
      </Card>
    </PageShell>
  );
}
