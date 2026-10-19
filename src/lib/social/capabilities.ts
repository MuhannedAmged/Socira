/* Honest capability registry — verified against installed @opencoredev/social-sdk.
 * Statuses: supported | partial | unsupported | requires_approval | requires_config | unverified
 * Never claim live-verified without a real publish against an approved app.
 */

export type CapabilityState =
  | "supported"
  | "partial"
  | "unsupported"
  | "requires_approval"
  | "requires_config"
  | "unverified";

export interface PlatformCapabilities {
  platform: string;
  oauth: CapabilityState;
  discovery: CapabilityState;
  text: CapabilityState;
  image: CapabilityState;
  video: CapabilityState;
  carousel: CapabilityState;
  nativeScheduling: CapabilityState;
  drafts: CapabilityState;
  analytics: CapabilityState;
  comments: CapabilityState;
  mediaRetrieval: CapabilityState;
  postDeletion: CapabilityState;
  webhooks: CapabilityState;
  tokenRefresh: CapabilityState;
  notes: string;
}

const SDK_VERSION = "0.5.0";
const LAST_CHECKED = "2026-10-19";

export const CAPABILITIES: PlatformCapabilities[] = [
  {
    platform: "instagram", oauth: "requires_config", discovery: "requires_config",
    text: "unsupported", image: "requires_config", video: "requires_config",
    carousel: "requires_config", nativeScheduling: "unsupported", drafts: "supported",
    analytics: "partial", comments: "partial", mediaRetrieval: "partial",
    postDeletion: "partial", webhooks: "requires_config", tokenRefresh: "supported",
    notes: "Business/Creator via Meta app review. Text-only posts are not native to Instagram.",
  },
  {
    platform: "facebook", oauth: "unsupported", discovery: "unsupported",
    text: "unsupported", image: "unsupported", video: "unsupported",
    carousel: "unsupported", nativeScheduling: "unsupported", drafts: "unsupported",
    analytics: "unsupported", comments: "unsupported", mediaRetrieval: "unsupported",
    postDeletion: "unsupported", webhooks: "unsupported", tokenRefresh: "unsupported",
    notes: "@opencoredev/social-sdk@0.5.0 has no Facebook OAuth provider or adapter, so Facebook cannot be connected. Enable it via a managed backend when one is configured.",
  },
  {
    platform: "youtube", oauth: "requires_config", discovery: "requires_config",
    text: "partial", image: "unsupported", video: "requires_config",
    carousel: "unsupported", nativeScheduling: "partial", drafts: "supported",
    analytics: "partial", comments: "partial", mediaRetrieval: "partial",
    postDeletion: "partial", webhooks: "unsupported", tokenRefresh: "supported",
    notes: "Only direct adapter with documented native schedule support. Uploads need Google OAuth + quota.",
  },
  {
    platform: "linkedin", oauth: "requires_config", discovery: "requires_config",
    text: "requires_config", image: "requires_config", video: "requires_config",
    carousel: "partial", nativeScheduling: "unsupported", drafts: "supported",
    analytics: "partial", comments: "partial", mediaRetrieval: "partial",
    postDeletion: "partial", webhooks: "unsupported", tokenRefresh: "supported",
    notes: "Member + organization posts need w_member_social / w_organization_social scopes.",
  },
  {
    platform: "tiktok", oauth: "requires_config", discovery: "requires_config",
    text: "partial", image: "partial", video: "requires_config",
    carousel: "unsupported", nativeScheduling: "unsupported", drafts: "supported",
    analytics: "partial", comments: "partial", mediaRetrieval: "partial",
    postDeletion: "unsupported", webhooks: "unsupported", tokenRefresh: "partial",
    notes: "Video-first. Draft/post privacy settings and audit approval apply.",
  },
  {
    platform: "x", oauth: "requires_config", discovery: "requires_config",
    text: "requires_config", image: "requires_config", video: "requires_config",
    carousel: "partial", nativeScheduling: "unsupported", drafts: "supported",
    analytics: "partial", comments: "partial", mediaRetrieval: "partial",
    postDeletion: "partial", webhooks: "requires_config", tokenRefresh: "supported",
    notes: "Free tier is read-heavy; posting needs approved project + OAuth 2.0 scopes.",
  },
];

export const SDK_META = { version: SDK_VERSION, lastChecked: LAST_CHECKED };

export function capabilityFor(platform: string): PlatformCapabilities | undefined {
  return CAPABILITIES.find((c) => c.platform === platform);
}

export function canPublishText(platform: string): boolean {
  const c = capabilityFor(platform);
  return c?.text === "supported";
}
