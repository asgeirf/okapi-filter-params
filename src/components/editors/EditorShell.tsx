import { useState, type ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

// --- Shared editor prop types ---

export interface EditorProps {
  formData: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  defaults?: Record<string, unknown>;
  schema?: Record<string, unknown>;
}

// Check if a field value differs from its default
export function isDirty(formData: Record<string, unknown>, defaults: Record<string, unknown> | undefined, key: string): boolean {
  if (!defaults) return false;
  return JSON.stringify(formData[key]) !== JSON.stringify(defaults[key]);
}

// Reset button — always takes space, invisible when not dirty (no layout shift)
function FieldResetButton({ dirty, onReset }: { dirty?: boolean; onReset?: () => void }) {
  return (
    <button
      type="button"
      onClick={onReset}
      className={`p-0.5 rounded flex-shrink-0 ${dirty && onReset ? 'text-amber-600 hover:text-amber-800 hover:bg-amber-100' : 'invisible'}`}
      title="Reset to default"
    >
      <X className="h-3 w-3" />
    </button>
  );
}

// Dirty indicator dot (right side of field)
function DirtyDot({ dirty }: { dirty?: boolean }) {
  return (
    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dirty ? 'bg-amber-500' : 'invisible'}`} title={dirty ? 'Modified' : undefined} />
  );
}

// --- Tab panel ---

export interface TabDef {
  id: string;
  label: string;
  content: ReactNode;
}

export function TabPanel({ tabs }: { tabs: TabDef[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);
  const active = tabs.find(t => t.id === activeTab) ?? tabs[0];
  if (!active) return null;

  return (
    <Card>
      <div className="flex bg-gray-50 border-b border-gray-200">
        {tabs.map(tab => {
          const isActive = tab.id === active.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={
                isActive
                  ? 'px-4 py-2.5 text-sm font-semibold text-gray-900 bg-white border-b-2 border-blue-600 -mb-px rounded-t-md'
                  : 'px-4 py-2.5 text-sm font-normal text-gray-500 bg-transparent border-b-2 border-transparent -mb-px hover:text-gray-700'
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <CardContent className="pt-4">{active.content}</CardContent>
    </Card>
  );
}

// --- Field group (bordered section with title) ---

export function FieldGroup({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  if (!label) {
    return <div className="space-y-1">{children}</div>;
  }
  return (
    <fieldset className="border rounded-md p-3 mt-3">
      <legend className="text-sm font-medium px-1">{label}</legend>
      {children}
    </fieldset>
  );
}

// --- Typed field helpers ---

export function BoolField({
  label,
  description,
  checked,
  onChange,
  disabled,
  indent,
  dirty,
  onReset,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  indent?: boolean;
  dirty?: boolean;
  onReset?: () => void;
}) {
  return (
    <div className={`flex items-center gap-2 py-1.5 ${indent ? 'ml-6' : ''} ${dirty ? 'bg-amber-50 -mx-2 px-2 rounded ring-1 ring-amber-200' : ''}`}>
      <FieldResetButton dirty={dirty} onReset={onReset} />
      <Switch
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <div className="flex-1">
        <Label className={disabled ? 'text-muted-foreground' : ''}>{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <DirtyDot dirty={dirty} />
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  mono,
  indent,
  dirty,
  onReset,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  mono?: boolean;
  indent?: boolean;
  dirty?: boolean;
  onReset?: () => void;
}) {
  return (
    <div className={`py-1.5 ${indent ? 'ml-6' : ''} ${dirty ? 'bg-amber-50 -mx-2 px-2 rounded ring-1 ring-amber-200' : ''}`}>
      <div className="flex items-center gap-1">
        <FieldResetButton dirty={dirty} onReset={onReset} />
        <Label className={`flex-1 ${disabled ? 'text-muted-foreground' : ''}`}>{label}</Label>
        <DirtyDot dirty={dirty} />
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={mono ? 'font-mono text-sm' : ''}
      />
    </div>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  disabled,
  rows,
  mono,
  dirty,
  onReset,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  rows?: number;
  mono?: boolean;
  dirty?: boolean;
  onReset?: () => void;
}) {
  return (
    <div className={`py-1.5 ${dirty ? 'bg-amber-50 -mx-2 px-2 rounded ring-1 ring-amber-200' : ''}`}>
      <div className="flex items-center gap-1">
        <FieldResetButton dirty={dirty} onReset={onReset} />
        <Label className={`flex-1 ${disabled ? 'text-muted-foreground' : ''}`}>{label}</Label>
        <DirtyDot dirty={dirty} />
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={rows ?? 3}
        className={mono ? 'font-mono text-sm' : ''}
      />
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  disabled,
  min,
  max,
  indent,
  dirty,
  onReset,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  indent?: boolean;
  dirty?: boolean;
  onReset?: () => void;
}) {
  return (
    <div className={`py-1.5 ${indent ? 'ml-6' : ''} ${dirty ? 'bg-amber-50 -mx-2 px-2 rounded ring-1 ring-amber-200' : ''}`}>
      <div className="flex items-center gap-1">
        <FieldResetButton dirty={dirty} onReset={onReset} />
        <Label className={`flex-1 ${disabled ? 'text-muted-foreground' : ''}`}>{label}</Label>
        <DirtyDot dirty={dirty} />
      </div>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        min={min}
        max={max}
        className="w-32"
      />
    </div>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  disabled,
  indent,
  dirty,
  onReset,
}: {
  label: string;
  value: string | number;
  options: { value: string | number; label: string }[];
  onChange: (v: string) => void;
  disabled?: boolean;
  indent?: boolean;
  dirty?: boolean;
  onReset?: () => void;
}) {
  return (
    <div className={`py-1.5 ${indent ? 'ml-6' : ''} ${dirty ? 'bg-amber-50 -mx-2 px-2 rounded ring-1 ring-amber-200' : ''}`}>
      <div className="flex items-center gap-1">
        <FieldResetButton dirty={dirty} onReset={onReset} />
        <Label className={`flex-1 ${disabled ? 'text-muted-foreground' : ''}`}>{label}</Label>
        <DirtyDot dirty={dirty} />
      </div>
      <Select
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </Select>
    </div>
  );
}

export function RadioGroup({
  label,
  value,
  options,
  onChange,
  disabled,
  dirty,
  onReset,
}: {
  label?: string;
  value: string | number | boolean;
  options: { value: string | number | boolean; label: string; description?: string }[];
  onChange: (v: string) => void;
  disabled?: boolean;
  dirty?: boolean;
  onReset?: () => void;
}) {
  return (
    <div className={`py-1.5 ${dirty ? 'bg-amber-50 -mx-2 px-2 rounded ring-1 ring-amber-200' : ''}`}>
      {label && (
        <div className="flex items-center gap-1 mb-1">
          <FieldResetButton dirty={dirty} onReset={onReset} />
          <Label className="flex-1">{label}</Label>
          <DirtyDot dirty={dirty} />
        </div>
      )}
      <div className="space-y-1">
        {options.map(opt => (
          <label key={String(opt.value)} className={`flex items-start gap-2 cursor-pointer ${disabled ? 'opacity-50' : ''}`}>
            <input
              type="radio"
              checked={String(value) === String(opt.value)}
              onChange={() => onChange(String(opt.value))}
              disabled={disabled}
              className="mt-1"
            />
            <div>
              <span className="text-sm">{opt.label}</span>
              {opt.description && (
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

// Helper to get typed values from formData
export function val<T>(formData: Record<string, unknown>, key: string, fallback: T): T {
  const v = formData[key];
  if (v === undefined || v === null) return fallback;
  return v as T;
}

// Helper to set a single field
export function set(
  formData: Record<string, unknown>,
  onChange: (d: Record<string, unknown>) => void,
  key: string,
  value: unknown
) {
  onChange({ ...formData, ...{ [key]: value } });
}

// Code finder section — wraps the existing widget pattern inline
export function CodeFinderSection({
  formData,
  onChange,
  useCodeFinderKey,
  codeFinderKey,
  defaults,
}: {
  formData: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
  useCodeFinderKey: string;
  codeFinderKey: string;
  defaults?: Record<string, unknown>;
}) {
  const enabled = val(formData, useCodeFinderKey, false);
  const rules = val(formData, codeFinderKey, '');

  return (
    <div className="space-y-2">
      <BoolField
        label="Has inline codes as defined below"
        checked={enabled}
        onChange={(v) => set(formData, onChange, useCodeFinderKey, v)}
        dirty={isDirty(formData, defaults, useCodeFinderKey)}
        onReset={() => { if (defaults && useCodeFinderKey in defaults) set(formData, onChange, useCodeFinderKey, defaults[useCodeFinderKey]); }}
      />
      <div className={enabled ? '' : 'opacity-50 pointer-events-none'}>
        <TextAreaField
          label="Code finder rules"
          value={String(rules)}
          onChange={(v) => set(formData, onChange, codeFinderKey, v)}
          mono
          rows={5}
          dirty={isDirty(formData, defaults, codeFinderKey)}
          onReset={() => { if (defaults && codeFinderKey in defaults) set(formData, onChange, codeFinderKey, defaults[codeFinderKey]); }}
        />
      </div>
    </div>
  );
}
