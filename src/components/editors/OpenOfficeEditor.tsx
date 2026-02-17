import { type EditorProps, BoolField, val, set } from './EditorShell';
import { Card, CardContent } from '@/components/ui/card';

export function OpenOfficeEditor({ formData, onChange }: EditorProps) {
  const s = (k: string, v: unknown) => set(formData, onChange, k, v);

  return (
    <Card>
      <CardContent className="pt-4 space-y-1">
        <BoolField label="Extract notes" checked={val(formData, 'extractNotes', true)} onChange={(v) => s('extractNotes', v)} />
        <BoolField label="Extract references" checked={val(formData, 'extractReferences', false)} onChange={(v) => s('extractReferences', v)} />
        <BoolField label="Extract document metadata" checked={val(formData, 'extractDocProperties', false)} onChange={(v) => s('extractDocProperties', v)} />
      </CardContent>
    </Card>
  );
}
