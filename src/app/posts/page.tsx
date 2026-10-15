import { IconSearch } from "@tabler/icons-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PostsPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="Content library"
        subtitle="Drafts, published, failed, and planned — with per-destination receipts."
        action={<Button variant="outline"><IconSearch /> Search</Button>}
      />
      <div className="mb-4 flex gap-2">
        <Input placeholder="Search posts…" aria-label="Search posts" />
      </div>
      <EmptyState
        title="No posts yet"
        description="Drafts you save and publications you make will appear here with filters, pagination, and platform identifiers."
      />
    </DashboardShell>
  );
}
