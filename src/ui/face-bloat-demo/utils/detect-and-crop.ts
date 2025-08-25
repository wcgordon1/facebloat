import { getFaceLandmarker } from "./mediapipe-init";
import { 
  FaceCropResult, 
  computeBoxFromLandmarks, 
  cropImageToCanvas, 
  mapLandmarksToCrop 
} from "./face-detection";
import { logRegionInfo } from "./landmark-utils";

/**
 * Main pipeline function: detect face landmarks and create a cropped face region
 */
export async function detectAndCropFace(imageElement: HTMLImageElement): Promise<FaceCropResult | null> {
  console.log("\n🚀 === STARTING FACE DETECTION PIPELINE ===");
  console.log(`📷 Input image: ${imageElement.naturalWidth} x ${imageElement.naturalHeight}`);
  
  try {
    // Initialize MediaPipe Face Landmarker
    console.log("\n1️⃣ Initializing MediaPipe Face Landmarker...");
    const landmarker = await getFaceLandmarker();
    
    // Run face landmark detection
    console.log("\n2️⃣ Running face landmark detection...");
    const startTime = performance.now();
    const result = landmarker.detect(imageElement);
    const detectionTime = performance.now() - startTime;
    
    console.log(`⏱️ Detection completed in ${detectionTime.toFixed(1)}ms`);
    console.log(`📊 Detection result:`, {
      faces: result.faceLandmarks?.length || 0,
      hasBlendshapes: !!result.faceBlendshapes?.length,
      hasTransformMatrices: !!result.facialTransformationMatrixes?.length
    });
    
    // Check if face was detected
    if (!result.faceLandmarks?.length) {
      console.log("❌ No face landmarks detected");
      return null;
    }
    
    if (result.faceLandmarks.length > 1) {
      console.log(`⚠️ Multiple faces detected (${result.faceLandmarks.length}), using first face`);
    }
    
    // Get landmarks for the first (primary) face
    const landmarks = result.faceLandmarks[0];
    console.log(`📍 Got ${landmarks.length} landmarks for face`);
    
    // Log some sample landmark coordinates for debugging
    console.log("🔍 Sample landmarks:");
    [0, 1, 2, 17, 152, 234].forEach(i => {
      if (i < landmarks.length) {
        const lm = landmarks[i];
        console.log(`  [${i}]: (${lm.x.toFixed(3)}, ${lm.y.toFixed(3)}, ${lm.z.toFixed(3)})`);
      }
    });
    
    // Log face region info for debugging
    logRegionInfo();
    
    const imageWidth = imageElement.naturalWidth;
    const imageHeight = imageElement.naturalHeight;
    
    // Compute bounding box with padding
    console.log("\n3️⃣ Computing face bounding box...");
    const faceBox = computeBoxFromLandmarks(landmarks, imageWidth, imageHeight, 0.20);
    
    // Create cropped face canvas
    console.log("\n4️⃣ Cropping face region...");
    const cropCanvas = cropImageToCanvas(imageElement, faceBox);
    
    // Map landmarks to crop coordinate space
    console.log("\n5️⃣ Mapping landmarks to crop space...");
    const landmarksCropSpace = mapLandmarksToCrop(landmarks, imageWidth, imageHeight, faceBox);
    
    // Calculate confidence score
    let confidence = 1.0; // Default confidence
    
    // If we have blendshapes, we can use them as a proxy for detection quality
    if (result.faceBlendshapes?.length) {
      const blendshapes = result.faceBlendshapes[0];
      console.log(`📈 Got ${blendshapes.categories?.length || 0} blendshapes`);
      
      // Log a few sample blendshapes
      if (blendshapes.categories?.length) {
        console.log("🎭 Sample blendshapes:");
        blendshapes.categories.slice(0, 5).forEach((cat) => {
          console.log(`  ${cat.categoryName}: ${cat.score?.toFixed(3)}`);
        });
      }
    }
    
    // Create result object
    const cropResult: FaceCropResult = {
      cropCanvas,
      originalBox: faceBox,
      cropOffsets: {
        offsetX: faceBox.x,
        offsetY: faceBox.y,
        scaleX: 1,
        scaleY: 1
      },
      landmarksCropSpace,
      confidence
    };
    
    console.log("\n✅ === FACE DETECTION PIPELINE COMPLETED ===");
    console.log(`📦 Final result:`, {
      cropSize: `${cropCanvas.width} x ${cropCanvas.height}`,
      originalBox: faceBox,
      landmarkCount: landmarksCropSpace.length,
      confidence
    });
    
    return cropResult;
    
  } catch (error) {
    console.error("\n❌ === FACE DETECTION PIPELINE FAILED ===");
    console.error("💥 Error details:", error);
    
    if (error instanceof Error) {
      // Log specific error types for debugging
      if (error.message.includes('modelAssetPath')) {
        console.error("🔍 Model loading issue - check if /models/face_landmarker.task exists");
      } else if (error.message.includes('WASM')) {
        console.error("🔍 WASM loading issue - check CDN connectivity");
      } else if (error.message.includes('canvas')) {
        console.error("🔍 Canvas operation issue - check image dimensions");
      }
    }
    
    throw error;
  }
}

/**
 * Helper to load an image from a File object
 */
export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  console.log(`📁 Loading image from file: ${file.name} (${file.size} bytes, ${file.type})`);
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      console.log(`✅ Image loaded: ${img.naturalWidth} x ${img.naturalHeight}`);
      URL.revokeObjectURL(objectUrl); // Clean up immediately
      resolve(img);
    };
    
    img.onerror = (error) => {
      console.error("❌ Failed to load image:", error);
      URL.revokeObjectURL(objectUrl); // Clean up on error
      reject(new Error(`Failed to load image from file: ${file.name}`));
    };
    
    img.src = objectUrl;
  });
}

/**
 * Helper to load an image from a data URL
 */
export async function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  console.log("📷 Loading image from data URL...");
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      console.log(`✅ Image loaded from data URL: ${img.naturalWidth} x ${img.naturalHeight}`);
      resolve(img);
    };
    
    img.onerror = (error) => {
      console.error("❌ Failed to load image from data URL:", error);
      reject(new Error("Failed to load image from data URL"));
    };
    
    img.src = dataUrl;
  });
}
