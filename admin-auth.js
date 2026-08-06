import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const config = window.NEXA_SUPABASE || {};
if (!config.url?.startsWith('https://') || !config.publishableKey?.startsWith('sb_')) {
  location.replace('login.html');
} else {
  const supabase = createClient(config.url, config.publishableKey);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) location.replace('login.html');
  else {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!['operator', 'compliance_admin'].includes(profile?.role)) location.replace('dashboard.html');
  }
}
