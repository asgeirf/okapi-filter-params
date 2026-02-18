import { type EditorProps, FieldGroup, BoolField, val, set, isDirty } from './EditorShell';
import { Card, CardContent } from '@/components/ui/card';

export function PlaintextEditor({ formData, onChange, defaults }: EditorProps) {
  const s = (k: string, v: unknown) => set(formData, onChange, k, v);
  const d = (key: string) => isDirty(formData, defaults, key);

  return (
    <Card>
      <CardContent className="pt-4 space-y-2">
        <FieldGroup label="Line Breaks">
          <BoolField label="Segment on line breaks" checked={val(formData, 'segmentOnLineBreaks', true)} onChange={(v) => s('segmentOnLineBreaks', v)} dirty={d('segmentOnLineBreaks')} />
          <BoolField label="Trim segments" checked={val(formData, 'trimSegments', true)} onChange={(v) => s('trimSegments', v)} dirty={d('trimSegments')} />
        </FieldGroup>

        <FieldGroup label="Processing">
          <BoolField label="Unescape source" checked={val(formData, 'unescapeSource', false)} onChange={(v) => s('unescapeSource', v)} dirty={d('unescapeSource')} />
          <BoolField label="Preserve whitespace" checked={val(formData, 'preserveWhitespace', false)} onChange={(v) => s('preserveWhitespace', v)} dirty={d('preserveWhitespace')} />
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
