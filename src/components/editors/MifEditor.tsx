import { type EditorProps, TabPanel, FieldGroup, BoolField, CodeFinderSection, val, set } from './EditorShell';

export function MifEditor({ formData, onChange }: EditorProps) {
  const s = (k: string, v: unknown) => set(formData, onChange, k, v);

  const optionsTab = (
    <div className="space-y-2">
      <FieldGroup label="Page Types to Extract">
        <BoolField label="Body pages" checked={val(formData, 'extractBodyPages', true)} onChange={(v) => s('extractBodyPages', v)} />
        <BoolField label="Hidden pages" checked={val(formData, 'extractHiddenPages', false)} onChange={(v) => s('extractHiddenPages', v)} />
        <BoolField label="Master pages" checked={val(formData, 'extractMasterPages', false)} onChange={(v) => s('extractMasterPages', v)} />
        <BoolField label="Reference pages" checked={val(formData, 'extractReferencePages', false)} onChange={(v) => s('extractReferencePages', v)} />
      </FieldGroup>

      <FieldGroup label="Content to Extract">
        <BoolField label="Extract variables" checked={val(formData, 'extractVariables', false)} onChange={(v) => s('extractVariables', v)} />
        <BoolField label="Extract index markers" checked={val(formData, 'extractIndexMarkers', true)} onChange={(v) => s('extractIndexMarkers', v)} />
        <BoolField label="Extract links" checked={val(formData, 'extractLinks', false)} onChange={(v) => s('extractLinks', v)} />
        <BoolField label="Extract PgfNumFormat strings" checked={val(formData, 'extractPgfNumFormats', false)} onChange={(v) => s('extractPgfNumFormats', v)} />
        <BoolField label="Extract reference format strings" checked={val(formData, 'extractReferenceFormats', false)} onChange={(v) => s('extractReferenceFormats', v)} />
      </FieldGroup>
    </div>
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
