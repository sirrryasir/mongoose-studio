# Changelog

All notable changes to this project will be documented in this file.

## [1.0.4] - 2026-01-31

### Added
- **Unified Single Origin Build**: The UI and API now run on a single port (`5555`), eliminating CORS issues.
- **Verbose Mode**: Added `--verbose` flag for detailed debugging of model loading.
- **Update Notifier**: CLI now checks for availability of new versions on startup.
- **Professional Metadata**: Enriched `package.json` with keywords and links.
- **SEO Ready Docs**: Added `sitemap.xml`, `robots.txt`, and OpenGraph tags to the documentation site.

### Changed
- Refactored `src/server.ts` to serve static assets from `dist/ui`.
- Migrated UI build to `output: export` for static generation.
- Improved CLI startup stability and error messages.

### Fixed
- Fixed "grid.svg" 404 error on Landing Page.
- Resolved flaky button styling by removing dependency on external themes.
