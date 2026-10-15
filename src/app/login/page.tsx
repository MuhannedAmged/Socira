"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2 } from "@tabler/icons-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, FieldError } from "@/components/ui/input";
import { loginFormSchema, normalizeEmail } from "@/lib/validation/schemas";
import type { z } from "zod";

type Values = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(loginFormSchema),
  });

  async function onSubmit(values: Values) {
    setServerError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...values, email: normalizeEmail(values.email) }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setServerError(data.error ?? "Sign-in failed. Check your credentials.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your Socira workspace.">
      <Card>
        <CardContent className="pt-5">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
              <FieldError message={errors.email?.message} />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs font-medium text-muted-foreground hover:text-foreground">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
              <FieldError message={errors.password?.message} />
            </div>
            {serverError ? <p className="text-[13px] text-destructive" role="alert">{serverError}</p> : null}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <IconLoader2 className="animate-spin" /> : null} Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-[13px] text-muted-foreground">
        New to Socira? <Link href="/register" className="font-semibold text-foreground">Create an account</Link>
      </p>
    </AuthShell>
  );
}
