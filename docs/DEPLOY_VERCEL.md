# Vercel Deploy (ComfyWizardUI)

## 1) Connect project

1. Push this repo to GitHub.
2. In Vercel: **Add New Project** -> import repo.
3. Framework preset: **Next.js**.

## 2) Set environment variables (Project Settings -> Environment Variables)

Required for durable waitlist storage:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `WAITLIST_STORE_KEY` = `comfywizard:waitlist:store` (optional, but recommended)

Optional:

- `WAITLIST_DATA_DIR` (local fallback only, normally not needed on Vercel)

## 3) Analytics IDs (already wired in code)

- GA4 Measurement ID: `G-FJKYKD6BSL`
- Clarity Project ID: `vlrsb6sbtl`

## 4) Domain

1. Vercel -> Project -> **Domains**
2. Add `comfywizard.tech`
3. Add `www.comfywizard.tech` (optional)
4. Point DNS records to Vercel as instructed in UI.

## 5) Post-deploy checks

1. Open `/waitlist/alt?funnel=install&utm_source=reddit&utm_medium=social&utm_campaign=launch&utm_content=post_a`
2. Submit waitlist form.
3. Verify:
   - GA4 Realtime events appear.
   - Clarity session appears.
   - Signup/event data appears in Upstash key `comfywizard:waitlist:store`.
