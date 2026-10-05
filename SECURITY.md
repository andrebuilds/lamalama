# Security Policy

## Supported versions

LamaLama is in early development. Security fixes land on the `main` branch and in the latest release only.

| Version | Supported |
|---|---|
| `main` / latest release | ✅ |
| Older releases | ❌ |

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues, discussions or pull requests.**

Report them privately instead, in either of these ways:

- **GitHub** — use [Report a vulnerability](https://github.com/andrebuilds/lamalama/security/advisories/new) on the repository's Security tab (preferred).
- **Email** — write to **security@lamalama.video**.

Please include as much of the following as you can:

- The type of issue (e.g. authentication bypass, SSRF, XSS, data exposure).
- The affected file(s), route(s) or feature.
- Steps to reproduce, ideally with a proof of concept.
- The impact: what an attacker could do with it.

## What to expect

- An acknowledgement within **3 working days**.
- An initial assessment within **7 days**, and regular updates until the issue is resolved.
- Credit in the release notes once a fix ships, unless you'd rather stay anonymous.

Please give us reasonable time to fix the issue before disclosing it publicly. We won't take legal action against anyone who reports a vulnerability in good faith and follows this policy.

## Scope

In scope: the code in this repository and the hosted service at [lamalama.video](https://lamalama.video).

Out of scope: vulnerabilities in third-party services (Neon, Resend, Anthropic, etc.) — report those to the vendor — and issues that need a compromised device or social engineering.
