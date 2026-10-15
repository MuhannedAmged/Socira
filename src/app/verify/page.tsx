"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2, IconMailCheck } from "@tabler/icons-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, FieldError } from "@/components/ui/input";
import { verifyFormSchema, normalizeEmail } from "@/lib/validation/schemas";
import { z } from "zod";

type Values = z.infer<typeof verifyFormSchema>;

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(verifyFormSchema),
    defaultValues: { email: params.get("email") ?? "" },
  });

  async function onSubmit(values: Values) {
    setStatus(null);
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...values, email: normalizeEmail(values.email) }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus({ ok: false, msg: data.error ?? "Verification failed." });
      return;
    }
    setStatus({ ok: true, msg: "Email verified. Redirecting to sign in…" });
    setTimeout(() => router.push("/login"), 1200);
  }

  async function resend() {
    const email = (document.getElementById("email") as HTMLInputElement)?.value;
    if (!email) return;
    const res = await fetch("/api/auth/verify/resend", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    setStatus({ ok: res.ok, msg: data.message ?? data.error ?? "Done." });
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconMailCheck className="size-4" /> We sent a 6-digit code with Resend. It expires in 15 minutes.
          </p>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            <FieldError message={errors.email?.message} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="code">Verification code</Label>
            <Input id="code" inputMode="numeric" placeholder="123456" maxLength={6} {...register("code")} className="tnum tracking-[0.3em]" />
            <FieldError message={errors.code?.message} />
          </div>
          {status ? (
            <p className={status.ok ? "text-[13px] text-emerald-600" : "text-[13px] text-destructive"} role="status">
              {status.msg}
            </p>
          ) : null}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? <IconLoader2 className="animate-spin" /> : null} Verify email
          </Button>
          <Button type="button" variant="ghost" onClick={resend}>
            Resend code
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function VerifyPage() {
  return (
    <AuthShell title="Check your inbox" subtitle="Enter the verification code to activate your account.">
      <Suspense>
        <VerifyForm />
      </Suspense>
    </AuthShell>
  );
}
