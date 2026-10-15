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
import { registerFormSchema, normalizeEmail } from "@/lib/validation/schemas";
import type { z } from "zod";

type Values = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(registerFormSchema),
  });

  async function onSubmit(values: Values) {
    setServerError(null);
    const payload = { ...values, email: normalizeEmail(values.email) };
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setServerError(data.error ?? "Registration failed. Try again.");
      return;
    }
    router.push(`/verify?email=${encodeURIComponent(payload.email)}`);
  }

  return (
    <AuthShell title="Create your workspace" subtitle="Free forever. No premium tiers, no paywalls.">
      <Card>
        <CardContent className="pt-5">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" autoComplete="name" placeholder="Ada Lovelace" {...register("name")} />
              <FieldError message={errors.name?.message} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
              <FieldError message={errors.email?.message} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" autoComplete="new-password" placeholder="Min. 10 characters" {...register("password")} />
                <FieldError message={errors.password?.message} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm">Confirm</Label>
                <Input id="confirm" type="password" autoComplete="new-password" {...register("confirm")} />
                <FieldError message={errors.confirm?.message} />
              </div>
            </div>
            <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-5 text-muted-foreground">
              <input type="checkbox" className="mt-1 size-4 accent-current" {...register("accept")} />
              I agree to the privacy policy and terms of use.
            </label>
            <FieldError message={errors.accept?.message} />
            {serverError ? <p className="text-[13px] text-destructive" role="alert">{serverError}</p> : null}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <IconLoader2 className="animate-spin" /> : null} Create account
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-[13px] text-muted-foreground">
        Already have an account? <Link href="/login" className="font-semibold text-foreground">Sign in</Link>
      </p>
    </AuthShell>
  );
}
