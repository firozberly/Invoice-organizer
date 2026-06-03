# Invoice Organizer architecture

## Goal

UltraHuman legal counsel should be able to forward invoice emails to a controlled Google Workspace mailbox. The application signs users in with UltraHuman organization credentials, extracts key fields from the email and attachments, and exports a spreadsheet that can be uploaded to Zoho Sheets.

## Production workflow

1. **Google Workspace sign-in**
   - Create a Google Cloud OAuth client restricted to the UltraHuman Workspace domain.
   - Request the minimum scopes needed for profile and Gmail read access.
   - Enforce domain membership server-side, not only in the browser.
2. **Shared invoice intake mailbox**
   - Configure an account such as `legal-invoices@ultrahuman.com` or a Google Group that archives forwarded mail.
   - Use Gmail API watches with Pub/Sub for near real-time ingestion, or scheduled Gmail API polling for a simpler first deployment.
3. **Extraction pipeline**
   - Store the raw Gmail message ID, sender, subject, received date, and attachment metadata.
   - Extract text from PDFs or images with OCR where required.
   - Normalize vendor, invoice number, invoice date, due date, amount, currency, payment terms, tax IDs, and attachment filenames.
   - Mark all rows as `Needs review` until counsel validates them against the source attachment.
4. **Review and export**
   - Present invoices in a searchable web register.
   - Export CSV/XLSX columns in the same order expected by Zoho Sheets.
   - Keep a source message link for auditability.

## Suggested data model

| Field | Purpose |
| --- | --- |
| `gmailMessageId` | Immutable source email reference. |
| `receivedDate` | Date the intake mailbox received the forwarded email. |
| `sourceEmail` | Original sender or forwarding counsel. |
| `vendorName` | Normalized supplier name. |
| `invoiceNumber` | Vendor invoice reference. |
| `invoiceDate` | Date printed on invoice. |
| `dueDate` | Due date if explicit or calculated from payment terms. |
| `paymentTerms` | Examples: Net 15, Net 30, Due on receipt. |
| `currency` | ISO code such as INR or USD. |
| `amount` | Invoice total payable. |
| `category` | Legal, SaaS, compliance, operations, or uncategorized. |
| `status` | Needs review, Approved for Zoho, Exported, or Rejected. |
| `attachmentNames` | Source files attached to the email. |
| `notes` | Reviewer comments or extraction warnings. |

## Security and controls

- Restrict login to UltraHuman's Google Workspace domain.
- Use least-privilege Gmail scopes and store OAuth tokens encrypted.
- Preserve source emails and attachments for audit trails.
- Maintain reviewer, approval, and export timestamps.
- Prevent duplicate imports using Gmail message ID plus invoice number.
- Keep production secrets outside the repository in the deployment environment.
