import { createFileRoute } from "@tanstack/react-router";
import { Dumbbell, Target, Calendar } from "lucide-react";
import siteConfig from "~/site.config";

export const Route = createFileRoute("/_app/_auth/dashboard/_layout/exercise")({
  component: Exercise,
  beforeLoad: () => ({
    title: `${siteConfig.siteTitle} - Exercise Tracker`,
    headerTitle: "Exercise Tracker",
    headerDescription: "Plan and track your workouts.",
  }),
});

export default function Exercise() {

  return (
    <div className="flex h-full w-full bg-secondary px-6 py-8 dark:bg-black">
      <div className="z-10 mx-auto flex h-full w-full max-w-screen-xl gap-12">
        <div className="flex w-full flex-col rounded-lg border border-border bg-card dark:bg-black">
          <div className="flex w-full flex-col rounded-lg p-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-medium text-primary">Exercise Tracker</h2>
              <p className="text-sm font-normal text-primary/60">
                Plan your workouts and track your fitness progress.
              </p>
            </div>
          </div>
          <div className="flex w-full px-6">
            <div className="w-full border-b border-border" />
          </div>
          <div className="relative mx-auto flex w-full flex-col items-center p-6">
            <div className="relative flex w-full flex-col items-center justify-center gap-6 overflow-hidden rounded-lg border border-border bg-secondary px-6 py-24 dark:bg-card">
              <div className="z-10 flex max-w-[460px] flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-card hover:border-primary/40">
                  <Dumbbell className="h-8 w-8 stroke-[1.5px] text-primary/60" />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-base font-medium text-primary">
                    Start Your Fitness Journey
                  </p>
                  <p className="text-center text-base font-normal text-primary/60">
                    Create your first workout plan and start tracking your exercises.
                  </p>
                </div>
              </div>
              <div className="z-10 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                <div className="flex flex-col items-center p-4 rounded-lg border border-border bg-card/50">
                  <Target className="h-6 w-6 mb-2 text-primary/60" />
                  <h3 className="font-medium text-sm text-primary">Set Goals</h3>
                  <p className="text-xs text-primary/60 text-center">Define your fitness objectives</p>
                </div>
                <div className="flex flex-col items-center p-4 rounded-lg border border-border bg-card/50">
                  <Calendar className="h-6 w-6 mb-2 text-primary/60" />
                  <h3 className="font-medium text-sm text-primary">Plan Workouts</h3>
                  <p className="text-xs text-primary/60 text-center">Schedule your training sessions</p>
                </div>
                <div className="flex flex-col items-center p-4 rounded-lg border border-border bg-card/50">
                  <Dumbbell className="h-6 w-6 mb-2 text-primary/60" />
                  <h3 className="font-medium text-sm text-primary">Track Progress</h3>
                  <p className="text-xs text-primary/60 text-center">Monitor your improvements</p>
                </div>
              </div>
              <div className="base-grid absolute h-full w-full opacity-40" />
              <div className="absolute bottom-0 h-full w-full bg-gradient-to-t from-[hsl(var(--card))] to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
