import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

let poseLandmarker = null;

export async function initPose() {

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
  );

  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "/models/pose_landmarker_heavy.task"
    },
    runningMode: "VIDEO",
    numPoses: 1
  });

}

export function detectPose(video) {

  if (!poseLandmarker) return null;

  const result = poseLandmarker.detectForVideo(video, performance.now());

  if (result.landmarks && result.landmarks.length > 0) {
    return result.landmarks[0];
  }

  return null;

}