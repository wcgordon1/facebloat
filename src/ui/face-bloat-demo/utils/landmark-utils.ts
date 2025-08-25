// MediaPipe Face Landmarker index sets for facial regions
// Total landmarks: 468 (includes iris refinement)
// Coordinates are normalized [0,1] in the original MediaPipe result

export const FACE_REGIONS = {
  // Face oval/jawline - comprehensive face boundary
  FACE_OVAL: [10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109],
  
  // Right eye region (from face perspective)
  RIGHT_EYE: [33,7,163,144,145,153,154,155,133,173,157,158,159,160,161,246],
  
  // Left eye region (from face perspective) 
  LEFT_EYE: [362,382,381,380,374,373,390,249,263,466,388,387,386,385,384,398],
  
  // Outer lip contour
  LIPS_OUTER: [61,146,91,181,84,17,314,405,321,375,291,308,324,318,402,317,14,87,178,88],
  
  // Left cheek/malar region (starter polygon - can be refined)
  CHEEK_L: [50,101,118,49,131,69,104,67],
  
  // Right cheek/malar region (starter polygon - can be refined)
  CHEEK_R: [280,334,349,281,361,291,324,293],
} as const;

export type RegionKey = keyof typeof FACE_REGIONS;

// Helper to validate that all indices are within MediaPipe's 468 landmark range
export function validateRegionIndices(): void {
  const maxIndex = 467; // 0-467 for 468 landmarks
  
  for (const [regionName, indices] of Object.entries(FACE_REGIONS)) {
    const invalidIndices = indices.filter(idx => idx < 0 || idx > maxIndex);
    if (invalidIndices.length > 0) {
      console.warn(`⚠️ Invalid landmark indices in ${regionName}:`, invalidIndices);
    } else {
      console.log(`✅ ${regionName}: ${indices.length} valid indices`);
    }
  }
}

// Debug helper to log region info
export function logRegionInfo(): void {
  console.log("📍 MediaPipe Face Regions:");
  for (const [name, indices] of Object.entries(FACE_REGIONS)) {
    console.log(`  ${name}: ${indices.length} landmarks`);
  }
  validateRegionIndices();
}
