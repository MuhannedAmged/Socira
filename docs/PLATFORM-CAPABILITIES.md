# Platform capabilities (verified 2026-10-15)

Source: installed `@opencoredev/social-sdk` + `src/lib/social/capabilities.ts`. States: supported / partial / unsupported / requires_approval / requires_config / unverified. Nothing below is live-verified without approved apps and real accounts.

| Capability | Instagram | Facebook | YouTube | LinkedIn | TikTok | X |
|---|---|---|---|---|---|---|
| OAuth connection | requires_config | requires_config | requires_config | requires_config | requires_config | requires_config |
| Account discovery | requires_config | requires_config | requires_config | requires_config | requires_config | requires_config |
| Text publishing | unsupported | requires_config | partial | requires_config | partial | requires_config |
| Image publishing | requires_config | requires_config | unsupported | requires_config | partial | requires_config |
| Video publishing | requires_config | requires_config | requires_config | requires_config | requires_config | requires_config |
| Carousel / multi-media | requires_config | partial | unsupported | partial | unsupported | partial |
| Native scheduling | unsupported | unsupported | partial | unsupported | unsupported | unsupported |
| Drafts | supported | supported | supported | supported | supported | supported |
| Analytics | partial | partial | partial | partial | partial | partial |
| Comments / replies | partial | partial | partial | partial | partial | partial |
| Media retrieval | partial | partial | partial | partial | partial | partial |
| Post deletion | partial | partial | partial | partial | unsupported | partial |
| Webhooks | requires_config | requires_config | unsupported | unsupported | unsupported | requires_config |
| Token refresh | supported | supported | supported | supported | partial | supported |

Notes: Instagram is Business/Creator via Meta review (no native text-only posts). Facebook uses Page tokens. YouTube is the only adapter with documented native schedule support — recheck before passing `schedule` elsewhere. TikTok is video-first with privacy/audit rules. X posting needs an approved project. UI disables unsupported operations with these explanations instead of failing at publish time.
