import { useRef, useState } from "react";
import { exerciseConfig } from "../exercises/exerciseConfig";

import { initPose, detectPose } from "../pose/poseDetection";
import WorkoutHUD from "./WorkoutHUD";

// ROUTER FUNCTIONS
import { analyzeExercise, setExercise } from "../exercises/exerciseRouter";
import { saveWorkoutSession } from "../api/workoutApi"; //new added api
import { speak } from "../voice/speak";
// import { startWorkout, checkExerciseCompletion } from "../workout/workoutController";
// import { setWorkoutQueue } from "../workout/workoutQueue";

export default function CameraView({ workoutQueue, onFinish }) {
  //checking modes
  //const isGuidedMode = workoutQueue && workoutQueue.length > 0;
  const isGuidedMode = Array.isArray(workoutQueue) && workoutQueue.length > 0;

  // VIDEO + CANVAS REFERENCES
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const cameraContainerRef = useRef(null); //new scroll to camera

  // IMPORTANT: stable exercise reference for animation loop
  const exerciseRef = useRef("squat");
  //session start time
  const sessionStartRef = useRef(null);

  const workoutStartedRef = useRef(false); //new queue

  const queueIndexRef = useRef(0);
  const targetRepsRef = useRef(null);
  const sessionExercisesRef = useRef([]);

  //target reps
  const targetReps = targetRepsRef.current || 10;
  // UI STATES
  const [stage, setStage] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [exercise, setExerciseUI] = useState("squat");

  const [reps, setReps] = useState(0);
  const [angle, setAngle] = useState(0);
  const [feedback, setFeedback] = useState("");

  //rest timer
  const [restTime, setRestTime] = useState(0);
  const restTimerRef = useRef(null);
  const isRestingRef = useRef(false);

  //speak
  const lastSpokenRef = useRef("");
  const lastSpeakTimeRef = useRef(0);

  //group

  const categoryStyles = {
    "Lower Body": "rgba(74,222,128,0.08)",
    "Upper Body": "rgba(96,165,250,0.08)",
    Core: "rgba(250,204,21,0.08)",
  };

  const groupedExercises = {};

  exerciseConfig.forEach((ex) => {
    if (!groupedExercises[ex.category]) {
      groupedExercises[ex.category] = [];
    }
    groupedExercises[ex.category].push(ex); // store full object
  });

  // BODY SKELETON CONNECTIONS
  const connections = [
    [11, 13],
    [13, 15],
    [12, 14],
    [14, 16],
    [11, 12],
    [11, 23],
    [12, 24],
    [23, 24],
    [23, 25],
    [25, 27],
    [24, 26],
    [26, 28],
    [27, 31],
    [28, 32],
  ];

  const COLORS = {
    skeleton: "#22d3ee", // cyan lines
    joints: "#38bdf8", // light blue dots
    accent: "#a78bfa",
  };

  // ==============================
  // START CAMERA
  // ==============================
  async function startCamera() {
    await initPose();

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    videoRef.current.srcObject = stream;

    videoRef.current.onloadeddata = () => {
      videoRef.current.play();

      setCameraOn(true);

      // 🔥 scroll to camera
      setTimeout(() => {
        cameraContainerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);

      // record session start time
      // record session start time
      sessionStartRef.current = Date.now();

      // queue logic
      if (workoutQueue && workoutQueue.length > 0) {
        queueIndexRef.current = 0;

        const first = workoutQueue[0];
        console.log("First exercise object:", first);

        const firstExercise = first.type;

        setExerciseUI(firstExercise);
        exerciseRef.current = firstExercise;

        setExercise(firstExercise);

        targetRepsRef.current = first.target;

        setReps(0);
      }

      // IMPORTANT: sync router AFTER exercise is decided
      setExercise(exerciseRef.current);

      requestAnimationFrame(runPose);
    };
  }

  // ==============================
  // STOP CAMERA
  // ==============================
  function stopCamera() {
    const tracks = videoRef.current.srcObject?.getTracks();
    tracks?.forEach((track) => track.stop());

    videoRef.current.srcObject = null;

    setCameraOn(false);

    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, 640, 480);

    const duration = Math.floor((Date.now() - sessionStartRef.current) / 1000);

    // 🔥 save current exercise progress (IMPORTANT)
    if (isGuidedMode) {
      const alreadyAdded = sessionExercisesRef.current.find(
        (ex) => ex.type === exerciseRef.current,
      );

      if (!alreadyAdded) {
        sessionExercisesRef.current.push({
          type: exerciseRef.current,
          reps: reps,
        });
      }
    }

    // -------- SUMMARY FOR MANUAL MODE --------
    if (onFinish) {
      onFinish({
        exercises: isGuidedMode
          ? sessionExercisesRef.current
          : [
              {
                type: exerciseRef.current,
                reps: reps,
              },
            ],
        totalCalories: Math.floor(reps * 0.4),
        totalDuration: duration,
      });
    }

    // -------- SAVE WORKOUT --------
    const workoutData = {
      userId: "guest",
      exercises: isGuidedMode
        ? sessionExercisesRef.current
        : [
            {
              type: exerciseRef.current,
              reps: reps,
            },
          ],
      totalCalories: isGuidedMode
        ? sessionExercisesRef.current.reduce(
            (sum, ex) => sum + (ex.reps || 0) * 0.4,
            0,
          )
        : Math.floor(reps * 0.4),
      totalDuration: duration,
    };

    console.log("Saving workout:", workoutData);

    saveWorkoutSession(workoutData);
  }

  // ==============================
  // DRAW BODY SKELETON
  // ==============================
  function drawPose(landmarks) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // DRAW LINES
    connections.forEach(([a, b]) => {
      const x1 = landmarks[a].x * width;
      const y1 = landmarks[a].y * height;

      const x2 = landmarks[b].x * width;
      const y2 = landmarks[b].y * height;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = COLORS.skeleton;
      ctx.lineWidth = 2;

      // smooth edges
      ctx.lineCap = "round";

      // glow effect
      ctx.shadowColor = COLORS.skeleton;
      ctx.shadowBlur = 8;
      ctx.stroke();
    });

    // DRAW JOINT POINTS
    landmarks.forEach((point) => {
      const x = point.x * width;
      const y = point.y * height;

      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = COLORS.joints;

      // glow effect
      ctx.shadowColor = COLORS.joints;
      ctx.shadowBlur = 6;
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  }

  // ==============================
  // MAIN POSE LOOP
  // ==============================
  function runPose() {
    //rest timer guard for not trigger line skeleton
    if (isRestingRef.current) {
      requestAnimationFrame(runPose);
      return;
    }

    const video = videoRef.current;

    if (video && video.readyState === 4) {
      // const landmarks = detectPose(video);
      const landmarks = detectPose(video);
      if (!landmarks) {
        requestAnimationFrame(runPose);
        return;
      }

      if (landmarks) {
        drawPose(landmarks);

        // ALWAYS read exercise from ref (stable)
        const currentExercise = exerciseRef.current;

        const result = analyzeExercise(landmarks);

        if (result) {
          if (currentExercise === "plank") {
            if (result.plankTime !== undefined) {
              setReps(result.plankTime);
              if (
                result.plankTime >=
                (workoutQueue?.[queueIndexRef.current]?.duration || 0)
              ) {
                sessionExercisesRef.current.push({
                  type: "plank",
                  duration: result.plankTime,
                });
              }
            }

            if (result.bodyAngle !== undefined) {
              setAngle(result.bodyAngle);
            }
          } else {
            if (result.reps !== undefined) {
              setReps(result.reps);
            }

            // QUEUE CHECK
            // QUEUE CHECK
            if (
              workoutQueue &&
              targetRepsRef.current !== null &&
              !workoutStartedRef.current
            ) {
              if (result.reps >= targetRepsRef.current) {
                workoutStartedRef.current = true;

                console.log("Exercise completed");
                sessionExercisesRef.current.push({
                  type: exerciseRef.current,
                  reps: result.reps,
                });

                queueIndexRef.current += 1;

                // WORKOUT FINISHED
                if (queueIndexRef.current >= workoutQueue.length) {
                  console.log("Workout finished");

                  const duration = Math.floor(
                    (Date.now() - sessionStartRef.current) / 1000,
                  );

                  const summaryData = {
                    exercises: sessionExercisesRef.current,
                    totalCalories: sessionExercisesRef.current.reduce(
                      (sum, ex) => sum + (ex.reps || 0) * 0.4,
                      0,
                    ),
                    totalDuration: duration,
                  };

                  if (onFinish) {
                    onFinish(summaryData);
                  }

                  stopCamera();
                  return;
                }

                const next = workoutQueue[queueIndexRef.current];
                const nextExercise = next.type;

                targetRepsRef.current = next.target;

                // ===== START REST TIMER =====

                isRestingRef.current = true;
                setRestTime(20);
                setFeedback("Rest for 20 seconds");

                let time = 20;

                restTimerRef.current = setInterval(() => {
                  time -= 1;

                  setRestTime(time);

                  if (time <= 0) {
                    clearInterval(restTimerRef.current);

                    console.log("Starting next exercise:", nextExercise);

                    setExercise(nextExercise);
                    setExerciseUI(nextExercise);
                    exerciseRef.current = nextExercise;

                    setReps(0);

                    setFeedback("Start " + nextExercise);

                    isRestingRef.current = false;
                    workoutStartedRef.current = false;
                  }
                }, 1000);
              }
            }

            if (
              result.kneeAngle !== undefined ||
              result.elbowAngle !== undefined
            ) {
              setAngle(result.kneeAngle ?? result.elbowAngle);
            }
          }

          const newFeedback = result.feedback ?? "";

          setFeedback(newFeedback);

          // SPEAK CONTROL
          const now = Date.now();

          // speak only if changed + cooldown
          if (
            newFeedback &&
            newFeedback !== lastSpokenRef.current &&
            now - lastSpeakTimeRef.current > 1500
          ) {
            speak(newFeedback);

            lastSpokenRef.current = newFeedback;
            lastSpeakTimeRef.current = now;
          }
          setStage(result.stage ?? "");

          // DEBUG LOGS
          if (result.reps !== undefined) {
            console.log("reps:", result.reps);
          }

          if (result.holdTime !== undefined) {
            setAngle(result.holdTime); // reuse angle display as timer
          }

          console.log("Current Exercise:", currentExercise);
        }
      }
    }

    requestAnimationFrame(runPose);
  }

  // 🔥 FIX: correct display exercise for guided mode
  const displayExercise = isGuidedMode
    ? workoutQueue?.[0]?.type || exercise
    : exercise;

  // ==============================
  // UI
  // ==============================
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
      }}
    >
      {/* MANUAL MODE ONLY */}
      {!workoutQueue && (
        <div style={{ width: "100%", maxWidth: "980px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "18px",
            }}
          >
            <div>
              <h2 style={{ marginBottom: "6px" }}>Manual Workout</h2>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>
                Pick an exercise, then start the camera to begin tracking.
              </div>
            </div>
            <div
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.12)",
                fontSize: "11px",
                color: "rgba(255,255,255,0.7)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              Selected: {exercise}
            </div>
          </div>

          {Object.keys(groupedExercises).map((category) => (
            <div
              key={category}
              style={{
                marginBottom: "20px",
                padding: "18px",
                borderRadius: "16px",
                background:
                  categoryStyles[category] || "rgba(255,255,255,0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <h3 style={{ marginBottom: "12px" }}>{category}</h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: "14px",
                }}
              >
                {groupedExercises[category].map((ex) => {
                  const isSelected = exercise === ex.name;

                  return (
                    <div
                      key={ex.name}
                      onClick={() => {
                        setExercise(ex.name);
                        setExerciseUI(ex.name);
                        exerciseRef.current = ex.name;

                        setReps(0);
                        setAngle(0);
                        setFeedback("");
                      }}
                      style={{
                        borderRadius: "14px",
                        overflow: "hidden",
                        background: "rgba(12,17,20,0.85)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        border: isSelected
                          ? "1px solid rgba(157,255,87,0.6)"
                          : "1px solid rgba(255,255,255,0.08)",
                        boxShadow: isSelected
                          ? "0 10px 26px rgba(157,255,87,0.2)"
                          : "0 6px 16px rgba(0,0,0,0.35)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-3px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <img
                        src={ex.image}
                        alt={ex.label}
                        style={{
                          width: "100%",
                          height: "140px",
                          objectFit: "cover",
                        }}
                      />

                      <div
                        style={{
                          padding: "8px 10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "8px",
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{ex.label}</div>
                        {isSelected && (
                          <span
                            style={{
                              fontSize: "10px",
                              padding: "2px 8px",
                              borderRadius: 999,
                              color: "var(--accent)",
                              border: "1px solid rgba(157,255,87,0.4)",
                              background: "rgba(157,255,87,0.1)",
                            }}
                          >
                            Selected
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CAMERA VIEW */}
      <div
        ref={cameraContainerRef} //to camera part scroll
        style={{
          position: "relative",
          width: "90vw",
          maxWidth: "900px",
          aspectRatio: "4 / 3",
          display: cameraOn ? "block" : "none",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          width="640"
          height="480"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
        <WorkoutHUD
          exercise={exercise}
          reps={reps}
          targetReps={targetReps}
          feedback={feedback}
          restTime={restTime}
          isGuidedMode={isGuidedMode}
          workoutQueue={workoutQueue}
          queueIndex={queueIndexRef.current}
        />
      </div>

      {/* CAMERA CONTROLS */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          display: "flex",
          gap: "12px",
          padding: "10px 16px",
          borderRadius: "12px",
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 5px 20px rgba(0,0,0,0.5)",
        }}
      >
        {!cameraOn && (
          <button
            onClick={startCamera}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              background: "#22c55e",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Start {displayExercise}
          </button>
        )}

        {cameraOn && (
          <button
            onClick={stopCamera}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              background: "#ef4444",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Stop Camera
          </button>
        )}
      </div>

      {/* STATS */}
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        <div
          style={{
            padding: "12px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)" }}>
            Exercise
          </div>
          <div style={{ fontSize: "16px", fontWeight: 600 }}>
            {displayExercise}
          </div>
        </div>
        <div
          style={{
            padding: "12px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)" }}>
            {exercise === "plank" ? "Time" : "Reps"}
          </div>
          <div style={{ fontSize: "16px", fontWeight: 600 }}>
            {exercise === "plank" ? `${reps}s` : reps}
          </div>
        </div>
        <div
          style={{
            padding: "12px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)" }}>
            Stage
          </div>
          <div style={{ fontSize: "16px", fontWeight: 600 }}>
            {stage || "-"}
          </div>
        </div>
        <div
          style={{
            padding: "12px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)" }}>
            Angle
          </div>
          <div style={{ fontSize: "16px", fontWeight: 600 }}>
            {Math.round(angle)}
          </div>
        </div>
        <div
          style={{
            padding: "12px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)" }}>
            Feedback
          </div>
          <div style={{ fontSize: "14px", fontWeight: 600 }}>
            {feedback || "-"}
          </div>
        </div>
        {restTime > 0 && (
          <div
            style={{
              padding: "12px",
              borderRadius: "12px",
              background: "rgba(157,255,87,0.08)",
              border: "1px solid rgba(157,255,87,0.3)",
            }}
          >
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)" }}>
              Rest
            </div>
            <div style={{ fontSize: "16px", fontWeight: 600 }}>{restTime}s</div>
          </div>
        )}
      </div>
    </div>
  );
}
