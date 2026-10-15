"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, FieldError } from "@/components/ui/input";
import { resetSchema } from "@/lib/validation/schemas";
import { z } from "zod";

type Values = z.output<typeof resetSchema>;

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(resetSchema),
    defaultValues: { token: params.get("token") ?? "" },
  });

  async function onSubmit(values: Values) {
    const res = await fetch("/api/auth/password/reset", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg({ ok: false, text: data.error ?? "Reset failed. The link may be expired." });
      return;
    }
    setMsg({ ok: true, text: "Password updated. Redirecting to sign in…" });
    setTimeout(() => router.push("/login"), 1200);
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <input type="hidden" {...register("token")} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
            <FieldError message={errors.password?.message} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input id="confirm" type="password" autoComplete="new-password" {...register("confirm")} />
            <FieldError message={errors.confirm?.message} />
          </div>
          {msg ? (
            <p className={msg.ok ? "text-[13px] text-emerald-600" : "text-[13px] text-destructive"} role="status">{msg.text}</p>
          ) : null}
          <Button type="submit" disabled={isSubmitting} className="w-full">Update password</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPage() {
  return (
    <AuthShell title="Choose a new password" subtitle="Links are single-use and expire quickly.">
      <Suspense>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
