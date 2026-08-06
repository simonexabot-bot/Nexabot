# Publish NexaTrade on GitHub Pages

## Why a Pages site often shows blank/404

GitHub Pages only serves an `index.html` that is in the selected publishing folder. In this project, the site files are inside `outputs`. GitHub Pages cannot select an arbitrary `outputs` folder in the branch settings; it only accepts the repository root or `/docs`.

## Simple publish method

1. In the GitHub repository, move/copy **the contents** of this `outputs` folder into the repository root. Do not upload the outer `outputs` folder as the only item.
2. Commit and push. Confirm that `index.html`, `app.css`, `auth.js`, `supabase-config.js`, and `.nojekyll` are visible at the top of the repository.
3. Open GitHub repository **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and the `/(root)` folder, then save.
6. Wait for the deployment notice. The address is normally `https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY-NAME/`.

## Required Supabase settings

1. In Supabase, open **Connect** and copy the project URL and publishable key.
2. Paste them into `supabase-config.js`. A publishable key may be public only when RLS is enabled. Never paste a service-role/secret key into GitHub.
3. In **Authentication → URL Configuration**, set:
   - Site URL: `https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY-NAME/`
   - Additional Redirect URL: `https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY-NAME/dashboard.html`
4. In **Authentication → Providers → Email**, enable Email. For launch, enable Confirm email and configure the sender/templates.
5. Run database migrations in this exact order: `001_secure_customer_ledger.sql`, `002_legal_consents.sql`, then `003_auth_bootstrap.sql`.

## Railway’s role

GitHub Pages hosts the public static website. Use Railway later for the protected API that handles provider webhooks, compliance checks, audit records, and all privileged writes.

1. Create a Railway project from the same repository.
2. Set its root directory to the folder holding `package.json` (the same published site folder if you use this project structure).
3. Add server-only variables from `.env.example` in Railway. Set the Supabase service-role key only there.
4. Deploy and verify `https://YOUR-RAILWAY-URL/health` returns `{"status":"ok"}`.
5. Do not add actual custody, trade, withdrawal, or wallet-signing endpoints until provider integration, MFA, dual approval, audit logging, and legal/compliance review are in place.

## Before public launch

- Replace the legal-page drafts with counsel-approved documents containing your legal entity, support address, country/jurisdiction, fees, and customer-rights details.
- Add a real support email, error monitoring, cookie notice if applicable, accessibility review, and analytics/privacy controls.
- Complete identity/compliance, custody, and security-provider selection before taking customer assets.
