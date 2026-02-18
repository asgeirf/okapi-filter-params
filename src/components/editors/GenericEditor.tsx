import { type EditorProps, FieldGroup, BoolField, TextField, TextAreaField, NumberField, SelectField, CodeFinderSection, isDirty, val, set } from './EditorShell';
import { Card, CardContent } from '@/components/ui/card';

interface SchemaProperty {
  type?: string;
  description?: string;
  default?: unknown;
  enum?: (string | number)[];
  'x-widget'?: string;
  'x-enumLabels'?: string[];
  minimum?: number;
  maximum?: number;
}

interface SchemaGroup {
  id: string;
  label: string;
  description?: string;
  collapsed?: boolean;
  fields: string[];
}

/**
 * Generic schema-driven editor that auto-generates fields from JSON Schema
 * metadata, mirroring Okapi's GenericEditor.java behavior.
 */
export function GenericEditor({ formData, onChange, defaults, schema }: EditorProps) {
  if (!schema) return null;

  const properties = (schema.properties ?? {}) as Record<string, SchemaProperty>;
  const groups = (schema['x-groups'] ?? []) as SchemaGroup[];
  const s = (k: string, v: unknown) => set(formData, onChange, k, v);
  const d = (key: string) => isDirty(formData, defaults, key);
  const r = (key: string) => () => { if (defaults && key in defaults) set(formData, onChange, key, defaults[key]); };

  // Skip widgets we can't render as standalone fields
  const skipWidgets = new Set(['simplifierRulesEditor']);
  // Internal properties that aren't user-configurable
  const internalProps = new Set(['taggedConfig', 'editorTitle', 'path', 'data']);

  function isRenderable(key: string): boolean {
    if (internalProps.has(key)) return false;
    const prop = properties[key];
    if (!prop) return false;
    const widget = prop['x-widget'];
    if (widget && skipWidgets.has(widget)) return false;
    // useCodeFinder booleans rendered as part of CodeFinderSection
    if (key === 'useCodeFinder' || key.match(/^use.*CodeFinder$/)) {
      const rulesKey = key.replace(/^use/, '').replace(/CodeFinder$/, 'codeFinderRules');
      if (rulesKey in properties || 'codeFinderRules' in properties) return false;
    }
    return true;
  }

  function renderField(key: string, prop: SchemaProperty) {
    if (!isRenderable(key)) return null;

    const widget = prop['x-widget'];

    // CodeFinder: render as a section with enable toggle + rules textarea
    if (widget === 'codeFinderRules' || widget === 'codeFinder') {
      const useKey = key.replace(/Rules$/, '').replace(/^codeFinder/, 'useCodeFinder');
      const hasUseKey = useKey in properties && useKey !== key;
      if (hasUseKey) {
        return (
          <CodeFinderSection
            key={key}
            formData={formData}
            onChange={onChange}
            useCodeFinderKey={useKey}
            codeFinderKey={key}
            defaults={defaults}
          />
        );
      }
    }

    const label = prop.description || key;
    const dirty = d(key);
    const onReset = r(key);

    // Enum → SelectField
    if (prop.enum && prop.enum.length > 0) {
      const enumLabels = prop['x-enumLabels'] || [];
      const options = prop.enum.map((v, i) => ({
        value: v,
        label: enumLabels[i] || String(v),
      }));
      return (
        <SelectField
          key={key}
          label={label}
          value={String(val(formData, key, prop.default ?? prop.enum[0] ?? ''))}
          options={options}
          onChange={(v) => {
            // Coerce back to number if enum values are numbers
            const coerced = prop.type === 'integer' ? Number(v) : v;
            s(key, coerced);
          }}
          dirty={dirty}
          onReset={onReset}
        />
      );
    }

    switch (prop.type) {
      case 'boolean':
        return (
          <BoolField
            key={key}
            label={label}
            checked={Boolean(val(formData, key, prop.default ?? false))}
            onChange={(v) => s(key, v)}
            dirty={dirty}
            onReset={onReset}
          />
        );
      case 'integer':
      case 'number':
        return (
          <NumberField
            key={key}
            label={label}
            value={Number(val(formData, key, prop.default ?? 0))}
            onChange={(v) => s(key, v)}
            min={prop.minimum}
            max={prop.maximum}
            dirty={dirty}
            onReset={onReset}
          />
        );
      case 'string':
      default: {
        const defaultStr = String(val(formData, key, prop.default ?? ''));
        // Use textarea for long defaults or multiline content
        if (defaultStr.length > 80 || defaultStr.includes('\n')) {
          return (
            <TextAreaField
              key={key}
              label={label}
              value={defaultStr}
              onChange={(v) => s(key, v)}
              mono
              dirty={dirty}
              onReset={onReset}
            />
          );
        }
        return (
          <TextField
            key={key}
            label={label}
            value={defaultStr}
            onChange={(v) => s(key, v)}
            dirty={dirty}
            onReset={onReset}
          />
        );
      }
    }
  }

  // Collect which fields are in groups
  const groupedFieldSet = new Set(groups.flatMap(g => g.fields));
  const ungroupedFields = Object.keys(properties).filter(k => !groupedFieldSet.has(k) && isRenderable(k));

  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        {groups.map(group => {
          const validFields = group.fields.filter(f => f in properties && isRenderable(f));
          if (validFields.length === 0) return null;
          return (
            <FieldGroup key={group.id} label={group.label}>
              {validFields.map(key => renderField(key, properties[key]))}
            </FieldGroup>
          );
        })}
        {ungroupedFields.length > 0 && (
          <FieldGroup label={groups.length > 0 ? 'Other' : undefined}>
            {ungroupedFields.map(key => renderField(key, properties[key]))}
          </FieldGroup>
        )}
      </CardContent>
    </Card>
  );
}
