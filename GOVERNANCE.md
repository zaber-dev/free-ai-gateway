# 🏛️ Project Governance & Decision Making

This document outlines the governance model, roles, decision-making process, and contribution stewardship for the **Free-AI Gateway** open-source project.

---

## 🎯 Guiding Principles

1. **Accessibility First**: Free-AI Gateway exists to provide democratic, frictionless, and zero-cost access to modern AI capabilities.
2. **Quality & Zero Breaking Changes**: We value backward compatibility, strict TypeScript contracts, and thorough automated test coverage across all supported Node versions.
3. **Transparent Collaboration**: Discussions, architectural proposals, and roadmap decisions happen openly in public repositories.
4. **Welcoming & Inclusive**: We adhere strictly to our [Code of Conduct](CODE_OF_CONDUCT.md) across all interaction channels.

---

## 👥 Roles & Responsibilities

### Contributors
Anyone who submits issues, pull requests, documentation improvements, or assists others in discussions is a valued contributor.

### Maintainers
Maintainers are responsible for:
- Reviewing and merging pull requests.
- Triaging bug reports and provider requests.
- Ensuring release integrity and publishing to npm.
- Safeguarding code quality, security standards, and CI green status.

**Project Lead / Benevolent Maintainer**:
- **Md. Mahedi Zaman Zaber** ([@zaber-dev](https://github.com/zaber-dev))

---

## 🗳️ Decision-Making Process

- **Minor Changes & Bug Fixes**: Reviewed and merged by maintainers following standard PR code review.
- **New Provider Adapters**: Accepted if the provider offers a legitimate free tier or developer tier, adheres to the `BaseProvider` contract, and passes schema validation.
- **Architectural & Breaking Changes**: Discussed in GitHub Issues / Discussions. Consensus among active maintainers is required.

---

## 📦 Release Policy & Versioning

Free-AI Gateway strictly follows [Semantic Versioning (SemVer 2.0.0)](https://semver.org/):
- **MAJOR (`x.0.0`)**: Incompatible API changes to Core contracts or Fastify endpoints.
- **MINOR (`1.x.0`)**: New provider adapters, additional capabilities, new skills, or backward-compatible features.
- **PATCH (`1.0.x`)**: Bug fixes, performance improvements, and documentation updates.
