import { useRef, useState, useCallback, useEffect } from "react";
import { Camera, Check, X, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/ui/button";
import { FacialAnalysis } from "./facial-analysis";

type CaptureState = "idle" | "camera-loading" | "camera-active" | "photo-taken" | "analyzing";

// MediaPipe results interface (matching face-bloat-analyzer)
interface MediaPipeResults {
  faceCropUrl: string;
  roiResults: Array<{
    regionKey: string;
    label: string;
    url: string;
  }>;
}

interface SelfieDemoProps {
  onPhotoApproved: (croppedPhoto: string) => void;
  onCancel: () => void;
  onMediaPipeResults?: (results: MediaPipeResults) => void;
}

export function SelfieDemo({ onPhotoApproved, onCancel, onMediaPipeResults }: SelfieDemoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [captureState, setCaptureState] = useState<CaptureState>("idle");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);

  // Cleanup stream when component unmounts or camera is stopped
  const stopCamera = useCallback((resetState = true) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (resetState) {
      setCaptureState("idle");
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setCameraPermissionDenied(false);
      setCaptureState("camera-loading");
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });
      
      streamRef.current = mediaStream;
      
      if (!videoRef.current) {
        setError("Video element not found");
        setCaptureState("idle");
        return;
      }
      
      const video = videoRef.current;
      video.srcObject = mediaStream;
      
      let hasActivated = false;
      
      const activateCamera = () => {
        if (hasActivated) return;
        hasActivated = true;
        setCaptureState("camera-active");
      };
      
      // Set up video events
      video.onloadedmetadata = () => activateCamera();
      video.onloadeddata = () => activateCamera();
      video.oncanplay = () => activateCamera();
      video.oncanplaythrough = () => activateCamera();
      video.onplaying = () => activateCamera();
      video.onerror = () => {
        setError("Video playback error");
        setCaptureState("idle");
      };
      
      // Try to play
      video.play()
        .then(() => activateCamera())
        .catch(() => {
          // Don't activate on play failure, wait for events
        });
      
      // Fallback timer
      setTimeout(() => {
        if (!hasActivated) {
          activateCamera();
        }
      }, 2000);
      
      // Check for video dimensions
      const checkInterval = setInterval(() => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          clearInterval(checkInterval);
          activateCamera();
        }
      }, 500);
      
      setTimeout(() => {
        clearInterval(checkInterval);
      }, 5000);
      
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraPermissionDenied(true);
      setError("Camera access denied. Please enable camera access to analyze your face.");
      setCaptureState("idle");
    }
  }, []);

  // Capture photo from video stream
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
      return;
    }
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Flip the canvas horizontally to match what user sees
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);
    
    // Reset transformations
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL("image/png", 0.8);
    
    setCapturedPhoto(dataUrl);
    setCaptureState("photo-taken");
    
    // Stop the camera stream but preserve the photo-taken state
    stopCamera(false);
  }, [stopCamera]);

  // Start facial analysis with the captured photo
  const startAnalysis = useCallback(() => {
    if (!capturedPhoto) return;
    
    console.log("🚀 Starting facial analysis with captured photo");
    setCaptureState("analyzing");
  }, [capturedPhoto]);

  // Handle retake from facial analysis
  const handleRetakeFromAnalysis = useCallback(() => {
    console.log("🔄 Retaking photo from facial analysis");
    setCapturedPhoto(null);
    setCaptureState("idle");
    setError(null);
    // Restart camera automatically
    setTimeout(() => {
      startCamera();
    }, 100);
  }, [startCamera]);

  // Reject photo and reset
  const rejectPhoto = useCallback(() => {
    setCapturedPhoto(null);
    setCaptureState("idle");
    setError(null);
    // Restart camera automatically
    setTimeout(() => {
      startCamera();
    }, 100);
  }, [startCamera]);

  // Retry camera access
  const retryCamera = useCallback(() => {
    setCameraPermissionDenied(false);
    setError(null);
    startCamera();
  }, [startCamera]);

  // Auto-start camera when component mounts
  useEffect(() => {
    startCamera();
  }, [startCamera]);

  return (
    <div className="w-full space-y-6">
      {/* Instructions */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-primary">Position Your Face</h3>
        <p className="text-sm text-muted-foreground">
          Center your face in the oval and look straight ahead. Remove facial distractions. Ensure decent lighting. Neutral expression.
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800 dark:text-blue-300">
            <p className="font-medium mb-1">Privacy & Usage Notice</p>
            <p>This tool is for appearance tracking only and is not a medical diagnostic tool. We do not store this image anywhere.</p>
          </div>
        </div>
      </div>

      {/* Main Capture Area */}
      <div className="relative">
        {captureState === "idle" && (
          <div className="space-y-4">
            {cameraPermissionDenied && (
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-sm text-orange-800 dark:text-orange-300 mb-3">
                  Camera access was denied. Please enable camera access to analyze your face.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryCamera}
                  className="text-orange-700 border-orange-300 hover:bg-orange-100"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Enable Camera Access
                </Button>
              </div>
            )}
            
            {!cameraPermissionDenied && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Preparing camera...</p>
              </div>
            )}
          </div>
        )}

        {/* Camera View */}
        {(captureState === "camera-loading" || captureState === "camera-active") && (
          <div className="relative">
            <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto transform scale-x-[-1]"
                style={{ 
                  minHeight: '300px',
                  maxHeight: '500px',
                  backgroundColor: '#f0f0f0',
                  opacity: captureState === "camera-active" ? 1 : 0,
                  transition: 'opacity 0.3s ease-in-out'
                }}
              />
              
              {/* Oval Mask Overlay - Only show when camera is active */}
              {captureState === "camera-active" && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    WebkitMaskImage:
                      "radial-gradient(ellipse 140px 180px at 50% 45%, transparent 58%, #000 60%)",
                    maskImage:
                      "radial-gradient(ellipse 140px 180px at 50% 45%, transparent 58%, #000 60%)",
                    background: "rgba(0,0,0,0.6)",
                  }}
                />
              )}
              
              {/* Oval Guide Ring - Only show when camera is active */}
              {captureState === "camera-active" && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div 
                    className="rounded-[50%] ring-2 ring-white/90 shadow-lg"
                    style={{
                      width: '280px',
                      height: '360px',
                      maxWidth: '70vw',
                      maxHeight: '60vh',
                      position: 'absolute',
                      top: '45%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                </div>
              )}
              
              {/* Loading Overlay (during camera setup) */}
              {captureState === "camera-loading" && (
                <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-sm">Setting up camera...</p>
                  </div>
                </div>
              )}
              
              {/* Instructions (when camera is active) */}
              {captureState === "camera-active" && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm text-center">
                    Center Face
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-4">
              {captureState === "camera-active" && (
                <Button onClick={capturePhoto} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Camera className="h-4 w-4 mr-2" />
                  Capture Photo
                </Button>
              )}
              <Button variant="outline" onClick={onCancel}>
                Cancel Analysis
              </Button>
            </div>
          </div>
        )}

        {/* Photo Review */}
        {captureState === "photo-taken" && capturedPhoto && (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
              <img
                src={capturedPhoto}
                alt="Captured selfie"
                className="w-full h-auto"
              />
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-primary">How does this look?</p>
              <p className="text-xs text-muted-foreground">
                We'll crop to the oval area and start your analysis
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={startAnalysis}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Start Analysis
              </Button>
              <Button 
                variant="outline" 
                onClick={rejectPhoto}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Retake
              </Button>
            </div>
          </div>
        )}

        {/* Facial Analysis */}
        {captureState === "analyzing" && capturedPhoto && (
          <FacialAnalysis 
            capturedPhoto={capturedPhoto}
            onRetake={handleRetakeFromAnalysis}
            onAnalysisComplete={onPhotoApproved}
            onMediaPipeResults={onMediaPipeResults}
          />
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}
      </div>

      {/* Hidden canvas for photo capture and cropping */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
