import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { IconInbox } from "@tabler/icons-react";

export default function InboxPage() {
  return (
    <DashboardShell>
      <PageHeader title="Inbox" subtitle="Comments and replies — only where the adapter implements them." />
      <EmptyState
        icon={<IconInbox />}
        title="No conversations yet"
        description="Supported comment threads will appear here with pagination, filters, and links to the original platform content."
      />
    </DashboardShell>
  );
}
