import { Navigate, useLocation, useNavigate } from "react-router-dom";
import WorkoutSummary from "./WorkoutSummary";

const SUMMARY_STORAGE_KEY = "aiFitnessCoach.workoutSummary";

function readStoredValue(key) {
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearStoredValue(key) {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore storage failures and continue rendering the route.
  }
}

export default function WorkoutSummaryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const summary =
    location.state?.summary ?? readStoredValue(SUMMARY_STORAGE_KEY);

  if (!summary) {
    return <Navigate to="/" replace />;
  }

  function goHome() {
    clearStoredValue(SUMMARY_STORAGE_KEY);
    navigate("/", { replace: true });
  }

  return <WorkoutSummary summary={summary} goHome={goHome} />;
}
