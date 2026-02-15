import { cn } from '@/lib/utils';

interface EnumRadioWidgetProps {
  value: string | number;
  onChange: (value: string | number) => void;
  disabled?: boolean;
  readonly?: boolean;
  schema?: { enum?: unknown[] };
  options?: {
    options?: Array<{ value: number | string; label: string; description?: string }>;
  };
}

export function EnumRadioWidget(props: EnumRadioWidgetProps) {
  const { value, onChange, options = {}, schema = {}, disabled, readonly } = props;
  
  // Get options either from editorHints or schema enum
  const enumOptions = options.options || 
    (schema.enum?.map((v: unknown) => ({ value: v, label: String(v) })) as Array<{ value: number | string; label: string; description?: string }>) || 
    [];

  return (
    <div className="space-y-2">
      {enumOptions.map((option, index) => (
        <label
          key={index}
          className={cn(
            'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
            value === option.value
              ? 'bg-blue-50 border-blue-300'
              : 'bg-white border-gray-200 hover:bg-gray-50',
            (disabled || readonly) && 'opacity-60 cursor-not-allowed'
          )}
        >
          <input
            type="radio"
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            disabled={disabled || readonly}
            className="mt-0.5"
          />
          <div className="flex-1">
            <div className="font-medium text-sm">{option.label}</div>
            {option.description && (
              <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
            )}
          </div>
        </label>
      ))}
    </div>
  );
}

export default EnumRadioWidget;
