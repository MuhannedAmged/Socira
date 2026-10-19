"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconCloudUpload,
  IconFile,
  IconLoader2,
  IconPhoto,
  IconTrash,
  IconVideo,
} from "@tabler/icons-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: string;
  path: string;
  mime: string;
  size: number;
  width: number | null;
  height: number | null;
  durationSec: number | null;
  status: string;
  createdAt: string;
  url: string | null;
}

const IMAGE_MAX = 25 * 1024 * 1024;
const VIDEO_MAX = 512 * 1024 * 1024;

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function imageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

function videoDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      resolve(Number.isFinite(video.duration) ? Math.round(video.duration) : null);
      URL.revokeObjectURL(url);
    };
    video.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    video.src = url;
  });
}

export default function MediaPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const load = useCallback(() => {
    fetch("/api/media")
      .then((r) => {
        if (r.status === 401) {
          router.replace("/login?next=/media");
          return { items: [] };
        }
        return r.ok ? r.json() : { items: [] };
      })
      .then((data) => setItems(Array.isArray(data.items) ? data.items : []))
      .catch(() => setItems([]));
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const upload = useCallback(
    async (file: File) => {
      setNotice(null);
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (!isImage && !isVideo) {
        setNotice({ ok: false, text: `${file.name} is not an image or video.` });
        return;
      }
      const max = isImage ? IMAGE_MAX : VIDEO_MAX;
      if (file.size > max) {
        setNotice({ ok: false, text: `${file.name} is larger than ${Math.round(max / (1024 * 1024))} MB.` });
        return;
      }
      setUploading(file.name);
      try {
        const signRes = await fetch("/api/media/sign", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ filename: file.name, mime: file.type, size: file.size }),
        });
        const sign = await signRes.json().catch(() => ({}));
        if (!signRes.ok) {
          setNotice({ ok: false, text: sign.error ?? "Could not start the upload." });
          return;
        }
        const put = await fetch(sign.signedUrl, {
          method: "PUT",
          headers: { "content-type": file.type, "x-upsert": "false" },
          body: file,
        });
        if (!put.ok) {
          setNotice({ ok: false, text: "Upload failed while transferring the file." });
          return;
        }
        const meta = isImage ? await imageDimensions(file) : null;
        const durationSec = isVideo ? await videoDuration(file) : null;
        const recordRes = await fetch("/api/media", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            path: sign.path,
            mime: file.type,
            size: file.size,
            width: meta?.width,
            height: meta?.height,
            durationSec: durationSec ?? undefined,
          }),
        });
        if (!recordRes.ok) {
          const data = await recordRes.json().catch(() => ({}));
          setNotice({ ok: false, text: data.error ?? "Uploaded, but the library entry was not saved." });
          return;
        }
        setNotice({ ok: true, text: `${file.name} uploaded.` });
        load();
      } catch {
        setNotice({ ok: false, text: "Upload failed. Check that storage is configured." });
      } finally {
        setUploading(null);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [load],
  );

  async function remove(id: string) {
    setNotice(null);
    setBusy(id);
    try {
      const res = await fetch("/api/media", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setNotice({ ok: false, text: data.error ?? "Could not delete this asset." });
        return;
      }
      setNotice({ ok: true, text: "Asset deleted." });
      load();
    } finally {
      setBusy(null);
    }
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Media library"
        subtitle="Private Supabase bucket · user-scoped paths · signed URLs · ownership checks."
        action={
          <Button disabled={Boolean(uploading)} onClick={() => inputRef.current?.click()}>
            {uploading ? <IconLoader2 className="animate-spin" /> : <IconCloudUpload />}
            {uploading ? "Uploading…" : "Upload"}
          </Button>
        }
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
        }}
      />

      {notice ? (
        <p
          role="status"
          className={cn(
            "mb-4 rounded-xl border border-border bg-card px-4 py-3 text-[13px] leading-5",
            notice.ok ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
          )}
        >
          {notice.text}
        </p>
      ) : null}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void upload(file);
        }}
        className={cn("rounded-2xl transition-colors", dragging && "ring-2 ring-primary ring-offset-2 ring-offset-background")}
      >
        {items === null ? (
          <Card>
            <CardContent className="flex items-center gap-2 pt-5 text-sm text-muted-foreground">
              <IconLoader2 className="animate-spin" /> Loading…
            </CardContent>
          </Card>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<IconPhoto />}
            title="No media yet"
            description="Upload images and videos, or drop a file here. Assets are stored in your own private folder and served with short-lived signed URLs."
            action={
              <Button variant="outline" onClick={() => inputRef.current?.click()}>
                <IconCloudUpload /> Choose a file
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const isImage = item.mime.startsWith("image/");
              return (
                <Card key={item.id} className="overflow-hidden">
                  <div className="relative flex aspect-video items-center justify-center bg-muted">
                    {item.url && isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt={item.path} className="size-full object-cover" />
                    ) : item.url && !isImage ? (
                      <video src={item.url} className="size-full object-cover" controls preload="metadata" />
                    ) : (
                      <span className="flex flex-col items-center gap-1 text-muted-foreground">
                        {isImage ? <IconPhoto className="size-6" /> : <IconVideo className="size-6" />}
                        <span className="text-[11px]">Preview unavailable</span>
                      </span>
                    )}
                  </div>
                  <CardContent className="flex items-center justify-between gap-3 pt-3">
                    <span className="flex min-w-0 items-center gap-2">
                      <IconFile className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium">
                          {item.path.split("/").pop()}
                        </span>
                        <span className="tnum block text-[11px] text-muted-foreground">
                          {humanSize(item.size)}
                          {item.width && item.height ? ` · ${item.width}×${item.height}` : ""}
                          {item.durationSec ? ` · ${item.durationSec}s` : ""}
                        </span>
                      </span>
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete asset"
                      title="Delete asset"
                      disabled={busy === item.id}
                      onClick={() => remove(item.id)}
                    >
                      {busy === item.id ? <IconLoader2 className="animate-spin" /> : <IconTrash />}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
