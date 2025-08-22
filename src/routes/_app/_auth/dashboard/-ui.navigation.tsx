import {
  ChevronUp,
  ChevronDown,
  Slash,
  Check,
  Settings,
} from "lucide-react";
import { cn } from "@/utils/misc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Button } from "@/ui/button";
import { buttonVariants } from "@/ui/button-util";
import { Logo } from "@/ui/logo";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { Route as DashboardRoute } from "@/routes/_app/_auth/dashboard/_layout.index";
import { Route as SelfieRoute } from "@/routes/_app/_auth/dashboard/_layout.selfie";
import { Route as ExerciseRoute } from "@/routes/_app/_auth/dashboard/_layout.exercise";
import { Route as DietRoute } from "@/routes/_app/_auth/dashboard/_layout.diet";
import { Route as SettingsRoute } from "@/routes/_app/_auth/dashboard/_layout.settings";
import { Route as BillingRoute } from "@/routes/_app/_auth/dashboard/_layout.settings.billing";

import { User } from "~/types";
import { UserButton } from '@clerk/clerk-react';

export function Navigation({ user }: { user: User }) {
  const matchRoute = useMatchRoute();
  const isDashboardPath = matchRoute({ to: DashboardRoute.fullPath });
  const isSelfiePath = matchRoute({ to: SelfieRoute.fullPath });
  const isExercisePath = matchRoute({ to: ExerciseRoute.fullPath });
  const isDietPath = matchRoute({ to: DietRoute.fullPath });


  if (!user) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 flex w-full flex-col border-b border-border bg-card px-6">
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between py-3">
        <div className="flex h-10 items-center gap-2">
          <Link
            to={DashboardRoute.fullPath}
            className="flex h-10 items-center gap-1"
          >
            <Logo />
          </Link>
          <Slash className="h-6 w-6 -rotate-12 stroke-[1.5px] text-primary/10" />
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-2 px-2 data-[state=open]:bg-primary/5"
              >
                <div className="flex items-center gap-2">
                  {user.avatarUrl ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      alt={user.username ?? user.email}
                      src={user.avatarUrl}
                    />
                  ) : (
                    <span className="h-8 w-8 rounded-full bg-gradient-to-br from-lime-400 from-10% via-cyan-300 to-blue-500" />
                  )}

                  <p className="text-sm font-medium text-primary/80">
                    {user?.username || ""}
                  </p>
                  <span className="flex h-5 items-center rounded-full bg-primary/10 px-2 text-xs font-medium text-primary/80">
                    {(user.subscription?.planKey &&
                      user.subscription.planKey.charAt(0).toUpperCase() +
                        user.subscription.planKey.slice(1)) ||
                      "Free"}
                  </span>
                </div>
                <span className="flex flex-col items-center justify-center">
                  <ChevronUp className="relative top-[3px] h-[14px] w-[14px] stroke-[1.5px] text-primary/60" />
                  <ChevronDown className="relative bottom-[3px] h-[14px] w-[14px] stroke-[1.5px] text-primary/60" />
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              sideOffset={8}
              className="min-w-56 bg-card p-2"
            >
              <DropdownMenuLabel className="flex items-center text-xs font-normal text-primary/60">
                Account
              </DropdownMenuLabel>
              <DropdownMenuItem className="h-10 w-full cursor-pointer justify-between rounded-md bg-secondary px-2">
                <div className="flex items-center gap-2">
                  {user.avatarUrl ? (
                    <img
                      className="h-6 w-6 rounded-full object-cover"
                      alt={user.username ?? user.email}
                      src={user.avatarUrl}
                    />
                  ) : (
                    <span className="h-6 w-6 rounded-full bg-gradient-to-br from-lime-400 from-10% via-cyan-300 to-blue-500" />
                  )}

                  <p className="text-sm font-medium text-primary/80">
                    {user.username || ""}
                  </p>
                </div>
                <Check className="h-[18px] w-[18px] stroke-[1.5px] text-primary/60" />
              </DropdownMenuItem>

              <Link to={SettingsRoute.fullPath}>
                <DropdownMenuItem className="h-10 w-full cursor-pointer rounded-md px-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary">
                      <Settings className="h-4 w-4 text-primary/80" />
                    </div>
                    <span className="text-sm font-medium text-primary/80">Settings</span>
                  </div>
                </DropdownMenuItem>
              </Link>

              {(!user.subscription?.planKey || user.subscription.planKey === "free") && (
                <Link to={BillingRoute.fullPath}>
                  <DropdownMenuItem className="h-10 w-full cursor-pointer rounded-md bg-primary px-2 text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 hover:text-primary-foreground focus:text-primary-foreground">
                    <div className="flex w-full items-center justify-center">
                      <span className="text-sm font-medium">Upgrade Now</span>
                    </div>
                  </DropdownMenuItem>
                </Link>
              )}

            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex h-10 items-center gap-3">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-screen-xl items-center gap-3">
        <div
          className={cn(
            `flex h-12 items-center border-b-2`,
            isDashboardPath ? "border-primary" : "border-transparent",
          )}
        >
          <Link
            to={DashboardRoute.fullPath}
            className={cn(
              `${buttonVariants({ variant: "ghost", size: "sm" })} text-primary/80`,
            )}
          >
            Dashboard
          </Link>
        </div>
        <div
          className={cn(
            `flex h-12 items-center border-b-2`,
            isSelfiePath ? "border-primary" : "border-transparent",
          )}
        >
          <Link
            to={SelfieRoute.fullPath}
            className={cn(
              `${buttonVariants({ variant: "ghost", size: "sm" })} text-primary/80`,
            )}
          >
            Selfie
          </Link>
        </div>
        <div
          className={cn(
            `flex h-12 items-center border-b-2`,
            isExercisePath ? "border-primary" : "border-transparent",
          )}
        >
          <Link
            to={ExerciseRoute.fullPath}
            className={cn(
              `${buttonVariants({ variant: "ghost", size: "sm" })} text-primary/80`,
            )}
          >
            Exercise
          </Link>
        </div>
        <div
          className={cn(
            `flex h-12 items-center border-b-2`,
            isDietPath ? "border-primary" : "border-transparent",
          )}
        >
          <Link
            to={DietRoute.fullPath}
            className={cn(
              `${buttonVariants({ variant: "ghost", size: "sm" })} text-primary/80`,
            )}
          >
            Diet
          </Link>
        </div>

      </div>
    </nav>
  );
}
