import { Box, Pixel } from "./face-detection";
import { FACE_REGIONS, RegionKey } from "./landmark-utils";

/**
 * Compute ROI bounding box from landmark indices in crop coordinate space
 */
export function roiFromIndices(
  landmarksCropSpace: Pixel[],
  regionKey: RegionKey,
  cropWidth: number,
  cropHeight: number,
  padPx = 12
): Box {
  console.log(`🎯 Computing ROI for ${regionKey}`);
  
  const indices = FACE_REGIONS[regionKey];
  console.log(`📍 Using ${indices.length} landmark indices:`, indices.slice(0, 5), "...");
  
  // Extract coordinates for this region
  const regionPoints = indices.map(index => {
    if (index >= landmarksCropSpace.length) {
      console.warn(`⚠️ Landmark index ${index} out of range (max: ${landmarksCropSpace.length - 1})`);
      return { x: 0, y: 0 };
    }
    return landmarksCropSpace[index];
  });
  
  // Find bounding box of region landmarks
  const xs = regionPoints.map(p => p.x);
  const ys = regionPoints.map(p => p.y);
  
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  console.log(`📏 Raw ${regionKey} bounds: x=${minX.toFixed(1)}-${maxX.toFixed(1)}, y=${minY.toFixed(1)}-${maxY.toFixed(1)}`);
  
  // Apply padding and clamp to crop boundaries
  const paddedMinX = Math.max(0, minX - padPx);
  const paddedMinY = Math.max(0, minY - padPx);
  const paddedMaxX = Math.min(cropWidth, maxX + padPx);
  const paddedMaxY = Math.min(cropHeight, maxY + padPx);
  
  const roi: Box = {
    x: paddedMinX,
    y: paddedMinY,
    width: paddedMaxX - paddedMinX,
    height: paddedMaxY - paddedMinY
  };
  
  console.log(`📦 ${regionKey} ROI (${padPx}px padding): x=${roi.x.toFixed(1)}, y=${roi.y.toFixed(1)}, w=${roi.width.toFixed(1)}, h=${roi.height.toFixed(1)}`);
  
  // Validate ROI size
  if (roi.width <= 0 || roi.height <= 0) {
    console.warn(`⚠️ Invalid ROI size for ${regionKey}: ${roi.width} x ${roi.height}`);
  }
  
  return roi;
}

/**
 * Crop a rectangular region from a source canvas to a new canvas
 */
export function cropBoxToCanvas(sourceCanvas: HTMLCanvasElement, box: Box): HTMLCanvasElement {
  console.log(`✂️ Cropping box from canvas: ${box.width.toFixed(1)} x ${box.height.toFixed(1)} at (${box.x.toFixed(1)}, ${box.y.toFixed(1)})`);
  
  // Create destination canvas
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(box.width));
  canvas.height = Math.max(1, Math.round(box.height));
  
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get 2D context for ROI canvas");
  }
  
  // Draw the cropped region
  ctx.drawImage(
    sourceCanvas,
    box.x, box.y, box.width, box.height,  // source rectangle
    0, 0, canvas.width, canvas.height     // destination rectangle
  );
  
  console.log(`✅ ROI cropped to ${canvas.width} x ${canvas.height} canvas`);
  return canvas;
}

/**
 * Convert canvas to Blob URL for display
 */
export async function canvasToBlobUrl(canvas: HTMLCanvasElement, quality = 1.0): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to create blob from canvas"));
        return;
      }
      
      const url = URL.createObjectURL(blob);
      console.log(`🔗 Created blob URL: ${url.substring(0, 50)}...`);
      resolve(url);
    }, "image/png", quality);
  });
}

/**
 * Extract all ROI crops from a face crop canvas
 */
export async function extractAllROIs(
  faceCropCanvas: HTMLCanvasElement,
  landmarksCropSpace: Pixel[],
  regions: RegionKey[] = ["LEFT_EYE", "RIGHT_EYE", "LIPS_OUTER", "FACE_OVAL"]
): Promise<Array<{ regionKey: RegionKey; label: string; url: string; canvas: HTMLCanvasElement }>> {
  console.log(`🔍 Extracting ${regions.length} ROI regions:`, regions);
  
  const cropWidth = faceCropCanvas.width;
  const cropHeight = faceCropCanvas.height;
  
  const results: Array<{ regionKey: RegionKey; label: string; url: string; canvas: HTMLCanvasElement }> = [];
  
  // Define friendly labels for regions
  const regionLabels: Record<RegionKey, string> = {
    LEFT_EYE: "Under-eye (L)",
    RIGHT_EYE: "Under-eye (R)", 
    LIPS_OUTER: "Lips/perioral",
    FACE_OVAL: "Jawline/submental",
    CHEEK_L: "Cheek (L)",
    CHEEK_R: "Cheek (R)"
  };
  
  for (const regionKey of regions) {
    try {
      console.log(`\n🎯 Processing ${regionKey}...`);
      
      // Compute ROI bounding box
      const roiBox = roiFromIndices(landmarksCropSpace, regionKey, cropWidth, cropHeight, 12);
      
      // Skip if invalid ROI
      if (roiBox.width <= 0 || roiBox.height <= 0) {
        console.warn(`⚠️ Skipping ${regionKey} - invalid dimensions`);
        continue;
      }
      
      // Crop the region
      const roiCanvas = cropBoxToCanvas(faceCropCanvas, roiBox);
      
      // Convert to blob URL
      const blobUrl = await canvasToBlobUrl(roiCanvas);
      
      results.push({
        regionKey,
        label: regionLabels[regionKey],
        url: blobUrl,
        canvas: roiCanvas
      });
      
      console.log(`✅ ${regionKey} extracted successfully`);
      
    } catch (error) {
      console.error(`❌ Failed to extract ${regionKey}:`, error);
    }
  }
  
  console.log(`🎉 Successfully extracted ${results.length}/${regions.length} ROI regions`);
  return results;
}

/**
 * Clean up blob URLs to prevent memory leaks
 */
export function revokeBlobUrls(urls: string[]): void {
  console.log(`🧹 Cleaning up ${urls.length} blob URLs`);
  urls.forEach(url => {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      console.warn("Failed to revoke blob URL:", url, error);
    }
  });
}
