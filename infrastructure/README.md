# Veyra infrastructure

Live site: https://veyra.veyra-nexaridev.workers.dev . Cloudflare Worker `veyra`, account subdomain `veyra-nexaridev`. It serves static release information, `/privacy`, and `/health`; it does not store accounts, browser data or set application cookies. Source: `site/worker.mjs`, configuration: `site/wrangler.jsonc`.

Supabase project: `ekqwcwedmdpiogxskrac`, region eu-west-1. `supabase/schema.sql` records the schema already applied remotely as `veyra_encrypted_sync`. Do not reapply it blindly to the existing project. Public client configuration is in `src/cloud-config.json` and the Android client. The publishable key is intended for public clients; service role/management keys must never enter the app.

Before opening registration to the public, configure a production SMTP provider in Supabase Auth and an appropriate Site URL / email confirmation landing page. Do not use localhost for public email links. The current Worker has no password-reset page or token processing. Registration and manual transfer need a real account test after this setup.

GitHub repository: https://github.com/nexaridev/veyra . The Windows/Android release is prepared as a draft with a signed update manifest. Publication remains pending the device/account acceptance checks in `RELEASE-0.6.0.md`. Windows updates download and verify a ZIP; they do not replace the running application automatically. Android update checking is not implemented yet.

R2 is not enabled in the Cloudflare account and is optional while GitHub hosts binary assets. No paid resource upgrade was requested or enabled during preparation.
