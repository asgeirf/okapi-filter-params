import { type EditorProps, TabPanel, FieldGroup, BoolField, TextField, CodeFinderSection, val, set } from './EditorShell';

export function RegexEditor({ formData, onChange }: EditorProps) {
  const s = (k: string, v: unknown) => set(formData, onChange, k, v);

  const rulesTab = (
    <div className="space-y-2">
      <FieldGroup label="Regex Options">
        <BoolField label="Case insensitive" checked={val(formData, 'regexCaseInsensitive', false)} onChange={(v) => s('regexCaseInsensitive', v)} />
        <BoolField label="Dot matches all (DOTALL)" checked={val(formData, 'regexDotAll', false)} onChange={(v) => s('regexDotAll', v)} />
        <BoolField label="Multiline" checked={val(formData, 'regexMultiline', false)} onChange={(v) => s('regexMultiline', v)} />
      </FieldGroup>

      <FieldGroup label="Inline Codes">
        <CodeFinderSection
          formData={formData}
          onChange={onChange}
          useCodeFinderKey="useCodeFinder"
          codeFinderKey="codeFinderRules"
        />
      </FieldGroup>
    </div>
  );

  const optionsTab = (
    <div className="space-y-2">
      <FieldGroup label="String Markers">
        <TextField label="Start marker" value={val(formData, 'startString', '')} onChange={(v) => s('startString', v)} mono />
        <TextField label="End marker" value={val(formData, 'endString', '')} onChange={(v) => s('endString', v)} mono />
      </FieldGroup>

      <FieldGroup label="Escaping">
        <BoolField label="Use backslash escaping" checked={val(formData, 'useBackslashEscape', false)} onChange={(v) => s('useBackslashEscape', v)} />
        <BoolField label="Use double-char escaping" checked={val(formData, 'useDoubleCharEscape', false)} onChange={(v) => s('useDoubleCharEscape', v)} />
      </FieldGroup>

      <FieldGroup label="Content">
        <TextField
          label="MIME type"
          value={val(formData, 'mimeType', 'text/plain')}
          onChange={(v) => s('mimeType', v)}
          placeholder="text/plain"
        />
        <TextField
          label="Subfilter ID"
          value={val(formData, 'subfilter', '')}
          onChange={(v) => s('subfilter', v)}
          placeholder="Configuration identifier (empty for none)"
        />
      </FieldGroup>
    </div>
  );

  return (
    <TabPanel tabs={[
      { id: 'rules', label: 'Rules', content: rulesTab },
      { id: 'options', label: 'Options', content: optionsTab },
    ]} />
  );
}
