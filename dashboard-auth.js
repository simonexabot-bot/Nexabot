import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const config = window.NEXA_SUPABASE || {};
const configured = config.url?.startsWith('https://') && config.publishableKey?.startsWith('sb_');
if (configured) {
  const supabase = createClient(config.url, config.publishableKey);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) location.replace('login.html');
  else {
    const { data: profile } = await supabase.from('profiles').select('display_name, role').eq('id', user.id).single();
    if (['operator', 'compliance_admin'].includes(profile?.role)) location.replace('admin.html');
    if (profile?.display_name) document.querySelector('#name').textContent = profile.display_name;
    const { data: account } = await supabase.from('customer_accounts').select('status').eq('customer_id', user.id).single();
    if (account?.status) document.querySelector('#account-status').textContent = `Account ${account.status}`;
    if (['restricted', 'closed'].includes(account?.status)) {
      document.querySelectorAll('a[href="fund-account.html"], a[href="wallet-setup.html"]').forEach((link) => {
        link.removeAttribute('href'); link.setAttribute('aria-disabled', 'true'); link.style.opacity = '.45';
        link.title = 'This account is deactivated. Contact support.';
      });
    }
    await import('./portfolio.js');
  }
}
