# Invoice Organizer

A web-based invoice intake prototype for UltraHuman's legal team. Counsel can forward invoice emails to a shared Google Workspace intake address, review extracted invoice details in a searchable register, and download an Excel/Zoho-compatible CSV.

## Current prototype

- Browser UI for invoice review and CSV export.
- Demo API with sample forwarded invoice emails.
- Extraction helpers for vendor, invoice number, invoice dates, payment terms, currency, amount, category, and attachment names.
- Architecture notes for Google Workspace OAuth, Gmail ingestion, and Zoho-ready exports.

## Quick start

```bash
npm start
```

Open <http://localhost:3000>.

## Tests

```bash
npm test
```

## Configuration

The prototype runs without secrets in demo mode. Production deployments should provide these environment variables through the hosting platform, not through committed files.

| Variable | Purpose |
| --- | --- |
| `GOOGLE_WORKSPACE_DOMAIN` | Workspace domain allowed to sign in. Defaults to `ultrahuman.com`. |
| `INTAKE_EMAIL` | Mailbox or Google Group where invoices are forwarded. Defaults to `legal-invoices@ultrahuman.com`. |
| `GOOGLE_CLIENT_ID` | Enables the UI to indicate Workspace OAuth mode once server-side OAuth is wired. |

## Production roadmap

1. Create a Google Cloud project and OAuth client restricted to UltraHuman's Google Workspace domain.
2. Add server-side OAuth session handling and domain enforcement.
3. Connect the Gmail API to the shared intake mailbox with Pub/Sub watches or scheduled polling.
4. Add PDF text extraction/OCR for invoice attachments.
5. Persist invoices, reviewers, approvals, exports, and source Gmail IDs in a database.
6. Export a Zoho Sheets template, or call Zoho APIs after legal review approval.

See [docs/architecture.md](docs/architecture.md) for implementation details and security controls.
