import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Copy, Check, RotateCcw, X, Link as LinkIcon } from 'lucide-react';
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
import { getFilterById, getDefaults, getSparseConfig, type FilterSchema, type EditorHints } from '@/data';
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

  // Label component: description as primary, fieldName as code below
  const FieldLabel = () => (
    <div className={`flex-1 ${isDeprecated ? 'opacity-50' : ''}`}>
      <Label htmlFor={id} className={isDeprecated ? 'line-through' : ''}>
        {descriptionText || fieldName}
        {isDeprecated && <span className="ml-2 text-xs text-destructive">(deprecated)</span>}
      </Label>
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

// Generate UI schema to handle long text fields and apply editorHints widgets
function generateUiSchema(schema: FilterSchema, editorHints: EditorHints | null): UiSchema {
  const uiSchema: UiSchema = {
    'ui:title': ' ',  // Hide root title
    'ui:description': ' ',  // Hide root description
  };
  
  // Apply editor hints widgets first (they take priority)
  if (editorHints?.fields) {
    for (const [key, hint] of Object.entries(editorHints.fields)) {
      if (hint.widget) {
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
      if (prop.type === 'string' && (
        key.toLowerCase().includes('rules') ||
        key.toLowerCase().includes('pattern') ||
        (prop.default && typeof prop.default === 'string' && prop.default.length > 50)
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
  const filter = useMemo(() => getFilterById(filterId || ''), [filterId]);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const defaults = useMemo(() => 
    filter ? getDefaults(filter.schema) : {}, 
    [filter]
  );
  
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

  // Update formData when defaults change (e.g., filter switch)
  useEffect(() => {
    const configParam = searchParams.get('config');
    if (configParam) {
      try {
        const decoded = JSON.parse(atob(configParam));
        setFormData({ ...defaults, ...decoded });
      } catch {
        setFormData(defaults);
      }
    } else {
      setFormData(defaults);
    }
  }, [defaults, searchParams]);

  const sparseConfig = useMemo(() => 
    getSparseConfig(formData, defaults), 
    [formData, defaults]
  );

  const configOutput = useMemo(() => sparseConfig, [sparseConfig]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(configOutput, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [configOutput]);

  const handleCopyLink = useCallback(() => {
    const hasConfig = Object.keys(sparseConfig).length > 0;
    // Use hash-based URL for GitHub Pages compatibility
    const base = window.location.origin + window.location.pathname + window.location.hash.split('?')[0];
    const url = hasConfig 
      ? `${base}?config=${btoa(JSON.stringify(sparseConfig))}`
      : base;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, [sparseConfig]);

  const handleReset = useCallback(() => {
    setFormData(defaults);
    // Clear URL params when resetting
    setSearchParams({});
  }, [defaults, setSearchParams]);

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
  }), [defaults, formData, handleResetField]);

  const uiSchema = useMemo(() => 
    filter ? generateUiSchema(filter.schema, filter.editorHints) : {}, 
    [filter]
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

  const { meta, schema } = filter;

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
              <p className="text-sm text-muted-foreground font-mono">{meta.id}</p>
            </div>
          </div>
          <div className="flex gap-2">
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

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Parameters</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure filter parameters. Only non-default values will be saved.
              </p>
            </CardHeader>
            <CardContent>
              {Object.keys(schema.properties).length === 0 ? (
                <p className="text-muted-foreground py-4">
                  This filter has no configurable parameters.
                </p>
              ) : (
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
                  <div /> {/* Hide submit button */}
                </Form>
              )}
            </CardContent>
          </Card>

          {/* JSON Preview Panel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Configuration Output</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {Object.keys(sparseConfig).length === 0
                    ? 'Using all default values'
                    : `${Object.keys(sparseConfig).length} parameter${Object.keys(sparseConfig).length !== 1 ? 's' : ''} overridden`}
                </p>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-96 font-mono">
                  {JSON.stringify(configOutput, null, 2)}
                </pre>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Filter Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">MIME Type:</span>{' '}
                  <code className="bg-muted px-1 rounded">{meta.mimeType}</code>
                </div>
                <div>
                  <span className="text-muted-foreground">Extensions:</span>{' '}
                  {meta.extensions.map((ext) => (
                    <code key={ext} className="bg-muted px-1 rounded mr-1">
                      {ext}
                    </code>
                  ))}
                </div>
                <div>
                  <span className="text-muted-foreground">Class:</span>{' '}
                  <code className="bg-muted px-1 rounded text-xs">{meta.class}</code>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
