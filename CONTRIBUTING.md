# Contributing to AIS Teaching Resources

Thank you for helping improve this resource collection for IS educators worldwide.

## How to suggest a new resource

Open a GitHub Issue with the following information:

- **Title** of the resource
- **URL** (must be a stable, permanent link)
- **Description** (1-3 sentences explaining what it offers to IS educators)
- **Category** (one of the 16 categories listed in `schema.json`)
- **Tags** (use terms from `schema.json` where possible)
- **Source** (organization or publisher)

## How to report a broken link or outdated resource

Open a GitHub Issue with:

- The resource title and ID (visible in `resources.json`)
- What's wrong (404, redirect, outdated content, archived)
- Suggested replacement URL, if available

## How to contribute directly

1. Fork the repository
2. Edit `resources.json` to add or update resources
3. Ensure your changes follow the data model (see README.md)
4. Verify all new URLs are accessible
5. Set `lastAccessed` to today's date (DD/MM/YYYY format)
6. Submit a pull request with a clear description of changes

### Guidelines

- Use the controlled vocabulary from `schema.json` for categories and tags
- Keep descriptions concise (1-3 sentences) and focused on value to IS educators
- Avoid promotional language — describe what the resource offers objectively
- Do not add resources that are paywalled without free academic access
- Do not add individual conference proceedings or year-specific URLs (link to the permanent series page instead)
- Verify that the resource is actively maintained and not archived

## Code of Conduct

Contributors are expected to follow the [AIS Code of Research Conduct](https://aisnet.org/page/AdoptedCodes).
