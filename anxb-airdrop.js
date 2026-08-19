import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';

const config=window.NEXA_SUPABASE||{},supabase=createClient(config.url,config.publishableKey),q=s=>document.querySelector(s);
const fmt=value=>new Intl.NumberFormat('en-US',{maximumFractionDigits:8}).format(Number(value||0));
const usd=value=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(Number(value||0));
const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
let summary=null;

function ensureStatus(){
  let node=q('#anxb-claim-status');
  if(!node){node=document.createElement('div');node.id='anxb-claim-status';node.className='notice-row';q('#airdrop h1')?.insertAdjacentElement('afterend',node)}
  return node;
}
function setButton(text,disabled){const button=q('#claim-airdrop-btn');button.textContent=text;button.disabled=disabled}
async function load(){
  const status=ensureStatus(),{data,error}=await supabase.rpc('customer_anxb_summary');
  if(error){status.textContent='ANXB approval system needs migration 021_anxb_airdrop_admin.sql before claims can be submitted.';setButton('Claim system not configured',true);return}
  summary=data||{};
  const [{data:claims},{data:gifts}]=await Promise.all([
    supabase.from('anxb_airdrop_claims').select('*').order('submitted_at',{ascending:false}),
    supabase.from('anxb_gifts').select('*').order('created_at',{ascending:false})
  ]);
  const pending=(claims||[]).find(x=>x.status==='submitted'),credited=Number(summary.credited_balance||0);
  q('#airdrop-amount').textContent=`${fmt(summary.available_to_claim)} ANXB`;
  q('#calc-deposit').textContent=usd(summary.deposit_basis);q('#calc-rate').textContent=`${fmt(Number(summary.rate)*100)}%`;q('#calc-total').textContent=`${fmt(summary.entitlement)} ANXB`;
  q('#sim-anxb-balance').textContent=`${fmt(credited)} ANXB`;
  const metric=[...document.querySelectorAll('#sim-portfolio-metrics article')].find(x=>x.querySelector('span')?.textContent==='Virtual ANXB');if(metric)metric.querySelector('strong').textContent=fmt(credited);
  status.innerHTML=`<strong>Credited balance: ${fmt(credited)} ANXB</strong><span>${fmt(summary.approved_claims)} approved from claims · ${fmt(summary.gifts)} received as admin gifts</span>${pending?`<small>Pending claim: ${fmt(pending.amount)} ANXB · submitted ${new Date(pending.submitted_at).toLocaleString()}</small>`:''}`;
  setButton(pending?'Awaiting administrator approval':Number(summary.available_to_claim)>0?'Submit claim for admin approval':'No new ANXB available',Boolean(pending)||Number(summary.available_to_claim)<=0);
  const steps=q('#airdrop article:nth-of-type(2)');if(steps){const headings=steps.querySelectorAll('strong'),copy=steps.querySelectorAll('p');if(headings[1])headings[1].textContent='Submit for approval';if(copy[1])copy[1].textContent='Your eligible ANXB becomes a pending request for an administrator.';if(headings[2])headings[2].textContent='Receive after approval';if(copy[2])copy[2].textContent='Approved claims and administrator gifts increase your credited ANXB balance.'}
  const history=q('#anxb-credit-history')||document.createElement('article');if(!history.id){history.id='anxb-credit-history';history.className='portal-card';q('#airdrop').append(history)}
  const rows=[...(claims||[]).map(x=>({at:x.submitted_at,label:`Airdrop claim · ${fmt(x.amount)} ANXB`,status:x.status})),...(gifts||[]).map(x=>({at:x.created_at,label:`Admin gift · ${fmt(x.amount)} ANXB · ${x.reason}`,status:'credited'}))].sort((a,b)=>new Date(b.at)-new Date(a.at));
  history.innerHTML=`<h2>ANXB history</h2>${rows.length?rows.map(x=>`<div class="data-row"><div>${esc(x.label)}<div class="state-chip">${esc(x.status)}</div></div><span>${new Date(x.at).toLocaleString()}</span></div>`).join(''):'<p class="empty-state">No ANXB claims or gifts yet.</p>'}`;
}

q('#claim-airdrop-btn').onclick=async()=>{setButton('Submitting…',true);const {error}=await supabase.rpc('customer_request_anxb_claim');if(error){ensureStatus().textContent=error.message;await load();return}ensureStatus().textContent='Your ANXB claim was submitted for administrator approval.';await load()};
load();
