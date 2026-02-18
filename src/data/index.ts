import bridgeBundle from './bridge-bundle.json';

// --- Types for composite schemas from okapi-bridge ---

export interface SchemaProperty {
  type: string | string[];
  default?: unknown;
  description?: string;
  enum?: unknown[];
  deprecated?: boolean;
  items?: unknown;
  properties?: Record<string, SchemaProperty>;
  required?: string[];
  'x-widget'?: string;
  'x-presets'?: Record<string, unknown>;
  'x-placeholder'?: string;
  'x-okapiFormat'?: string;
  [key: string]: unknown;
}

export interface SchemaGroup {
  id: string;
  label: string;
  description?: string;
  collapsed?: boolean;
  fields: string[];
}

export interface XFilterMeta {
  id: string;
  class: string;
  extensions: string[];
  mimeTypes: string[];
}

export interface CompositeSchema {
  $schema: string;
  $id: string;
  $version?: string;
  title: string;
  description: string;
  type: string;
  properties: Record<string, SchemaProperty>;
  additionalProperties?: boolean;
  'x-filter'?: XFilterMeta;
  'x-groups'?: SchemaGroup[];
  'x-schemaVersion'?: number;
  'x-baseVersion'?: number;
  'x-baseHash'?: string;
  'x-compositeHash'?: string;
  'x-introducedInOkapi'?: string;
}

export interface FilterVersionInfo {
  version: number;
  okapiVersions: string[];
  introducedInOkapi: string;
}

export interface FilterInfo {
  versions: FilterVersionInfo[];
}

// Backward-compatible types used by existing UI components

export interface FilterSchema {
  $schema: string;
  $id: string;
  title: string;
  description: string;
  type: string;
  properties: Record<string, SchemaProperty>;
  additionalProperties?: boolean;
}

export interface EditorHintField {
  widget?: string;
  separator?: string;
  placeholder?: string;
  suggestions?: string[];
  allowCustom?: boolean;
  allowNull?: boolean;
  oneBased?: boolean;
  common?: Array<{ value: string; label: string }>;
  options?: Array<{ value: number | string; label: string; description?: string }>;
  presets?: Record<string, unknown>;
  testSamples?: string[];
  language?: string;
  description?: string;
}

export interface EditorHintGroup {
  id: string;
  label: string;
  description?: string;
  collapsed?: boolean;
  fields: string[];
}

export interface EditorHints {
  groups?: EditorHintGroup[];
  fields?: Record<string, EditorHintField>;
}

export interface FilterMeta {
  id: string;
  name: string;
  class: string;
  mimeType: string;
  extensions: string[];
  description: string;
  schemaVersion: number;
}

export interface FilterConfiguration {
  configId: string;
  name: string;
  description: string;
  isDefault: boolean;
  parameters: Record<string, unknown> | null;
  filterClass: string | null;
  /** Filter ID whose schema should be used for this config (e.g. "okf_commaseparatedvalues") */
  schemaRef: string | null;
}

export interface FilterData {
  meta: FilterMeta;
  schema: FilterSchema;
  editorHints: EditorHints | null;
}

// --- Bridge data access ---

const bundle = bridgeBundle as {
  generatedAt: string;
  okapiVersions: string[];
  filters: Record<string, FilterInfo>;
  schemas: Record<string, CompositeSchema>;
  configurations: Record<string, Record<string, FilterConfiguration[]>>;
};

/** All supported Okapi versions, sorted ascending */
export const okapiVersions: string[] = bundle.okapiVersions;

/** The latest Okapi version */
export const latestOkapiVersion: string = okapiVersions[okapiVersions.length - 1];

/** All filter IDs */
export const allFilterIds: string[] = Object.keys(bundle.filters).sort();

/**
 * Get the schema version number for a filter at a specific Okapi version.
 * Returns undefined if the filter is not available in that Okapi version.
 */
export function getSchemaVersionForOkapi(filterId: string, okapiVersion: string): number | undefined {
  const info = bundle.filters[filterId];
  if (!info) return undefined;
  // When multiple versions list the same okapiVersion (e.g. stale + regenerated),
  // pick the highest version number which has the most complete schema.
  let best: number | undefined;
  for (const ver of info.versions) {
    if (ver.okapiVersions.includes(okapiVersion)) {
      if (best === undefined || ver.version > best) {
        best = ver.version;
      }
    }
  }
  return best;
}

/**
 * Get all version info for a filter
 */
export function getFilterVersions(filterId: string): FilterVersionInfo[] {
  return bundle.filters[filterId]?.versions ?? [];
}

/**
 * Get the composite schema for a specific filter and schema version.
 */
export function getCompositeSchema(filterId: string, schemaVersion: number): CompositeSchema | undefined {
  const key = `${filterId}.v${schemaVersion}`;
  return bundle.schemas[key] as CompositeSchema | undefined;
}

/**
 * Get filter IDs available for a specific Okapi version.
 */
export function getFilterIdsForOkapi(okapiVersion: string): string[] {
  return allFilterIds.filter(id => getSchemaVersionForOkapi(id, okapiVersion) !== undefined);
}

/**
 * Get configurations (presets) for a filter at a specific Okapi version.
 */
export function getConfigurations(filterId: string, okapiVersion: string): FilterConfiguration[] {
  return bundle.configurations?.[okapiVersion]?.[filterId] ?? [];
}

/**
 * Resolve a configuration's schema. If the config has a schemaRef, load that
 * filter's schema instead of the parent filter's schema.
 */
export function getFilterDataForConfig(
  parentFilterId: string,
  config: FilterConfiguration,
  okapiVersion: string
): FilterData | undefined {
  if (config.schemaRef) {
    return getFilterForOkapi(config.schemaRef, okapiVersion);
  }
  return getFilterForOkapi(parentFilterId, okapiVersion);
}

/**
 * Extract EditorHints from a composite schema's x-extensions.
 * The composite schemas already have groups and widget info merged in.
 */
function extractEditorHints(schema: CompositeSchema): EditorHints | null {
  const groups = schema['x-groups'];
  const fields: Record<string, EditorHintField> = {};

  let hasFields = false;
  for (const [key, prop] of Object.entries(schema.properties)) {
    const hint: EditorHintField = {};
    if (prop['x-widget']) hint.widget = prop['x-widget'];
    if (prop['x-placeholder']) hint.placeholder = prop['x-placeholder'];
    if (prop['x-presets']) hint.presets = prop['x-presets'];
    if (prop.description) hint.description = prop.description;
    if (Object.keys(hint).length > 0) {
      fields[key] = hint;
      hasFields = true;
    }
  }

  if (!groups && !hasFields) return null;
  return {
    groups: groups ?? undefined,
    fields: hasFields ? fields : undefined,
  };
}

/**
 * Well-known display names for filters whose upstream title is generic.
 */
const filterDisplayNames: Record<string, string> = {
  okf_baseplaintext: 'Base Plain Text',
  okf_basetable: 'Base Table',
  okf_commaseparatedvalues: 'Comma Separated Values (CSV)',
  okf_fixedwidthcolumns: 'Fixed Width Columns',
  okf_paraplaintext: 'Paragraph Plain Text',
  okf_plaintext: 'Plain Text',
  okf_splicedlines: 'Spliced Lines',
  okf_tabseparatedvalues: 'Tab Separated Values (TSV)',
};

/**
 * Extract FilterMeta from a composite schema.
 */
function extractMeta(filterId: string, schema: CompositeSchema, schemaVersion: number): FilterMeta {
  const xf = schema['x-filter'];
  let name = schema.title?.replace(/ Filter$/, '').replace(/ Filter$/, '') || '';
  // If the title is generic (shared by many filters), use well-known name or filter ID
  if (!name || name === 'Plain Text' || name === 'Plain Text (BETA)') {
    name = filterDisplayNames[filterId] ?? filterId;
  }
  return {
    id: filterId,
    name,
    class: xf?.class ?? '',
    mimeType: xf?.mimeTypes?.[0] ?? '',
    extensions: xf?.extensions ?? [],
    description: schema.description ?? '',
    schemaVersion,
  };
}

/**
 * Build a FilterData object for a filter at a specific Okapi version.
 * Returns undefined if the filter is not available in that version.
 */
export function getFilterForOkapi(filterId: string, okapiVersion: string): FilterData | undefined {
  const ver = getSchemaVersionForOkapi(filterId, okapiVersion);
  if (ver === undefined) return undefined;
  const schema = getCompositeSchema(filterId, ver);
  if (!schema) return undefined;

  return {
    meta: extractMeta(filterId, schema, ver),
    schema: schema as FilterSchema,
    editorHints: extractEditorHints(schema),
  };
}

/**
 * Get all FilterData objects for a specific Okapi version.
 */
export function getFiltersForOkapi(okapiVersion: string): FilterData[] {
  return getFilterIdsForOkapi(okapiVersion)
    .map(id => getFilterForOkapi(id, okapiVersion))
    .filter((f): f is FilterData => f !== undefined);
}

/**
 * Search filters for a specific Okapi version.
 */
export function searchFilters(query: string, okapiVersion: string): FilterData[] {
  const all = getFiltersForOkapi(okapiVersion);
  const q = query.toLowerCase();
  if (!q) return all;

  return all.filter(f => {
    const { meta } = f;
    return (
      meta.id.toLowerCase().includes(q) ||
      meta.name.toLowerCase().includes(q) ||
      meta.mimeType.toLowerCase().includes(q) ||
      meta.description.toLowerCase().includes(q) ||
      meta.extensions.some(ext => ext.toLowerCase().includes(q))
    );
  });
}

/**
 * Get the FilterData for a specific filter by ID at a given Okapi version.
 */
export function getFilterById(id: string, okapiVersion: string): FilterData | undefined {
  return getFilterForOkapi(id, okapiVersion);
}

export function getDefaults(schema: FilterSchema): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const [key, prop] of Object.entries(schema.properties)) {
    if (prop.default !== undefined) {
      defaults[key] = prop.default;
    } else {
      // Infer a sensible default from the schema type
      switch (prop.type) {
        case 'boolean': defaults[key] = false; break;
        case 'string': defaults[key] = ''; break;
        case 'integer': case 'number': defaults[key] = 0; break;
      }
    }
  }
  return defaults;
}

export function getSparseConfig(
  formData: Record<string, unknown>,
  defaults: Record<string, unknown>
): Record<string, unknown> {
  const sparse: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(formData)) {
    const defaultValue = defaults[key];
    if (JSON.stringify(value) !== JSON.stringify(defaultValue)) {
      sparse[key] = value;
    }
  }
  return sparse;
}
