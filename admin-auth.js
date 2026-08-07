import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const config=window.NEXA_SUPABASE||{}, supabase=createClient(config.url,config.publishableKey);
const message=document.querySelector('#message'), loadState=document.querySelector('#load-state');
const depositForm=document.querySelector('#deposit-form');
depositForm.insertAdjacentHTML('beforebegin','<p class="hint" style="margin:10px 0 18px">Optional managed-account funding only. Enter a unique deposit address created by your approved custody or exchange provider for this customer. Do not enter the customer MetaMask address, your personal wallet, a seed phrase, or a private key. For demonstrations, use testnet addresses only.</p>');
depositForm.closest('section').insertAdjacentHTML('beforebegin','<section class="card"><span class="card-label">Deposit verification queue</span><p class="hint" style="margin:10px 0">Compare the transaction ID, destination, asset, network, amount, and confirmation status with your custody provider or a trusted chain explorer. The customer-declared amount is never credited automatically.</p><table class="queue"><thead><tr><th>Customer</th><th>Transaction</th><th>Declared</th><th>Verified amount</th><th>Confirmations</th><th>Verification reference</th><th>State / action</th></tr></thead><tbody id="funding-requests"></tbody></table></section>');
const show=(text,error=false)=>{message.style.display='block';message.style.color=error?'#f7b1ba':'var(--aqua)';message.textContent=text};
const escapeHtml=(value='')=>String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const short=(value='')=>value.length>18?`${value.slice(0,9)}…${value.slice(-7)}`:value;

const {data:{user}}=await supabase.auth.getUser();
if(!user) location.replace('admin-login.html');
else {
const {data:me}=await supabase.from('profiles').select('display_name,role').eq('id',user.id).single();
if(!['operator','compliance_admin'].includes(me?.role)) location.replace('dashboard.html');
document.querySelector('#admin-name').textContent=me?.display_name||user.email;

async function load(){
  loadState.textContent='Refreshing…';
  const [profilesResult,accountsResult,walletsResult,instructionsResult,fundingResult]=await Promise.all([
    supabase.from('profiles').select('id,display_name,role').eq('role','customer').order('created_at'),
    supabase.from('customer_accounts').select('id,customer_id,status').order('created_at'),
    supabase.from('wallet_connection_requests').select('id,customer_id,wallet_address,chain_id,status,submitted_at').order('submitted_at',{ascending:false}),
    supabase.from('deposit_instructions').select('id,account_id,asset_symbol,chain_id,deposit_address,status,provider_reference').order('created_at',{ascending:false}),
    supabase.from('funding_requests').select('id,customer_id,account_id,instruction_id,transaction_hash,declared_amount,status,submitted_at').order('submitted_at',{ascending:false})
  ]);
  const failure=[profilesResult,accountsResult,walletsResult,instructionsResult,fundingResult].find(x=>x.error);
  if(failure){show(failure.error.message,true);loadState.textContent='Load failed';return}
  const profiles=profilesResult.data, accounts=accountsResult.data, wallets=walletsResult.data, instructions=instructionsResult.data, funding=fundingResult.data;
  const profileById=Object.fromEntries(profiles.map(p=>[p.id,p])), accountById=Object.fromEntries(accounts.map(a=>[a.id,a])), instructionById=Object.fromEntries(instructions.map(i=>[i.id,i]));
  document.querySelector('#accounts').innerHTML=accounts.map(a=>{const p=profileById[a.customer_id]||{};return `<tr><td>${escapeHtml(p.display_name||'Customer')}</td><td title="${a.customer_id}">${short(a.customer_id)}</td><td><span class="pill">${escapeHtml(a.status)}</span></td><td><div class="actions"><button class="button secondary" data-account="${a.customer_id}" data-status="active">Activate</button><button class="button secondary" data-account="${a.customer_id}" data-status="restricted">Deactivate</button><button class="button secondary" data-delete-customer="${a.customer_id}" data-customer-name="${escapeHtml(p.display_name||'Customer')}">Delete unused test account</button></div></td></tr>`}).join('')||'<tr><td colspan="4" class="empty">No customer accounts.</td></tr>';
  document.querySelector('#wallets').innerHTML=wallets.map(w=>{const p=profileById[w.customer_id]||{},actions=w.status==='submitted'?`<div class="actions"><button class="button secondary" data-wallet="${w.id}" data-decision="verified">Approve</button><button class="button secondary" data-wallet="${w.id}" data-decision="rejected">Reject</button></div>`:`<span class="hint">Review complete</span>`;return `<tr><td>${escapeHtml(p.display_name||short(w.customer_id))}</td><td title="${escapeHtml(w.wallet_address)}">${escapeHtml(short(w.wallet_address))}</td><td>${w.chain_id}</td><td><span class="pill">${escapeHtml(w.status)}</span></td><td>${actions}</td></tr>`}).join('')||'<tr><td colspan="5" class="empty">No wallet requests.</td></tr>';
  document.querySelector('#customer').innerHTML=accounts.map(a=>`<option value="${a.customer_id}">${escapeHtml(profileById[a.customer_id]?.display_name||short(a.customer_id))}</option>`).join('');
  document.querySelector('#instructions').innerHTML=instructions.map(i=>`<tr><td>${escapeHtml(profileById[accountById[i.account_id]?.customer_id]?.display_name||short(i.account_id))}</td><td>${escapeHtml(i.asset_symbol)} · ${i.chain_id}</td><td title="${escapeHtml(i.deposit_address)}">${escapeHtml(short(i.deposit_address))}</td><td><span class="pill">${escapeHtml(i.status)}</span>${i.status==='active'?`<br><br><button class="button secondary" data-disable-instruction="${i.id}">Disable</button>`:''}</td></tr>`).join('')||'<tr><td colspan="4" class="empty">No deposit instructions.</td></tr>';
  document.querySelector('#funding-requests').innerHTML=funding.map(f=>{const i=instructionById[f.instruction_id]||{},p=profileById[f.customer_id]||{},pending=['submitted','under_review'].includes(f.status),controls=pending?`<div class="actions"><button class="button secondary" data-funding="${f.id}" data-funding-decision="approved">Approve verified</button><button class="button secondary" data-funding="${f.id}" data-funding-decision="rejected">Reject</button></div>`:'<span class="hint">Review complete</span>';return `<tr><td>${escapeHtml(p.display_name||short(f.customer_id))}</td><td title="${escapeHtml(f.transaction_hash)}">${escapeHtml(short(f.transaction_hash))}<br><span class="hint">${escapeHtml(i.asset_symbol||'')} · chain ${i.chain_id??'?'}</span></td><td>${escapeHtml(f.declared_amount)} ${escapeHtml(i.asset_symbol||'')}</td><td><input data-verified-quantity="${f.id}" type="number" min="0" step="any" value="${escapeHtml(f.declared_amount)}" ${pending?'':'disabled'} style="width:110px"></td><td><input data-confirmations="${f.id}" type="number" min="1" step="1" value="1" ${pending?'':'disabled'} style="width:75px"></td><td><input data-verification-reference="${f.id}" placeholder="Provider/explorer ID" ${pending?'':'disabled'} style="min-width:150px"></td><td><span class="pill">${escapeHtml(f.status)}</span><br><br>${controls}</td></tr>`}).join('')||'<tr><td colspan="7" class="empty">No submitted deposits.</td></tr>';
  document.querySelectorAll('[data-account]').forEach(button=>button.onclick=()=>setAccount(button.dataset.account,button.dataset.status));
  document.querySelectorAll('[data-delete-customer]').forEach(button=>button.onclick=()=>deleteUnusedCustomer(button.dataset.deleteCustomer,button.dataset.customerName));
  document.querySelectorAll('[data-wallet]').forEach(button=>button.onclick=()=>reviewWallet(button.dataset.wallet,button.dataset.decision));
  document.querySelectorAll('[data-funding]').forEach(button=>button.onclick=()=>reviewFunding(button.dataset.funding,button.dataset.fundingDecision));
  document.querySelectorAll('[data-disable-instruction]').forEach(button=>button.onclick=()=>disableInstruction(button.dataset.disableInstruction));
  loadState.textContent='Current';
}

async function setAccount(customerId,status){
  const {error}=await supabase.rpc('admin_set_account_status',{p_customer_id:customerId,p_status:status});
  if(error) return show(error.message,true);show(`Account marked ${status}.`);await load();
}
async function deleteUnusedCustomer(customerId,name){
  const confirmation=prompt(`Delete unused test customer "${name}"?\n\nThis works only when no financial or legal history exists. To confirm, paste this customer ID:\n${customerId}`);
  if(confirmation===null) return;
  if(confirmation!==customerId) return show('Deletion cancelled: customer ID did not match.',true);
  const {error}=await supabase.rpc('admin_delete_unused_test_customer',{p_customer_id:customerId,p_confirmation:confirmation});
  if(error) return show(error.message,true);show('Unused test customer deleted.');await load();
}
async function reviewWallet(requestId,decision){
  const {error}=await supabase.rpc('admin_review_wallet_request',{p_request_id:requestId,p_decision:decision});
  if(error) return show(error.message,true);show(`Wallet request ${decision}.`);await load();
}
async function reviewFunding(requestId,decision){
  const quantity=document.querySelector(`[data-verified-quantity="${requestId}"]`)?.value;
  const confirmations=document.querySelector(`[data-confirmations="${requestId}"]`)?.value;
  const reference=document.querySelector(`[data-verification-reference="${requestId}"]`)?.value.trim();
  if(decision==='approved'&&(!quantity||Number(quantity)<=0||!confirmations||Number(confirmations)<1||!reference)) return show('Enter the independently verified amount, confirmation count, and a unique provider or explorer reference before approval.',true);
  const {error}=await supabase.rpc('admin_review_funding_request',{p_request_id:requestId,p_decision:decision,p_verified_quantity:decision==='approved'?quantity:null,p_verification_reference:decision==='approved'?reference:null,p_confirmations:decision==='approved'?Number(confirmations):null});
  if(error) return show(error.message,true);show(`Deposit request ${decision}.`);await load();
}
async function disableInstruction(instructionId){
  const {error}=await supabase.rpc('admin_disable_deposit_instruction',{p_instruction_id:instructionId});
  if(error) return show(error.message,true);show('Deposit instruction disabled.');await load();
}
depositForm.onsubmit=async event=>{
  event.preventDefault();
  const asset=document.querySelector('#asset').value.toUpperCase().trim(),chain=Number(document.querySelector('#chain').value),address=document.querySelector('#address').value.trim();
  if(chain===1&&(!/^0x[0-9a-fA-F]{40}$/.test(address)||asset==='BTC')) return show('Chain ID 1 is Ethereum. Use an Ethereum 0x address and an Ethereum-supported asset; do not use a Bitcoin bc1 address.',true);
  const {error}=await supabase.rpc('admin_assign_deposit_instruction',{p_customer_id:document.querySelector('#customer').value,p_chain_id:chain,p_asset_symbol:asset,p_deposit_address:address,p_provider_reference:document.querySelector('#reference').value.trim()});
  if(error) return show(error.message,true);show('Deposit address assigned.');event.target.reset();document.querySelector('#asset').value='USDT';document.querySelector('#chain').value='1';await load();
};
document.querySelector('#logout').onclick=async event=>{event.preventDefault();await supabase.auth.signOut();location.replace('admin-login.html')};
await load();
}
