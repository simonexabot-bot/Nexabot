document.addEventListener('DOMContentLoaded',()=>{
  const one=(selector,text)=>{const node=document.querySelector(selector);if(node)node.textContent=text};
  const all=(selector,texts)=>document.querySelectorAll(selector).forEach((node,index)=>{if(texts[index])node.textContent=texts[index]});
  const nav=document.querySelector('#site-links');
  if(nav&&!nav.querySelector('[href="education-home.html"]'))nav.insertAdjacentHTML('afterbegin','<a href="education-home.html">Academy</a><a href="token-presale-home.html">ANXB Token</a>');

  one('.eyebrow','NEXA AI · Learn · ANXB · Simulate');
  const title=document.querySelector('.hero h1');
  if(title)title.innerHTML='Learn trading. Explore ANXB. <em>Experience arbitrage.</em>';
  one('.hero-copy','One NEXA AI account opens three clear experiences: practical trading and AI courses, the ANXB token presale portal, and the existing virtual arbitrage bot with virtual USDT, simulated profit distribution and transaction history.');
  const heroLinks=document.querySelectorAll('.hero-actions a');
  if(heroLinks[0]){heroLinks[0].textContent='Choose your NEXA portal →';heroLinks[0].href='login.html'}
  if(heroLinks[1]){heroLinks[1].textContent='Explore all three';heroLinks[1].href='#ecosystem'}
  all('.trust-row span',['✓ Five education programs','✓ Separate ANXB presale area','✓ Existing arbitrage portal preserved']);

  const proof=document.querySelector('.proof-strip');
  if(proof&&!document.querySelector('#ecosystem'))proof.insertAdjacentHTML('afterend',`<section class="ecosystem-section" id="ecosystem"><div class="shell"><div class="section-head"><div><span class="kicker">Three focused experiences</span><h2>Choose what you want to explore.</h2></div><p>Each concept now has its own public home page and its own signed-in customer workflow.</p></div><div class="ecosystem-grid"><article class="ecosystem-card"><span>01 · EDUCATION</span><h3>NEXA Academy</h3><p>Learn trading basics, arbitrage, AI trading and how an AI bot is created through five focused courses.</p><strong>$49–$100 · Free for eligible early members</strong><a href="education-home.html">Visit Academy home →</a></article><article class="ecosystem-card"><span>02 · TOKEN</span><h3>ANXB Presale</h3><p>Review the ANXB plan and record presale interest in a dedicated area, separate from bot funding.</p><strong>Interest registration · No funds moved</strong><a href="token-presale-home.html">Visit ANXB home →</a></article><article class="ecosystem-card"><span>03 · SIMULATION</span><h3>Arbitrage Bot</h3><p>Continue into the completed virtual-USDT experience with wallet snapshot, bot controls, trades and simulated profits.</p><strong>Existing workflow preserved</strong><a href="login.html">Enter arbitrage portal →</a></article></div></div></section>`);

  all('.proof-strip b',['Education access','Income simulation','ANXB tier','Airdrop claim']);
  all('.proof-strip span',['Five courses from basics to AI bot building','Follow illustrative daily profit and trade records','See tier-based token benefits clearly','Eligible customers can submit claims from their portal']);

  one('#platform .kicker','One clear simulation journey');
  one('#platform h2','Deposit virtual USDT. Simulate arbitrage. Track distributed profit.');
  one('#platform .section-head>p','Every key step appears in the customer portal, from virtual funding through portfolio balances and simulated transaction history.');
  all('#platform .benefit-grid h3',['Add virtual USDT','Receive virtual ANXB','Use existing bot approval','Simulate arbitrage','Track every result','Simulate withdrawals']);
  all('#platform .benefit-grid p',[
    'Fund the simulation instantly with virtual USDT. No faucet, testnet transaction, or real deposit is required.',
    'See the ANXB allocation associated with your existing deposit tier and giveaway rate.',
    'The working wallet and bot-approval experience remains available as a separate demonstration flow.',
    'The simulation creates illustrative cross-market opportunities and records venues, spread, fees, and net result.',
    'Daily simulated earnings flow into the virtual portfolio balance and appear beside a complete transaction history.',
    'Test full or partial virtual withdrawals without moving blockchain assets.'
  ]);

  one('#arbitrage .kicker','How the virtual engine is presented');
  one('#arbitrage h2','A complete arbitrage story customers can follow.');
  one('#arbitrage .process>div>p','ANXB customers can explore the whole experience using virtual balances before any future real-market product is considered.');
  one('.final-cta .kicker','Explore the ANXB ecosystem');
  const finalTitle=document.querySelector('.final-cta h2');if(finalTitle)finalTitle.innerHTML='Start with virtual USDT.<br>Understand every simulated trade.';
  one('.final-cta p','Create a customer account to explore virtual deposits, daily arbitrage simulations, ANXB allocations, profit distribution, transaction history, and virtual withdrawals in one clear portfolio.');
  one('footer .footer-grid>div:first-child p','ANXB is the token at the center of the NEXA AI virtual arbitrage experience. Explore simulated trades and profit distribution without using real funds.');
});
