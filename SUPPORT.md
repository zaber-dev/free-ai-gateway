# 💬 Support & Community Guidelines

Thank you for using **Free-AI Gateway**! We want to make sure you get help quickly and find answers to your questions.

---

## 🔍 Where to Look First

Before opening an issue, check these resources:

1. **[Architecture & Developer Guide (LEARN.md)](LEARN.md)** — Explains core concepts, resilience mechanisms, MCP tools, and tutorials.
2. **[Frequently Asked Questions (FAQ)](LEARN.md#-advanced-patterns--faq)** — Common configuration and API key questions.
3. **[Supported Providers Matrix](README.md#-supported-providers-matrix-19-adapters)** — Details on quotas, scopes, and environment variables.

---

## 🙋 Getting Help

### 1. General Questions & Community Discussions
For usage questions, architecture discussions, or sharing setups:
👉 **[GitHub Discussions](https://github.com/zaber-dev/free-ai-gateway/discussions)**
- **Q&A**: Ask how to configure specific IDEs or providers.
- **Show and Tell**: Share agent workflows, prompt routing setups, or custom skills.
- **Ideas**: Discuss proposed features before submitting a formal issue.

### 2. Bug Reports
If you found a bug or unexpected behavior:
👉 **[Submit a Bug Report](https://github.com/zaber-dev/free-ai-gateway/issues/new?template=bug_report.md)**
- Please include reproduction steps, your operating system, and Node.js version.
- Make sure to redact sensitive API keys in your logs.

### 3. Feature & Provider Requests
If you want support for a new free-tier AI provider:
👉 **[Submit a Provider Request](https://github.com/zaber-dev/free-ai-gateway/issues/new?template=provider_request.md)**

### 4. Security Vulnerabilities
Do **NOT** disclose security vulnerabilities publicly in GitHub Issues.
Follow the disclosure protocol in **[SECURITY.md](SECURITY.md)** or report privately at:
👉 **[GitHub Security Advisories](https://github.com/zaber-dev/free-ai-gateway/security/advisories/new)**

---

## 🛠️ CLI Diagnostics (`doctor`)
You can run automated diagnostics locally to test your environment and configured API keys:

```bash
# Run doctor command via CLI package
npx @free-ai-gateway/cli doctor

# Or inside the repository root
npm run start --workspace=@free-ai-gateway/cli -- doctor
```
