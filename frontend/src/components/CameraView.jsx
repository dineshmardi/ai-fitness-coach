import { useRef, useState } from "react";
import { initPose, detectPose } from "../pose/poseDetection";
import { analyzeExercise } from "../exercises/exerciseRouter";
// import { analyzeSquat, resetSquat } from "../exercises/squatEngine";

export default function CameraView() {

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [stage, setStage] = useState("");

    const [cameraOn, setCameraOn] = useState(false);
    const [exercise, setExercise] = useState("squat");

    const [reps, setReps] = useState(0);
    const [angle, setAngle] = useState(0);
    const [feedback, setFeedback] = useState("");

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

    async function startCamera() {

        await initPose();

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });

        videoRef.current.srcObject = stream;

        videoRef.current.onloadeddata = () => {

            videoRef.current.play();

            setCameraOn(true);

            requestAnimationFrame(runPose);

        };

    }

    function stopCamera() {

        const tracks = videoRef.current.srcObject?.getTracks();

        tracks?.forEach(track => track.stop());

        videoRef.current.srcObject = null;

        setCameraOn(false);

        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, 640, 480);

    }

    function drawPose(landmarks) {

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

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

        landmarks.forEach(point => {

            const x = point.x * width;
            const y = point.y * height;

            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fillStyle = "red";
            ctx.fill();

        });

    }

    function runPose() {

        const video = videoRef.current;

        if (video && video.readyState === 4) {

            const landmarks = detectPose(video);

            if (landmarks) {

                drawPose(landmarks);

                let result;

                if (exercise === "squat") {
                    result = analyzeSquat(landmarks);
                }

                if (result) {
                    setReps(result.reps);
                    setAngle(result.kneeAngle);
                    setFeedback(result.feedback);
                    setStage(result.stage);
                    console.log(
                        "knee:", Math.round(result.kneeAngle),
                        "hip:", Math.round(result.hipAngle),
                        "back:", Math.round(result.backAngle),
                        "drop:", result.hipDrop.toFixed(3),
                        "stage:", result.stage
                    );
                }

            }

        }

        requestAnimationFrame(runPose);

    }

    return (

        <div>

            <h2>Select Exercise</h2>

            <button onClick={() => {
                setExercise("squat");
                resetSquat();
                setReps(0);
                setAngle(0);
                setFeedback("");
            }}>
                Squat
            </button>

            <button onClick={() => {
                setExercise("pushup");
                setReps(0);
                setAngle(0);
                setFeedback("");
            }}>
                Push-up
            </button>

            <button onClick={() => {
                setExercise("plank");
                setReps(0);
                setAngle(0);
                setFeedback("");
            }}>
                Plank
            </button>

            <br /><br />

            <div style={{ position: "relative", width: "640px", height: "480px" }}>

                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    width="640"
                    height="480"
                    style={{ position: "absolute" }}
                />

                <canvas
                    ref={canvasRef}
                    width="640"
                    height="480"
                    style={{ position: "absolute" }}
                />

            </div>

            <br />

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

            <h2>Exercise: {exercise}</h2>
            <h3>Reps: {reps}</h3>
            <h3>Stage: {stage}</h3>
            <h3>Angle: {Math.round(angle)}</h3>
            <h3>Feedback: {feedback}</h3>

        </div>

    );

}