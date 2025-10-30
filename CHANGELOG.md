<!-- markdownlint-configure-file {"MD024": { "siblings_only": true }} -->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on **[Keep a Changelog](https://keepachangelog.com/en/1.1.0/)**, and this project adheres to **[Semantic Versioning](https://semver.org/spec/v2.0.0.html)**.

## [Unreleased]

### Added

- (placeholder) Future enhancements go here.

---

## [0.1.0] - 2025-10-22
>
> Initial public baseline with version badge and docs/CI polish.

### Added

- **Shared version source** at `docs/site.json`; pages render a DOM-ready version badge fed by this JSON.
- **Pre-commit hook** that refreshes the build date and runs markdownlint with friendly logging.

### Changed

- **HTML validation fixes**: DOCTYPE uppercased, void elements normalized, inline styles removed. (Documented during versioning milestone work.)

### Fixed

- **Markdown lint reliability** by routing `npx` via `cmd.exe` in the hook; documented quick troubleshooting steps.

### Documentation

- Updated **Workflow Guide** with Markdown hygiene rules and hook behavior.
- Added **head snippet** with version-badge script for reuse across pages.
- Clarified **Project Setup Guide** for “Load project bootstrap” behavior.

---

## Notes

- Current version in `docs/site.json`: **0.1.0** (build date **2025-10-22**).

[Unreleased]: https://github.com/sjones321/civ7-tracker/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/sjones321/civ7-tracker/releases/tag/v0.1.0
