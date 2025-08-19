import { useRef, useState, useCallback, useEffect } from "react";
import { Camera, Upload, Check, X, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/ui/button";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";

type CaptureMode = "camera" | "upload" | null;
type CaptureState = "idle" | "camera-active" | "photo-taken" | "uploading" | "success";

export function SelfieCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [captureMode, setCaptureMode] = useState<CaptureMode>(null);
  const [captureState, setCaptureState] = useState<CaptureState>("idle");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);

  // Convex mutations
  const generateUploadUrl = useConvexMutation(api.selfies.generateSelfieUploadUrl);
  const uploadSelfie = useConvexMutation(api.selfies.uploadSelfie);

  // Cleanup stream when component unmounts or camera is stopped
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCaptureState("idle");
    setCaptureMode(null);
  }, [stream]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setCameraPermissionDenied(false);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });
      
      setStream(mediaStream);
      setCaptureMode("camera");
      setCaptureState("camera-active");
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraPermissionDenied(true);
      setError("Camera access denied. You can still upload a photo from your device.");
    }
  }, []);

  // Capture photo from video stream
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);
    
    // Get image data as base64
    const dataUrl = canvas.toDataURL("image/png", 0.8);
    setCapturedPhoto(dataUrl);
    
    // Convert canvas to blob/file for upload
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `selfie-${Date.now()}.png`, {
          type: "image/png"
        });
        setCapturedFile(file);
      }
    }, "image/png", 0.8);
    
    setCaptureState("photo-taken");
    
    // Stop camera after capture
    stopCamera();
  }, [stopCamera]);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image file is too large. Please choose a file under 10MB.");
      return;
    }
    
    setCapturedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setCapturedPhoto(dataUrl);
      setCaptureState("photo-taken");
      setCaptureMode("upload");
    };
    reader.readAsDataURL(file);
  }, []);

  // Upload approved photo
  const uploadPhoto = useCallback(async () => {
    if (!capturedFile || !capturedPhoto) return;
    
    setCaptureState("uploading");
    
    try {
      // Generate upload URL
      const uploadUrl = await generateUploadUrl();
      
      // Upload file to Convex storage
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": capturedFile.type },
        body: capturedFile,
      });
      
      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }
      
      const { storageId } = await uploadResponse.json();
      
      // Create image for metadata extraction
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = capturedPhoto;
      });
      
      // Save selfie record to database
      await uploadSelfie({
        storageId,
        originalFilename: capturedFile.name,
        mimeType: capturedFile.type,
        fileSize: capturedFile.size,
        captureMethod: captureMode === "camera" ? "camera" : "upload",
        metadata: {
          width: img.width,
          height: img.height,
          deviceInfo: navigator.userAgent,
        },
      });
      
      setCaptureState("success");
      
      // Reset after success message
      setTimeout(() => {
        setCapturedPhoto(null);
        setCapturedFile(null);
        setCaptureState("idle");
        setCaptureMode(null);
        setError(null);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 2000);
      
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload photo. Please try again.");
      setCaptureState("photo-taken");
    }
  }, [capturedFile, capturedPhoto, captureMode, generateUploadUrl, uploadSelfie]);

  // Reject photo and reset
  const rejectPhoto = useCallback(() => {
    setCapturedPhoto(null);
    setCapturedFile(null);
    setCaptureState("idle");
    setCaptureMode(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Retry camera access
  const retryCamera = useCallback(() => {
    setCameraPermissionDenied(false);
    setError(null);
    startCamera();
  }, [startCamera]);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Privacy Notice */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium mb-1">Privacy & Usage Notice</p>
            <p>This tool is for appearance tracking only and is not a medical diagnostic tool. Photos are processed on your device when possible and stored securely in your account.</p>
          </div>
        </div>
      </div>

      {/* Main Capture Area */}
      <div className="relative">
        {captureState === "idle" && (
          <div className="space-y-4">
            <div className="text-center space-y-2 mb-6">
              <h3 className="text-lg font-semibold text-primary">Take Your Progress Photo</h3>
              <p className="text-sm text-primary/60">Choose how you'd like to add your photo</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={startCamera}
                className="flex items-center justify-center gap-2 h-12"
                disabled={!navigator.mediaDevices}
              >
                <Camera className="h-5 w-5" />
                Take Photo with Camera
              </Button>
              
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 h-12"
              >
                <Upload className="h-5 w-5" />
                Upload from Device
              </Button>
            </div>
            
            {cameraPermissionDenied && (
              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-sm text-orange-800 dark:text-orange-300 mb-2">
                  Camera access was denied. You can still upload photos or try enabling camera access.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryCamera}
                  className="text-orange-700 border-orange-300 hover:bg-orange-100"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Camera Again
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Camera View */}
        {captureState === "camera-active" && (
          <div className="relative">
            <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto"
              />
              
              {/* Oval Mask Overlay */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  WebkitMaskImage:
                    "radial-gradient(ellipse 46% 62% at 50% 45%, #000 60%, transparent 62%)",
                  maskImage:
                    "radial-gradient(ellipse 46% 62% at 50% 45%, #000 60%, transparent 62%)",
                  background: "rgba(0,0,0,0.45)",
                }}
              />
              
              {/* Oval Guide Ring */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-[70%] w-[58%] rounded-[50%] ring-2 ring-white/85" />
              </div>
            </div>
            
            <div className="flex gap-3 mt-4">
              <Button onClick={capturePhoto} className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Capture Photo
              </Button>
              <Button variant="outline" onClick={stopCamera}>
                Cancel
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
              <p className="text-xs text-primary/60">You can approve to save or retake the photo</p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={uploadPhoto}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve & Save
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

        {/* Upload State */}
        {captureState === "uploading" && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-primary/60">Uploading your photo...</p>
          </div>
        )}

        {/* Success State */}
        {captureState === "success" && (
          <div className="text-center py-8">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3 w-fit mx-auto mb-4">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Photo uploaded successfully!
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
