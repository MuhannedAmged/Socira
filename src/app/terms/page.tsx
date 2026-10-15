import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Terms of use</h1>
        <div className="mt-4 flex flex-col gap-3 text-sm leading-6 text-muted-foreground">
          <p>Socira is provided as-is under the MIT License. You are responsible for your connected accounts, content compliance, and each platform&apos;s terms and approval requirements.</p>
          <p>Do not use the platform for spam, abuse, or unlawful content. Credentials and publishing actions are attributable to your workspace.</p>
          <p>There are no subscriptions, billing, or premium tiers in this software.</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
