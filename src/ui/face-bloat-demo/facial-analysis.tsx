import { useEffect, useState, useCallback } from "react";
import { Button } from "@/ui/button";
import { RotateCcw, AlertCircle } from "lucide-react";
import { detectAndCropFace, loadImageFromDataUrl } from "./utils/detect-and-crop";
import { extractAllROIs, revokeBlobUrls, canvasToBlobUrl } from "./utils/roi-extraction";
import { dataURLToBlob, blobToFile } from "./utils/face-detection";
import { RegionKey } from "./utils/landmark-utils";

type AnalysisStatus = "idle" | "loading" | "analyzing" | "completed" | "error";

// MediaPipe results interface 
interface MediaPipeResults {
  faceCropUrl: string;
  roiResults: Array<{
    regionKey: string;
    label: string;
    url: string;
  }>;
}

interface FacialAnalysisProps {
  /** The captured photo as a data URL from SelfieDemo */
  capturedPhoto: string;
  /** Callback when user wants to retake the photo */
  onRetake: () => void;
  /** Optional callback when analysis is completed successfully */
  onAnalysisComplete?: (processedPhoto: string) => void;
  /** Optional callback to pass MediaPipe results to parent */
  onMediaPipeResults?: (results: MediaPipeResults) => void;
}

interface ROIResult {
  regionKey: RegionKey;
  label: string;
  url: string;
  canvas: HTMLCanvasElement;
}

export function FacialAnalysis({ capturedPhoto, onRetake, onAnalysisComplete, onMediaPipeResults }: FacialAnalysisProps) {
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [error, setError] = useState<string>("");
  const [faceCropUrl, setFaceCropUrl] = useState<string>("");
  const [roiResults, setRoiResults] = useState<ROIResult[]>([]);
  const [progress, setProgress] = useState<string>("");

  // Cleanup blob URLs when component unmounts or results change
  const cleanupUrls = useCallback(() => {
    if (faceCropUrl) {
      URL.revokeObjectURL(faceCropUrl);
    }
    if (roiResults.length > 0) {
      revokeBlobUrls(roiResults.map(r => r.url));
    }
  }, [faceCropUrl, roiResults]);

  useEffect(() => {
    return cleanupUrls;
  }, [cleanupUrls]);

  // Main analysis function
  const runAnalysis = useCallback(async () => {
    console.log("\n🎬 === STARTING FACIAL ANALYSIS ===");
    
    try {
      setStatus("loading");
      setError("");
      setProgress("Initializing MediaPipe...");
      
      // Small delay to let UI update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Convert data URL to image element
      console.log("🖼️ Loading image from captured photo...");
      setProgress("Loading image...");
      const imageElement = await loadImageFromDataUrl(capturedPhoto);
      
      // Run face detection and cropping
      console.log("🔍 Starting face detection...");
      setStatus("analyzing");
      setProgress("Detecting face landmarks...");
      
      const faceResult = await detectAndCropFace(imageElement);
      
      if (!faceResult) {
        console.log("❌ No face detected in image");
        setStatus("error");
        setError("No face detected. Please retake in brighter light with your face centered.");
        return;
      }
      
      console.log("✅ Face detected successfully");
      setProgress("Extracting facial regions...");
      
      // Convert face crop to blob URL for display
      const faceBlobUrl = await canvasToBlobUrl(faceResult.cropCanvas);
      setFaceCropUrl(faceBlobUrl);
      
      // Extract ROI regions
      const regions: RegionKey[] = ["LEFT_EYE", "RIGHT_EYE", "LIPS_OUTER", "FACE_OVAL"];
      const rois = await extractAllROIs(
        faceResult.cropCanvas, 
        faceResult.landmarksCropSpace,
        regions
      );
      
      if (rois.length === 0) {
        console.log("⚠️ No ROI regions extracted");
        setStatus("error");
        setError("Unable to extract facial regions. Please try a different angle or lighting.");
        return;
      }
      
      console.log(`🎉 Analysis completed! Extracted ${rois.length} regions`);
      console.log("📱 Setting component status to 'completed'");
      console.log("🖼️ ROI results:", rois.map(r => ({ label: r.label, url: r.url.substring(0, 30) + "..." })));
      
      setRoiResults(rois);
      setStatus("completed");
      setProgress("");
      
      // Send MediaPipe results to parent for display
      if (onMediaPipeResults) {
        const mediaPipeResults: MediaPipeResults = {
          faceCropUrl: faceBlobUrl, // This should now be available
          roiResults: rois.map(r => ({
            regionKey: r.regionKey,
            label: r.label,
            url: r.url
          }))
        };
        console.log("📤 Sending MediaPipe results to parent");
        console.log("🖼️ Face crop URL:", faceBlobUrl ? "✅ Available" : "❌ Missing");
        onMediaPipeResults(mediaPipeResults);
      }
      
      // Also notify parent component that analysis is complete (for backward compatibility)
      if (onAnalysisComplete) {
        console.log("📤 Calling onAnalysisComplete callback");
        onAnalysisComplete(capturedPhoto);
      } else {
        console.log("ℹ️ No onAnalysisComplete callback provided");
      }
      
    } catch (error) {
      console.error("❌ Analysis failed:", error);
      
      let errorMessage = "Analysis failed. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("model") || error.message.includes("Model")) {
          errorMessage = "Failed to load analysis model. Please check your internet connection.";
        } else if (error.message.includes("WASM")) {
          errorMessage = "Failed to initialize face detection. Please refresh and try again.";
        } else if (error.message.includes("canvas") || error.message.includes("image")) {
          errorMessage = "Image processing failed. Please try a different photo.";
        }
      }
      
      setStatus("error");
      setError(errorMessage);
      setProgress("");
    }
  }, [capturedPhoto]);

  // Auto-start analysis when component mounts
  useEffect(() => {
    if (capturedPhoto && status === "idle") {
      runAnalysis();
    }
  }, [capturedPhoto, status, runAnalysis]);

  // Retry analysis
  const handleRetry = useCallback(() => {
    cleanupUrls();
    setFaceCropUrl("");
    setRoiResults([]);
    setStatus("idle");
    setError("");
    setProgress("");
    
    // Restart analysis after cleanup
    setTimeout(() => {
      runAnalysis();
    }, 100);
  }, [cleanupUrls, runAnalysis]);

  // Loading state
  if (status === "loading" || status === "analyzing") {
    return (
      <div className="w-full space-y-6">
        {/* Progress indicator */}
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-primary">
              {status === "loading" ? "Initializing Analysis" : "Analyzing Your Photo"}
            </h3>
            {progress && (
              <p className="text-sm text-muted-foreground">{progress}</p>
            )}
          </div>
        </div>
        
        {/* Scanning box placeholder */}
        <div className="relative">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl aspect-video flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                📊 Processing facial landmarks...
              </div>
              <div className="text-xs text-muted-foreground">
                This may take a few seconds
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <div className="w-full space-y-6">
        {/* Error message */}
        <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-3">
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-300">
                  Poor image quality. Please consider retaking.
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                  {error}
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetake}
                  className="text-orange-700 border-orange-300 hover:bg-orange-100"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Photo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="text-orange-700 border-orange-300 hover:bg-orange-100"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state - show results
  if (status === "completed") {
    console.log("🎨 Rendering completed state with:", { 
      faceCropUrl: !!faceCropUrl, 
      roiResultsCount: roiResults.length,
      roiLabels: roiResults.map(r => r.label)
    });
    
    return (
      <div className="w-full space-y-6">
        {/* Analysis complete header */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-primary">Analysis Complete</h3>
          <p className="text-sm text-muted-foreground">
            Your facial regions have been extracted and analyzed
          </p>
        </div>

        {/* Face crop preview */}
        {faceCropUrl && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">
              Face Detection Result
            </div>
            <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
              <img
                src={faceCropUrl}
                alt="Detected face region"
                className="w-full h-auto max-h-64 object-contain mx-auto"
              />
            </div>
          </div>
        )}

        {/* ROI Results Grid */}
        {roiResults.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">
              Extracted Facial Regions ({roiResults.length})
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {roiResults.map((roi, index) => (
                <div key={index} className="space-y-2">
                  <div className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 aspect-square">
                    <img
                      src={roi.url}
                      alt={roi.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    {roi.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onRetake}
            className="flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Photo
          </Button>
          <Button
            variant="outline"
            onClick={handleRetry}
            className="flex-1"
          >
            Analyze Again
          </Button>
        </div>
      </div>
    );
  }

  // Default idle state (shouldn't reach here due to auto-start)
  return (
    <div className="w-full text-center py-8">
      <p className="text-muted-foreground">Preparing analysis...</p>
    </div>
  );
}
