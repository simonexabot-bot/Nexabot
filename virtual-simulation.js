import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';

const q=selector=>document.querySelector(selector),config=window.NEXA_SUPABASE||{},supabase=createClient(config.url,config.publishableKey);
const money=value=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(Number(value||0));
const number=value=>new Intl.NumberFormat('en-US',{maximumFractionDigits:8}).format(Number(value||0));
const date=value=>value?new Date(value).toLocaleString():'—';
const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const row=(label,value,state)=>`<div class="data-row"><div>${label}<div class="state-chip">${esc(state)}</div></div><span>${value}</span></div>`;

function render(run,trades){
  if(!run){
    ['#sim-recent-activity','#sim-balance-history','#sim-trade-history'].forEach(selector=>{const node=q(selector);if(node)node.innerHTML='<p class="empty-state">No server-side simulation is active. Ask an administrator to start a 30-day test run.</p>'});
    q('#sim-total-value').textContent='$0.00';q('#sim-usdt-balance').textContent='0 vUSDT';q('#sim-daily-profit').textContent='$0.00';q('#sim-trade-count').textContent='No active simulation';q('#sim-tier-label').textContent='Waiting for admin start';q('#sim-portfolio-metrics').innerHTML='<article><span>Simulation</span><strong>Not started</strong><small>Administrator activation required</small></article>';return;
  }
  const today=new Date().toISOString().slice(0,10),todayTrades=trades.filter(x=>x.executed_at.slice(0,10)===today),todayProfit=todayTrades.reduce((sum,x)=>sum+Number(x.net_profit_usdt),0),daysLeft=Math.max(0,Math.ceil((new Date(run.ends_at)-Date.now())/86400000));
  const syncHeader=()=>q('#header-portfolio').textContent=money(run.current_balance);syncHeader();setTimeout(syncHeader,1500);
  q('#sim-total-value').textContent=money(run.current_balance);q('#sim-usdt-balance').textContent=`${number(run.current_balance)} vUSDT`;q('#sim-daily-profit').textContent=`+${money(todayProfit)}`;q('#sim-tier-label').textContent=`30-day backend test · ${run.status}`;q('#sim-trade-count').textContent=`${todayTrades.length} trades today · ${daysLeft} days remaining`;
  q('#sim-portfolio-metrics').innerHTML=`<article><span>Virtual USDT balance</span><strong>${number(run.current_balance)}</strong><small>Started at ${number(run.initial_balance)}</small></article><article><span>Total simulated profit</span><strong>+${money(run.total_profit)}</strong><small>${trades.length} settled trades</small></article><article><span>Test status</span><strong>${esc(run.status)}</strong><small>Ends ${date(run.ends_at)}</small></article><article><span>Worker heartbeat</span><strong>${run.last_cycle_at?'Active':'Waiting'}</strong><small>${run.last_cycle_at?date(run.last_cycle_at):'Worker has not advanced this run'}</small></article>`;
  const history=trades.map(x=>row(`${esc(x.pair)}<small>${esc(x.buy_venue)} → ${esc(x.sell_venue)} · allocated ${money(x.allocated_usdt)} · spread ${number(x.gross_spread_pct)}% · fees ${money(x.fees_usdt)}</small>`,`+${money(x.net_profit_usdt)} · ${date(x.executed_at)}`,x.status)).join('');
  q('#sim-trade-history').innerHTML=history||'<p class="empty-state">The worker will create the first trade on its next cycle.</p>';
  q('#sim-recent-activity').innerHTML=trades.slice(0,5).map(x=>row(`${esc(x.pair)} arbitrage`,`+${money(x.net_profit_usdt)} · ${date(x.executed_at)}`,'settled')).join('')||'<p class="empty-state">Waiting for the first worker cycle.</p>';
  q('#sim-balance-history').innerHTML=history||'<p class="empty-state">No simulated balance changes yet.</p>';
}

async function loadSimulation(){
  const {data:runs,error}=await supabase.from('arbitrage_simulation_runs').select('*').order('created_at',{ascending:false}).limit(1);if(error){q('#sim-recent-activity').textContent='Apply migration 022_monthly_arbitrage_simulation.sql to enable continuous backend testing.';return}
  const run=runs?.[0];if(!run)return render(null,[]);
  const {data:trades}=await supabase.from('arbitrage_simulation_trades').select('*').eq('run_id',run.id).order('executed_at',{ascending:false}).limit(500);render(run,trades||[]);
}

async function refreshWallet(){const box=q('#sim-wallet-summary');try{if(!window.ethereum)throw new Error('No browser wallet detected. Use the existing Wallets page to connect one.');const accounts=await window.ethereum.request({method:'eth_accounts'});if(!accounts.length)throw new Error('No wallet is currently connected.');const address=accounts[0],chainId=parseInt(await window.ethereum.request({method:'eth_chainId'}),16),raw=await window.ethereum.request({method:'eth_getBalance',params:[address,'latest']});const native=Number(BigInt(raw))/1e18,symbol=({1:'ETH',10:'ETH',56:'BNB',137:'POL',42161:'ETH',8453:'ETH'})[chainId]||'native';box.innerHTML=`<strong>${address.slice(0,8)}…${address.slice(-6)}</strong><span>${number(native)} ${symbol}</span><small>Chain ${chainId} · read-only wallet balance</small>`}catch(error){box.textContent=error.message||'Unable to read wallet balance.'}}

const {data:{user}}=await supabase.auth.getUser();if(user){await loadSimulation();q('#sim-refresh-wallet')?.addEventListener('click',refreshWallet);await refreshWallet();setInterval(loadSimulation,60000)}
