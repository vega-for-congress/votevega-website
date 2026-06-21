# Form Submission Worker

Cloudflare Worker with Turnstile bot protection and VegaVan contact sync.

## Quick Setup

```bash
cd workers/form-submission
bun install

# Set secrets
wrangler secret put TURNSTILE_SECRET_KEY
wrangler secret put TURNSTILE_TEST_SECRET_KEY
wrangler secret put RESEND_API_KEY
wrangler secret put VEGAVAN_API_KEY

# Deploy
bun run deploy
```

## VegaVan Contract

The worker now treats VegaVan as the primary system of record.

- Preferred endpoint: `POST /api/contacts/upsert`
- Fallback endpoint: `POST /api/contacts/ingest`

The worker sends:
- contact identity fields
- volunteer interests
- canvass date selections
- source, verification, and opt-in metadata
- a human-readable organizer note

## After Deployment

Verify:
- `VEGAVAN_API_URL` points at the correct VegaVan instance
- `VEGAVAN_API_KEY` has access to the contact upsert or ingest endpoint
- the frontend worker URL in `static/js/main.js` still matches this worker deployment

## Commands

- `bun run dev` - Local testing on `localhost:8787`
- `bun run deploy` - Deploy to production
- `bun run tail` - View live logs
