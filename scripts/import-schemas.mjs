#!/usr/bin/env node
/**
 * Import composite schemas and schema-versions.json from okapi-bridge
 * into a single bundled JSON file for the UI.
 *
 * Usage: node scripts/import-schemas.mjs [bridge-path]
 *   bridge-path defaults to ../gokapi/okapi-bridge (relative to repo root)
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const bridgePath = process.argv[2]
  ? resolve(process.argv[2])
  : resolve(repoRoot, '../../gokapi/okapi-bridge');

const compositeDir = join(bridgePath, 'schemas/composite');
const versionsFile = join(bridgePath, 'schema-versions.json');

if (!existsSync(versionsFile)) {
  console.error(`schema-versions.json not found at ${versionsFile}`);
  process.exit(1);
}
if (!existsSync(compositeDir)) {
  console.error(`composite schemas directory not found at ${compositeDir}`);
  process.exit(1);
}

// Read schema-versions.json
const schemaVersions = JSON.parse(readFileSync(versionsFile, 'utf-8'));

// Read all composite schemas into a map: "okf_json.v4" -> schema object
const schemas = {};
for (const file of readdirSync(compositeDir)) {
  if (!file.endsWith('.schema.json')) continue;
  // e.g. okf_json.v4.schema.json -> okf_json.v4
  const key = file.replace('.schema.json', '');
  schemas[key] = JSON.parse(readFileSync(join(compositeDir, file), 'utf-8'));
}

// Collect all Okapi versions across all filters
const allOkapiVersions = new Set();
for (const filterInfo of Object.values(schemaVersions.filters)) {
  for (const ver of filterInfo.versions) {
    ver.okapiVersions.forEach(v => allOkapiVersions.add(v));
  }
}

// Sort versions: numeric comparison
function parseVersion(v) {
  return v.split('.').map(Number);
}
function compareVersions(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

const sortedOkapiVersions = [...allOkapiVersions].sort(compareVersions);

// Build the output bundle
const bundle = {
  generatedAt: new Date().toISOString(),
  okapiVersions: sortedOkapiVersions,
  // Map: filterId -> { versions: [...] }
  filters: {},
  // Map: "okf_json.v4" -> composite schema
  schemas,
  // Map: okapiVersion -> filterId -> configurations[]
  configurations: {},
};

for (const [filterId, filterInfo] of Object.entries(schemaVersions.filters)) {
  bundle.filters[filterId] = {
    versions: filterInfo.versions.map(v => ({
      version: v.version,
      okapiVersions: v.okapiVersions,
      introducedInOkapi: v.introducedInOkapi,
    })),
  };
}

// Extract configurations from per-version schemas
const releasesDir = join(bridgePath, 'okapi-releases');
let totalConfigs = 0;
for (const okapiVersion of sortedOkapiVersions) {
  const versionSchemasDir = join(releasesDir, okapiVersion, 'schemas');
  if (!existsSync(versionSchemasDir)) continue;
  
  const versionConfigs = {};
  for (const file of readdirSync(versionSchemasDir)) {
    if (!file.endsWith('.schema.json')) continue;
    const filterId = file.replace('.schema.json', '');
    const versionSchema = JSON.parse(readFileSync(join(versionSchemasDir, file), 'utf-8'));
    const configs = versionSchema?.['x-filter']?.configurations;
    if (configs && configs.length > 0) {
      const relevant = configs.map(c => ({
        configId: c.configId,
        name: c.name,
        description: c.description || '',
        isDefault: c.isDefault || false,
        parameters: c.parameters || null,
        filterClass: c.filterClass || null,
        schemaRef: c.schemaRef ? c.schemaRef.replace('.schema.json', '') : null,
      }));
      versionConfigs[filterId] = relevant;
      totalConfigs += relevant.length;
    }
  }
  if (Object.keys(versionConfigs).length > 0) {
    bundle.configurations[okapiVersion] = versionConfigs;
  }
}

const outPath = join(repoRoot, 'src/data/bridge-bundle.json');
writeFileSync(outPath, JSON.stringify(bundle));

const schemaCount = Object.keys(schemas).length;
const filterCount = Object.keys(bundle.filters).length;
const sizeKb = (Buffer.byteLength(JSON.stringify(bundle)) / 1024).toFixed(1);
console.log(`✓ Imported ${schemaCount} schemas for ${filterCount} filters across ${sortedOkapiVersions.length} Okapi versions`);
console.log(`  Configurations: ${totalConfigs} presets`);
console.log(`  Okapi versions: ${sortedOkapiVersions.join(', ')}`);
console.log(`  Output: ${outPath} (${sizeKb} KB)`);
