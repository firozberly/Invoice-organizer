const CATEGORY_RULES = [
  { category: 'Legal - Outside Counsel', patterns: [/law/i, /legal/i, /counsel/i, /advocate/i, /attorney/i] },
  { category: 'Software & SaaS', patterns: [/software/i, /saas/i, /subscription/i, /license/i, /cloud/i] },
  { category: 'Compliance & Filings', patterns: [/compliance/i, /filing/i, /registration/i, /statutory/i] },
  { category: 'Operations', patterns: [/courier/i, /printing/i, /office/i, /operations/i] }
];

const DEFAULT_COLUMNS = [
  'receivedDate',
  'sourceEmail',
  'vendorName',
  'invoiceNumber',
  'invoiceDate',
  'dueDate',
  'paymentTerms',
  'currency',
  'amount',
  'category',
  'status',
  'attachmentNames',
  'notes'
];

export function categorizeInvoice({ vendorName = '', subject = '', bodyText = '' } = {}) {
  const haystack = `${vendorName} ${subject} ${bodyText}`;
  const match = CATEGORY_RULES.find((rule) => rule.patterns.some((pattern) => pattern.test(haystack)));
  return match?.category ?? 'Uncategorized';
}

export function extractInvoiceFields(email) {
  const bodyText = email.bodyText ?? '';
  const subject = email.subject ?? '';
  const vendorName = extractFirst(bodyText, /(?:vendor|from|supplier)\s*:\s*(.+)/i) ?? inferVendorFromSender(email.from);
  const invoiceNumber = extractFirst(`${subject}\n${bodyText}`, /(?:invoice\s*(?:no\.?|number|#)|inv\s*#)\s*[:#-]?\s*([A-Z0-9-]+)/i);
  const amountMatch = `${subject}\n${bodyText}`.match(/(?:amount|total|balance due)\s*[:#-]?\s*(INR|USD|EUR|GBP|₹|\$|€|£)?\s*([0-9][0-9,]*(?:\.\d{2})?)/i);
  const terms = extractFirst(bodyText, /(?:payment terms|terms)\s*:\s*(.+)/i) ?? extractFirst(bodyText, /\b(Net\s*\d{1,3})\b/i);

  const currency = normalizeCurrency(amountMatch?.[1]);
  const amount = amountMatch ? Number(amountMatch[2].replace(/,/g, '')) : null;

  return {
    receivedDate: email.receivedDate ?? new Date().toISOString().slice(0, 10),
    sourceEmail: email.from ?? '',
    vendorName,
    invoiceNumber: invoiceNumber ?? '',
    invoiceDate: extractFirst(bodyText, /(?:invoice date|date)\s*:\s*(\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i) ?? '',
    dueDate: extractFirst(bodyText, /(?:due date|pay by)\s*:\s*(\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i) ?? '',
    paymentTerms: terms ?? '',
    currency,
    amount,
    category: categorizeInvoice({ vendorName, subject, bodyText }),
    status: 'Needs review',
    attachmentNames: (email.attachments ?? []).map((attachment) => attachment.name).join('; '),
    notes: 'Auto-extracted from forwarded email. Verify against attachment before payment.'
  };
}

export function invoicesToCsv(invoices, columns = DEFAULT_COLUMNS) {
  const header = columns.join(',');
  const rows = invoices.map((invoice) => columns.map((column) => csvEscape(formatValue(invoice[column]))).join(','));
  return [header, ...rows].join('\n');
}

function extractFirst(text, regex) {
  const match = text.match(regex);
  return match?.[1]?.trim();
}

function inferVendorFromSender(sender = '') {
  const email = sender.match(/[A-Z0-9._%+-]+@([A-Z0-9.-]+)\.[A-Z]{2,}/i)?.[1];
  if (!email) return 'Unknown vendor';
  return email
    .split('.')
    .filter((part) => !['mail', 'email', 'billing', 'accounts'].includes(part.toLowerCase()))
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeCurrency(symbol) {
  if (!symbol) return 'INR';
  const normalized = symbol.toUpperCase();
  if (normalized === '₹') return 'INR';
  if (normalized === '$') return 'USD';
  if (normalized === '€') return 'EUR';
  if (normalized === '£') return 'GBP';
  return normalized;
}

function formatValue(value) {
  if (value === null || value === undefined) return '';
  return String(value);
}

function csvEscape(value) {
  if (!/[",\n]/.test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
}
