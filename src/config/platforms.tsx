import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTiktok,
  IconBrandX,
  IconBrandYoutube,
  type Icon,
} from "@tabler/icons-react";

export type PlatformId = "instagram" | "facebook" | "youtube" | "linkedin" | "tiktok" | "x";

export interface PlatformMeta {
  id: PlatformId;
  name: string;
  icon: Icon;
  handleHint: string;
  charLimit: number;
  mediaNote: string;
}

export const PLATFORMS: PlatformMeta[] = [
  { id: "instagram", name: "Instagram", icon: IconBrandInstagram, handleHint: "@handle", charLimit: 2200, mediaNote: "Images, video & carousel" },
  { id: "facebook", name: "Facebook", icon: IconBrandFacebook, handleHint: "Page", charLimit: 63206, mediaNote: "Text, image & video" },
  { id: "youtube", name: "YouTube", icon: IconBrandYoutube, handleHint: "Channel", charLimit: 5000, mediaNote: "Video + native scheduling" },
  { id: "linkedin", name: "LinkedIn", icon: IconBrandLinkedin, handleHint: "Profile / Page", charLimit: 3000, mediaNote: "Text, image & video" },
  { id: "tiktok", name: "TikTok", icon: IconBrandTiktok, handleHint: "@handle", charLimit: 2200, mediaNote: "Short video" },
  { id: "x", name: "X", icon: IconBrandX, handleHint: "@handle", charLimit: 280, mediaNote: "Text-first, media optional" },
];

export const platformById = (id: string): PlatformMeta | undefined =>
  PLATFORMS.find((p) => p.id === id);
