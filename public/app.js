const state = { invoices: [], filter: '' };

const rows = document.querySelector('#invoice-rows');
const filter = document.querySelector('#filter');
const signIn = document.querySelector('#sign-in');

async function init() {
  const [configResponse, invoicesResponse] = await Promise.all([
    fetch('/api/config'),
    fetch('/api/invoices')
  ]);
  const config = await configResponse.json();
  const payload = await invoicesResponse.json();

  state.invoices = payload.invoices;
  document.querySelector('#intake-email').textContent = config.intakeEmail;
  document.querySelector('#auth-mode').textContent = config.authMode === 'demo' ? 'Demo mode' : 'Workspace OAuth';
  signIn.textContent = `Sign in with ${config.organizationDomain}`;
  renderRows();
}

function renderRows() {
  const query = state.filter.toLowerCase();
  const visibleInvoices = state.invoices.filter((invoice) => Object.values(invoice).join(' ').toLowerCase().includes(query));

  rows.innerHTML = visibleInvoices.map((invoice) => `
    <tr>
      <td>${escapeHtml(invoice.receivedDate)}</td>
      <td><strong>${escapeHtml(invoice.vendorName)}</strong><br><small>${escapeHtml(invoice.sourceEmail)}</small></td>
      <td>${escapeHtml(invoice.invoiceNumber)}</td>
      <td>${escapeHtml(invoice.paymentTerms || 'Verify')}</td>
      <td class="amount">${escapeHtml(invoice.currency)} ${formatAmount(invoice.amount)}</td>
      <td><span class="badge">${escapeHtml(invoice.category)}</span></td>
      <td>${escapeHtml(invoice.status)}</td>
      <td>${escapeHtml(invoice.attachmentNames)}</td>
    </tr>
  `).join('');
}

filter.addEventListener('input', (event) => {
  state.filter = event.target.value;
  renderRows();
});

signIn.addEventListener('click', () => {
  alert('Demo sign-in placeholder. Configure GOOGLE_CLIENT_ID and server-side OAuth before production deployment.');
});

function formatAmount(value) {
  if (value === null || value === undefined) return 'Verify';
  return Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));
}

init().catch((error) => {
  rows.innerHTML = `<tr><td colspan="8">Unable to load invoices: ${escapeHtml(error.message)}</td></tr>`;
});
