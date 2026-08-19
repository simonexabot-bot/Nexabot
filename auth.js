import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const config = window.NEXA_SUPABASE || {};
const configured = config.url?.startsWith('https://') && config.publishableKey?.startsWith('sb_');
const message = document.querySelector('#message');
const form = document.querySelector('#auth-form');
const submit = document.querySelector('#submit');
const status = (text, error = false) => { message.style.display = 'block'; message.style.color = error ? '#f7b1ba' : 'var(--aqua)'; message.textContent = text; };

let mode = 'signup';
const tabs = document.querySelectorAll('.tab');
const nameField = document.querySelector('#name-field');
const mobileField = document.querySelector('#mobile-field');
const title = document.querySelector('#title');
const intro = document.querySelector('#intro');
const name = document.querySelector('#name');
const mobile = document.querySelector('#mobile');
const password = document.querySelector('#password');
const recoveryLink = document.createElement('p');
recoveryLink.style.textAlign = 'right';
recoveryLink.innerHTML = '<a href="reset-password.html">Forgot your password?</a>';
form.insertAdjacentElement('afterend', recoveryLink);
const demoLink=document.createElement('a');demoLink.href='demo.html';demoLink.className='button secondary';demoLink.style.cssText='display:flex;margin-top:14px;width:100%';demoLink.textContent='Try the $10,000 virtual bot demo →';recoveryLink.insertAdjacentElement('afterend',demoLink);

tabs.forEach((tab) => tab.addEventListener('click', () => {
  mode = tab.dataset.mode;
  tabs.forEach((item) => item.classList.toggle('active', item === tab));
  const isLogin = mode === 'login';
  title.textContent = isLogin ? 'Welcome back' : 'Create your account';
  intro.textContent = isLogin ? 'Log in to access your NexaTrade account.' : 'Use your email address to start a secure account setup.';
  nameField.style.display = isLogin ? 'none' : 'grid';
  mobileField.style.display = isLogin ? 'none' : 'grid';
  name.required = !isLogin;
  mobile.required = !isLogin;
  password.autocomplete = isLogin ? 'current-password' : 'new-password';
  submit.innerHTML = isLogin ? 'Log in&nbsp; →' : 'Create account&nbsp; →';
  message.style.display = 'none';
}));

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!configured) { status('Add your Supabase URL and publishable key to supabase-config.js before using login.', true); return; }
  const supabase = createClient(config.url, config.publishableKey);
  submit.disabled = true;
  submit.textContent = 'Please wait…';
  const email = document.querySelector('#email').value.trim();
  const secret = password.value;
  try {
    if (mode === 'signup') {
      const mobileNumber=mobile.value.trim();if(!/^\+[1-9][0-9]{7,14}$/.test(mobileNumber))throw new Error('Enter a valid mobile number with country code, for example +19171234567.');
      const { error } = await supabase.auth.signUp({ email, password: secret, options: { data: { display_name: name.value.trim(), mobile_number: mobileNumber }, emailRedirectTo: `${location.origin}${location.pathname.replace('login.html', 'portal.html')}` } });
      if (error) throw error;
      status('Check your email to confirm your account, then log in.');
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: secret });
      if (error) throw error;
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
      location.href = ['operator', 'compliance_admin'].includes(profile?.role) ? 'admin.html' : 'portal.html';
    }
  } catch (error) { status(error.message || 'Unable to complete authentication.', true); }
  finally { submit.disabled = false; submit.innerHTML = mode === 'login' ? 'Log in&nbsp; →' : 'Create account&nbsp; →'; }
});
