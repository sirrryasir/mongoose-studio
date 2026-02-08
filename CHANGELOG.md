# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-02-08

### Major Features
- **Smart Type Inference**: Automatically detects `Boolean`, `Date`, and `ObjectID` fields from data samples when metadata is missing (fixes "disappearing columns" and uneditable fields).
- **Deep Linking System**: Clicking on a Reference (`author_id`) now opens that document in a side panel with full context.
- **Premium UI Overhaul**:
    - **Tabs System**: Switch between Form and JSON views seamlessly.
    - **Better Typography**: Refined fonts, spacing, and high-contrast dark mode colors.
    - **Visual Feedback**: Added Toast notifications for Save/Delete actions.
    - **Safe Deletion**: Replaced browser `alert` with a custom `AlertDialog` UI.
- **Visual Aggregation Builder**: A drag-and-drop interface to build aggregation pipelines without writing raw JSON.
- **Improved Filter System**: Visual query builder for complex filtering (`$gt`, `$in`, `$regex` support).

### Fixed
- Fixed layout issues where the sidebar was too wide on large screens.
- Fixed `RefPreview` not triggering correctly on hover.
- Resolved "Copy JSON" button positioning for better UX.

## [1.1.0] - 2026-02-06 (Internal Release)

### Added
- **Tab Workspace**: Ability to have multiple models open in tabs (like VS Code).
- **Virtualized Grid**: Switched to `@tanstack/react-virtual` for high-performance rendering of large datasets.
- **Reference Expansion**: Inline expansion of related documents in the grid.
- **Sortable Columns**: Server-side sorting implemented by clicking column headers.

### Changed
- **Performance**: Optimized large object rendering to prevent UI freezing.
- **Security**: Implemented stricter query sanitization to prevent NoSQL injection.

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

