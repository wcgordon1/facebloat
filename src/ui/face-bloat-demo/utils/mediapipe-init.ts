import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

// Singleton instance for MediaPipe Face Landmarker
let faceLandmarker: FaceLandmarker | null = null;
let initializationPromise: Promise<FaceLandmarker> | null = null;

/**
 * Get or initialize the MediaPipe Face Landmarker singleton
 * Uses CDN for WASM files and local model file
 */
export async function getFaceLandmarker(): Promise<FaceLandmarker> {
  console.log("🔄 getFaceLandmarker called");
  
  // Return existing instance if available
  if (faceLandmarker) {
    console.log("✅ Returning existing FaceLandmarker instance");
    return faceLandmarker;
  }
  
  // Return existing initialization promise if in progress
  if (initializationPromise) {
    console.log("⏳ FaceLandmarker initialization in progress, waiting...");
    return initializationPromise;
  }
  
  // Start new initialization
  console.log("🚀 Initializing new FaceLandmarker instance");
  initializationPromise = initializeFaceLandmarker();
  
  try {
    faceLandmarker = await initializationPromise;
    console.log("✅ FaceLandmarker initialized successfully");
    return faceLandmarker;
  } catch (error) {
    // Reset on failure so next call can retry
    initializationPromise = null;
    console.error("❌ FaceLandmarker initialization failed:", error);
    throw error;
  }
}

/**
 * Internal initialization function
 */
async function initializeFaceLandmarker(): Promise<FaceLandmarker> {
  console.log("📦 Loading MediaPipe WASM files from CDN...");
  
  // Always load WASM assets from jsDelivr CDN
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  
  console.log("✅ WASM files loaded successfully");
  console.log("🤖 Creating FaceLandmarker with model from /models/face_landmarker.task...");
  
  const landmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      // Model hosted locally in public/models/
      modelAssetPath: "/models/face_landmarker.task",
    },
    runningMode: "IMAGE",
    numFaces: 1,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
    minFaceDetectionConfidence: 0.6,
    minFacePresenceConfidence: 0.6,
    minTrackingConfidence: 0.5,
  });
  
  console.log("✅ FaceLandmarker created with config:");
  console.log("  - Running mode: IMAGE");
  console.log("  - Max faces: 1");
  console.log("  - Face detection confidence: 0.6");
  console.log("  - Face presence confidence: 0.6");
  console.log("  - Output blendshapes: true");
  console.log("  - Output transformation matrices: true");
  
  return landmarker;
}

/**
 * Reset the singleton (useful for testing or error recovery)
 */
export function resetFaceLandmarker(): void {
  console.log("🔄 Resetting FaceLandmarker singleton");
  faceLandmarker = null;
  initializationPromise = null;
}
