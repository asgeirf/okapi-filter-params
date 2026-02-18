import { useState } from 'react';
import { val, set, isDirty, FieldResetButton, DirtyDot } from './EditorShell';
import { Plus, Trash2 } from 'lucide-react';

const ATTRIBUTE_RULE_TYPES = [
  'ATTRIBUTE_TRANS', 'ATTRIBUTE_WRITABLE', 'ATTRIBUTE_READONLY', 'ATTRIBUTE_ID',
] as const;

interface AttributeRule {
  ruleTypes: string[];
  allElementsExcept?: string[];
  onlyTheseElements?: string[];
}

interface Props {
  formData: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  defaults?: Record<string, unknown>;
  fieldKey: string;
}

function ruleTypeBadgeColor(rt: string): string {
  switch (rt) {
    case 'ATTRIBUTE_TRANS': return 'bg-blue-100 text-blue-800';
    case 'ATTRIBUTE_WRITABLE': return 'bg-green-100 text-green-800';
    case 'ATTRIBUTE_READONLY': return 'bg-amber-100 text-amber-800';
    case 'ATTRIBUTE_ID': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function ruleTypeLabel(rt: string): string {
  switch (rt) {
    case 'ATTRIBUTE_TRANS': return 'Translatable';
    case 'ATTRIBUTE_WRITABLE': return 'Writable';
    case 'ATTRIBUTE_READONLY': return 'Read-Only';
    case 'ATTRIBUTE_ID': return 'ID';
    default: return rt;
  }
}

export function AttributeRulesEditor({ formData, onChange, defaults, fieldKey }: Props) {
  const [newAttrName, setNewAttrName] = useState('');

  const attributes = (val(formData, fieldKey, {}) as Record<string, AttributeRule>) || {};
  const dirty = isDirty(formData, defaults, fieldKey);
  const onReset = () => { if (defaults && fieldKey in defaults) set(formData, onChange, fieldKey, defaults[fieldKey]); };

  const sortedKeys = Object.keys(attributes).sort();

  const updateAttr = (name: string, rule: AttributeRule) => {
    set(formData, onChange, fieldKey, { ...attributes, [name]: rule });
  };

  const removeAttr = (name: string) => {
    const updated = { ...attributes };
    delete updated[name];
    set(formData, onChange, fieldKey, updated);
  };

  const addAttr = () => {
    const name = newAttrName.trim();
    if (!name || name in attributes) return;
    set(formData, onChange, fieldKey, { ...attributes, [name]: { ruleTypes: ['ATTRIBUTE_TRANS'] } });
    setNewAttrName('');
  };

  const toggleRuleType = (name: string, rt: string) => {
    const rule = attributes[name] || { ruleTypes: [] };
    const types = rule.ruleTypes || [];
    const updated = types.includes(rt) ? types.filter(t => t !== rt) : [...types, rt];
    updateAttr(name, { ...rule, ruleTypes: updated });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <FieldResetButton visible={dirty} onReset={onReset} />
        <span className="text-sm font-medium">Global Attribute Rules</span>
        <span className="text-xs text-muted-foreground">({sortedKeys.length} attributes)</span>
        <div className="flex-1" />
        <DirtyDot dirty={dirty} />
      </div>

      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-xs text-muted-foreground">
              <th className="text-left px-3 py-1.5">Attribute</th>
              <th className="text-left px-3 py-1.5">Rule Types</th>
              <th className="text-left px-3 py-1.5">Element Scope</th>
              <th className="text-left px-3 py-1.5 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {sortedKeys.map(name => {
              const rule = attributes[name];
              return (
                <tr key={name} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-1.5 font-mono text-xs">{name}</td>
                  <td className="px-3 py-1.5">
                    <div className="flex flex-wrap gap-1">
                      {ATTRIBUTE_RULE_TYPES.map(rt => {
                        const active = (rule.ruleTypes || []).includes(rt);
                        return (
                          <button
                            key={rt}
                            onClick={() => toggleRuleType(name, rt)}
                            className={`text-xs px-1.5 py-0.5 rounded border transition-colors ${
                              active
                                ? ruleTypeBadgeColor(rt) + ' border-current'
                                : 'bg-background text-muted-foreground border-border hover:bg-muted'
                            }`}
                          >
                            {ruleTypeLabel(rt)}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-3 py-1.5">
                    <ScopeEditor rule={rule} onChange={r => updateAttr(name, r)} />
                  </td>
                  <td className="px-3 py-1.5">
                    <button onClick={() => removeAttr(name)} className="text-muted-foreground hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newAttrName}
          onChange={e => setNewAttrName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addAttr()}
          placeholder="Add attribute..."
          className="flex-1 h-8 px-2 text-sm border rounded-md bg-background"
        />
        <button
          onClick={addAttr}
          disabled={!newAttrName.trim() || newAttrName.trim() in attributes}
          className="h-8 px-2 text-sm border rounded-md hover:bg-muted disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ScopeEditor({ rule, onChange }: { rule: AttributeRule; onChange: (r: AttributeRule) => void }) {
  const hasExcept = rule.allElementsExcept && rule.allElementsExcept.length > 0;
  const hasOnly = rule.onlyTheseElements && rule.onlyTheseElements.length > 0;

  if (!hasExcept && !hasOnly) {
    return <span className="text-xs text-muted-foreground">All elements</span>;
  }

  if (hasExcept) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">All except:</span>
        <input
          type="text"
          value={(rule.allElementsExcept || []).join(', ')}
          onChange={e => {
            const els = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
            onChange({ ...rule, allElementsExcept: els.length > 0 ? els : undefined });
          }}
          className="h-6 px-1 text-xs border rounded bg-background flex-1"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground">Only:</span>
      <input
        type="text"
        value={(rule.onlyTheseElements || []).join(', ')}
        onChange={e => {
          const els = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
          onChange({ ...rule, onlyTheseElements: els.length > 0 ? els : undefined });
        }}
        className="h-6 px-1 text-xs border rounded bg-background flex-1"
      />
    </div>
  );
}
