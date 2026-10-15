"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, FieldError } from "@/components/ui/input";
import { forgotFormSchema, normalizeEmail } from "@/lib/validation/schemas";
import { z } from "zod";

type Values = z.infer<typeof forgotFormSchema>;

export default function ForgotPage() {
  const [msg, setMsg] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(forgotFormSchema),
  });

  async function onSubmit(values: Values) {
    const res = await fetch("/api/auth/password/forgot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: normalizeEmail(values.email) }),
    });
    const data = await res.json().catch(() => ({}));
    // Always show neutral message to prevent enumeration.
    setMsg(data.message ?? "If an account exists, a reset link was sent.");
  }

  return (
    <AuthShell title="Reset password" subtitle="We will email you a secure, single-use reset link.">
      <Card>
        <CardContent className="pt-5">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              <FieldError message={errors.email?.message} />
            </div>
            {msg ? <p className="text-[13px] text-muted-foreground" role="status">{msg}</p> : null}
            <Button type="submit" disabled={isSubmitting} className="w-full">Send reset link</Button>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
