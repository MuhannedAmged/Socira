import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Privacy policy</h1>
        <div className="mt-4 flex flex-col gap-3 text-sm leading-6 text-muted-foreground">
          <p>Socira stores your profile, content, and encrypted social credentials in infrastructure you control (your MongoDB, Supabase bucket, and keys).</p>
          <p>Social tokens are encrypted at rest (AES-256-GCM) and never exposed to the browser. Verification codes and reset tokens are stored as hashes with short expirations.</p>
          <p>Transactional email is sent via Resend. We never sell data, run ads, or gate features behind payments — the software is MIT open source.</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
