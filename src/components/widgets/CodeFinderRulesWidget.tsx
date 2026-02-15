import { useState, useEffect } from 'react';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Plus, Trash2, TestTube2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeFinderRulesWidgetProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readonly?: boolean;
  options?: {
    presets?: Record<string, string>;
  };
}

interface ParsedRule {
  pattern: string;
  sample?: string;
  regexValid?: boolean;
}

// Parse the #v1 format: #v1\ncount.i=3\nrule0=pattern\nrule1=pattern...
function parseCodeFinderRules(value: string): ParsedRule[] {
  if (!value) return [];
  
  const lines = value.split('\n');
  const rules: ParsedRule[] = [];
  
  for (const line of lines) {
    const match = line.match(/^rule(\d+)=(.*)$/);
    if (match) {
      const pattern = match[2];
      let regexValid = true;
      try {
        new RegExp(pattern);
      } catch {
        regexValid = false;
      }
      rules.push({ pattern, regexValid });
    }
  }
  
  return rules;
}

// Serialize rules back to #v1 format
function serializeCodeFinderRules(rules: ParsedRule[]): string {
  if (rules.length === 0) return '';
  
  const lines = ['#v1', `count.i=${rules.length}`];
  rules.forEach((rule, i) => {
    lines.push(`rule${i}=${rule.pattern}`);
  });
  
  return lines.join('\n');
}

export function CodeFinderRulesWidget(props: CodeFinderRulesWidgetProps) {
  const { value, onChange, options = {}, disabled, readonly } = props;
  const { presets = {} } = options;
  
  const [rules, setRules] = useState<ParsedRule[]>(() => parseCodeFinderRules(String(value || '')));
  const [testInput, setTestInput] = useState('');
  const [testResults, setTestResults] = useState<boolean[]>([]);

  // Sync local state with prop value
  useEffect(() => {
    const parsed = parseCodeFinderRules(String(value || ''));
    setRules(parsed);
  }, [value]);

  const updateRules = (newRules: ParsedRule[]) => {
    setRules(newRules);
    onChange(serializeCodeFinderRules(newRules));
  };

  const addRule = (pattern: string = '') => {
    let regexValid = true;
    try {
      new RegExp(pattern);
    } catch {
      regexValid = false;
    }
    updateRules([...rules, { pattern, regexValid }]);
  };

  const updateRule = (index: number, pattern: string) => {
    let regexValid = true;
    try {
      new RegExp(pattern);
    } catch {
      regexValid = false;
    }
    const newRules = [...rules];
    newRules[index] = { pattern, regexValid };
    updateRules(newRules);
  };

  const removeRule = (index: number) => {
    updateRules(rules.filter((_, i) => i !== index));
  };

  const runTest = () => {
    const results = rules.map(rule => {
      try {
        const regex = new RegExp(rule.pattern);
        return regex.test(testInput);
      } catch {
        return false;
      }
    });
    setTestResults(results);
  };

  return (
    <div className="space-y-4">
      {/* Presets */}
      {Object.keys(presets).length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Presets:</span>
          {Object.entries(presets).map(([name, pattern]) => (
            <button
              key={name}
              type="button"
              onClick={() => addRule(pattern)}
              disabled={disabled || readonly}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* Rules list */}
      <div className="space-y-2">
        {rules.map((rule, index) => (
          <div key={index} className="flex gap-2 items-start">
            <span className="text-xs text-gray-400 w-8 py-2 text-right shrink-0">
              {index}:
            </span>
            <div className="flex-1 relative">
              <Input
                type="text"
                value={rule.pattern}
                onChange={(e) => updateRule(index, e.target.value)}
                disabled={disabled || readonly}
                className={cn(
                  'font-mono text-sm',
                  !rule.regexValid && 'border-red-300 bg-red-50'
                )}
                placeholder="Regular expression pattern"
              />
              {!rule.regexValid && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-red-500">
                  Invalid regex
                </span>
              )}
            </div>
            {testResults[index] !== undefined && (
              <span className={cn(
                'w-6 h-9 flex items-center justify-center rounded',
                testResults[index] ? 'text-green-600' : 'text-gray-300'
              )}>
                {testResults[index] ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </span>
            )}
            {!readonly && !disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeRule(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Add rule button */}
      {!readonly && !disabled && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addRule('')}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      )}

      {/* Test area */}
      <div className="space-y-2 pt-2 border-t">
        <div className="flex gap-2">
          <Input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Test string..."
            className="flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={runTest}
            disabled={!testInput || rules.length === 0}
          >
            <TestTube2 className="h-4 w-4 mr-2" />
            Test
          </Button>
        </div>
      </div>

      {/* Raw value preview */}
      <details className="text-xs">
        <summary className="text-gray-400 cursor-pointer">Raw value</summary>
        <Textarea
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          disabled={readonly}
          className="font-mono text-xs mt-2"
          rows={4}
        />
      </details>
    </div>
  );
}

export default CodeFinderRulesWidget;
