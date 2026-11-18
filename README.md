# Rudo Roots – The Village
Plain HTML/CSS/JS (no build step). Deploys straight to Vercel.

## Files
All files sit together in one folder (easy to upload from a phone): the `.html` pages, `styles.css`, `config.js` (**your settings**), `core.js`, `data.js`, `market.js`, `news.js`, `logo.png`, `logo-mark.png`, `favicon.png`, `icon-192.png`, `icon-512.png` (your logo).

## Go live
1. Supabase: create project → SQL Editor → run `setup.sql`.
2. Put the project URL + anon key in `config.js`.
3. Auth → Providers: enable **Google** and **Facebook** (Meta developer app; add the Supabase callback URL) — Google needs a Google Cloud OAuth client — and **Phone** (needs an SMS provider such as Twilio — SMS costs money per code).
4. Auth → URL Configuration: add your site URL and `https://yourdomain/profile.html` to redirect URLs.
5. Approve listings/posts in Table Editor by ticking `approved`.
