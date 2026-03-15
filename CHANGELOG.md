# Changelog

All notable changes to the AIS Teaching Resources website are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
