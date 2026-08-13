# Papsnet lead conversion operations

## Installed identifiers

- Google Tag Manager: `GTM-WNWPBJMK`
- Google Analytics 4: `G-BSW4E81SS0`
- Lead notification address: `kimnardo@papsnet.net`

## Implemented events

| Event | Trigger |
| --- | --- |
| `form_start` | First trusted input in `contact.html` |
| `generate_lead` | First load of `contact-complete.html` per lead ID |
| `phone_click` | Click on a `tel:` link |
| `brochure_view` | Page view of `brochure.html` |

`generate_lead` includes `lead_id`, `lead_type`, and `product_interest`. Configure a GTM Custom Event trigger named `generate_lead`, connect it to the GA4 event tag, and mark that event as a key event in GA4. Do not publish a second GA4 page-view configuration tag in GTM while the direct `G-BSW4E81SS0` page tag is active, or page views will be duplicated.

## Production environment

Set these variables in Heroku before relying on email delivery:

```text
LEAD_NOTIFICATION_EMAIL=kimnardo@papsnet.net
RESEND_API_KEY=<production Resend API key>
LEAD_FROM_EMAIL=<verified sender on the papsnet.net domain>
DOWNLOAD_TOKEN_SECRET=<long random secret>
```

`FormSubmit` remains a delivery fallback, but the verified Resend sender is the recommended primary channel. A response with `deliveryPending: true` means the server archived the lead but email delivery has not yet been confirmed.

## Lead retention and audit

Every validated consultation request is written as one JSON object per line to `.data/contact-leads.jsonl` before email delivery is attempted. The same record is also written to the Heroku application log with the marker `[contact-lead-received]`.

Heroku's filesystem is ephemeral, so production must set `LEAD_WEBHOOK_URL` to a durable CRM, database, or spreadsheet webhook. The webhook receives the event `contact.requested` with the full validated lead payload. Until that webhook is configured, use the application logs as the recovery path:

```powershell
heroku logs --tail --app <app-name> | Select-String "contact-lead-received"
```

## Release verification

1. Open `/contact.html?type=diagnosis` and confirm the diagnosis copy.
2. Submit a real test lead and verify the URL changes to `/contact-complete.html`.
3. Verify the message arrives at `kimnardo@papsnet.net` and contains the same lead ID shown on the completion page.
4. In GTM Preview, confirm `form_start` and `generate_lead` are present.
5. In GA4 DebugView, confirm the same `generate_lead` event is received once.
6. Search Heroku logs for the lead ID to confirm the server-side backup record.
