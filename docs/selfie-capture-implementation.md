# Selfie Capture Component Implementation Guide

## Overview
This document details the complete implementation of the selfie capture feature, including camera access, photo capture, file upload, and Convex integration.

## Files Created/Modified

### New Files
- `src/ui/selfie-capture.tsx` - Main selfie capture component
- `convex/selfies.ts` - Convex functions for selfie management
- `src/routes/_app/_auth/dashboard/_layout.selfie.tsx` - Selfie dashboard page
- `src/routes/_app/_auth/dashboard/_layout.exercise.tsx` - Exercise dashboard page  
- `src/routes/_app/_auth/dashboard/_layout.diet.tsx` - Diet dashboard page

### Modified Files
- `convex/schema.ts` - Added selfiePhotos table schema
- `src/routes/_app/_auth/dashboard/-ui.navigation.tsx` - Added new dashboard tabs
- `eslint.config.js` - Updated ESLint configuration
- `package.json` - Updated dependencies

## Core Implementation Details

### 1. Camera Access & Video Stream Setup

```typescript
// WebRTC camera access
const startCamera = useCallback(async () => {
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "user",
      width: { ideal: 640 },
      height: { ideal: 480 }
    },
    audio: false
  });
  
  streamRef.current = mediaStream;
  videoRef.current.srcObject = mediaStream;
}, []);
```

**Key Features:**
- Uses `getUserMedia()` API for camera access
- Stores stream in `useRef` to prevent re-render loops
- Sets up video element with proper constraints

### 2. Photo Capture from Video Stream

```typescript
const capturePhoto = useCallback(() => {
  const video = videoRef.current;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  
  // Set canvas size to match video
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  // Flip canvas horizontally for mirror effect
  ctx.scale(-1, 1);
  ctx.translate(-canvas.width, 0);
  
  // Draw video frame to canvas
  ctx.drawImage(video, 0, 0);
  
  // Convert to File object for upload
  canvas.toBlob((blob) => {
    const file = new File([blob], `selfie-${Date.now()}.png`, {
      type: 'image/png',
      lastModified: Date.now(),
    });
    
    setCapturedFile(file);
    setCapturedPhoto(canvas.toDataURL("image/png", 0.8));
    setCaptureState("photo-taken");
    stopCamera(false); // Preserve photo-taken state
  }, 'image/png', 0.8);
}, []);
```

**Key Features:**
- Captures current video frame to canvas
- Mirrors image horizontally for natural selfie view
- Converts canvas to File object for Convex upload
- Preserves state after capture

### 3. Oval Guide Overlay

```typescript
// CSS mask for oval cutout
<div
  style={{
    WebkitMaskImage: "radial-gradient(ellipse 46% 62% at 50% 45%, transparent 58%, #000 60%)",
    maskImage: "radial-gradient(ellipse 46% 62% at 50% 45%, transparent 58%, #000 60%)",
    background: "rgba(0,0,0,0.6)",
  }}
/>

// Matching oval ring guide
<div 
  style={{
    width: '46%',
    height: '62%',
    position: 'absolute',
    top: '45%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  }}
  className="rounded-[50%] ring-2 ring-white/90"
/>
```

**Key Features:**
- CSS mask creates oval "hole" in dark overlay
- White ring provides visual guide for face positioning
- Exact dimension matching between mask and ring

### 4. Convex Database Schema

```typescript
// convex/schema.ts
selfiePhotos: defineTable({
  userId: v.id("users"),
  storageId: v.id("_storage"),
  originalFilename: v.optional(v.string()),
  mimeType: v.string(),
  fileSize: v.number(),
  captureMethod: v.union(v.literal("camera"), v.literal("upload")),
  metadata: v.optional(v.object({
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    deviceInfo: v.optional(v.string()),
  })),
  analysisData: v.optional(v.any()),
  analysisStatus: v.optional(v.union(
    v.literal("pending"),
    v.literal("processing"), 
    v.literal("completed"),
    v.literal("failed")
  )),
})
.index("userId", ["userId"]),
```

**Key Features:**
- Row-level security with userId index
- Tracks capture method (camera vs upload)
- Extensible for future AI analysis
- File metadata storage

### 5. Convex Functions

```typescript
// convex/selfies.ts

// Generate upload URL
export const generateSelfieUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Save selfie to database
export const uploadSelfie = mutation({
  args: {
    storageId: v.id("_storage"),
    originalFilename: v.optional(v.string()),
    mimeType: v.string(),
    fileSize: v.number(),
    captureMethod: v.union(v.literal("camera"), v.literal("upload")),
    metadata: v.optional(v.object({
      width: v.optional(v.number()),
      height: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("User not authenticated");
    
    return await ctx.db.insert("selfiePhotos", {
      userId,
      ...args,
    });
  },
});

// Get user's selfies
export const getUserSelfies = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("selfiePhotos")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});
```

**Key Features:**
- Authentication-protected endpoints
- File storage integration
- Query optimization with indexes
- Metadata tracking

### 6. Upload Workflow

```typescript
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
    
    const { storageId } = await uploadResponse.json();
    
    // Extract image metadata
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = capturedPhoto;
    });
    
    // Save to database
    await uploadSelfie({
      storageId,
      originalFilename: capturedFile.name,
      mimeType: capturedFile.type,
      fileSize: capturedFile.size,
      captureMethod: captureMode || "upload",
      metadata: {
        width: img.naturalWidth,
        height: img.naturalHeight,
      },
    });
    
    // Success state
    setCaptureState("success");
  } catch (error) {
    console.error("Upload failed:", error);
    setError("Upload failed. Please try again.");
    setCaptureState("photo-taken");
  }
}, [capturedFile, capturedPhoto, captureMode]);
```

**Key Features:**
- Two-step upload (file → storage, metadata → database)
- Image metadata extraction
- Error handling and recovery
- Progress state management

## State Management

### State Flow Diagram
```
idle → camera-loading → camera-active → photo-taken → uploading → success
  ↑                                         ↓
  ←─────────── (cancel/retake) ─────────────┘
```

### Critical State Handling
```typescript
// Prevent state reset after photo capture
const stopCamera = useCallback((resetState = true) => {
  // Stop video stream
  if (streamRef.current) {
    streamRef.current.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  }
  
  // Only reset state if explicitly requested
  if (resetState) {
    setCaptureState("idle");
    setCaptureMode(null);
  }
}, []);

// Usage:
stopCamera();      // Reset to idle (cancel button)
stopCamera(false); // Preserve current state (after capture)
```

## UI/UX Features

### Progressive Enhancement
1. **Loading States**: Smooth transitions between camera setup and active states
2. **Privacy Notice**: Clear messaging about camera usage and data handling  
3. **Fallback Options**: Upload from device if camera access denied
4. **Mirror Effect**: Video preview and captured photo both mirror user's view
5. **Visual Guides**: Oval overlay helps users position their face correctly

### Responsive Design
- Works on desktop and mobile browsers
- Handles different screen sizes and orientations
- Graceful degradation for unsupported browsers

## Security Considerations

### Authentication
- All Convex functions require authenticated user
- Row-level security via userId index
- File access controlled by Convex auth system

### Privacy
- Camera access requires explicit user permission
- Photos stored securely in Convex with user association
- Clear privacy messaging about data usage

### File Validation
- File size limits (10MB max)
- MIME type validation
- Error handling for invalid uploads

## Performance Optimizations

### Memory Management
- Cleanup video streams on component unmount
- Stop camera tracks when not needed
- Clear file references after upload

### Bundle Size
- Lazy loading of camera functionality
- Conditional rendering of heavy components
- Efficient state updates

## Browser Compatibility

### Supported Features
- `getUserMedia()` API (modern browsers)
- Canvas API for image capture
- File API for upload handling
- CSS masking for oval overlay

### Fallbacks
- Upload from device if camera access denied
- Graceful error handling for unsupported browsers
- Progressive enhancement approach

## Debugging & Monitoring

### Console Logging
- Comprehensive state transition logging
- Camera setup and error tracking
- Upload progress monitoring
- Performance timing information

### Error Handling
- User-friendly error messages
- Automatic retry mechanisms
- Graceful fallback options

## Future Enhancements

### Planned Features
1. **AI Analysis**: Integration with image analysis APIs
2. **Progress Comparison**: Side-by-side photo comparisons
3. **Batch Upload**: Multiple photo selection
4. **Export Options**: Download photo collections
5. **Social Sharing**: Share progress with friends

### Technical Improvements
1. **WebAssembly**: Client-side image processing
2. **Service Workers**: Offline capability
3. **Push Notifications**: Progress reminders
4. **Real-time Sync**: Multi-device synchronization

## Testing Strategy

### Manual Testing Checklist
- [ ] Camera permission flow
- [ ] Photo capture and review
- [ ] File upload from device
- [ ] Error state handling
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

### Automated Testing (Future)
- Unit tests for utility functions
- Integration tests for Convex functions
- E2E tests for complete user flows
- Visual regression testing

## Deployment Notes

### Environment Variables Required
```bash
VITE_CONVEX_URL=your_convex_deployment_url
AUTH_RESEND_KEY=your_resend_api_key
AUTH_EMAIL=your_sender_email
STRIPE_SECRET_KEY=your_stripe_key
SITE_URL=your_site_url
JWT_PRIVATE_KEY=auto_generated
```

### Build Considerations
- Ensure HTTPS for camera access in production
- Configure proper CORS for file uploads
- Set up CDN for efficient file delivery
- Monitor storage usage and costs

---

*Last Updated: January 2025*
*Implementation by: Claude Sonnet 4*
