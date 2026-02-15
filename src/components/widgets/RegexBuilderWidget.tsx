import { useState } from 'react';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

interface RegexBuilderWidgetProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readonly?: boolean;
  options?: {
    placeholder?: string;
    testSamples?: string[];
    presets?: Record<string, string>;
  };
}

export function RegexBuilderWidget(props: RegexBuilderWidgetProps) {
  const { value, onChange, disabled, readonly, options = {} } = props;
  const { placeholder = 'Enter regex pattern...', testSamples = [], presets = {} } = options;
  const [testInput, setTestInput] = useState('');

  // Validate regex
  let isValid = true;
  let regex: RegExp | null = null;
  try {
    if (value) {
      regex = new RegExp(value);
    }
  } catch {
    isValid = false;
  }

  // Test against input
  const testResult = regex && testInput ? regex.test(testInput) : null;

  return (
    <div className="space-y-3">
      {/* Presets */}
      {Object.keys(presets).length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500">Presets:</span>
          {Object.entries(presets).map(([name, pattern]) => (
            <button
              key={name}
              type="button"
              onClick={() => onChange(pattern)}
              disabled={disabled || readonly}
              className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* Pattern input */}
      <div className="relative">
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || readonly}
          placeholder={placeholder}
          className={cn(
            'font-mono text-sm',
            !isValid && value && 'border-red-300 bg-red-50'
          )}
        />
        {!isValid && value && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-red-500">
            Invalid regex
          </span>
        )}
      </div>

      {/* Test area */}
      <div className="flex gap-2 items-center">
        <Input
          type="text"
          value={testInput}
          onChange={(e) => setTestInput(e.target.value)}
          placeholder="Test string..."
          className="flex-1 text-sm"
          disabled={disabled || readonly}
        />
        {testResult !== null && (
          <span className={cn(
            'text-xs px-2 py-1 rounded',
            testResult ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          )}>
            {testResult ? 'Match' : 'No match'}
          </span>
        )}
      </div>

      {/* Test samples */}
      {testSamples.length > 0 && (
        <div className="text-xs text-gray-400">
          <span>Samples: </span>
          {testSamples.map((sample, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setTestInput(sample)}
              className="font-mono mx-1 hover:text-gray-600"
            >
              "{sample}"
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default RegexBuilderWidget;
