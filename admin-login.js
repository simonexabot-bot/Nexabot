import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const config = window.NEXA_SUPABASE || {};
const form = document.querySelector('#admin-form');
const message = document.querySelector('#message');
const submit = document.querySelector('#submit');
const show = (text, error = true) => {
  message.style.display = 'block';
  message.style.color = error ? '#f7b1ba' : 'var(--aqua)';
  message.textContent = text;
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const supabase = createClient(config.url, config.publishableKey);
  submit.disabled = true;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: document.querySelector('#email').value.trim(),
      password: document.querySelector('#password').value
    });
    if (error) throw error;
    const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    if (profileError) throw profileError;
    if (!['operator', 'compliance_admin'].includes(profile.role)) {
      await supabase.auth.signOut();
      throw new Error('This is a customer account. Use the customer login page instead.');
    }
    location.replace('admin.html');
  } catch (error) { show(error.message || 'Unable to sign in.'); }
  finally { submit.disabled = false; }
});
