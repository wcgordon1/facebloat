import { AlertTriangle } from "lucide-react";
import { Button } from "@/ui/button";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmationDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div 
        className="relative max-w-md w-full bg-white dark:bg-gray-900 rounded-lg border border-border shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-6 pb-4">
          <div className={`rounded-full p-2 ${
            variant === "destructive" 
              ? "bg-red-100 dark:bg-red-950/20" 
              : "bg-blue-100 dark:bg-blue-950/20"
          }`}>
            <AlertTriangle className={`h-5 w-5 ${
              variant === "destructive"
                ? "text-red-600 dark:text-red-400"
                : "text-blue-600 dark:text-blue-400"
            }`} />
          </div>
          <h2 className="text-lg font-semibold text-primary">{title}</h2>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <p className="text-sm text-primary/70 mb-6">{message}</p>
          
          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onCancel}
              className="px-4 py-2"
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              className={`px-4 py-2 ${
                variant === "destructive"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : ""
              }`}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
