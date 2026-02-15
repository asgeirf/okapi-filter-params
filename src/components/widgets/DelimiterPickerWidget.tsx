import { cn } from '@/lib/utils';

interface DelimiterPickerWidgetProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readonly?: boolean;
  options?: {
    common?: Array<{ value: string; label: string }>;
  };
}

const DEFAULT_COMMON = [
  { value: ',', label: 'Comma' },
  { value: '\t', label: 'Tab' },
  { value: ';', label: 'Semicolon' },
  { value: '|', label: 'Pipe' },
  { value: ' ', label: 'Space' },
];

export function DelimiterPickerWidget(props: DelimiterPickerWidgetProps) {
  const { value, onChange, options = {}, disabled, readonly } = props;
  const { common = DEFAULT_COMMON } = options;

  const isCustom = !common.some(c => c.value === value);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {common.map((option, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onChange(option.value)}
            disabled={disabled || readonly}
            className={cn(
              'px-3 py-1.5 rounded border text-sm transition-colors',
              value === option.value
                ? 'bg-blue-100 border-blue-300 text-blue-800'
                : 'bg-white border-gray-200 hover:bg-gray-50',
              (disabled || readonly) && 'opacity-60 cursor-not-allowed'
            )}
          >
            {option.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            // Show custom input
            const custom = prompt('Enter custom delimiter:', value || '');
            if (custom !== null) {
              onChange(custom);
            }
          }}
          disabled={disabled || readonly}
          className={cn(
            'px-3 py-1.5 rounded border text-sm transition-colors',
            isCustom
              ? 'bg-blue-100 border-blue-300 text-blue-800'
              : 'bg-white border-gray-200 hover:bg-gray-50',
            (disabled || readonly) && 'opacity-60 cursor-not-allowed'
          )}
        >
          {isCustom ? `Custom: "${value}"` : 'Custom...'}
        </button>
      </div>
      <div className="text-xs text-gray-400 font-mono">
        Value: {JSON.stringify(value)}
      </div>
    </div>
  );
}

export default DelimiterPickerWidget;
