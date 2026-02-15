import filtersData from './filters.json';

export interface FilterMeta {
  id: string;
  name: string;
  version: string;
  class: string;
  parametersClass: string;
  mimeType: string;
  extensions: string[];
  description: string;
  documentation: string;
}

export interface FilterSchema {
  $schema: string;
  $id: string;
  title: string;
  description: string;
  type: string;
  properties: Record<string, {
    type: string | string[];
    default?: unknown;
    description?: string;
    enum?: unknown[];
    deprecated?: boolean;
    items?: unknown;
  }>;
  additionalProperties: boolean;
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
  presets?: Record<string, string>;
  testSamples?: string[];
  language?: string;
  description?: string;
}

export interface EditorHintGroup {
  id: string;
  label: string;
  collapsed?: boolean;
  fields: string[];
}

export interface EditorHints {
  groups?: EditorHintGroup[];
  fields?: Record<string, EditorHintField>;
}

export interface FilterData {
  meta: FilterMeta;
  schema: FilterSchema;
  editorHints: EditorHints | null;
}

export const filters: FilterData[] = filtersData as FilterData[];

export function getFilterById(id: string): FilterData | undefined {
  return filters.find(f => f.meta.id === id);
}

export function searchFilters(query: string): FilterData[] {
  const q = query.toLowerCase();
  if (!q) return filters;
  
  return filters.filter(f => {
    const meta = f.meta;
    return (
      meta.id.toLowerCase().includes(q) ||
      meta.name.toLowerCase().includes(q) ||
      meta.mimeType.toLowerCase().includes(q) ||
      meta.description.toLowerCase().includes(q) ||
      meta.extensions.some(ext => ext.toLowerCase().includes(q))
    );
  });
}

export function getDefaults(schema: FilterSchema): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const [key, prop] of Object.entries(schema.properties)) {
    if (prop.default !== undefined) {
      defaults[key] = prop.default;
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
    // Only include if different from default
    if (JSON.stringify(value) !== JSON.stringify(defaultValue)) {
      sparse[key] = value;
    }
  }
  return sparse;
}
