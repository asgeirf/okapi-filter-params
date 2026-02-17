# Okapi Filter Configuration UI

A web-based configuration editor for [Okapi Framework](https://okapiframework.org/) filter parameters. Supports **57 filters** across **11 Okapi versions** (0.38 → 1.48.0) with version-aware schemas, collapsible field groups, and rich editor widgets.

## Features

- **Version-aware**: Select any Okapi version to see the correct filter parameters and defaults
- **57 filters**: All filters from the Okapi Framework with auto-generated JSON Schemas
- **Grouped parameters**: Fields organized into collapsible sections (e.g., Word/Excel/PowerPoint for OpenXML)
- **Rich widgets**: Tag lists, regex builders, code finder editors, delimiter pickers
- **Sparse output**: Only non-default values are included in the configuration output
- **Shareable links**: Copy a link with your configuration embedded in the URL

## Schema Data

Filter schemas are imported from [okapi-bridge](https://github.com/gokapi/okapi-bridge), which provides composite JSON Schemas (base + human-curated UI overrides) for each filter version.

To update schemas from okapi-bridge:

```bash
npm run import-schemas                           # uses default path
npm run import-schemas -- /path/to/okapi-bridge  # custom path
```

This generates `src/data/bridge-bundle.json` containing all composite schemas and version mappings.

## Development

```bash
npm install
npm run import-schemas  # generate schema bundle (required before first build)
npm run dev             # start dev server
npm run build           # production build
npm run lint            # run linter
```
