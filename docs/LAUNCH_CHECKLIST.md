# Launch Checklist (X + Reddit)

Launch target: **Friday, February 27, 2026**.

## 1) Must-pass before posting

- [x] Domain/canonical path works: `/` -> `/waitlist`
- [x] Waitlist submit works in production and stores data (Upstash)
- [ ] GA4 realtime receives: `lp_view`, `cta_waitlist_click`, `waitlist_signup_submitted`
- [ ] Clarity records fresh session on `/waitlist`
- [x] Discord invite works: `https://discord.gg/5KtWuSfNrp`
- [x] Install command on sample workflow is copy/paste-ready
- [x] RunPod token naming is consistent everywhere: `HF_TOKEN`, `CIVITAI_TOKEN`
- [x] UTM links are prepared per channel/post
- [x] Final smoke test: `npm run lint && npm run test && npm run build`

## Verified now (February 25, 2026)

- Production route checks:
  - `/` returns `307` to `/waitlist`
  - `/waitlist` returns `200`
  - `/workflows` returns `200`
  - `/workflow/sample` returns `200`
  - `/about` and `/collections` return `404`
- Legacy waitlist routes:
  - `/waitlist/alt` -> `/waitlist?funnel=install`
  - `/waitlist/install` -> `/waitlist?funnel=install`
  - `/waitlist/hub` -> `/waitlist?funnel=hub`
- Installer API checks:
  - `/api/install/workflows/sample?version=1.0.0` returns schema `1.0`, 11 dependencies, 3 custom nodes
  - `/api/install/script` contains required env names and installs to `/workspace/ComfyUI/user/default/workflows/ComfyWizard`
- Waitlist API checks:
  - `POST /api/track` returned `{ ok: true }`
  - `POST /api/waitlist/signup` returned `{ ok: true }`
- Quality gates:
  - `npm run lint` passed
  - `npm run test` passed
  - `npm run build` passed

## 2) Where to post first

1. X (primary launch thread + 1 reply with direct waitlist CTA)
2. Reddit `r/comfyui` (main launch post, value-first, include sample workflow page)
3. Reddit `r/StableDiffusion` (use monthly promotion thread for direct product promotion)

## 3) Best posting windows (recommended for this launch)

Use local timezone of your main audience account (for now: ET/CET aligned test windows).

1. X primary window (Friday): 09:00-11:00 local time
2. X fallback window (Friday): 12:00-14:00 local time
3. Reddit primary window (Friday): 08:00-10:00 ET
4. Reddit fallback window (Friday): 11:00-13:00 ET

## 4) Friday execution runbook (February 27, 2026)

1. T-60 min
- Final click-through check on `/waitlist`, `/workflows`, `/workflow/sample`
- Verify UTMs open correctly
- Open GA4 Realtime + Upstash dashboard side-by-side
2. T-0
- Publish X thread with UTM `utm_source=x`
- Pin the thread or keep it as latest post for 24h
3. T+30 to T+60 min
- Publish Reddit post in `r/comfyui` with UTM `utm_source=reddit`
- First comment: concise setup flow + discord invite + sample link
4. T+2h
- Post in `r/StableDiffusion` promotion thread with same value framing and separate UTM `utm_content`
5. T+4h and T+8h
- Reply to every legit comment/question (no post-and-ghost)
- Capture objections in a small list for day-2 copy update

## 5) UTM templates

X:
`https://www.comfywizard.tech/waitlist?funnel=install&utm_source=x&utm_medium=social&utm_campaign=launch_2026_02_27&utm_content=thread_main`

Reddit (`r/comfyui`):
`https://www.comfywizard.tech/waitlist?funnel=hub&utm_source=reddit&utm_medium=social&utm_campaign=launch_2026_02_27&utm_content=r_comfyui_post`

Reddit (`r/StableDiffusion` promo thread):
`https://www.comfywizard.tech/waitlist?funnel=hub&utm_source=reddit&utm_medium=social&utm_campaign=launch_2026_02_27&utm_content=r_stablediffusion_promo`

## 6) Launch-day scorecard

- Landing views by source
- Waitlist submits by source
- Submit conversion rate by source
- Discord join clicks
- Activated Discord users (manual check)
- Top 5 objections from comments

## 7) 48-hour prep plan (start now)

1. Day -2 (today)
- Freeze copy and links
- Prepare 1 X thread draft + 1 Reddit `r/comfyui` draft + 1 promo-thread draft
- Validate tracking with real UTM links
2. Day -1
- Run full production smoke test
- Prepare visual assets (hero screenshot + sample workflow screenshot)
- Dry-run post sequence with exact timestamps
3. Day 0 (Friday)
- Execute runbook above
- Review metrics 12h after first post

## 8) Go/No-Go for week 2

- Go if: quality signups and Discord activation trend up across first 72h
- Hold and adjust if: high clicks but low submit rate (<10% landing-to-signup)

## Sources

- Hootsuite 2025 best time data (X: Wed-Fri, 9-11 AM): https://blog.hootsuite.com/best-time-to-post-on-social-media/
- Buffer 2025 X analysis (1M+ posts; Friday best window includes 8-9 AM): https://buffer.com/resources/best-time-to-post-on-twitter-x/
- Reddit spam/self-promo policy baseline: https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam
- `r/StableDiffusion` updated self-promo guidance context: https://www.reddit.com/r/StableDiffusion/comments/1f4zznt/updated_rules_for_this_subreddit/
- `r/StableDiffusion` monthly promotion thread format: https://www.reddit.com/r/StableDiffusion/comments/1ip0s39/monthly_promotion_megathread_february_2025/

Inference note:
- Reddit timing windows above are practical launch windows aligned with U.S. morning discovery behavior and should be A/B tested in your first 2 launch posts.
