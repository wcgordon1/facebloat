import { createFileRoute } from "@tanstack/react-router";
import { Apple, Clock, PieChart } from "lucide-react";
import siteConfig from "~/site.config";

export const Route = createFileRoute("/_app/_auth/dashboard/_layout/diet")({
  component: Diet,
  beforeLoad: () => ({
    title: `${siteConfig.siteTitle} - Diet Tracker`,
    headerTitle: "Diet Tracker",
    headerDescription: "Track your nutrition and eating habits.",
  }),
});

export default function Diet() {

  return (
    <div className="flex h-full w-full bg-secondary px-6 py-8 dark:bg-black">
      <div className="z-10 mx-auto flex h-full w-full max-w-screen-xl gap-12">
        <div className="flex w-full flex-col rounded-lg border border-border bg-card dark:bg-black">
          <div className="flex w-full flex-col rounded-lg p-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-medium text-primary">Diet Tracker</h2>
              <p className="text-sm font-normal text-primary/60">
                Monitor your nutrition and maintain healthy eating habits.
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
                  <Apple className="h-8 w-8 stroke-[1.5px] text-primary/60" />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-base font-medium text-primary">
                    Begin Your Nutrition Journey
                  </p>
                  <p className="text-center text-base font-normal text-primary/60">
                    Start logging your meals and track your nutritional intake.
                  </p>
                </div>
              </div>
              <div className="z-10 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                <div className="flex flex-col items-center p-4 rounded-lg border border-border bg-card/50">
                  <Apple className="h-6 w-6 mb-2 text-primary/60" />
                  <h3 className="font-medium text-sm text-primary">Log Meals</h3>
                  <p className="text-xs text-primary/60 text-center">Record what you eat daily</p>
                </div>
                <div className="flex flex-col items-center p-4 rounded-lg border border-border bg-card/50">
                  <PieChart className="h-6 w-6 mb-2 text-primary/60" />
                  <h3 className="font-medium text-sm text-primary">Track Macros</h3>
                  <p className="text-xs text-primary/60 text-center">Monitor protein, carbs, and fats</p>
                </div>
                <div className="flex flex-col items-center p-4 rounded-lg border border-border bg-card/50">
                  <Clock className="h-6 w-6 mb-2 text-primary/60" />
                  <h3 className="font-medium text-sm text-primary">Meal Timing</h3>
                  <p className="text-xs text-primary/60 text-center">Optimize your eating schedule</p>
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
