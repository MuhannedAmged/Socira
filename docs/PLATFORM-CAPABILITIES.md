# Platform capabilities (verified 2026-10-19)

Source: installed `@opencoredev/social-sdk@0.5.0` + `src/lib/social/capabilities.ts`. States: supported / partial / unsupported / requires_approval / requires_config / unverified. Nothing below is live-verified without approved apps and real accounts.

| Capability | Instagram | Facebook | YouTube | LinkedIn | TikTok | X |
|---|---|---|---|---|---|---|
| OAuth connection | requires_config | unsupported | requires_config | requires_config | requires_config | requires_config |
| Account discovery | requires_config | unsupported | requires_config | requires_config | requires_config | requires_config |
| Text publishing | unsupported | unsupported | partial | requires_config | partial | requires_config |
| Image publishing | requires_config | unsupported | unsupported | requires_config | partial | requires_config |
| Video publishing | requires_config | unsupported | requires_config | requires_config | requires_config | requires_config |
| Carousel / multi-media | requires_config | unsupported | unsupported | partial | unsupported | partial |
| Native scheduling | unsupported | unsupported | partial | unsupported | unsupported | unsupported |
| Drafts | supported | unsupported | supported | supported | supported | supported |
| Analytics | partial | unsupported | partial | partial | partial | partial |
| Comments / replies | partial | unsupported | partial | partial | partial | partial |
| Media retrieval | partial | unsupported | partial | partial | partial | partial |
| Post deletion | partial | unsupported | partial | partial | unsupported | partial |
| Webhooks | requires_config | unsupported | unsupported | unsupported | unsupported | requires_config |
| Token refresh | supported | unsupported | supported | supported | partial | supported |

Notes: Instagram is Business/Creator via Meta review (no native text-only posts). **Facebook is unsupported in the installed SDK**: it defines the platform name but ships no OAuth provider or adapter, so the connect UI marks it unavailable. YouTube is the only adapter with documented native schedule support — recheck before passing `schedule` elsewhere. TikTok is video-first with privacy/audit rules. X posting needs an approved project. UI disables unsupported operations with these explanations instead of failing at publish time.
