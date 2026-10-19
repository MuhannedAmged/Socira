"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  IconCloudUpload,
  IconFile,
  IconLoader2,
  IconMaximize,
  IconPhoto,
  IconTrash,
  IconVideo,
  IconX,
} from "@tabler/icons-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { EASE_OUT, SPRING_PANEL } from "@/lib/ease";
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

function fileName(path: string) {
  return path.split("/").pop() || path;
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
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!preview) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreview(null);
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [preview]);

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
        subtitle="Private Supabase bucket · user-scoped paths · signed URLs · automatically deleted after 3 days."
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
            description="Upload images and videos, or drop a file here. Assets are stored in your own private folder, served with short-lived signed URLs, and removed after 3 days."
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
              const name = fileName(item.path);
              return (
                <Card key={item.id} className="overflow-hidden">
                  <div className="relative flex aspect-video items-center justify-center bg-muted">
                    {item.url && isImage ? (
                      <button
                        type="button"
                        onClick={() => setPreview(item)}
                        className="group relative flex size-full cursor-zoom-in items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                        aria-label={`Open ${name} full screen`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.url} alt={name} className="size-full object-cover" />
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-[background-color,opacity] duration-200 group-hover:bg-black/25 group-hover:opacity-100 group-focus-visible:bg-black/25 group-focus-visible:opacity-100">
                          <IconMaximize className="size-5 text-white" aria-hidden />
                        </span>
                      </button>
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
                        <span className="block truncate text-[13px] font-medium">{name}</span>
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

      {preview?.url
        ? createPortal(
            <motion.div
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-black/90 p-4 backdrop-blur-sm sm:p-8"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.18, ease: EASE_OUT }}
              role="dialog"
              aria-modal="true"
              aria-label={`Preview of ${fileName(preview.path)}`}
            >
              <button
                type="button"
                aria-label="Close preview"
                onClick={() => setPreview(null)}
                className="absolute inset-0 size-full cursor-zoom-out"
              />
              <button
                type="button"
                autoFocus
                onClick={() => setPreview(null)}
                className="absolute right-4 top-4 z-20 flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <IconX className="size-5" aria-hidden />
                <span className="sr-only">Close preview</span>
              </button>
              <motion.figure
                className="relative z-10 flex max-h-full max-w-full flex-col items-center gap-3"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={SPRING_PANEL}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.url}
                  alt={fileName(preview.path)}
                  className="max-h-[82vh] max-w-full rounded-xl object-contain shadow-2xl"
                />
                <figcaption className="max-w-full truncate px-12 text-center text-xs text-white/70">
                  {fileName(preview.path)}
                  {preview.width && preview.height ? ` · ${preview.width}×${preview.height}` : ""}
                  {" · "}
                  {humanSize(preview.size)}
                </figcaption>
              </motion.figure>
            </motion.div>,
            document.body,
          )
        : null}
    </DashboardShell>
  );
}
