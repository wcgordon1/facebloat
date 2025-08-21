import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { useEffect, useState } from "react";
import { Route as OnboardingUsernameRoute } from "@/routes/_app/_auth/onboarding/_layout.username";
import { Route as DashboardRoute } from "@/routes/_app/_auth/dashboard/_layout.index";
import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery, useConvexAuth } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";

export const Route = createFileRoute("/_app/login/_layout/")({
  component: Login,
});

function Login() {
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const { data: user } = useQuery(convexQuery(api.app.getCurrentUser, {}));
  const navigate = useNavigate();
  useEffect(() => {
    // Clear any stale tokens from previous auth config
    signOut().catch(() => {});
    // Also proactively clear known auth keys if present (belt and suspenders)
    try {
      localStorage.removeItem("convex:auth");
      localStorage.removeItem("@convex/auth");
      sessionStorage.removeItem("convex:auth");
    } catch {}
  }, []);
  useEffect(() => {
    if ((isLoading && !isAuthenticated) || !user) {
      return;
    }
    if (!isLoading && isAuthenticated && !user.username) {
      navigate({ to: OnboardingUsernameRoute.fullPath });
      return;
    }
    if (!isLoading && isAuthenticated) {
      navigate({ to: DashboardRoute.fullPath });
      return;
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  // Reset to email input if authentication fails
  useEffect(() => {
    if (!isLoading && !isAuthenticated && step !== "signIn") {
      setStep("signIn");
    }
  }, [isAuthenticated, isLoading, step]);

  if (step === "signIn") {
    return <LoginForm onSubmit={(email) => setStep({ email })} />;
  }
  return <VerifyForm email={step.email} />;
}

function LoginForm({ onSubmit }: { onSubmit: (email: string) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuthActions();

  const form = useForm({
    validatorAdapter: zodValidator(),
    defaultValues: {
      email: "",
    },
          onSubmit: async ({ value }) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        const normalizedEmail = value.email.trim().toLowerCase();
        try {
          const formData = new FormData();
          formData.append("email", normalizedEmail);
          void signIn("resend-otp", formData).then(() =>
            onSubmit(normalizedEmail)
          );
        } catch (err) {
          console.error("Failed to send OTP:", err);
        } finally {
          setIsSubmitting(false);
        }
      },
  });
  return (
    <div className="mx-auto flex h-full w-full max-w-96 flex-col items-center justify-center gap-6">
      <div className="mb-2 flex flex-col gap-2">
        <h3 className="text-center text-2xl font-medium text-primary">
          Continue to FaceBloat
        </h3>
        <p className="text-center text-base font-normal text-primary/60">
          Welcome! Please enter your email to continue.
        </p>
      </div>
      <form
        className="flex w-full flex-col items-start gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="flex w-full flex-col gap-1.5">
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <form.Field
            name="email"
            validators={{
              onSubmit: z
                .string()
                .max(256)
                .email("Email address is not valid."),
            }}
            children={(field) => (
              <Input
                placeholder="Email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={isSubmitting}
                className={`bg-transparent ${
                  field.state.meta?.errors.length > 0 &&
                  "border-destructive focus-visible:ring-destructive"
                }`}
              />
            )}
          />
        </div>

        <div className="flex flex-col">
          {form.state.fieldMeta.email?.errors.length > 0 && (
            <span className="mb-2 text-sm text-destructive dark:text-destructive-foreground">
              {form.state.fieldMeta.email?.errors.join(" ")}
            </span>
          )}
          {/*
          {!authEmail && authError && (
            <span className="mb-2 text-sm text-destructive dark:text-destructive-foreground">
              {authError.message}
            </span>
          )}
          */}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting} aria-disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Continue with Email"
          )}
        </Button>
      </form>

      <p className="px-12 text-center text-sm font-normal leading-normal text-primary/60">
        By clicking continue, you agree to our{" "}
        <a className="underline hover:text-primary">Terms of Service</a> and{" "}
        <a className="underline hover:text-primary">Privacy Policy.</a>
      </p>
    </div>
  );
}

function VerifyForm({ email }: { email: string }) {
  const [verifying, setVerifying] = useState(false);
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  
  const form = useForm({
    validatorAdapter: zodValidator(),
    defaultValues: {
      code: "",
    },
    onSubmit: async ({ value }) => {
      if (verifying) return;
      setVerifying(true);
      const normalizedEmail = email.trim().toLowerCase();
      const cleanedCode = value.code.trim().replace(/\s|-/g, "");
      try {
        const formData = new FormData();
        formData.append("email", normalizedEmail);
        formData.append("code", cleanedCode);
        console.log("[OTP] Attempting to verify code:", { email: normalizedEmail, code: cleanedCode });
        const result = await signIn("resend-otp", formData);
        console.log("[OTP] SignIn result:", result);
        // Navigate to dashboard on success
        navigate({ to: DashboardRoute.fullPath });
      } catch (err) {
        console.error("Failed to verify OTP:", err);
      } finally {
        setVerifying(false);
      }
    },
  });
  return (
    <div className="mx-auto flex h-full w-full max-w-96 flex-col items-center justify-center gap-6">
      <div className="mb-2 flex flex-col gap-2">
        <p className="text-center text-2xl text-primary">Check your inbox!</p>
        <p className="text-center text-base font-normal text-primary/60">
          We've just emailed you a temporary password.
          <br />
          Please enter it below.
        </p>
      </div>
      <form
        className="flex w-full flex-col items-start gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="flex w-full flex-col gap-1.5">
          <label htmlFor="code" className="sr-only">
            Code
          </label>
          <form.Field
            name="code"
            validators={{
              onSubmit: z
                .string()
                .min(1, "Please enter the verification code."),
            }}
            children={(field) => {
              return (
                <Input
                  placeholder="Code"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={`bg-transparent ${
                    field.state.meta?.errors.length > 0 &&
                    "border-destructive focus-visible:ring-destructive"
                  }`}
                />
              );
            }}
          />
        </div>

        <div className="flex flex-col">
          {form.state.fieldMeta.code?.errors.length > 0 && (
            <span className="mb-2 text-sm text-destructive dark:text-destructive-foreground">
              {form.state.fieldMeta.code?.errors.join(" ")}
            </span>
          )}
          {/*
          {!authEmail && authError && (
            <span className="mb-2 text-sm text-destructive dark:text-destructive-foreground">
              {authError.message}
            </span>
          )}
          */}
        </div>

        <Button type="submit" className="w-full" disabled={verifying} aria-disabled={verifying}>
          Continue
        </Button>
      </form>

      {/* Request New Code. */}
      <div className="flex w-full flex-col">
        <p className="text-center text-sm font-normal text-primary/60">
          Did not receive the code?
        </p>
        <Button
          onClick={async () => {
            const formData = new FormData();
            formData.append("email", email.trim().toLowerCase());
            await signIn("resend-otp", formData);
          }}
          variant="ghost"
          className="w-full hover:bg-transparent"
        >
          Request New Code
        </Button>
      </div>
    </div>
  );
}
