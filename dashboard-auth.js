import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const config = window.NEXA_SUPABASE || {};
const configured = config.url?.startsWith('https://') && config.publishableKey?.startsWith('sb_');
if (configured) {
  const supabase = createClient(config.url, config.publishableKey);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) location.replace('login.html');
  else {
    const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).single();
    if (profile?.display_name) document.querySelector('#name').textContent = profile.display_name;
    const { data: account } = await supabase.from('customer_accounts').select('status').eq('customer_id', user.id).single();
    if (account?.status) document.querySelector('#account-status').textContent = `Account ${account.status}`;
  }
}
