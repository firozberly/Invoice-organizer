import { extractInvoiceFields } from './invoiceParser.js';

const SAMPLE_EMAILS = [
  {
    id: 'msg_001',
    from: 'billing@lexbridge-law.com',
    subject: 'Invoice LB-2026-041 for UltraHuman legal advisory',
    receivedDate: '2026-06-01',
    bodyText: `Vendor: LexBridge Law LLP
Invoice Number: LB-2026-041
Invoice Date: 2026-05-31
Due Date: 2026-06-15
Payment Terms: Net 15
Total: INR 245,000.00
Monthly advisory and contract review services.`,
    attachments: [{ name: 'LB-2026-041.pdf' }]
  },
  {
    id: 'msg_002',
    from: 'accounts@clouddocs.example',
    subject: 'CloudDocs subscription invoice INV-8831',
    receivedDate: '2026-06-02',
    bodyText: `Supplier: CloudDocs
Inv # INV-8831
Date: 2026-06-01
Terms: Net 30
Amount: USD 1,200.00
Annual document repository software license renewal.`,
    attachments: [{ name: 'invoice-8831.pdf' }, { name: 'tax-certificate.pdf' }]
  },
  {
    id: 'msg_003',
    from: 'filings@corpsecretarial.example',
    subject: 'Statutory filing fees - May',
    receivedDate: '2026-06-03',
    bodyText: `Vendor: Corp Secretarial Services
Invoice No: CSS-9940
Invoice Date: 2026-06-02
Payment Terms: Due on receipt
Balance Due: ₹85,500.00
Compliance filing support and registry fees.`,
    attachments: [{ name: 'CSS-9940.pdf' }]
  }
];

export const invoices = SAMPLE_EMAILS.map((email) => ({
  id: email.id,
  ...extractInvoiceFields(email)
}));
