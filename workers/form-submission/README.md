# Form Submission Worker

Cloudflare Worker with Turnstile bot protection → Baserow database

## Quick Setup

```bash
cd workers/form-submission
bun install

# Set secrets
wrangler secret put TURNSTILE_SECRET_KEY  # Get from dash.cloudflare.com/turnstile
wrangler secret put BASEROW_API_TOKEN     # Already in wrangler.toml comment

# Deploy
bun run deploy
```

## Baserow Columns (must match exactly)
- Name, Email, Phone, Zip, Source, User Agent, IP Address, Submitted At, Turnstile Verified

## After Deployment

Update `static/js/main.js` lines 295 & 297:
- Worker URL from deploy output
- Turnstile Site Key from dashboard

## Commands
- `bun run dev` - Local testing (localhost:8787)
- `bun run deploy` - Deploy to production  
- `bun run tail` - View live logs
