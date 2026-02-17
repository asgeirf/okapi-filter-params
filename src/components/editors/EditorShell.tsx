import { useState, type ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// --- Shared editor prop types ---

export interface EditorProps {
  formData: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
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
  label: string;
  children: ReactNode;
}) {
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
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  indent?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 py-1.5 ${indent ? 'ml-6' : ''}`}>
      <Switch
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <div>
        <Label className={disabled ? 'text-muted-foreground' : ''}>{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  mono?: boolean;
  indent?: boolean;
}) {
  return (
    <div className={`py-1.5 ${indent ? 'ml-6' : ''}`}>
      <Label className={disabled ? 'text-muted-foreground' : ''}>{label}</Label>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  rows?: number;
  mono?: boolean;
}) {
  return (
    <div className="py-1.5">
      <Label className={disabled ? 'text-muted-foreground' : ''}>{label}</Label>
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
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  indent?: boolean;
}) {
  return (
    <div className={`py-1.5 ${indent ? 'ml-6' : ''}`}>
      <Label className={disabled ? 'text-muted-foreground' : ''}>{label}</Label>
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
}: {
  label: string;
  value: string | number;
  options: { value: string | number; label: string }[];
  onChange: (v: string) => void;
  disabled?: boolean;
  indent?: boolean;
}) {
  return (
    <div className={`py-1.5 ${indent ? 'ml-6' : ''}`}>
      <Label className={disabled ? 'text-muted-foreground' : ''}>{label}</Label>
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
}: {
  label?: string;
  value: string | number | boolean;
  options: { value: string | number | boolean; label: string; description?: string }[];
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="py-1.5">
      {label && <Label className="mb-1">{label}</Label>}
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
}: {
  formData: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
  useCodeFinderKey: string;
  codeFinderKey: string;
}) {
  const enabled = val(formData, useCodeFinderKey, false);
  const rules = val(formData, codeFinderKey, '');

  return (
    <div className="space-y-2">
      <BoolField
        label="Has inline codes as defined below"
        checked={enabled}
        onChange={(v) => set(formData, onChange, useCodeFinderKey, v)}
      />
      <div className={enabled ? '' : 'opacity-50 pointer-events-none'}>
        <TextAreaField
          label="Code finder rules"
          value={String(rules)}
          onChange={(v) => set(formData, onChange, codeFinderKey, v)}
          mono
          rows={5}
        />
      </div>
    </div>
  );
}
