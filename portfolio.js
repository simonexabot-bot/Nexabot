import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const config=window.NEXA_SUPABASE||{}, supabase=createClient(config.url,config.publishableKey);
const decimalToUnits=value=>{const text=String(value),negative=text.startsWith('-'),[whole,fraction='']=(negative?text.slice(1):text).split('.'),units=BigInt(whole||'0')*10n**18n+BigInt(fraction.padEnd(18,'0').slice(0,18)||'0');return negative?-units:units};
const unitsToDecimal=units=>{const negative=units<0n,value=negative?-units:units,whole=value/10n**18n,fraction=(value%10n**18n).toString().padStart(18,'0').replace(/0+$/,'').slice(0,8);return `${negative?'-':''}${whole}${fraction?'.'+fraction:''}`};
const activity=document.querySelector('.activity');
const card=document.createElement('section');
card.className='card portfolio-summary';
card.innerHTML='<span class="card-label">Portfolio balances</span><h2 style="font-size:18px;margin:8px 0">Managed account</h2><div id="managed-balances" class="value" style="font-size:24px">Loading…</div><p class="hint">Calculated only from approved, immutable ledger entries.</p><div style="border-top:1px solid var(--line);margin:20px 0;padding-top:18px"><h2 style="font-size:18px;margin:0 0 8px">Connected wallet</h2><div id="verified-wallets" class="hint">Loading…</div><div id="wallet-native-balance" class="value" style="font-size:22px;margin:12px 0">—</div><button class="button secondary" id="refresh-wallet-balance">Show native balance</button><p class="hint" style="margin-top:10px">Shows only the selected network’s native coin. Tokens, NFTs, and positions require a reviewed chain-data provider and are not added to the managed-account ledger.</p></div>';
activity.parentNode.insertBefore(card,activity);

const {data:{user}}=await supabase.auth.getUser();
if(user){
  const [{data:entries,error:ledgerError},{data:wallets,error:walletError}]=await Promise.all([
    supabase.from('portfolio_ledger').select('asset_symbol,quantity').order('created_at'),
    supabase.from('wallet_connections').select('wallet_address,chain_id,revoked_at').is('revoked_at',null).order('created_at')
  ]);
  const managed=document.querySelector('#managed-balances');
  if(ledgerError) managed.textContent='Unable to load ledger';
  else {
    const totals={};
    for(const entry of entries||[]) totals[entry.asset_symbol]=(totals[entry.asset_symbol]||0n)+decimalToUnits(entry.quantity);
    managed.textContent=Object.keys(totals).length?Object.entries(totals).map(([asset,total])=>`${unitsToDecimal(total)} ${asset}`).join(' · '):'No approved balance yet';
  }
  const walletBox=document.querySelector('#verified-wallets');
  if(walletError) walletBox.textContent='Unable to load connected wallets.';
  else if(!wallets?.length) walletBox.textContent='No verified wallet connected.';
  else walletBox.textContent=wallets.map(w=>`${w.wallet_address.slice(0,8)}…${w.wallet_address.slice(-6)} · chain ${w.chain_id}`).join(' | ');

  document.querySelector('#refresh-wallet-balance').onclick=async()=>{try{
    if(!window.ethereum) throw new Error('Install or open your browser wallet first.');
    const [address]=await ethereum.request({method:'eth_requestAccounts'});
    const chainId=parseInt(await ethereum.request({method:'eth_chainId'}),16);
    const verified=wallets?.find(w=>w.wallet_address.toLowerCase()===address.toLowerCase()&&w.chain_id===chainId);
    if(!verified) throw new Error('The selected wallet and network are not verified for this account.');
    const raw=await ethereum.request({method:'eth_getBalance',params:[address,'latest']});
    const symbol=({1:'ETH',10:'ETH',56:'BNB',137:'POL',42161:'ETH',8453:'ETH'})[chainId]||'native coin';
    document.querySelector('#wallet-native-balance').textContent=`${unitsToDecimal(BigInt(raw))} ${symbol}`;
  }catch(error){document.querySelector('#wallet-native-balance').textContent=error.message||'Unable to load wallet balance.'}}
}
