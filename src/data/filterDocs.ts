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

const EMPTY_LIMITATIONS = new Set(['none known.', 'none known', 'none.', 'none', 'n/a']);

/**
 * Get documentation for a filter by ID.
 * Resolves aliases (e.g., okf_baseplaintext → okf_plaintext).
 */
export function getFilterDoc(filterId: string): FilterDoc | undefined {
  const doc = bundle.filters[filterId] ?? (bundle.aliases?.[filterId] ? bundle.filters[bundle.aliases[filterId]] : undefined);
  if (!doc) return undefined;
  // Filter out placeholder limitation entries like "None known."
  if (doc.limitations) {
    const real = doc.limitations.filter(l => !EMPTY_LIMITATIONS.has(l.trim().toLowerCase()));
    return { ...doc, limitations: real.length > 0 ? real : undefined };
  }
  return doc;
}

/**
 * Get documentation for a specific parameter of a filter.
 */
export function getParamDoc(filterId: string, paramName: string): ParamDoc | undefined {
  return getFilterDoc(filterId)?.parameters?.[paramName];
}
