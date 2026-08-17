// Chatbot greeting pop-up for website visitors
(function(){
  // Only show once per session
  if(sessionStorage.getItem('nexabot-greeting-shown')) return;
  
  // Create greeting popup
  const greeting=document.createElement('div');
  greeting.className='nexabot-greeting';
  greeting.innerHTML=`
    <div class="greeting-content">
      <button class="greeting-close" aria-label="Close">&times;</button>
      <div class="greeting-icon">◌</div>
      <h3>Welcome to NexaTrade</h3>
      <p>How can I help you today?</p>
      <form class="greeting-form" id="greeting-form">
        <input type="text" placeholder="Ask about accounts, strategies, wallets..." maxlength="500" required>
        <button type="submit">Send →</button>
      </form>
      <p class="greeting-note">
        <small>Our AI assistant is here to answer questions. For urgent support, please <a href="#" onclick="alert('Log in to your account and request staff support in the chat.')">contact our team</a>.</small>
      </p>
    </div>
  `;
  
  // Add styles
  const styles=document.createElement('style');
  styles.textContent=`
    .nexabot-greeting{
      position:fixed;
      bottom:20px;right:20px;
      width:320px;
      background:linear-gradient(135deg, #0a1428 0%, #1a2a3a 100%);
      border:1px solid #2a4a5a;
      border-radius:12px;
      padding:0;
      box-shadow:0 8px 24px rgba(0,0,0,0.3);
      z-index:999;
      animation:slideIn 0.4s ease-out;
      font-family:'Manrope',sans-serif;
    }
    @keyframes slideIn{
      from{opacity:0;transform:translateY(20px)}
      to{opacity:1;transform:translateY(0)}
    }
    .greeting-content{
      position:relative;
      padding:24px;
      text-align:center;
    }
    .greeting-close{
      position:absolute;
      top:8px;right:8px;
      background:none;
      border:none;
      color:#71849c;
      font-size:24px;
      cursor:pointer;
      padding:4px 8px;
      transition:color 0.2s;
    }
    .greeting-close:hover{color:#a8bcc8}
    .greeting-icon{
      font-size:32px;
      color:var(--aqua,#00e5ff);
      margin-bottom:12px;
    }
    .greeting-content h3{
      margin:0 0 8px 0;
      color:#fff;
      font-size:18px;
      font-weight:600;
    }
    .greeting-content>p{
      margin:0 0 16px 0;
      color:#a8bcc8;
      font-size:14px;
    }
    .greeting-form{
      display:flex;
      flex-direction:column;
      gap:8px;
      margin-bottom:12px;
    }
    .greeting-form input{
      padding:10px 12px;
      background:#0a1428;
      border:1px solid #2a4a5a;
      border-radius:6px;
      color:#fff;
      font-size:13px;
      font-family:inherit;
    }
    .greeting-form input::placeholder{color:#71849c}
    .greeting-form input:focus{
      outline:none;
      border-color:var(--aqua,#00e5ff);
    }
    .greeting-form button{
      padding:10px 12px;
      background:var(--aqua,#00e5ff);
      border:none;
      border-radius:6px;
      color:#0a1428;
      font-size:13px;
      font-weight:600;
      cursor:pointer;
      transition:background 0.2s;
    }
    .greeting-form button:hover{background:#00d4dd}
    .greeting-note{
      margin:0;
      font-size:11px;
      color:#71849c;
      line-height:1.4;
    }
    .greeting-note a{
      color:var(--aqua,#00e5ff);
      text-decoration:none;
    }
    .greeting-note a:hover{text-decoration:underline}
    @media (max-width:480px){
      .nexabot-greeting{width:calc(100% - 24px);bottom:12px;right:12px}
    }
  `;
  document.head.appendChild(styles);
  
  // Show after page load
  document.addEventListener('DOMContentLoaded',()=>{
    document.body.appendChild(greeting);
    sessionStorage.setItem('nexabot-greeting-shown','true');
  });
  
  // Handle greeting form
  document.addEventListener('submit',function(e){
    if(e.target.id==='greeting-form'){
      e.preventDefault();
      const input=e.target.querySelector('input');
      const message=input.value.trim();
      if(message){
        // Open chat widget with the message
        if(window.nexaChatInput){
          window.nexaChatInput.value=message;
        }
        // Close greeting
        greeting.remove();
        sessionStorage.removeItem('nexabot-greeting-shown');
        // Show chat widget
        const chatToggle=document.querySelector('.nexa-chat-toggle');
        if(chatToggle){
          chatToggle.click();
        }
      }
    }
  },true);
  
  // Close button
  document.addEventListener('click',function(e){
    if(e.target.classList.contains('greeting-close')){
      greeting.remove();
      sessionStorage.setItem('nexabot-greeting-shown','true');
    }
  },true);
})();
