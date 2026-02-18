import docsBundle from './filter-docs-bundle.json';

// --- Types for filter documentation ---

export interface ParamDependency {
  property: string;
  condition: string;
}

export interface ParamDoc {
  description: string;
  notes?: string[];
  dependsOn?: ParamDependency[];
  introducedIn?: string;
}

export interface DocExample {
  title: string;
  description: string;
  input?: string;
  output?: string;
}

export interface FilterDoc {
  filterName: string;
  overview: string;
  wikiUrl?: string;
  filterId?: string;
  limitations?: string[];
  processingNotes?: string[];
  examples?: DocExample[];
  parameters: Record<string, ParamDoc>;
}

// --- Data access ---

const bundle = docsBundle as {
  generatedAt: string;
  filters: Record<string, FilterDoc>;
  aliases?: Record<string, string>;
};

/**
 * Get documentation for a filter by ID.
 * Resolves aliases (e.g., okf_baseplaintext → okf_plaintext).
 */
export function getFilterDoc(filterId: string): FilterDoc | undefined {
  const doc = bundle.filters[filterId];
  if (doc) return doc;
  // Check aliases
  const aliasTarget = bundle.aliases?.[filterId];
  if (aliasTarget) return bundle.filters[aliasTarget];
  return undefined;
}

/**
 * Get documentation for a specific parameter of a filter.
 */
export function getParamDoc(filterId: string, paramName: string): ParamDoc | undefined {
  return getFilterDoc(filterId)?.parameters?.[paramName];
}
