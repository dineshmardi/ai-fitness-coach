import { Navigate, useLocation, useNavigate } from "react-router-dom";
import CameraView from "../components/CameraView";

const QUEUE_STORAGE_KEY = "aiFitnessCoach.workoutQueue";
const SUMMARY_STORAGE_KEY = "aiFitnessCoach.workoutSummary";

function readStoredValue(key) {
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredValue(key, value) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures and keep the route flow working.
  }
}

export default function WorkoutSessionPage({ mode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const queue =
    mode === "guided"
      ? (location.state?.queue ?? readStoredValue(QUEUE_STORAGE_KEY))
      : null;

  if (mode === "guided" && (!Array.isArray(queue) || queue.length === 0)) {
    return <Navigate to="/workout/builder" replace />;
  }

  function finishWorkout(summary) {
    writeStoredValue(SUMMARY_STORAGE_KEY, summary);
    navigate("/workout/summary", { state: { summary }, replace: true });
  }

  return <CameraView workoutQueue={queue} onFinish={finishWorkout} />;
}
