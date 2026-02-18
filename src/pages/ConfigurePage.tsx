import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Copy, Check, RotateCcw, X, Link as LinkIcon, ChevronDown, ChevronRight } from 'lucide-react';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import type { RJSFSchema, UiSchema, FieldTemplateProps } from '@rjsf/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { OkapiVersionSelector } from '@/components/OkapiVersionSelector';
import { useOkapiVersion } from '@/components/OkapiVersionContext';
import { getFilterById, getDefaults, getSparseConfig, getFilterVersions, getConfigurations, getFilterDataForConfig, type FilterSchema, type EditorHints, type EditorHintGroup } from '@/data';
import { formatConfig, toJson, toYaml, type SerializationFormat } from '@/lib/outputFormats';
import { getEditor } from '@/components/editors';
import { getFilterDoc, getParamDoc } from '@/data/filterDocs';
import { ParamHelp } from '@/components/ui/param-help';
import { ExternalLink, AlertTriangle } from 'lucide-react';
import { CodeBlock } from '@/components/ui/code-block';
import { 
  TagListWidget, 
  EnumRadioWidget, 
  DelimiterPickerWidget, 
  CodeFinderRulesWidget, 
  FilterSelectorWidget,
  RegexBuilderWidget,
  ColumnIndexListWidget,
  CodeEditorWidget
} from '@/components/widgets';

interface FieldContext {
  defaults: Record<string, unknown>;
  formData: Record<string, unknown>;
  onResetField: (fieldName: string) => void;
  filterId: string;
}

// Custom widgets for RJSF - base widgets plus rich editors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const baseWidgets: Record<string, any> = {
  CheckboxWidget: ({ value, onChange }: { 
    value: boolean; 
    onChange: (v: boolean) => void; 
  }) => (
    <Switch checked={value || false} onChange={(e) => onChange(e.target.checked)} />
  ),
  TextWidget: ({ value, onChange, label, placeholder }: {
    value: string;
    onChange: (v: string) => void;
    label: string;
    placeholder?: string;
  }) => (
    <Input
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || label}
    />
  ),
  SelectWidget: ({ value, onChange, options }: {
    value: string;
    onChange: (v: string) => void;
    options: { enumOptions?: { value: string; label: string }[] };
  }) => (
    <Select value={value || ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select...</option>
      {options.enumOptions?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Select>
  ),
  TextareaWidget: ({ value, onChange }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <Textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
    />
  ),
  // Rich editor widgets
  tagList: TagListWidget,
  enumRadio: EnumRadioWidget,
  delimiterPicker: DelimiterPickerWidget,
  codeFinderRules: CodeFinderRulesWidget,
  filterSelector: FilterSelectorWidget,
  regexBuilder: RegexBuilderWidget,
  columnIndexList: ColumnIndexListWidget,
  codeEditor: CodeEditorWidget,
};

// Custom field template with modification indicator
function FieldTemplate<T = unknown, S extends RJSFSchema = RJSFSchema>(
  props: FieldTemplateProps<T, S, FieldContext>
) {
  const { id, children, schema, registry, rawDescription } = props;
  
  // Skip rendering wrapper for root object - just render children
  if (id === 'root') {
    return <>{children}</>;
  }
  
  const formContext = registry.formContext;
  
  const isBoolean = schema.type === 'boolean';
  // Extract field name from id (format: "root_fieldName")
  const fieldName = id.replace('root_', '');
  const schemaDesc = (schema as { description?: string }).description;
  const descriptionText = rawDescription || schemaDesc;
  const isDeprecated = (schema as { deprecated?: boolean }).deprecated;
  
  // Check if field is modified from its default value
  const currentValue = formContext?.formData?.[fieldName];
  const defaultValue = formContext?.defaults?.[fieldName];
  const hasDefault = formContext?.defaults && fieldName in formContext.defaults;
  
  let isModified = false;
  if (hasDefault) {
    // Field has a default - compare current vs default
    isModified = JSON.stringify(currentValue) !== JSON.stringify(defaultValue);
  } else {
    // Field has no default - modified if it has any non-empty value
    isModified = currentValue !== undefined && currentValue !== null && currentValue !== '';
  }

  const handleReset = () => {
    if (formContext?.onResetField) {
      formContext.onResetField(fieldName);
    }
  };

  // Look up parameter documentation from wiki
  const paramDoc = formContext?.filterId ? getParamDoc(formContext.filterId, fieldName) : undefined;

  // Label component: description as primary, fieldName as code below
  const FieldLabel = () => (
    <div className={`flex-1 ${isDeprecated ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-1">
        <Label htmlFor={id} className={isDeprecated ? 'line-through' : ''}>
          {descriptionText || fieldName}
          {isDeprecated && <span className="ml-2 text-xs text-destructive">(deprecated)</span>}
        </Label>
        {paramDoc && <ParamHelp doc={paramDoc} />}
      </div>
      {descriptionText && (
        <code className="block text-xs text-muted-foreground mt-0.5 font-mono">{fieldName}</code>
      )}
    </div>
  );

  // Reset button - always takes space, invisible when not modified
  const ResetButton = () => (
    <button
      type="button"
      onClick={handleReset}
      className={`p-0.5 rounded ${isModified ? 'text-amber-600 hover:text-amber-800 hover:bg-amber-100' : 'invisible'}`}
      title="Reset to default"
    >
      <X className="h-3 w-3" />
    </button>
  );

  // Indicator dot - always takes space, invisible when not modified
  const ModifiedDot = () => (
    <span 
      className={`w-2 h-2 rounded-full flex-shrink-0 ${isModified ? 'bg-amber-500' : 'invisible'}`} 
      title={isModified ? "Modified" : undefined} 
    />
  );
  
  if (isBoolean) {
    return (
      <div className={`border-b py-2 ${isModified ? 'bg-amber-50 -mx-2 px-2 rounded' : ''}`}>
        <div className="flex items-center gap-2">
          <ResetButton />
          <FieldLabel />
          {children}
          <ModifiedDot />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 py-3 border-b ${isModified ? 'bg-amber-50 -mx-2 px-2 rounded' : ''}`}>
      <div className="flex items-center gap-2">
        <ResetButton />
        <FieldLabel />
        <ModifiedDot />
      </div>
      {children}
    </div>
  );
}

function ObjectFieldTemplate({ properties }: { properties: { content: React.ReactNode }[] }) {
  return <div className="space-y-1">{properties.map((p) => p.content)}</div>;
}

// Suppress the root title
function TitleFieldTemplate() {
  return null;
}

// Suppress the root description
function DescriptionFieldTemplate() {
  return null;
}

// Widgets registered in RJSF that can be referenced by x-widget
const knownWidgets = new Set([
  'tagList', 'enumRadio', 'delimiterPicker', 'codeFinderRules',
  'filterSelector', 'regexBuilder', 'columnIndexList', 'codeEditor',
]);

// Recursively rewrite $ref paths from $defs to definitions for RJSF compatibility
function rewriteRefs(obj: unknown): unknown {
  if (obj == null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(rewriteRefs);
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (k === '$ref' && typeof v === 'string') {
      result[k] = v.replace('#/$defs/', '#/definitions/');
    } else {
      result[k] = rewriteRefs(v);
    }
  }
  return result;
}

// Generate UI schema from composite schema x-extensions and editorHints
function generateUiSchema(schema: FilterSchema, editorHints: EditorHints | null): UiSchema {
  const uiSchema: UiSchema = {
    'ui:title': ' ',
    'ui:description': ' ',
  };
  
  // Apply editor hints widgets (extracted from x-widget in composite schemas)
  if (editorHints?.fields) {
    for (const [key, hint] of Object.entries(editorHints.fields)) {
      if (hint.widget && knownWidgets.has(hint.widget)) {
        uiSchema[key] = {
          'ui:widget': hint.widget,
          'ui:options': hint,
        };
      }
    }
  }
  
  // Apply fallback rules for fields not covered by hints
  for (const [key, prop] of Object.entries(schema.properties)) {
    if (!uiSchema[key]) {
      // Check x-widget directly on the schema property
      const xWidget = (prop as Record<string, unknown>)['x-widget'] as string | undefined;
      if (xWidget && knownWidgets.has(xWidget)) {
        const options: Record<string, unknown> = {};
        const xPresets = (prop as Record<string, unknown>)['x-presets'];
        const xPlaceholder = (prop as Record<string, unknown>)['x-placeholder'];
        if (xPresets) options.presets = xPresets;
        if (xPlaceholder) options.placeholder = xPlaceholder;
        if (prop.description) options.description = prop.description;
        uiSchema[key] = {
          'ui:widget': xWidget,
          'ui:options': options,
        };
      } else if (prop.type === 'string' && (
        key.toLowerCase().includes('rules') ||
        key.toLowerCase().includes('pattern') ||
        (prop.default && typeof prop.default === 'string' && (prop.default as string).length > 50)
      )) {
        uiSchema[key] = { 'ui:widget': 'textarea' };
      }
    }
  }
  return uiSchema;
}


export function ConfigurePage() {
  const { filterId } = useParams<{ filterId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { okapiVersion } = useOkapiVersion();
  const filter = useMemo(() => getFilterById(filterId || '', okapiVersion), [filterId, okapiVersion]);
  const filterVersions = useMemo(() => getFilterVersions(filterId || ''), [filterId]);
  const configurations = useMemo(() => getConfigurations(filterId || '', okapiVersion), [filterId, okapiVersion]);
  const filterDoc = useMemo(() => getFilterDoc(filterId || ''), [filterId]);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<'form' | 'editor'>(() => {
    const viewParam = searchParams.get('view');
    return viewParam === 'form' ? 'form' : 'editor';
  });

  // Resolve the active filter data based on selected configuration's schemaRef
  const activeFilter = useMemo(() => {
    if (selectedConfigId && configurations.length > 0) {
      const cfg = configurations.find(c => c.configId === selectedConfigId);
      if (cfg?.schemaRef) {
        return getFilterDataForConfig(filterId || '', cfg, okapiVersion) ?? filter;
      }
    }
    return filter;
  }, [filter, selectedConfigId, configurations, filterId, okapiVersion]);

  const schemaDefaults = useMemo(() => 
    activeFilter ? getDefaults(activeFilter.schema) : {}, 
    [activeFilter]
  );

  // When a preset is loaded, its values become the baseline for modification detection.
  const [presetBaseline, setPresetBaseline] = useState<Record<string, unknown> | null>(null);
  const defaults = presetBaseline ?? schemaDefaults;
  
  // Initialize formData from URL params or defaults
  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const configParam = searchParams.get('config');
    if (configParam) {
      try {
        const decoded = JSON.parse(atob(configParam));
        return { ...defaults, ...decoded };
      } catch {
        // Invalid config param, use defaults
      }
    }
    return defaults;
  });

  // Reset formData when the base filter changes (i.e. filterId or okapiVersion),
  // but NOT when defaults change due to preset/schemaRef selection.
  useEffect(() => {
    setSelectedConfigId(null);
    setPresetBaseline(null);
    const presetParam = searchParams.get('preset');
    const configParam = searchParams.get('config');
    const viewParam = searchParams.get('view');
    setEditorMode(viewParam === 'form' ? 'form' : 'editor');

    // Restore preset from URL if available
    if (presetParam && configurations.length > 0) {
      const preset = configurations.find(c => c.configId === presetParam);
      if (preset) {
        setSelectedConfigId(presetParam);
        let targetDefaults = filter ? getDefaults(filter.schema) : {};
        if (preset.schemaRef) {
          const targetFilter = getFilterDataForConfig(filterId || '', preset, okapiVersion);
          if (targetFilter) {
            targetDefaults = getDefaults(targetFilter.schema);
          }
        }
        const merged = { ...targetDefaults };
        if (preset.parameters) {
          for (const [key, value] of Object.entries(preset.parameters)) {
            merged[key] = value;
          }
        }
        // Apply any additional config overrides on top of preset
        if (configParam) {
          try {
            const decoded = JSON.parse(atob(configParam));
            Object.assign(merged, decoded);
          } catch { /* ignore */ }
        }
        setPresetBaseline({ ...targetDefaults, ...(preset.parameters || {}) });
        setFormData(merged);
        return;
      }
    }

    if (configParam) {
      try {
        const decoded = JSON.parse(atob(configParam));
        const baseDefaults = filter ? getDefaults(filter.schema) : {};
        setFormData({ ...baseDefaults, ...decoded });
      } catch {
        setFormData(filter ? getDefaults(filter.schema) : {});
      }
    } else {
      setFormData(filter ? getDefaults(filter.schema) : {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterId, okapiVersion]);

  // Output shows diff from schema defaults (so preset values appear in output)
  const sparseConfig = useMemo(() => 
    getSparseConfig(formData, schemaDefaults), 
    [formData, schemaDefaults]
  );

  // Determine the native serialization format from the schema's x-filter metadata
  const activeSchema = (activeFilter ?? filter)?.schema;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializationFormat: SerializationFormat = 
    (activeSchema as any)?.['x-filter']?.serializationFormat === 'yaml'
      ? 'yaml' : 'stringParameters';

  // Keys the user has changed relative to the effective baseline (preset or schema defaults)
  const dirtyKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const key of Object.keys(sparseConfig)) {
      if (JSON.stringify(formData[key]) !== JSON.stringify(defaults[key])) {
        keys.add(key);
      }
    }
    return keys;
  }, [sparseConfig, formData, defaults]);

  // Always show native .fprm format in the output panel
  const configOutputText = useMemo(() => 
    formatConfig(sparseConfig, 'fprm', serializationFormat), 
    [sparseConfig, serializationFormat]
  );

  const handleCopyAs = useCallback((format: string) => {
    let text: string;
    switch (format) {
      case 'json': text = toJson(sparseConfig); break;
      case 'yaml': text = toYaml(sparseConfig); break;
      default: text = formatConfig(sparseConfig, 'fprm', serializationFormat); break;
    }
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  }, [sparseConfig, serializationFormat]);

  const handleCopyLink = useCallback(() => {
    const hasConfig = Object.keys(sparseConfig).length > 0;
    const base = window.location.origin + window.location.pathname + window.location.hash.split('?')[0];
    const params = new URLSearchParams();
    params.set('okapi', okapiVersion);
    if (selectedConfigId) params.set('preset', selectedConfigId);
    if (editorMode === 'form') params.set('view', 'form');
    if (hasConfig) params.set('config', btoa(JSON.stringify(sparseConfig)));
    navigator.clipboard.writeText(`${base}?${params.toString()}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, [sparseConfig, okapiVersion, selectedConfigId, editorMode]);

  const handleSetEditorMode = useCallback((mode: 'form' | 'editor') => {
    setEditorMode(mode);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (mode === 'form') {
        next.set('view', 'form');
      } else {
        next.delete('view');
      }
      return next;
    });
  }, [setSearchParams]);

  const handleReset = useCallback(() => {
    setPresetBaseline(null);
    setSelectedConfigId(null);
    setFormData(schemaDefaults);
    setSearchParams({});
  }, [schemaDefaults, setSearchParams]);

  const handleLoadPreset = useCallback((configId: string) => {
    setSelectedConfigId(configId);
    const preset = configurations.find(c => c.configId === configId);
    if (!preset) return;

    // If this config has a schemaRef, the schema/defaults will change via activeFilter.
    // We need to compute new defaults for the target schema.
    let targetDefaults = schemaDefaults;
    if (preset.schemaRef) {
      const targetFilter = getFilterDataForConfig(filterId || '', preset, okapiVersion);
      if (targetFilter) {
        targetDefaults = getDefaults(targetFilter.schema);
      }
    }

    const merged = { ...targetDefaults };
    if (preset.parameters) {
      for (const [key, value] of Object.entries(preset.parameters)) {
        merged[key] = value;
      }
    }
    // Preset values become the new baseline — nothing shows as modified
    setPresetBaseline(merged);
    setFormData(merged);
    // Persist preset in URL
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('preset', configId);
      next.delete('config');
      return next;
    });
  }, [configurations, schemaDefaults, filterId, okapiVersion, setSearchParams]);

  const handleResetField = useCallback((fieldName: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: defaults[fieldName],
    }));
  }, [defaults]);

  const formContext: FieldContext = useMemo(() => ({
    defaults,
    formData,
    onResetField: handleResetField,
    filterId: filterId || '',
  }), [defaults, formData, handleResetField, filterId]);

  const uiSchema = useMemo(() => 
    activeFilter ? generateUiSchema(activeFilter.schema, activeFilter.editorHints) : {}, 
    [activeFilter]
  );

  if (!filter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Filter Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The filter "{filterId}" was not found.
            </p>
            <Link to="/">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to filters
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { meta } = filter;
  const { schema: rawSchema, editorHints } = activeFilter ?? filter;
  const groups = editorHints?.groups;

  // RJSF uses draft-07 "definitions", not draft 2019-09+ "$defs"
  const schema = useMemo(() => {
    const s = rawSchema as unknown as Record<string, unknown>;
    if (!s['$defs']) return rawSchema;
    const { '$defs': defs, properties: props, ...rest } = s;
    const rewrittenDefs = rewriteRefs(defs);
    const rewrittenProps: Record<string, unknown> = {};
    if (props && typeof props === 'object') {
      for (const [k, v] of Object.entries(props as Record<string, unknown>)) {
        const rewritten = rewriteRefs(v) as Record<string, unknown>;
        // RJSF requires `items` on array types — add a string fallback if missing
        if (rewritten && rewritten.type === 'array' && !rewritten.items) {
          rewritten.items = { type: 'string' };
        }
        rewrittenProps[k] = rewritten;
      }
    }
    return { ...rest, definitions: rewrittenDefs, properties: rewrittenProps } as unknown as typeof rawSchema;
  }, [rawSchema]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">{meta.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-muted-foreground font-mono">{meta.id}</span>
                {filterVersions.length > 1 && (
                  <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono">
                    schema v{meta.schemaVersion}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <OkapiVersionSelector />
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              {linkCopied ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </header>

      {/* Filter overview and limitations from wiki docs */}
      {filterDoc && (filterDoc.overview || (filterDoc.limitations && filterDoc.limitations.length > 0)) && (
        <div className="container mx-auto px-4 pt-4 space-y-3">
          {filterDoc.overview && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {filterDoc.overview}
              {filterDoc.wikiUrl && (
                <a
                  href={filterDoc.wikiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 ml-2 text-primary hover:underline"
                >
                  Wiki <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </p>
          )}
          {filterDoc.limitations && filterDoc.limitations.length > 0 && (
            <div className="flex items-start gap-2 text-sm bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-amber-800">
                {filterDoc.limitations.map((lim, i) => (
                  <p key={i}>{lim}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form Panel */}
          <div className="space-y-4">
            {/* Configuration Presets */}
            {configurations.length > 1 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Configuration Presets</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Load a preset configuration from this filter
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {configurations.map(cfg => (
                      <Button
                        key={cfg.configId}
                        variant={selectedConfigId === cfg.configId ? 'default' : 'outline'}
                        size="sm"
                        className={selectedConfigId === cfg.configId ? 'bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-blue-300' : ''}
                        onClick={() => handleLoadPreset(cfg.configId)}
                        title={cfg.description || cfg.name}
                      >
                        {cfg.name}
                        {cfg.isDefault && (
                          <span className="ml-1 text-xs text-muted-foreground">(default)</span>
                        )}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Editor mode toggle */}
            {(() => {
              // Determine the effective filter ID for editor lookup
              const effectiveFilterId = selectedConfigId
                ? (configurations.find(c => c.configId === selectedConfigId)?.schemaRef || filterId || '')
                : (filterId || '');
              const EditorComponent = getEditor(effectiveFilterId, schema as unknown as Record<string, unknown>);
              const editorAvailable = !!EditorComponent;

              return (
                <>
                  {editorAvailable && (
                    <div className="flex items-center justify-end gap-2">
                      <div className="flex rounded-md border">
                        <button
                          type="button"
                          onClick={() => handleSetEditorMode('editor')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-l-md transition-colors ${
                            editorMode === 'editor'
                              ? 'bg-blue-600 text-white'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                        >
                          Rainbow UI
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetEditorMode('form')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-r-md transition-colors ${
                            editorMode === 'form'
                              ? 'bg-blue-600 text-white'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                        >
                          Dynamic Form
                        </button>
                      </div>
                    </div>
                  )}

                  {editorAvailable && editorMode === 'editor' ? (
                    <EditorComponent formData={formData} onChange={setFormData} defaults={defaults} schema={schema as unknown as Record<string, unknown>} filterId={filterId || ''} />
                  ) : Object.keys(schema.properties).length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-muted-foreground text-center">
                    This filter has no configurable parameters.
                  </p>
                </CardContent>
              </Card>
            ) : groups && groups.length > 0 ? (
              <GroupedForm
                schema={schema}
                groups={groups}
                uiSchema={uiSchema}
                formData={formData}
                formContext={formContext}
                onFormData={setFormData}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Parameters</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Configure filter parameters. Only non-default values will be saved.
                  </p>
                </CardHeader>
                <CardContent>
                  <Form
                    schema={schema as RJSFSchema}
                    uiSchema={uiSchema}
                    formData={formData}
                    formContext={formContext}
                    validator={validator}
                    onChange={(e) => setFormData(e.formData || {})}
                    widgets={baseWidgets}
                    templates={{
                      FieldTemplate,
                      ObjectFieldTemplate,
                      TitleFieldTemplate,
                      DescriptionFieldTemplate,
                    }}
                    liveValidate
                  >
                    <div />
                  </Form>
                </CardContent>
              </Card>
            )}
                </>
              );
            })()}
          </div>

          {/* Output Panel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Configuration Output</CardTitle>
                  <div className="flex gap-1">
                    {[
                      { key: 'fprm', label: serializationFormat === 'yaml' ? '.fprm' : '.fprm' },
                      { key: 'json', label: 'JSON' },
                      { key: 'yaml', label: 'YAML' },
                    ].map(fmt => (
                      <Button
                        key={fmt.key}
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyAs(fmt.key)}
                        className="text-xs"
                      >
                        {copiedFormat === fmt.key ? (
                          <>
                            <Check className="mr-1 h-3 w-3 text-green-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-3 w-3" />
                            {fmt.label}
                          </>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {Object.keys(sparseConfig).length === 0
                    ? 'Using all default values'
                    : `${Object.keys(sparseConfig).length} parameter${Object.keys(sparseConfig).length !== 1 ? 's' : ''} overridden`}
                  {serializationFormat === 'yaml' && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">YAML format</span>
                  )}
                </p>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  code={configOutputText}
                  language={serializationFormat === 'yaml' ? 'yaml' : 'fprm'}
                  dirtyKeys={dirtyKeys}
                />
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Filter Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {meta.mimeType && (
                  <div>
                    <span className="text-muted-foreground">MIME Type:</span>{' '}
                    <code className="bg-muted px-1 rounded">{meta.mimeType}</code>
                  </div>
                )}
                {meta.extensions.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Extensions:</span>{' '}
                    {meta.extensions.map((ext) => (
                      <code key={ext} className="bg-muted px-1 rounded mr-1">
                        {ext}
                      </code>
                    ))}
                  </div>
                )}
                {meta.class && (
                  <div>
                    <span className="text-muted-foreground">Class:</span>{' '}
                    <code className="bg-muted px-1 rounded text-xs">{meta.class}</code>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Okapi Version:</span>{' '}
                  <code className="bg-muted px-1 rounded">{okapiVersion}</code>
                </div>
                {filterVersions.length > 1 && (
                  <div>
                    <span className="text-muted-foreground">Schema Versions:</span>{' '}
                    {filterVersions.map(v => (
                      <span key={v.version} className={`inline-block mr-1 px-1.5 py-0.5 rounded text-xs font-mono ${
                        v.version === meta.schemaVersion
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        v{v.version}
                        <span className="text-[10px] ml-1 opacity-70">({v.introducedInOkapi})</span>
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

/** Renders form fields organized into collapsible groups */
function GroupedForm({
  schema,
  groups,
  uiSchema,
  formData,
  formContext,
  onFormData,
}: {
  schema: FilterSchema;
  groups: EditorHintGroup[];
  uiSchema: UiSchema;
  formData: Record<string, unknown>;
  formContext: FieldContext;
  onFormData: (data: Record<string, unknown>) => void;
}) {
  // Track which groups are collapsed
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => {
    const collapsed = new Set<string>();
    groups.forEach(g => { if (g.collapsed) collapsed.add(g.id); });
    return collapsed;
  });

  const toggleGroup = useCallback((groupId: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  // Collect fields that are in groups
  const groupedFields = new Set<string>();
  groups.forEach(g => g.fields.forEach(f => groupedFields.add(f)));

  // Fields not in any group
  const ungroupedFields = Object.keys(schema.properties).filter(f => !groupedFields.has(f));

  const renderGroupSchema = (fields: string[]): RJSFSchema => {
    const props: Record<string, unknown> = {};
    for (const field of fields) {
      if (schema.properties[field]) {
        props[field] = schema.properties[field];
      }
    }
    const sub: Record<string, unknown> = {
      type: 'object',
      properties: props as RJSFSchema['properties'],
    };
    // Carry definitions so $ref can resolve
    const defs = (schema as unknown as Record<string, unknown>)['definitions'];
    if (defs) sub.definitions = defs;
    return sub as RJSFSchema;
  };

  const renderGroupUiSchema = (fields: string[]): UiSchema => {
    const ui: UiSchema = {
      'ui:title': ' ',
      'ui:description': ' ',
      'ui:order': fields.filter(f => schema.properties[f]),
    };
    for (const field of fields) {
      if (uiSchema[field]) {
        ui[field] = uiSchema[field];
      }
    }
    return ui;
  };

  return (
    <>
      {groups.map(group => {
        const validFields = group.fields.filter(f => schema.properties[f]);
        if (validFields.length === 0) return null;
        const isCollapsed = collapsedGroups.has(group.id);

        return (
          <Card key={group.id}>
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => toggleGroup(group.id)}
            >
              <div className="flex items-center gap-2">
                {isCollapsed
                  ? <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                }
                <CardTitle className="text-lg">{group.label}</CardTitle>
              </div>
              {group.description && (
                <p className="text-sm text-muted-foreground ml-6">{group.description}</p>
              )}
            </CardHeader>
            {!isCollapsed && (
              <CardContent>
                <Form
                  schema={renderGroupSchema(validFields)}
                  uiSchema={renderGroupUiSchema(validFields)}
                  formData={formData}
                  formContext={formContext}
                  validator={validator}
                  onChange={(e) => onFormData({ ...formData, ...e.formData })}
                  widgets={baseWidgets}
                  templates={{
                    FieldTemplate,
                    ObjectFieldTemplate,
                    TitleFieldTemplate,
                    DescriptionFieldTemplate,
                  }}
                  liveValidate
                >
                  <div />
                </Form>
              </CardContent>
            )}
          </Card>
        );
      })}

      {ungroupedFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Other Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Form
              schema={renderGroupSchema(ungroupedFields)}
              uiSchema={renderGroupUiSchema(ungroupedFields)}
              formData={formData}
              formContext={formContext}
              validator={validator}
              onChange={(e) => onFormData({ ...formData, ...e.formData })}
              widgets={baseWidgets}
              templates={{
                FieldTemplate,
                ObjectFieldTemplate,
                TitleFieldTemplate,
                DescriptionFieldTemplate,
              }}
              liveValidate
            >
              <div />
            </Form>
          </CardContent>
        </Card>
      )}
    </>
  );
}
