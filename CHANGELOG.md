# Changelog

All notable changes to LamaLama are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Privacy Policy, Terms of Service and Cookie Policy pages (`/privacy`, `/terms`, `/cookies`), written for the GDPR and the EU Digital Services Act, linked from the footer, the sign-in and sign-up pages and the sitemap.
- A cookie notice with a cookie-eating llama. LamaLama sets only technical cookies, so it informs and doesn't ask for consent.
- `www.` redirects to the app's own domain.

### Changed

- The footer's author avatar loads through the app's image optimizer, so visitors' browsers no longer contact GitHub.
- Daily limits per user, across all their workspaces, on new workspaces, invitations, clip uploads and exports (`userLimits` in `src/shared/config/limits.ts`).

### Security

- Next.js 16.3.8 and sharp 0.35.5, with the fixes for the image optimizer SSRF and cache poisoning advisories.
- A GitHub sign-in links to an existing account only when GitHub has verified the email.
- Sign-in links are limited per email address as well as per IP, and saving an AI key is limited per user.
- Better Auth's raw `update-user` endpoint is off: the profile form is the only way to change your name.
- HSTS and a `frame-ancestors` Content-Security-Policy; the app's own cookies are `Secure` on HTTPS.
- Public share pages no longer use the clip's poster as preview image: it came from the raw recording, before blur and cuts.
- ffmpeg reads uploads only as local MP4, MOV or WebM files.
- AES-GCM decryption checks the full 16-byte auth tag.

## [0.1.0] - 2026-10-09

### Added

- First open-source release of LamaLama under the MIT License.
- Sign in with Google, GitHub or an email magic link; a personal workspace per user.
- Brand kits: colours, fonts and logo, drafted from a website.
- Footage: in-browser screen recording and uploads, processing and AI analysis of key moments.
- Motion studio: camera moves, cuts, speed, transitions, text, motion graphics, layouts, lens looks, AI director and full-screen preview.
- Videos: clips joined in order with transitions, with versioned saves.
- MP4 export in 16:9, 9:16, 1:1 and 4:5, and revocable public share links.
- Shared workspaces: invitations by email, Owner, Admin, Editor and Viewer roles, and custom per-member permissions.
- Bring your own key: each workspace saves its own Anthropic API key, encrypted at rest (AES-256-GCM).
- Profile settings: photo upload, a llama mascot shown in the user menu, and account deletion.
- Search-ready site: sitemap, robots.txt, structured data and `llms.txt`.
- Llamageddon: press "Make it rain" in the dashboard header.

[Unreleased]: https://github.com/andrebuilds/lamalama/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/andrebuilds/lamalama/releases/tag/v0.1.0
