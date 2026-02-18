import yaml from 'js-yaml';

export type OutputFormat = 'json' | 'yaml' | 'fprm';
export type SerializationFormat = 'stringParameters' | 'yaml';

/**
 * Serialize sparse config to JSON string.
 */
export function toJson(config: Record<string, unknown>): string {
  return JSON.stringify(config, null, 2);
}

/**
 * Serialize sparse config to YAML string.
 */
export function toYaml(config: Record<string, unknown>): string {
  if (Object.keys(config).length === 0) return '';
  return yaml.dump(config, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
  }).trimEnd();
}

/**
 * Infer .fprm type suffix from a value.
 * .b = boolean, .i = integer, no suffix = string
 */
function fprmKey(key: string, value: unknown): string {
  if (typeof value === 'boolean') return `${key}.b`;
  if (typeof value === 'number' && Number.isInteger(value)) return `${key}.i`;
  return key;
}

/**
 * Escape a string value for .fprm format.
 * Newlines -> $0a$, other special chars preserved.
 */
function fprmEscape(value: string): string {
  return value.replace(/\n/g, '$0a$').replace(/\r/g, '$0d$');
}

/**
 * Serialize a value for .fprm format.
 */
function fprmValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return fprmEscape(value);
  // Complex objects: serialize as JSON string
  return fprmEscape(JSON.stringify(value));
}

/**
 * Serialize sparse config to Okapi .fprm format (key=value with type suffixes).
 *
 * Format:
 *   #v1
 *   key.b=true          (boolean)
 *   key.i=42            (integer)
 *   key=string value    (string)
 */
export function toFprm(config: Record<string, unknown>): string {
  if (Object.keys(config).length === 0) return '';
  const lines = ['#v1'];
  for (const [key, value] of Object.entries(config)) {
    if (value === null || value === undefined) continue;
    lines.push(`${fprmKey(key, value)}=${fprmValue(value)}`);
  }
  return lines.join('\n');
}

/**
 * Format config in the specified output format.
 * For .fprm, uses the filter's native serialization format (key=value or YAML).
 */
export function formatConfig(
  config: Record<string, unknown>,
  format: OutputFormat,
  serializationFormat: SerializationFormat = 'stringParameters',
): string {
  switch (format) {
    case 'json': return toJson(config);
    case 'yaml': return toYaml(config);
    case 'fprm':
      return serializationFormat === 'yaml' ? toYaml(config) : toFprm(config);
  }
}

/**
 * Get file extension for an output format.
 */
export function formatExtension(
  format: OutputFormat,
  serializationFormat: SerializationFormat = 'stringParameters',
): string {
  switch (format) {
    case 'json': return '.json';
    case 'yaml': return '.yml';
    case 'fprm':
      return serializationFormat === 'yaml' ? '.yml' : '.fprm';
  }
}

/**
 * Get the output format options, with .fprm label adjusted for YAML-based filters.
 */
export function getOutputFormats(serializationFormat: SerializationFormat = 'stringParameters') {
  return [
    { value: 'json' as OutputFormat, label: 'JSON' },
    { value: 'yaml' as OutputFormat, label: 'YAML' },
    { value: 'fprm' as OutputFormat, label: serializationFormat === 'yaml' ? '.fprm (YAML)' : '.fprm' },
  ];
}
