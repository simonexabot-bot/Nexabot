// GitHub Pages is a static host. This is intentionally PUBLIC configuration only.
// Replace the two values with Supabase Dashboard → Connect values.
// Never put a service_role / secret key in this file.
window.NEXA_SUPABASE = {
  url: 'https://fuuxihoagfrgrbgrjltb.supabase.co',
  publishableKey: 'sb_publishable_EuoLc4sCZq1XJpB7YnnACg_vveKaKJz'
};

if ((location.pathname.endsWith('/') || location.pathname.endsWith('/index.html')) && !document.querySelector('link[href="academy-home-polish.css"]')) {
  const academyPolish = document.createElement('link');
  academyPolish.rel = 'stylesheet';
  academyPolish.href = 'academy-home-polish.css';
  document.head.append(academyPolish);
}

// Shared branding, contact details, and optional consent-aware Google tags.
if (!document.querySelector('link[href="logo.css"]')) {
  const styles = document.createElement('link'); styles.rel = 'stylesheet'; styles.href = 'logo.css'; document.head.append(styles);
}
if (!window.NEXA_SITE && !document.querySelector('script[src="site-config.js"]')) {
  const configScript = document.createElement('script'); configScript.src = 'site-config.js';
  configScript.onload = () => { if (!document.querySelector('script[src="site.js"]')) { const siteScript = document.createElement('script'); siteScript.src = 'site.js'; document.head.append(siteScript); } };
  document.head.append(configScript);
}
