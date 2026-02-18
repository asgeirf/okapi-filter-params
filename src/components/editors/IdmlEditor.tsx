import { type EditorProps, FieldGroup, BoolField, TextField, val, set, isDirty } from './EditorShell';
import { Card, CardContent } from '@/components/ui/card';

export function IdmlEditor({ formData, onChange, defaults }: EditorProps) {
  const s = (k: string, v: unknown) => set(formData, onChange, k, v);
  const d = (key: string) => isDirty(formData, defaults, key);

  return (
    <Card>
      <CardContent className="pt-4 space-y-2">
        <FieldGroup label="Content Extraction">
          <BoolField label="Extract notes" checked={val(formData, 'extractNotes', true)} onChange={(v) => s('extractNotes', v)} dirty={d('extractNotes')} />
          <BoolField label="Extract master spreads" checked={val(formData, 'extractMasterSpreads', false)} onChange={(v) => s('extractMasterSpreads', v)} dirty={d('extractMasterSpreads')} />
          <BoolField label="Extract hidden layers" checked={val(formData, 'extractHiddenLayers', false)} onChange={(v) => s('extractHiddenLayers', v)} dirty={d('extractHiddenLayers')} />
        </FieldGroup>

        <FieldGroup label="Processing">
          <BoolField label="Add source as alt-trans" checked={val(formData, 'addSourceAsAltTrans', false)} onChange={(v) => s('addSourceAsAltTrans', v)} dirty={d('addSourceAsAltTrans')} />
          <BoolField label="Use CDATA for embedded" checked={val(formData, 'useCdataForEmbedded', false)} onChange={(v) => s('useCdataForEmbedded', v)} dirty={d('useCdataForEmbedded')} />
        </FieldGroup>

        <FieldGroup label="Subfilter">
          <TextField
            label="Subfilter ID"
            value={val(formData, 'subfilter', '')}
            onChange={(v) => s('subfilter', v)}
            placeholder="Configuration identifier (empty for none)"
            dirty={d('subfilter')}
          />
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
