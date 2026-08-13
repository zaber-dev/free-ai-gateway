# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

---

## Reporting a Vulnerability

We take the security and integrity of **Free-AI Gateway** seriously. If you believe you have discovered a vulnerability, security flaw, or sensitive data leakage issue, please follow these reporting steps:

1. **Do NOT file a public issue.**
2. Send an email describing the vulnerability, proof of concept, and affected components to the project maintainers.
3. We will acknowledge receipt of your vulnerability report within 48 hours and provide a timeline for remediation.
4. Once resolved, we will publish a patch and credit the reporter in the release notes.

---

## Best Practices for Deploying Free-AI Gateway

- **API Keys**: Never commit your `.env` file or hardcode provider API keys into source files.
- **Network Security**: When exposing Free-AI Gateway to the public internet, deploy behind a reverse proxy (e.g., Nginx, Caddy, Cloudflare) with HTTPS and authentication tokens.
- **Rate Limiting**: Protect client-facing instances with reverse-proxy IP rate limiting to prevent upstream free-tier starvation.
