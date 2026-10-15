import { IconCloudUpload } from "@tabler/icons-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function MediaPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="Media library"
        subtitle="Private Supabase bucket · user-scoped paths · signed URLs · ownership checks."
        action={<Button><IconCloudUpload /> Upload</Button>}
      />
      <EmptyState
        title="No media yet"
        description="Images and videos you upload will appear here with grid/list views, metadata, and safe deletion."
      />
    </DashboardShell>
  );
}
