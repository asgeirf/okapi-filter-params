import { type EditorProps, FieldGroup, BoolField, TextField, val, set } from './EditorShell';
import { Card, CardContent } from '@/components/ui/card';

export function IdmlEditor({ formData, onChange }: EditorProps) {
  const s = (k: string, v: unknown) => set(formData, onChange, k, v);

  return (
    <Card>
      <CardContent className="pt-4 space-y-2">
        <FieldGroup label="Content Extraction">
          <BoolField label="Extract notes" checked={val(formData, 'extractNotes', true)} onChange={(v) => s('extractNotes', v)} />
          <BoolField label="Extract master spreads" checked={val(formData, 'extractMasterSpreads', false)} onChange={(v) => s('extractMasterSpreads', v)} />
          <BoolField label="Extract hidden layers" checked={val(formData, 'extractHiddenLayers', false)} onChange={(v) => s('extractHiddenLayers', v)} />
        </FieldGroup>

        <FieldGroup label="Processing">
          <BoolField label="Add source as alt-trans" checked={val(formData, 'addSourceAsAltTrans', false)} onChange={(v) => s('addSourceAsAltTrans', v)} />
          <BoolField label="Use CDATA for embedded" checked={val(formData, 'useCdataForEmbedded', false)} onChange={(v) => s('useCdataForEmbedded', v)} />
        </FieldGroup>

        <FieldGroup label="Subfilter">
          <TextField
            label="Subfilter ID"
            value={val(formData, 'subfilter', '')}
            onChange={(v) => s('subfilter', v)}
            placeholder="Configuration identifier (empty for none)"
          />
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
