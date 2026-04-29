import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import {
  Dashboard,
  HomeScreen,
  WorkoutBuilder,
  WorkoutSessionPage,
  WorkoutSummaryPage,
} from "./pages";

const QUEUE_STORAGE_KEY = "aiFitnessCoach.workoutQueue";

function App() {
  const navigate = useNavigate();

  function startWorkout(queue) {
    try {
      window.sessionStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch {
      // Ignore storage failures and continue with route state.
    }

    navigate("/workout/guided", { state: { queue } });
  }

  return (
    <Routes>
      {/* Layout Routes - Header + Sidebar */}
      <Route element={<AppLayout />}>
        <Route
          path="/"
          element={
            <HomeScreen
              startManual={() => navigate("/workout/manual")}
              openBuilder={() => navigate("/workout/builder")}
              openDashboard={() => navigate("/dashboard")}
            />
          }
        />
        <Route
          path="/workout/builder"
          element={<WorkoutBuilder onStartWorkout={startWorkout} />}
        />
        <Route path="/workout/summary" element={<WorkoutSummaryPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Full-Screen Routes - No Layout */}
      <Route
        path="/workout/manual"
        element={<WorkoutSessionPage mode="manual" />}
      />
      <Route
        path="/workout/guided"
        element={<WorkoutSessionPage mode="guided" />}
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
