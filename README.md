# ComfyWizardUI

Customer-facing MVP for a ComfyUI workflow hub + waitlist launch.

## Current surface

- Landing redirect: `/` -> `/waitlist`
- Waitlist (canonical): `/waitlist`
- Workflow hub: `/workflows`
- Workflow detail: `/workflow/[slug]`
- Install API script: `/api/install/script`
- Install manifest API: `/api/install/workflows/[slug]?version=<semver>`
- Convenience redirects:
  - `/waitlist/alt` -> `/waitlist`
  - `/waitlist/install` -> `/waitlist?funnel=install`
  - `/waitlist/hub` -> `/waitlist?funnel=hub`

Current workflow catalog is intentionally limited to one sample listing.

## What is implemented

- Full-card clickable workflow cards (accessible single-link pattern)
- Dependency-aware workflow detail page
- Join modal waitlist flow (`Join now!`)
- Waitlist tracking + signup APIs
- Anti-spam rate limiting on waitlist APIs
- UTM capture (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`)
- Waitlist storage with Upstash Redis support (Vercel-ready) + local JSON fallback
- Local Civitai brand asset (`/public/brands/civitai.png`)

## Waitlist storage

- Production (recommended): Upstash Redis via environment variables:

```bash
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
WAITLIST_STORE_KEY=comfywizard:waitlist:store
```

- Local fallback (if Upstash vars are missing): data is persisted to `/.data/waitlist-store.json`.
- You can override local fallback directory with:

```bash
WAITLIST_DATA_DIR=/absolute/path/to/storage
```

## One-command installer

The workflow detail page now shows a real install command, for example:

```bash
curl -fsSL https://www.comfywizard.tech/api/install/script | bash -s -- --workflow sample --version 1.0.0
```

Installer behavior:

- Fetches install manifest from `/api/install/workflows/<slug>`
- Downloads workflow JSON + dependencies to ComfyUI folders
- Installs custom nodes as best-effort
- Uses deterministic exit codes (`0`, `2`, `3`, `4`)

Optional runtime env vars:

- `HF_TOKEN` for gated Hugging Face assets
- `CIVITAI_TOKEN` for Civitai downloads
- `ARTIFACT_AUTH` for private URL sources

## Analytics (GA4)

- GA4 is wired with Measurement ID: `G-FJKYKD6BSL`
- Script is injected in:
  - `/Users/max/www/ComfyWizardUI/src/components/shared/google-analytics.tsx`
- Events sent to GA4:
  - `lp_view`
  - `cta_waitlist_click`
  - `waitlist_signup_submitted`
  - `discord_join_clicked`
  - `install_intent_clicked`

Use GA4 Realtime report to verify event flow while testing:

- [Google Analytics Realtime](https://analytics.google.com/)

## Analytics (Microsoft Clarity)

- Clarity is wired with Project ID: `vlrsb6sbtl`
- Script is injected in:
  - `/Users/max/www/ComfyWizardUI/src/components/shared/microsoft-clarity.tsx`

Use Clarity dashboard to verify recordings and heatmaps:

- [Microsoft Clarity](https://clarity.microsoft.com/)

## Run

```bash
npm install
npm run dev
```

Open:
- `http://localhost:3000/waitlist`
- `http://localhost:3000/workflows`
- `http://localhost:3000/workflow/sample`

## Quality checks

```bash
npm run lint
npm test
npm run build
```

## Strategy docs

- `docs/PRODUCT_STRATEGY.md`
- `docs/MARKETING_TRACTION_PLAN.md`
- `docs/WAITLIST_PAGE_PLAYBOOK.md`
- `docs/INTERNAL_BUSINESS_NOTES.md`

## Data adapter contract

- `getWorkflowList(params)`
- `getWorkflowBySlug(slug)`
- `getWorkflowDependencies(workflowVersionId)`

Current adapter is JSON-backed and can be swapped later.
