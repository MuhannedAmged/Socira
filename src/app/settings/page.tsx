import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
  return (
    <DashboardShell>
      <PageHeader title="Settings" subtitle="Profile, appearance, security, and danger zone." />
      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Name, timezone, and theme preference.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5"><Label htmlFor="name">Name</Label><Input id="name" defaultValue="" placeholder="Your name" /></div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="tz">Timezone</Label><Input id="tz" defaultValue="UTC" /></div>
            <div className="flex items-center gap-2"><span className="text-sm">Appearance</span><ThemeToggle /></div>
            <Button className="w-fit">Save changes</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Sessions, password, and connected sessions.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="outline" className="w-fit">Change password</Button>
            <Button variant="outline" className="w-fit">Sign out everywhere</Button>
            <Button variant="destructive" className="w-fit">Delete workspace</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
