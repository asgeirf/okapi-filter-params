import { type EditorProps, BoolField, val, set, isDirty } from './EditorShell';
import { Card, CardContent } from '@/components/ui/card';

export function OpenOfficeEditor({ formData, onChange, defaults }: EditorProps) {
  const s = (k: string, v: unknown) => set(formData, onChange, k, v);
  const d = (key: string) => isDirty(formData, defaults, key);

  return (
    <Card>
      <CardContent className="pt-4 space-y-1">
        <BoolField label="Extract notes" checked={val(formData, 'extractNotes', true)} onChange={(v) => s('extractNotes', v)} dirty={d('extractNotes')} />
        <BoolField label="Extract references" checked={val(formData, 'extractReferences', false)} onChange={(v) => s('extractReferences', v)} dirty={d('extractReferences')} />
        <BoolField label="Extract document metadata" checked={val(formData, 'extractDocProperties', false)} onChange={(v) => s('extractDocProperties', v)} dirty={d('extractDocProperties')} />
      </CardContent>
    </Card>
  );
}
