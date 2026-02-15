import { Textarea } from '../ui/textarea';

interface CodeEditorWidgetProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readonly?: boolean;
  options?: {
    language?: string;
    rows?: number;
  };
}

export function CodeEditorWidget(props: CodeEditorWidgetProps) {
  const { value, onChange, disabled, readonly, options = {} } = props;
  const { rows = 6 } = options;

  return (
    <Textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || readonly}
      rows={rows}
      className="font-mono text-sm"
      placeholder="Enter code or rules..."
    />
  );
}

export default CodeEditorWidget;
