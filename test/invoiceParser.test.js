import test from 'node:test';
import assert from 'node:assert/strict';
import { categorizeInvoice, extractInvoiceFields, invoicesToCsv } from '../src/invoiceParser.js';

test('extracts core invoice fields from a forwarded email', () => {
  const invoice = extractInvoiceFields({
    from: 'billing@legalfirm.example',
    subject: 'Invoice LF-101',
    receivedDate: '2026-06-03',
    bodyText: `Vendor: Legal Firm LLP
Invoice Number: LF-101
Invoice Date: 2026-06-01
Due Date: 2026-06-16
Payment Terms: Net 15
Total: INR 123,456.78`,
    attachments: [{ name: 'invoice.pdf' }]
  });

  assert.equal(invoice.vendorName, 'Legal Firm LLP');
  assert.equal(invoice.invoiceNumber, 'LF-101');
  assert.equal(invoice.paymentTerms, 'Net 15');
  assert.equal(invoice.currency, 'INR');
  assert.equal(invoice.amount, 123456.78);
  assert.equal(invoice.category, 'Legal - Outside Counsel');
  assert.equal(invoice.attachmentNames, 'invoice.pdf');
});

test('categorizes software subscriptions', () => {
  assert.equal(categorizeInvoice({ bodyText: 'Annual SaaS subscription license renewal' }), 'Software & SaaS');
});

test('escapes CSV values for Excel and Zoho imports', () => {
  const csv = invoicesToCsv([
    { vendorName: 'A, B & Co', notes: 'Review "tax" line', amount: 10 }
  ], ['vendorName', 'notes', 'amount']);

  assert.equal(csv, 'vendorName,notes,amount\n"A, B & Co","Review ""tax"" line",10');
});
