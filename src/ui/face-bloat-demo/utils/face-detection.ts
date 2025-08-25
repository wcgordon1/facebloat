// Core types and utilities for face detection and cropping

export interface Box {
  x: number;
  y: number; 
  width: number;
  height: number;
}

export interface Pixel {
  x: number;
  y: number;
  z?: number;
}

export interface FaceCropResult {
  cropCanvas: HTMLCanvasElement;
  originalBox: Box;
  cropOffsets: { offsetX: number; offsetY: number; scaleX: number; scaleY: number };
  landmarksCropSpace: Pixel[];
  confidence: number;
}

/**
 * Compute bounding box from MediaPipe landmarks in pixel space
 */
export function computeBoxFromLandmarks(
  landmarks: { x: number; y: number; z: number }[],
  imageWidth: number,
  imageHeight: number,
  padPercent = 0.20
): Box {
  console.log(`📐 Computing bbox from ${landmarks.length} landmarks`);
  console.log(`📏 Image dimensions: ${imageWidth} x ${imageHeight}`);
  
  // Convert normalized landmarks to pixel coordinates
  const pixelPoints = landmarks.map(lm => ({
    x: lm.x * imageWidth,
    y: lm.y * imageHeight
  }));
  
  // Find min/max coordinates
  const xs = pixelPoints.map(p => p.x);
  const ys = pixelPoints.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  console.log(`📊 Face bounds (before padding): x=${minX.toFixed(1)}, y=${minY.toFixed(1)}, w=${(maxX-minX).toFixed(1)}, h=${(maxY-minY).toFixed(1)}`);
  
  // Calculate padding based on the larger dimension
  const faceWidth = maxX - minX;
  const faceHeight = maxY - minY;
  const pad = Math.round(Math.max(faceWidth, faceHeight) * padPercent);
  
  console.log(`📏 Padding: ${pad}px (${(padPercent * 100).toFixed(0)}% of ${Math.max(faceWidth, faceHeight).toFixed(1)}px)`);
  
  // Apply padding with bounds checking
  const x = Math.max(0, minX - pad);
  const y = Math.max(0, minY - pad);
  const width = Math.min(imageWidth, maxX + pad) - x;
  const height = Math.min(imageHeight, maxY + pad) - y;
  
  const finalBox = { x, y, width, height };
  console.log(`📦 Final padded box: x=${x.toFixed(1)}, y=${y.toFixed(1)}, w=${width.toFixed(1)}, h=${height.toFixed(1)}`);
  
  return finalBox;
}

/**
 * Crop a rectangular region from an image to a new canvas
 */
export function cropImageToCanvas(
  sourceImage: HTMLImageElement,
  box: Box
): HTMLCanvasElement {
  console.log(`✂️ Cropping image region:`, box);
  
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(box.width));
  canvas.height = Math.max(1, Math.round(box.height));
  
  console.log(`🖼️ Created crop canvas: ${canvas.width} x ${canvas.height}`);
  
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get 2D context for crop canvas");
  }
  
  // Draw the cropped region
  ctx.drawImage(
    sourceImage,
    box.x, box.y, box.width, box.height,  // source rectangle
    0, 0, canvas.width, canvas.height     // destination rectangle
  );
  
  console.log(`✅ Image cropped successfully`);
  return canvas;
}

/**
 * Map normalized landmarks to crop coordinate space
 */
export function mapLandmarksToCrop(
  landmarks: { x: number; y: number; z: number }[],
  imageWidth: number,
  imageHeight: number,
  cropBox: Box
): Pixel[] {
  console.log(`🗺️ Mapping ${landmarks.length} landmarks to crop space`);
  console.log(`📍 Crop offset: (${cropBox.x}, ${cropBox.y})`);
  
  const mappedLandmarks = landmarks.map((lm, index) => {
    // Convert normalized → original pixels → crop pixels
    const originalX = lm.x * imageWidth;
    const originalY = lm.y * imageHeight;
    const cropX = originalX - cropBox.x;
    const cropY = originalY - cropBox.y;
    
    // Log first few landmarks for debugging
    if (index < 3) {
      console.log(`  Landmark ${index}: (${lm.x.toFixed(3)}, ${lm.y.toFixed(3)}) → (${originalX.toFixed(1)}, ${originalY.toFixed(1)}) → (${cropX.toFixed(1)}, ${cropY.toFixed(1)})`);
    }
    
    return {
      x: cropX,
      y: cropY,
      z: lm.z
    };
  });
  
  console.log(`✅ Landmarks mapped to crop space`);
  return mappedLandmarks;
}

/**
 * Helper to convert data URL to Blob
 */
export function dataURLToBlob(dataUrl: string): Blob {
  console.log("🔄 Converting data URL to Blob");
  
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = /data:(.*?);base64/.exec(header);
  const mime = mimeMatch?.[1] ?? "image/png";
  
  console.log(`📄 Detected MIME type: ${mime}`);
  
  const binary = atob(base64);
  const length = binary.length;
  const array = new Uint8Array(length);
  
  for (let i = 0; i < length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  
  const blob = new Blob([array], { type: mime });
  console.log(`✅ Created blob: ${blob.size} bytes, type: ${blob.type}`);
  
  return blob;
}

/**
 * Helper to convert Blob to File
 */
export function blobToFile(blob: Blob, name = "selfie.png"): File {
  console.log(`📁 Converting blob to file: ${name}`);
  
  const file = new File([blob], name, { 
    type: blob.type, 
    lastModified: Date.now() 
  });
  
  console.log(`✅ Created file: ${file.name}, ${file.size} bytes`);
  return file;
}
