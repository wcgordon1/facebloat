import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { ArrowLeft, Calendar, Camera, Upload, Trash2, Download, Eye } from "lucide-react";
import { Button } from "@/ui/button";
import { ConfirmationDialog } from "@/ui/confirmation-dialog";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import type { Doc } from "@cvx/_generated/dataModel";

interface PhotoGalleryProps {
  onBack: () => void;
}

type SelfieWithUrl = Doc<"selfiePhotos"> & { url: string | null };

export function PhotoGallery({ onBack }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<SelfieWithUrl | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    photoId: string | null;
    photoName: string;
  }>({
    isOpen: false,
    photoId: null,
    photoName: "",
  });

  // Fetch user's selfies with Convex query
  const { data: selfies = [], isLoading, error } = useQuery(
    convexQuery(api.selfies.getUserSelfies, {})
  );

  // Delete mutation
  const deleteSelfie = useConvexMutation(api.selfies.deleteSelfie);

  // Handle photo deletion request
  const handleDeletePhoto = (selfie: SelfieWithUrl) => {
    const photoName = selfie.originalFilename || `Photo from ${formatDate(selfie._creationTime)}`;
    setDeleteConfirmation({
      isOpen: true,
      photoId: selfie._id,
      photoName,
    });
  };

  // Confirm photo deletion
  const confirmDeletePhoto = async () => {
    const { photoId } = deleteConfirmation;
    if (!photoId) return;

    setIsDeleting(photoId);
    setDeleteConfirmation({ isOpen: false, photoId: null, photoName: "" });

    try {
      await deleteSelfie({ selfieId: photoId as any });
      // If we're viewing the deleted photo, close the modal
      if (selectedPhoto?._id === photoId) {
        setSelectedPhoto(null);
      }
    } catch (err) {
      console.error("Failed to delete photo:", err);
      // You could add a toast notification here instead of alert
      alert("Failed to delete photo. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  };

  // Cancel photo deletion
  const cancelDeletePhoto = () => {
    setDeleteConfirmation({ isOpen: false, photoId: null, photoName: "" });
  };

  // Handle photo download
  const handleDownloadPhoto = async (selfie: SelfieWithUrl) => {
    if (!selfie.url) return;
    
    try {
      const response = await fetch(selfie.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selfie.originalFilename || `selfie-${selfie._creationTime}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to download photo:", err);
      alert("Failed to download photo. Please try again.");
    }
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-primary">Photo Gallery</h2>
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Camera
          </Button>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-sm text-primary/60">Loading your photos...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-primary">Photo Gallery</h2>
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Camera
          </Button>
        </div>
        
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400 mb-4">
            Failed to load photos. Please try again.
          </div>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-primary">Photo Gallery</h2>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Camera
        </Button>
      </div>

      {/* Empty state */}
      {selfies.length === 0 ? (
        <div className="text-center py-12">
          <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Camera className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-primary mb-2">No photos yet</h3>
          <p className="text-sm text-primary/60 mb-6">
            Start your progress journey by taking your first photo!
          </p>
          <Button onClick={onBack}>
            <Camera className="h-4 w-4 mr-2" />
            Take Your First Photo
          </Button>
        </div>
      ) : (
        <>
          {/* Photo Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {selfies.map((selfie) => (
              <div
                key={selfie._id}
                className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-border hover:border-primary/20 transition-colors cursor-pointer"
                onClick={() => setSelectedPhoto(selfie)}
              >
                {selfie.url ? (
                  <img
                    src={selfie.url}
                    alt={`Progress photo from ${formatDate(selfie._creationTime)}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                
                {/* Overlay with info */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded px-2 py-1">
                    <div className="flex items-center gap-1 text-xs">
                      {selfie.captureMethod === "camera" ? (
                        <Camera className="h-3 w-3" />
                      ) : (
                        <Upload className="h-3 w-3" />
                      )}
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        {formatDate(selfie._creationTime)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 flex items-center justify-center p-4"
          style={{ 
            paddingTop: '208px'
          }}
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-white dark:bg-gray-900 rounded-lg overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 208px - 2rem)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-primary/60">
                  <Calendar className="h-4 w-4" />
                  {formatDate(selectedPhoto._creationTime)}
                </div>
                <div className="flex items-center gap-2 text-sm text-primary/60">
                  {selectedPhoto.captureMethod === "camera" ? (
                    <Camera className="h-4 w-4" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {selectedPhoto.captureMethod === "camera" ? "Camera" : "Upload"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownloadPhoto(selectedPhoto)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePhoto(selectedPhoto)}
                  disabled={isDeleting === selectedPhoto._id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  {isDeleting === selectedPhoto._id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPhoto(null)}
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="relative">
              {selectedPhoto.url ? (
                <img
                  src={selectedPhoto.url}
                  alt={`Progress photo from ${formatDate(selectedPhoto._creationTime)}`}
                  className="w-full h-auto object-contain"
                  style={{ maxHeight: 'calc(100vh - 208px - 200px)' }}
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <Camera className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {selectedPhoto.metadata && (
              <div className="p-4 border-t border-border bg-gray-50 dark:bg-gray-800/50">
                <div className="flex gap-6 text-sm text-primary/60">
                  {selectedPhoto.metadata.width && selectedPhoto.metadata.height && (
                    <div>
                      <span className="font-medium">Dimensions:</span>{" "}
                      {selectedPhoto.metadata.width} × {selectedPhoto.metadata.height}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Size:</span>{" "}
                    {(selectedPhoto.fileSize / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <div>
                    <span className="font-medium">Format:</span>{" "}
                    {selectedPhoto.mimeType.split("/")[1]?.toUpperCase()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onConfirm={confirmDeletePhoto}
        onCancel={cancelDeletePhoto}
        title="Delete Photo"
        message={`Are you sure you want to delete "${deleteConfirmation.photoName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
