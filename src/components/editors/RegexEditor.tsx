import { type EditorProps, TabPanel, FieldGroup, BoolField, TextField, CodeFinderSection, val, set, isDirty } from './EditorShell';

export function RegexEditor({ formData, onChange, defaults }: EditorProps) {
  const s = (k: string, v: unknown) => set(formData, onChange, k, v);
  const d = (key: string) => isDirty(formData, defaults, key);
  const r = (key: string) => () => { if (defaults && key in defaults) set(formData, onChange, key, defaults[key]); };

  const rulesTab = (
    <div className="space-y-2">
      <FieldGroup label="Regex Options">
        <BoolField label="Case insensitive" checked={val(formData, 'regexCaseInsensitive', false)} onChange={(v) => s('regexCaseInsensitive', v)} dirty={d('regexCaseInsensitive')}
          onReset={r('regexCaseInsensitive')} />
        <BoolField label="Dot matches all (DOTALL)" checked={val(formData, 'regexDotAll', false)} onChange={(v) => s('regexDotAll', v)} dirty={d('regexDotAll')}
          onReset={r('regexDotAll')} />
        <BoolField label="Multiline" checked={val(formData, 'regexMultiline', false)} onChange={(v) => s('regexMultiline', v)} dirty={d('regexMultiline')}
          onReset={r('regexMultiline')} />
      </FieldGroup>

      <FieldGroup label="Inline Codes">
        <CodeFinderSection
          formData={formData}
          onChange={onChange}
          useCodeFinderKey="useCodeFinder"
          codeFinderKey="codeFinderRules"
            defaults={defaults}
        />
      </FieldGroup>
    </div>
  );

  const optionsTab = (
    <div className="space-y-2">
      <FieldGroup label="String Markers">
        <TextField label="Start marker" value={val(formData, 'startString', '')} onChange={(v) => s('startString', v)} mono dirty={d('startString')}
          onReset={r('startString')} />
        <TextField label="End marker" value={val(formData, 'endString', '')} onChange={(v) => s('endString', v)} mono dirty={d('endString')}
          onReset={r('endString')} />
      </FieldGroup>

      <FieldGroup label="Escaping">
        <BoolField label="Use backslash escaping" checked={val(formData, 'useBackslashEscape', false)} onChange={(v) => s('useBackslashEscape', v)} dirty={d('useBackslashEscape')}
          onReset={r('useBackslashEscape')} />
        <BoolField label="Use double-char escaping" checked={val(formData, 'useDoubleCharEscape', false)} onChange={(v) => s('useDoubleCharEscape', v)} dirty={d('useDoubleCharEscape')}
          onReset={r('useDoubleCharEscape')} />
      </FieldGroup>

      <FieldGroup label="Content">
        <TextField
          label="MIME type"
          value={val(formData, 'mimeType', 'text/plain')}
          onChange={(v) => s('mimeType', v)}
          placeholder="text/plain"
          dirty={d('mimeType')}
          onReset={r('mimeType')}
        />
        <TextField
          label="Subfilter ID"
          value={val(formData, 'subfilter', '')}
          onChange={(v) => s('subfilter', v)}
          placeholder="Configuration identifier (empty for none)"
          dirty={d('subfilter')}
          onReset={r('subfilter')}
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
