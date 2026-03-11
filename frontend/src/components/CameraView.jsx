import { useRef, useState } from "react";
import { initPose, detectPose } from "../pose/poseDetection";

// ROUTER FUNCTIONS
import { analyzeExercise, setExercise } from "../exercises/exerciseRouter";
import { saveWorkoutSession } from "../api/workoutApi";//new added api

// import { startWorkout, checkExerciseCompletion } from "../workout/workoutController";
// import { setWorkoutQueue } from "../workout/workoutQueue";

export default function CameraView({ workoutQueue }) {

    // VIDEO + CANVAS REFERENCES
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // IMPORTANT: stable exercise reference for animation loop
    const exerciseRef = useRef("squat");
    //session start time
    const sessionStartRef = useRef(null);

    const workoutStartedRef = useRef(false);//new queue

    const queueIndexRef = useRef(0);
    const targetRepsRef = useRef(null);
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

    // BODY SKELETON CONNECTIONS
    const connections = [
        [11, 13], [13, 15],
        [12, 14], [14, 16],
        [11, 12],
        [11, 23], [12, 24],
        [23, 24],
        [23, 25], [25, 27],
        [24, 26], [26, 28],
        [27, 31], [28, 32]
    ];

    // ==============================
    // START CAMERA
    // ==============================
    async function startCamera() {

        await initPose();

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });

        videoRef.current.srcObject = stream;

        videoRef.current.onloadeddata = () => {

            videoRef.current.play();

            setCameraOn(true);

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

        tracks?.forEach(track => track.stop());

        videoRef.current.srcObject = null;

        setCameraOn(false);

        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, 640, 480);

        // =============================
        // SAVE WORKOUT SESSION
        // =============================

        const duration = Math.floor((Date.now() - sessionStartRef.current) / 1000);

        const workoutData = {
            userId: "guest",
            exercises: [
                {
                    type: exerciseRef.current,
                    reps: reps
                }
            ],
            totalCalories: Math.floor(reps * 0.4),
            totalDuration: duration
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
            ctx.strokeStyle = "lime";
            ctx.lineWidth = 3;
            ctx.stroke();

        });

        // DRAW JOINT POINTS
        landmarks.forEach(point => {

            const x = point.x * width;
            const y = point.y * height;

            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fillStyle = "red";
            ctx.fill();

        });
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
                        if (workoutQueue && targetRepsRef.current !== null && !workoutStartedRef.current) {

                            if (result.reps >= targetRepsRef.current) {

                                workoutStartedRef.current = true;

                                console.log("Exercise completed");

                                queueIndexRef.current += 1;

                                // WORKOUT FINISHED
                                if (queueIndexRef.current >= workoutQueue.length) {

                                    console.log("Workout finished");

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

                        if (result.kneeAngle !== undefined || result.elbowAngle !== undefined) {
                            setAngle(result.kneeAngle ?? result.elbowAngle);
                        }
                    }

                    setFeedback(result.feedback ?? "");
                    setStage(result.stage ?? "");


                    // DEBUG LOGS
                    if (result.reps !== undefined) {
                        console.log("reps:", result.reps);
                    }

                    console.log("Current Exercise:", currentExercise);
                }
            }
        }

        requestAnimationFrame(runPose);
    }

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
                alignItems: "center"
            }}
        >

            {/* MANUAL MODE ONLY */}
            {!workoutQueue && (
                <div style={{ textAlign: "center" }}>
                    <h2>Select Exercise</h2>

                    {/* SQUAT */}
                    <button onClick={() => {

                        setExercise("squat");
                        setExerciseUI("squat");
                        exerciseRef.current = "squat";

                        setReps(0);
                        setAngle(0);
                        setFeedback("");

                    }}>
                        Squat
                    </button>

                    {/* PUSHUP */}
                    <button onClick={() => {

                        setExercise("pushup");
                        setExerciseUI("pushup");
                        exerciseRef.current = "pushup";

                        setReps(0);
                        setAngle(0);
                        setFeedback("");

                    }}>
                        Push-up
                    </button>

                    {/* PLANK */}
                    <button onClick={() => {

                        setExercise("plank");
                        setExerciseUI("plank");
                        exerciseRef.current = "plank";

                        setReps(0);
                        setAngle(0);
                        setFeedback("");

                    }}>
                        Plank
                    </button>

                    <br /><br />
                </div>
            )}

            {/* CAMERA VIEW */}
            <div
                style={{
                    position: "relative",
                    width: "90vw",
                    maxWidth: "900px",
                    aspectRatio: "4 / 3",
                    display: cameraOn ? "block" : "none",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
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
                        objectFit: "cover"
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
                        height: "100%"
                    }}
                />

            </div>

            {/* CAMERA CONTROLS */}
            <div style={{ display: "flex", justifyContent: "center" }}>
                {!cameraOn && (
                    <button onClick={startCamera}>
                        Start Camera
                    </button>
                )}

                {cameraOn && (
                    <button onClick={stopCamera}>
                        Stop Camera
                    </button>
                )}
            </div>

            {/* STATS */}
            <div style={{ textAlign: "center" }}>
                <h2>Exercise: {exercise}</h2>

                <h3>
                    {exercise === "plank"
                        ? `Time: ${reps}s`
                        : `Reps: ${reps}`}
                </h3>

                <h3>Stage: {stage}</h3>
                <h3>Angle: {Math.round(angle)}</h3>
                <h3>Feedback: {feedback}</h3>

                {restTime > 0 && (
                    <h2>Rest: {restTime}s</h2>
                )}
            </div>

        </div>
    );
}