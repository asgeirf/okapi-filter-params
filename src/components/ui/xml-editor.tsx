import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';

function highlight(code: string): string {
  return Prism.highlight(code, Prism.languages.markup, 'markup');
}

interface XmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function XmlEditor({ value, onChange, className = '' }: XmlEditorProps) {
  return (
    <div className={`rounded-md overflow-auto max-h-[600px] bg-muted ${className}`}>
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={highlight}
        padding={12}
        tabSize={2}
        insertSpaces
        className="font-mono text-sm !outline-none [&>textarea]:!outline-none"
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
          fontSize: '0.875rem',
          lineHeight: '1.625',
          minHeight: '12rem',
        }}
      />
    </div>
  );
}
