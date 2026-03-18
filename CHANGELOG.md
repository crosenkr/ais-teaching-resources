# Changelog

All notable changes to the AIS Teaching Resources website are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.0] - 2026-03-18

### Added

- **Suggest a Resource** — "+" button in controls bar opens a modal form (title, URL, category, description, name); submits as a pre-filled GitHub Issue with `suggestion` label for community-driven curation
- **Report Issue** — flag button on each resource card opens a pre-filled GitHub Issue with `bug` label for reporting dead links, miscategorization, or incorrect information
- **Sort options** — dropdown per category header to sort resources by title (A–Z), source, or newest (by last-accessed date); sort state persists per category during the session

### Changed

- Suggest and Report features use GitHub Issues (no email dependency) — configurable via `GITHUB_ISSUES_URL` constant
- Modal includes focus trapping, Escape-to-close with priority over tag cloud panel, and focus return to trigger on close
- Added `aria-required="true"` on required form fields for improved screen reader compatibility
- Sort dropdown uses `:focus-visible` instead of `:focus` for proper focus indicator
- Inline form validation (focus empty field) replaces `alert()` dialog
- Print stylesheet updated to hide modal, sort dropdowns, and report buttons

## [0.8.0] - 2026-03-17

### Added

- **Dark mode** — automatic detection via `prefers-color-scheme: dark` with full dark palette; manual toggle button (crescent/sun icon) in controls bar; preference persisted in `localStorage`
- **"New" badges** — resources with a `lastAccessed` date within the last 60 days display a green "New" badge next to the title
- **Back-to-top button** — fixed floating button appears after scrolling 400px, smooth-scrolls to top; 44px touch target for mobile accessibility
- **Extended roadmap** in README — organized into near-term, medium-term, and long-term sections with 11 planned features

### Changed

- Dark mode CSS variables and element overrides for all components (header, cards, controls, footer, search highlights, tags, share buttons)
- Print stylesheet updated to hide back-to-top button and dark mode toggle
- README updated with new features and expanded roadmap

## [0.7.0] - 2026-03-17

### Added

- **Multi-category selection** — category filter buttons now toggle on/off; select multiple categories simultaneously (desktop pill buttons)
- **Collapsible category sections** — click the ▼ toggle on any category header to collapse/expand its resource cards
- **Expand all / Collapse all** button in the controls bar
- **Reduced motion support** — respects `prefers-reduced-motion` OS setting
- **High contrast mode** — respects `prefers-contrast: more` with thicker borders and darker text
- **Escape-to-close** for tag cloud panel
- **Referrer policy** — `strict-origin-when-cross-origin` meta tag for privacy
- `aria-label` on "+N more" tag expand buttons

### Changed

- **Contrast fixes (WCAG 2.1 AA):** `--ais-light-blue` darkened from `#2a8fd4` to `#1a73b5` (4.7:1 ratio); "last accessed" text darkened from `#767676` to `#595959` (7:1 ratio)
- **Share button touch targets** increased from 26px to 32px with 6px padding for better mobile tapping
- **Category collapse toggle** refactored from `role="button"` on `<div>` to a proper `<button>` element — fixes screen reader heading-inside-button confusion
- Category filter group now labeled "select one or more" for discoverability
- Search input focus style enhanced with blue border and accent shadow
- Controls bar wrapped in `<nav aria-label="Resource filters">` landmark

## [0.6.1] - 2026-03-17

### Added

- **Clear filters button** in the controls bar — appears whenever any filter (search, category, or tag) is active; clears all filters in one click

## [0.6.0] - 2026-03-16

### Added

- **Share bar** on every resource card — copy link, share to X, LinkedIn, Facebook, Bluesky, WhatsApp, or email with a single click
- Native Share API integration for mobile devices (progressive enhancement)
- 3 new categories: Accreditation & Quality Assurance (3), Data & Analytics Education (9), Low-Code / No-Code Education (4)
- 46 new resources across all categories (205 total, up from 159):
  - AI & GenAI in Education (+3): Stanford HAI, Google AI Essentials, Elements of AI
  - Accreditation & Quality Assurance (3): ABET CAC, AACSB, EQUIS
  - Case Studies (+2): INSEAD Case Publishing, Stanford GSB Free Cases
  - Curricula & Standards (+3): DigComp 2.2, e-CF, SFIA
  - Cybersecurity Education (+2): SANS CyberStart, NIST CSF 2.0
  - Data & Analytics Education (9): Snowflake, Databricks, DataCamp, Tableau Public, BigQuery Sandbox, FiveThirtyEight, Data.gov, EU Open Data, UCI ML Repository
  - Ethics & Responsible Technology (+2): AI Ethics Lab, Responsible AI Institute
  - Funding & Grants (+2): DAAD, Fulbright Scholar Program
  - IS Education Journals (+2): Education and Information Technologies, Computers & Education
  - Low-Code / No-Code Education (4): Mendix, OutSystems, Appian, Microsoft Power Platform
  - Online Courses & MOOCs (+3): LinkedIn Learning, Udacity, Google Digital Garage
  - Open Educational Resources (+5): Awesome Public Datasets, CORGIS, Khan Academy, FigJam, Padlet
  - Professional Communities (+1): IFIP TC8
  - Professional Development (+1): POD Network
  - Regional Communities (+2): K-AIS, JASMIN
  - Research Archives (+1): SSRN
  - Simulations & Experiential Learning (+3): HBR Simulations, Hacking Lab, TryHackMe
  - Vendor Academic Programs (+6): Camunda, UiPath, ServiceNow, Atlassian, Figma, Notion
- New tags: 6 topics (automation, data engineering, digital competence, low-code, responsible AI, RPA), 4 resource types (accreditation, open data, preprints, quality assurance), 19 organizations (ABET, Appian, Atlassian, Camunda, Databricks, DataCamp, Elsevier, Figma, IFIP, INSEAD, Mendix, Notion, OutSystems, SANS, ServiceNow, SFIA, Snowflake, Springer, UiPath)
- ARIA labels on all share buttons for screen reader accessibility

### Changed

- Moved Kaggle (ID 51) from "Online Courses & MOOCs" to "Open Educational Resources"
- Updated copyright to include Philipp Hukal as co-copyright holder (LICENSE, README, footer)
- Welcome banner updated to "200+ resources across 19 categories"

### Removed

- AIS Resources Page (ID 7) — obsolete, replaced by this website

## [0.5.1] - 2026-03-15

### Changed

- Welcome banner dismiss now uses `sessionStorage` (per-session) instead of `localStorage` (permanent), so the banner reappears on new browser sessions

## [0.5.0] - 2026-03-15

### Added

- Dismissable welcome banner with introductory text for first-time visitors

### Changed

- Reordered categories for better discoverability: teaching content first (Curricula, OER, MOOCs, Case Studies, Textbooks, Simulations, Vendor Programs), then specialized topics (AI, Ethics, Cybersecurity), research (Journals, Archives), community (Professional, Regional), and support (Professional Development, Funding)

## [0.4.1] - 2026-03-15

### Fixed

- Replaced `document.write()` in print header with DOM manipulation for better CSP compatibility

## [0.4.0] - 2026-03-15

### Added

- Region tags on all 160 resources (Global, North America, Europe, DACH, Asia-Pacific, Nordic, Africa, Latin America, Middle East)
- Regions now appear in the tag cloud facet and are filterable like any other tag

### Changed

- Removed lowercase "global" duplicate tag from Ivey Publishing resource

## [0.3.1] - 2026-03-15

### Added

- Animated loading spinner replacing static "Loading resources…" text
- SVG search icon for consistent cross-browser rendering (replaces emoji)
- Print-only header with site title and print date
- Favicon (inline SVG with AIS blue "TR" monogram)
- Mobile grid enforcement: list view is overridden to card layout on small screens (view toggle hidden)

## [0.3.0] - 2026-03-15

### Added

- Multi-tag intersection filtering: select multiple tags to show only resources matching all of them
- Tag cloud panel with "Browse Tags" toggle, organized by 6 schema facets
- Tags sized proportionally to usage frequency (5 size levels) with resource counts
- Collapsible "Other" section for uncategorized tags
- Instructional hint in tag cloud for multi-tag feature discoverability
- Content Security Policy meta tag
- ARIA attributes: `aria-expanded` on tag cloud toggle, `aria-pressed` on view/filter buttons, `aria-hidden` on decorative icons, `role="region"` on tag cloud panel
- `scroll-margin-top` on main content for sticky header accommodation

### Fixed

- **Security:** XSS vulnerability in active tag filter bar — replaced inline `onclick` handlers with event delegation throughout (tag pills, clear buttons, category filters, view toggles, logo error handler)
- **Bug:** Browser back/forward navigation now correctly restores tag and search state (previously `hashchange` handler cleared tags)
- **Accessibility:** "Last accessed" text and tag facet labels now meet WCAG AA contrast (changed from `#999` to `#767676`)

### Changed

- All inline event handlers removed — full event delegation for CSP compatibility

## [0.1.0] - 2026-03-15

### Added

- Initial prototype with 160 curated IS teaching resources
- 16 resource categories with schema-driven rendering
- Controlled tag vocabulary (6 facets, 111 terms) in `schema.json`
- Full-text search across title, description, tags, source, and category
- Search term highlighting in results
- Category filter buttons (desktop) and dropdown (mobile)
- Clickable tag filtering with active tag indicator
- Grid/List view toggle
- URL state persistence (shareable filtered views via hash)
- "Last accessed" date on each resource card
- Responsive design with tablet (1024px) and mobile (768px) breakpoints
- Accessibility: skip-to-content, ARIA labels, `aria-pressed`, `aria-live`, focus-visible styles, keyboard-accessible tags
- Print stylesheet with URL display
- Keyboard shortcuts: `/` to focus search, `Escape` to clear
- "Clear all filters" button in empty state
- XSS prevention via `escapeHtml()` and `safeUrl()` functions
- `rel="noopener noreferrer"` on all external links
- AIS branding: logo, Open Sans font, AIS blue/gold color scheme
- GitHub Pages deployment

### Resource coverage

- Curricula & Standards (15): IS2020, MSIS 2016, CC2020, NICE, AACSB, WKWI, IEEE, etc.
- Open Educational Resources (21): OpenStax, MERLOT, MIT OCW, AISEL, IDEO, Stanford d.school, etc.
- Case Studies (8): Harvard, Ivey, Case Centre, JITTC, JITCAR, MIT Sloan, etc.
- Vendor Academic Programs (23): SAP, AWS, Microsoft, Oracle, GitHub, IBM, Cisco, JetBrains, Celonis, etc.
- Simulations & Experiential Learning (11): ERPsim, MonsoonSIM, Capsim, Packet Tracer, GNS3, etc.
- Online Courses & MOOCs (8): Coursera, edX, Kaggle, IxDF, DataCamp, etc.
- AI & GenAI in Education (7): Harvard, Cornell, OECD, Faculty Focus, etc.
- Cybersecurity Education (2): NICCS, CyberSeek
- Ethics & Responsible Technology (4): Markkula Center, IEEE TechEthics, ACM Code of Ethics, etc.
- IS Education Journals (14): JISE, ISEDJ, BISE, SJIS, AJIS, AMLE, etc.
- Professional Communities (15): SIGED, SIGCITE, EDUCAUSE, ISACA, IEEE TEMS, etc.
- Regional Communities (16): WI Conference, IRIS/SCIS, NOKOBIT, AIM, ItAIS, MCIS, AAIS, etc.
- Research Archives (4): AISeL, ACM DL, IEEE Xplore, etc.
- Textbook Companions (4): Pearson MyLab, McGraw Hill, Valacich/Schneider, Rainer/Prince
- Funding & Grants (5): NSF CyberCorps, NSF IUSE, Erasmus+, etc.
- Professional Development (3): AACSB Academy, SIGED ICISER, etc.
