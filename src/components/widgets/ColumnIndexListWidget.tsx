import { useState, type KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface ColumnIndexListWidgetProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readonly?: boolean;
  options?: {
    separator?: string;
    placeholder?: string;
    oneBased?: boolean;
  };
}

export function ColumnIndexListWidget(props: ColumnIndexListWidgetProps) {
  const { value, onChange, disabled, readonly, options = {} } = props;
  const { separator = ',', placeholder = 'Add column...', oneBased = true } = options;
  const [inputValue, setInputValue] = useState('');

  // Parse current value into array of numbers
  const columns: number[] = value
    ? String(value).split(separator).map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
    : [];

  // Serialize back to string
  const serializeColumns = (cols: number[]): string => {
    return cols.join(separator);
  };

  const addColumn = (col: string) => {
    const num = parseInt(col.trim(), 10);
    if (!isNaN(num) && !columns.includes(num)) {
      const newCols = [...columns, num].sort((a, b) => a - b);
      onChange(serializeColumns(newCols));
    }
    setInputValue('');
  };

  const removeColumn = (index: number) => {
    const newCols = columns.filter((_, i) => i !== index);
    onChange(newCols.length > 0 ? serializeColumns(newCols) : '');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addColumn(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && columns.length > 0) {
      removeColumn(columns.length - 1);
    }
  };

  return (
    <div className="space-y-2">
      {/* Visual column indicators */}
      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
        {columns.map((col, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-sm font-mono"
          >
            {oneBased ? `Col ${col}` : `[${col}]`}
            {!readonly && !disabled && (
              <button
                type="button"
                onClick={() => removeColumn(index)}
                className="hover:bg-indigo-200 rounded p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Input */}
      {!readonly && !disabled && (
        <div className="flex gap-2">
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            min={oneBased ? 1 : 0}
            className="flex-1 font-mono"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputValue.trim() && addColumn(inputValue)}
            disabled={!inputValue.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Raw value preview */}
      {columns.length > 0 && (
        <div className="text-xs text-gray-400 font-mono truncate">
          → {value}
        </div>
      )}
    </div>
  );
}

export default ColumnIndexListWidget;
