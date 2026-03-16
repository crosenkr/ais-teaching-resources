# AIS Teaching Resources

A curated collection of teaching resources for Information Systems (IS) educators worldwide, maintained by the AIS VP Education team.

**Live site:** [crosenkr.github.io/ais-teaching-resources](https://crosenkr.github.io/ais-teaching-resources/)

## Overview

This website provides IS faculty with a searchable, filterable directory of 160+ teaching resources across 16 categories — from curricula and case studies to vendor academic programs, simulations, and regional IS communities.

### Features

- **Search** with highlighted results across titles, descriptions, tags, and sources
- **Category filtering** via pill buttons (desktop) or dropdown (mobile)
- **Tag-based filtering** — click any tag to filter across all categories
- **Shareable URLs** — filter state is persisted in the URL hash
- **Responsive design** — optimized for desktop, tablet, and mobile
- **Accessible** — WCAG-compliant contrast, keyboard navigation, ARIA labels, skip-to-content
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
| 1 | Curricula & Standards | 15 |
| 2 | Open Educational Resources | 21 |
| 3 | Online Courses & MOOCs | 8 |
| 4 | Case Studies | 8 |
| 5 | Textbook Companions | 4 |
| 6 | Simulations & Experiential Learning | 11 |
| 7 | Vendor Academic Programs | 23 |
| 8 | AI & GenAI in Education | 7 |
| 9 | Ethics & Responsible Technology | 4 |
| 10 | Cybersecurity Education | 2 |
| 11 | IS Education Journals | 14 |
| 12 | Research Archives | 4 |
| 13 | Professional Communities | 15 |
| 14 | Regional & Language-Specific IS Communities | 16 |
| 15 | Professional Development for IS Faculty | 3 |
| 16 | Funding & Grants for IS Education | 5 |

### Tag Taxonomy

Tags are organized into 6 facets (see `schema.json` for the full controlled vocabulary):

- **Topics** (28): AI, analytics, BPM, cloud, cybersecurity, data science, ERP, ethics, etc.
- **Resource types** (24): case studies, certification, courseware, dataset, journal, MOOC, OER, etc.
- **Organizations** (36): AACSB, ACM, AIS, AWS, Cisco, Google, IEEE, Microsoft, SAP, etc.
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
3. Set `category` to one of the 16 labels from `schema.json`
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

**Current version:** 0.5.1 (Prototype)

This is a working prototype for user testing and feedback collection. See `USER_TEST_SCRIPT.md` for the test protocol.

### Roadmap

- **Resource suggestion form** — Allow registered AIS members to suggest new resources via an integrated form (review queue → curation → publish)

## License

Copyright (c) 2026 Christoph Rosenkranz and the Association for Information Systems (AIS). All rights reserved.

This work is licensed under the [Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/).

You are free to share and adapt this material for non-commercial purposes with appropriate attribution. See the [LICENSE](LICENSE) file for full terms.

**Exception:** The AIS logo (`ais-logo.png`), AIS trademarks, and branding are proprietary and not covered by the CC BY-NC 4.0 license.

## Contact

AIS VP Education — [aisnet.org/page/Education](https://aisnet.org/page/Education)
