import { Button, Card, PageShell, SectionHeader } from "../ui";

export default function WorkoutSummary({ summary, goHome }) {
  if (!summary) return null;

  return (
    <PageShell maxWidth="700px">
      <Card
        variant="panel"
        padding="40px"
        style={{ width: "100%", textAlign: "center" }}
      >
        <h1>Workout Complete 🎉</h1>

        <SectionHeader title="Exercises" style={{ marginTop: "20px" }} />

        <ul style={{ listStyle: "none", padding: 0 }}>
          {summary.exercises.map((ex, i) => (
            <li key={i} style={{ margin: "10px 0" }}>
              {ex.type} —
              {ex.reps !== undefined ? ` ${ex.reps} reps` : ` ${ex.duration}s`}
            </li>
          ))}
        </ul>

        <h3 style={{ marginTop: "20px" }}>
          Calories: {Math.round(summary.totalCalories)}
        </h3>

        <h3>Duration: {summary.totalDuration}s</h3>

        <Button
          variant="primary"
          size="lg"
          onClick={goHome}
          style={{ marginTop: "30px" }}
        >
          Back to Home
        </Button>
      </Card>
    </PageShell>
  );
}
