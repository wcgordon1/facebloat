import { createFileRoute } from "@tanstack/react-router";
import { Camera, Image, TrendingUp } from "lucide-react";
import siteConfig from "~/site.config";
import { SelfieCapture } from "@/ui/selfie-capture";

export const Route = createFileRoute("/_app/_auth/dashboard/_layout/selfie")({
  component: Selfie,
  beforeLoad: () => ({
    title: `${siteConfig.siteTitle} - Selfie Tracker`,
    headerTitle: "Selfie Progress",
    headerDescription: "Track your transformation with photos.",
  }),
});

export default function Selfie() {

  return (
    <div className="flex h-full w-full bg-secondary px-6 py-8 dark:bg-black">
      <div className="z-10 mx-auto flex h-full w-full max-w-screen-xl gap-12">
        <div className="flex w-full flex-col rounded-lg border border-border bg-card dark:bg-black">
          <div className="flex w-full flex-col rounded-lg p-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-medium text-primary">Selfie Progress Tracker</h2>
              <p className="text-sm font-normal text-primary/60">
                Document your transformation journey with progress photos.
              </p>
            </div>
          </div>
          <div className="flex w-full px-6">
            <div className="w-full border-b border-border" />
          </div>
          <div className="relative mx-auto flex w-full flex-col items-center p-6">
            {/* Selfie Capture Component */}
            <div className="mb-8 w-full max-w-md">
              <SelfieCapture />
            </div>

            {/* Feature Info Cards */}
            <div className="z-10 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
              <div className="flex flex-col items-center p-4 rounded-lg border border-border bg-card/50">
                <Image className="h-6 w-6 mb-2 text-primary/60" />
                <h3 className="font-medium text-sm text-primary">Before Photos</h3>
                <p className="text-xs text-primary/60 text-center">Upload your starting photos</p>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg border border-border bg-card/50">
                <TrendingUp className="h-6 w-6 mb-2 text-primary/60" />
                <h3 className="font-medium text-sm text-primary">Progress Tracking</h3>
                <p className="text-xs text-primary/60 text-center">See your changes over time</p>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg border border-border bg-card/50">
                <Camera className="h-6 w-6 mb-2 text-primary/60" />
                <h3 className="font-medium text-sm text-primary">Regular Updates</h3>
                <p className="text-xs text-primary/60 text-center">Keep documenting your journey</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
