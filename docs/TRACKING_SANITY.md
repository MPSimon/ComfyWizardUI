# Tracking Sanity Checklist (Launch)

Use this before posting on Reddit/X.

## 1) Start app

```bash
cd /Users/max/www/ComfyWizardUI
npm run dev
```

## 2) Open waitlist with UTM params

Install funnel:

```text
http://localhost:3000/waitlist?funnel=install&utm_source=reddit&utm_medium=social&utm_campaign=waitlist_launch&utm_content=post_a
```

Hub funnel:

```text
http://localhost:3000/waitlist?funnel=hub&utm_source=x&utm_medium=social&utm_campaign=waitlist_launch&utm_content=post_b
```

## 3) Verify key events fire

For each funnel URL above:

1. Open page -> should track `lp_view`.
2. Click `Join now!` -> submit form -> should track `cta_waitlist_click` and `waitlist_signup_submitted`.
3. Click `Join Discord onboarding` -> should track `discord_join_clicked`.
4. (Optional) Trigger install-intent button where available -> should track `install_intent_clicked`.

## 4) Verify data actually stored

```bash
cat /Users/max/www/ComfyWizardUI/.data/waitlist-store.json
```

Check:

- `signups[]` contains `email`, `role`, `stack`, `funnelId`
- signup includes `utmSource`, `utmMedium`, `utmCampaign`, `utmContent`
- `events[]` contains the event names above with matching `funnelId`
- events include `metadata.utm*`

## 5) Fast metrics spot check

You should see non-zero counts after testing:

- install funnel: `lp_view`, `cta_waitlist_click`, `waitlist_signup_submitted`
- hub funnel: `lp_view` at minimum

## 6) Automated local guard

```bash
cd /Users/max/www/ComfyWizardUI
npm run lint
npm run test
```

`src/lib/waitlist-store.test.ts` validates:

- signup + UTM storage
- key event counters by funnel
- event metadata persistence
