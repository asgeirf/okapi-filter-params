import { type EditorProps, TabPanel, FieldGroup, BoolField, CodeFinderSection, val, set } from './EditorShell';

export function TsEditor({ formData, onChange }: EditorProps) {
  const s = (k: string, v: unknown) => set(formData, onChange, k, v);

  const optionsTab = (
    <FieldGroup label="Characters">
      <BoolField
        label="Decode byte values"
        checked={val(formData, 'decodeByteValues', false)}
        onChange={(v) => s('decodeByteValues', v)}
      />
    </FieldGroup>
  );

  const inlineTab = (
    <FieldGroup label="Inline Codes">
      <CodeFinderSection
        formData={formData}
        onChange={onChange}
        useCodeFinderKey="useCodeFinder"
        codeFinderKey="codeFinderRules"
      />
    </FieldGroup>
  );

  return (
    <TabPanel tabs={[
      { id: 'options', label: 'Options', content: optionsTab },
      { id: 'inline', label: 'Inline Codes', content: inlineTab },
    ]} />
  );
}
