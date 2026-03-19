# AIS Teaching Resources

A curated collection of teaching resources for Information Systems (IS) educators worldwide, maintained by the AIS Education advisory board.

**Live site:** [crosenkr.github.io/ais-teaching-resources](https://crosenkr.github.io/ais-teaching-resources/)

## Overview

This website provides IS faculty with a searchable, filterable directory of 200+ teaching resources across 19 categories — from curricula and case studies to vendor academic programs, simulations, and regional IS communities.

### Features

- **Search** with highlighted results across titles, descriptions, tags, and sources
- **Multi-category filtering** — select one or more categories via pill buttons (desktop) or dropdown (mobile)
- **Collapsible categories** — expand/collapse individual category sections; "Collapse all / Expand all" button
- **Tag-based filtering** — click any tag to filter across all categories
- **Share bar** — copy link, share to X, LinkedIn, Facebook, Bluesky, WhatsApp, or email directly from each resource card; native sharing on mobile
- **Clear filters** — persistent button in the controls bar appears whenever any filter is active, resets all filters in one click
- **Shareable URLs** — filter state is persisted in the URL hash (supports multi-category)
- **Responsive design** — optimized for desktop, tablet, and mobile
- **Dark mode** — automatic via `prefers-color-scheme`, with manual toggle button; preference saved in `localStorage`
- **"New" badges** — resources accessed within the last 60 days display a green "New" badge
- **Back-to-top button** — floating button appears after scrolling down, smooth-scrolls to top
- **Accessible** — WCAG 2.1 AA contrast, keyboard navigation, ARIA labels, skip-to-content, reduced motion, high contrast mode
- **Suggest a resource** — modal form opens a pre-filled GitHub Issue for community contributions
- **Report issue** — flag button on each card opens a GitHub Issue for dead links or miscategorization
- **Sort options** — sort within each category by title (A–Z), source, or newest
- **Export view** — dedicated view with checkboxes to select resources and download as CSV; all filters work in export mode
- **Keyboard shortcuts** — press `?` to see all shortcuts; `/` search, `d` dark mode, `e` export, `Esc` clear/close
- **Print-friendly** — clean print layout with URLs shown after links
- **Zero dependencies** — pure HTML, CSS, and vanilla JavaScript

## Architecture

The site is fully static with no build step, no framework, and no database.

```
index.html        Single-page application (HTML + CSS + JS, all inline)
resources.json    Resource data (id, title, url, description, category, tags, source, lastAccessed)
schema.json       Controlled vocabulary (categories, tag taxonomy)
ais-logo.png      AIS logo
```

### Data Model

Each resource in `resources.json`:

```json
{
  "id": 1,
  "title": "IS2020 Competency Model",
  "url": "https://www.acm.org/education/curricula-recommendations",
  "description": "ACM/AIS joint model curriculum for undergraduate IS programs.",
  "category": "Curricula & Standards",
  "tags": ["curriculum", "undergraduate", "ACM", "AIS"],
  "source": "ACM",
  "lastAccessed": "15/03/2026"
}
```

### Categories (defined in `schema.json`)

| # | Category | Resources |
|---|----------|:---------:|
| 1 | Curricula & Standards | 17 |
| 2 | Open Educational Resources | 24 |
| 3 | Online Courses & MOOCs | 7 |
| 4 | Case Studies | 10 |
| 5 | Textbook Companions | 4 |
| 6 | Simulations & Experiential Learning | 14 |
| 7 | Vendor Academic Programs | 29 |
| 8 | AI & GenAI in Education | 10 |
| 9 | Ethics & Responsible Technology | 6 |
| 10 | Cybersecurity Education | 4 |
| 11 | IS Education Journals | 16 |
| 12 | Research Archives | 5 |
| 13 | Professional Communities | 16 |
| 14 | Regional & Language-Specific IS Communities | 18 |
| 15 | Professional Development for IS Faculty | 4 |
| 16 | Funding & Grants for IS Education | 5 |
| 17 | Accreditation & Quality Assurance | 3 |
| 18 | Data & Analytics Education | 9 |
| 19 | Low-Code / No-Code Education | 4 |

### Tag Taxonomy

Tags are organized into 6 facets (see `schema.json` for the full controlled vocabulary):

- **Topics** (34): AI, analytics, automation, BPM, cloud, cybersecurity, data engineering, data science, digital competence, ERP, ethics, low-code, responsible AI, RPA, etc.
- **Resource types** (28): accreditation, case studies, certification, courseware, dataset, journal, MOOC, OER, open data, preprints, quality assurance, etc.
- **Organizations** (55): AACSB, ABET, ACM, AIS, Appian, Atlassian, AWS, Camunda, Celonis, Cisco, Databricks, DataCamp, Google, IBM, IEEE, IFIP, Mendix, Microsoft, OutSystems, SANS, SAP, ServiceNow, Snowflake, UiPath, etc.
- **Audience** (5): undergraduate, graduate, doctoral, faculty, practitioners
- **Regions** (9): Global, Africa, Asia-Pacific, DACH, Europe, Latin America, etc.
- **Languages** (9): en, de, fr, it, es, pt, no, zh, ja

## Development

### Local preview

```bash
python3 -m http.server 8080
# Open http://localhost:8080
```

### Adding a resource

1. Edit `resources.json`
2. Assign a unique `id` (use the next available number)
3. Set `category` to one of the 19 labels from `schema.json`
4. Use tags from the controlled vocabulary in `schema.json` where possible
5. Set `lastAccessed` to the date you verified the URL (DD/MM/YYYY)
6. Commit and push — GitHub Pages deploys automatically

### Adding a new category or tag

1. Edit `schema.json` to add the new category (with id, label, icon, order) or tag
2. The website renders dynamically from the schema — no HTML changes needed

## Deployment

The site is deployed via **GitHub Pages** from the `main` branch. Any push to `main` triggers an automatic rebuild (typically < 1 minute).

## Security

- All resource data is HTML-escaped before rendering (XSS prevention)
- URLs are validated against `http://` and `https://` protocols only
- External links use `rel="noopener noreferrer"`
- Tag filtering uses delegated event listeners (no inline script injection)

## Status

**Current version:** 0.10.1 (Prototype)

This is a working prototype for user testing and feedback collection. See `USER_TEST_SCRIPT.md` for the test protocol.

### Roadmap

#### Near-term
- **"New" badge refinement** — add "Recently Updated" indicator alongside existing "New" badges
- **Resource count in shared URLs** — show "Showing 12 of 205 resources" more prominently when sharing filtered views

#### Medium-term
- **Star/voting system** — Registered users can star or vote on resources to surface the most useful ones
- **Mobile multi-category parity** — replace `<select>` dropdown with chip/checkbox UI for multi-select on mobile

#### Long-term
- **Embed widget** — Let faculty embed a filtered subset (e.g., "AI resources") in their LMS or course page via `<iframe>`
- **Usage analytics** — Anonymous tracking of which categories/resources get the most clicks to inform curation
- **Multi-language UI** — Support for multiple UI languages (de/fr/es) alongside the already-tagged resource languages

## License

Copyright (c) 2026 Christoph Rosenkranz, Philipp Hukal, and the Association for Information Systems (AIS). All rights reserved.

This work is licensed under the [Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/).

You are free to share and adapt this material for non-commercial purposes with appropriate attribution. See the [LICENSE](LICENSE) file for full terms.

**Exception:** The AIS logo (`ais-logo.png`), AIS trademarks, and branding are proprietary and not covered by the CC BY-NC 4.0 license.

## Contact

AIS Education advisory board — [aisnet.org/page/Education](https://aisnet.org/page/Education)
