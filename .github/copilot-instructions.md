# Copilot Instructions

## Build & Dev Commands

```bash
npm run dev             # start Vite dev server
npm run build           # tsc -b && vite build
npm run lint            # eslint .
npm run import-schemas  # regenerate src/data/bridge-bundle.json from okapi-bridge
```

No test suite exists. The `import-schemas` step is required before the first build — it generates `src/data/bridge-bundle.json` from the sibling `okapi-bridge` repo.

## Architecture

This is a React + TypeScript SPA (Vite, Tailwind CSS v4, React Router with HashRouter) that renders configuration editors for Okapi Framework filters. It uses `@rjsf/core` (React JSON Schema Form) as the base form engine.

### Data flow

1. **Schema import** — `scripts/import-schemas.mjs` reads composite JSON Schemas from the `okapi-bridge` repo and bundles them into `src/data/bridge-bundle.json` (committed, ~large).
2. **Data layer** (`src/data/index.ts`) — Typed accessors over the bundle. All data functions that return filter-specific results require an `okapiVersion` parameter (e.g. `getFilterById(id, okapiVersion)`, `searchFilters(query, okapiVersion)`).
3. **Version context** — `OkapiVersionContext` (React context + URL `?okapi=` search param) tracks the selected Okapi version globally.
4. **Sparse output** — `getSparseConfig()` strips defaults so only non-default values appear in the output. Output formats: JSON, YAML, and `.fprm` (Okapi's native key=value format) via `src/lib/outputFormats.ts`.

### Pages

- `/` — `FilterSelectPage`: filter list for the selected Okapi version
- `/configure/:filterId` — `ConfigurePage`: form editor for a single filter

### Editor system

Filters get either a **dedicated editor** or the **GenericEditor** (schema-driven). The registry is in `src/components/editors/index.ts` — `getEditor(filterId)` returns the component.

- **Dedicated editors** (`src/components/editors/`) — hand-built for complex filters (OpenXML, Regex, JSON, etc.). Each receives `EditorProps { formData, onChange, defaults, schema }`.
- **GenericEditor** — auto-generates fields from JSON Schema + `x-groups` metadata.
- **EditorShell** (`EditorShell.tsx`) — shared field primitives (`BoolField`, `TextField`, `FieldGroup`, etc.) and dirty-state helpers used by all editors.
- **Widgets** (`src/components/widgets/`) — rich input controls (TagList, RegexBuilder, CodeFinderRules, etc.) used by both RJSF and dedicated editors.

### UI components

`src/components/ui/` contains shadcn/ui-style primitives (Button, Card, Input, etc.) using `class-variance-authority` + `tailwind-merge` via the `cn()` utility in `src/lib/utils.ts`.

## Key Conventions

- **Path alias**: `@/` maps to `src/` (configured in `vite.config.ts`).
- **Schema extensions**: Custom `x-` prefixed JSON Schema properties drive UI behavior — `x-widget`, `x-groups`, `x-presets`, `x-filter`, `x-placeholder`, `x-okapiFormat`.
- **New editors**: Add the component to `src/components/editors/`, register it in the `editorRegistry` map in `editors/index.ts`, and implement `EditorProps`. Use `EditorShell` primitives for field rendering.
- **New widgets**: Add to `src/components/widgets/` and re-export from the barrel `index.ts`.
- **Configurations (presets)**: Some filters have multiple named configurations (e.g. CSV filter has "comma" and "tab" presets). A config may reference a different filter's schema via `schemaRef`.
