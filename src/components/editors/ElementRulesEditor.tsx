import { useState } from 'react';
import { val, set, isDirty, FieldResetButton, DirtyDot } from './EditorShell';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';

// Rule type options for elements
const ELEMENT_RULE_TYPES = [
  'INLINE', 'TEXTUNIT', 'EXCLUDE', 'INCLUDE', 'GROUP',
  'ATTRIBUTES_ONLY', 'PRESERVE_WHITESPACE', 'SCRIPT', 'SERVER',
  'INLINE_EXCLUDED', 'INLINE_INCLUDED',
] as const;

interface ElementRule {
  ruleTypes: string[];
  elementType?: string;
  translatableAttributes?: string[] | Record<string, unknown>;
  writableLocalizableAttributes?: string[] | Record<string, unknown>;
  readOnlyLocalizableAttributes?: string[] | Record<string, unknown>;
  idAttributes?: string[];
  conditions?: unknown[];
}

interface Props {
  formData: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  defaults?: Record<string, unknown>;
  fieldKey: string;
}

function isSimpleArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every(i => typeof i === 'string');
}

function formatAttrs(v: unknown): string {
  if (!v) return '';
  if (isSimpleArray(v)) return v.join(', ');
  if (typeof v === 'object') return Object.keys(v as object).join(', ') + ' (conditional)';
  return String(v);
}

function ruleTypeBadgeColor(rt: string): string {
  switch (rt) {
    case 'INLINE': return 'bg-blue-100 text-blue-800';
    case 'TEXTUNIT': return 'bg-green-100 text-green-800';
    case 'EXCLUDE': return 'bg-red-100 text-red-800';
    case 'INCLUDE': return 'bg-emerald-100 text-emerald-800';
    case 'GROUP': return 'bg-purple-100 text-purple-800';
    case 'ATTRIBUTES_ONLY': return 'bg-amber-100 text-amber-800';
    case 'PRESERVE_WHITESPACE': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-700';
  }
}

export function ElementRulesEditor({ formData, onChange, defaults, fieldKey }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [newElementName, setNewElementName] = useState('');

  const elements = (val(formData, fieldKey, {}) as Record<string, ElementRule>) || {};
  const defaultElements = defaults ? (val(defaults, fieldKey, {}) as Record<string, ElementRule>) || {} : {};
  const dirty = isDirty(formData, defaults, fieldKey);
  const onReset = () => { if (defaults && fieldKey in defaults) set(formData, onChange, fieldKey, defaults[fieldKey]); };

  // Preserve original insertion order from the loaded preset/YAML
  const elementKeys = Object.keys(elements);

  const toggle = (key: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const updateElement = (name: string, rule: ElementRule) => {
    // Rebuild in same key order to preserve insertion order
    const updated: Record<string, ElementRule> = {};
    for (const k of Object.keys(elements)) {
      updated[k] = k === name ? rule : elements[k];
    }
    set(formData, onChange, fieldKey, updated);
  };

  const removeElement = (name: string) => {
    const updated: Record<string, ElementRule> = {};
    for (const k of Object.keys(elements)) {
      if (k !== name) updated[k] = elements[k];
    }
    set(formData, onChange, fieldKey, updated);
  };

  const addElement = () => {
    const name = newElementName.trim();
    if (!name || name in elements) return;
    const updated = { ...elements, [name]: { ruleTypes: ['TEXTUNIT'] } };
    set(formData, onChange, fieldKey, updated);
    setNewElementName('');
    setExpanded(prev => new Set(prev).add(name));
  };

  const toggleRuleType = (name: string, rt: string) => {
    const rule = elements[name] || { ruleTypes: [] };
    const types = rule.ruleTypes || [];
    const updated = types.includes(rt) ? types.filter(t => t !== rt) : [...types, rt];
    updateElement(name, { ...rule, ruleTypes: updated });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <FieldResetButton visible={dirty} onReset={onReset} />
        <span className="text-sm font-medium">Element Rules</span>
        <span className="text-xs text-muted-foreground">({elementKeys.length} elements)</span>
        <div className="flex-1" />
        <DirtyDot dirty={dirty} />
      </div>

      {/* Compact table view */}
      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-xs text-muted-foreground">
              <th className="text-left px-3 py-1.5 w-8"></th>
              <th className="text-left px-3 py-1.5">Element</th>
              <th className="text-left px-3 py-1.5">Rule Types</th>
              <th className="text-left px-3 py-1.5">Translatable Attrs</th>
              <th className="text-left px-3 py-1.5 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {elementKeys.map(name => {
              const rule = elements[name];
              const isExpanded = expanded.has(name);
              const isModified = JSON.stringify(rule) !== JSON.stringify(defaultElements[name]);
              return (
                <ElementRow
                  key={name}
                  name={name}
                  rule={rule}
                  isExpanded={isExpanded}
                  isModified={isModified}
                  onToggle={() => toggle(name)}
                  onToggleRuleType={(rt) => toggleRuleType(name, rt)}
                  onUpdate={(r) => updateElement(name, r)}
                  onRemove={() => removeElement(name)}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add element */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newElementName}
          onChange={e => setNewElementName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addElement()}
          placeholder="Add element..."
          className="flex-1 h-8 px-2 text-sm border rounded-md bg-background"
        />
        <button
          onClick={addElement}
          disabled={!newElementName.trim() || newElementName.trim() in elements}
          className="h-8 px-2 text-sm border rounded-md hover:bg-muted disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ElementRow({ name, rule, isExpanded, isModified, onToggle, onToggleRuleType, onUpdate, onRemove }: {
  name: string;
  rule: ElementRule;
  isExpanded: boolean;
  isModified: boolean;
  onToggle: () => void;
  onToggleRuleType: (rt: string) => void;
  onUpdate: (r: ElementRule) => void;
  onRemove: () => void;
}) {
  return (
    <>
      <tr
        className={`border-t cursor-pointer hover:bg-muted/30 ${isModified ? 'bg-yellow-50/50' : ''}`}
        onClick={onToggle}
      >
        <td className="px-3 py-1.5">
          {isExpanded
            ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          }
        </td>
        <td className="px-3 py-1.5 font-mono text-xs">
          {name}
          {rule.elementType && <span className="ml-1 text-muted-foreground">({rule.elementType})</span>}
        </td>
        <td className="px-3 py-1.5">
          <div className="flex flex-wrap gap-1">
            {(rule.ruleTypes || []).map(rt => (
              <span key={rt} className={`text-xs px-1.5 py-0.5 rounded ${ruleTypeBadgeColor(rt)}`}>
                {rt}
              </span>
            ))}
          </div>
        </td>
        <td className="px-3 py-1.5 text-xs text-muted-foreground truncate max-w-48">
          {formatAttrs(rule.translatableAttributes)}
        </td>
        <td className="px-3 py-1.5" onClick={e => e.stopPropagation()}>
          <button onClick={onRemove} className="text-muted-foreground hover:text-red-500">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr className="border-t bg-muted/20">
          <td colSpan={5} className="px-6 py-3">
            <ElementRuleDetail
              rule={rule}
              onToggleRuleType={onToggleRuleType}
              onUpdate={onUpdate}
            />
          </td>
        </tr>
      )}
    </>
  );
}

function ElementRuleDetail({ rule, onToggleRuleType, onUpdate }: {
  rule: ElementRule;
  onToggleRuleType: (rt: string) => void;
  onUpdate: (r: ElementRule) => void;
}) {
  return (
    <div className="space-y-3">
      {/* Rule types as toggleable badges */}
      <div>
        <div className="text-xs font-medium text-muted-foreground mb-1">Rule Types</div>
        <div className="flex flex-wrap gap-1.5">
          {ELEMENT_RULE_TYPES.map(rt => {
            const active = (rule.ruleTypes || []).includes(rt);
            return (
              <button
                key={rt}
                onClick={() => onToggleRuleType(rt)}
                className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                  active ? ruleTypeBadgeColor(rt) + ' border-current' : 'bg-background text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                {rt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Element type */}
      <div>
        <div className="text-xs font-medium text-muted-foreground mb-1">Element Type</div>
        <input
          type="text"
          value={rule.elementType || ''}
          onChange={e => onUpdate({ ...rule, elementType: e.target.value || undefined })}
          placeholder="e.g. bold, italic, link, image, paragraph"
          className="h-7 px-2 text-xs border rounded-md bg-background w-64"
        />
      </div>

      {/* Translatable attributes */}
      <AttrListEditor
        label="Translatable Attributes"
        value={rule.translatableAttributes}
        onChange={v => onUpdate({ ...rule, translatableAttributes: v })}
      />

      {/* Writable localizable attributes */}
      <AttrListEditor
        label="Writable Localizable Attributes"
        value={rule.writableLocalizableAttributes}
        onChange={v => onUpdate({ ...rule, writableLocalizableAttributes: v })}
      />

      {/* Read-only localizable attributes */}
      <AttrListEditor
        label="Read-Only Localizable Attributes"
        value={rule.readOnlyLocalizableAttributes}
        onChange={v => onUpdate({ ...rule, readOnlyLocalizableAttributes: v })}
      />

      {/* ID attributes */}
      <div>
        <div className="text-xs font-medium text-muted-foreground mb-1">ID Attributes</div>
        <input
          type="text"
          value={(rule.idAttributes || []).join(', ')}
          onChange={e => {
            const ids = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
            onUpdate({ ...rule, idAttributes: ids.length > 0 ? ids : undefined });
          }}
          placeholder="Comma-separated attribute names (e.g. id, name)"
          className="h-7 px-2 text-xs border rounded-md bg-background w-full"
        />
      </div>
    </div>
  );
}

function AttrListEditor({ label, value, onChange }: {
  label: string;
  value: unknown;
  onChange: (v: string[] | Record<string, unknown> | undefined) => void;
}) {
  const isConditional = value != null && !Array.isArray(value) && typeof value === 'object';

  if (isConditional) {
    // For conditional maps, show as read-only YAML-like display with option to edit raw
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      <div>
        <div className="text-xs font-medium text-muted-foreground mb-1">
          {label} <span className="text-amber-600">(conditional)</span>
        </div>
        <div className="text-xs font-mono bg-muted/50 rounded p-2 space-y-0.5">
          {entries.map(([attr, cond]) => (
            <div key={attr}>
              <span className="text-blue-600">{attr}</span>
              <span className="text-muted-foreground">: </span>
              <span>{JSON.stringify(cond)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Simple array editor
  const items = isSimpleArray(value) ? value : [];
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground mb-1">{label}</div>
      <input
        type="text"
        value={items.join(', ')}
        onChange={e => {
          const attrs = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
          onChange(attrs.length > 0 ? attrs : undefined);
        }}
        placeholder="Comma-separated attribute names"
        className="h-7 px-2 text-xs border rounded-md bg-background w-full"
      />
    </div>
  );
}
