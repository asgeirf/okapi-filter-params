import { type EditorProps, TabPanel, FieldGroup, BoolField, CodeFinderSection, val, set, isDirty } from './EditorShell';

export function MifEditor({ formData, onChange, defaults }: EditorProps) {
  const s = (k: string, v: unknown) => set(formData, onChange, k, v);
  const d = (key: string) => isDirty(formData, defaults, key);
  const r = (key: string) => () => { if (defaults && key in defaults) set(formData, onChange, key, defaults[key]); };

  const optionsTab = (
    <div className="space-y-2">
      <FieldGroup label="Page Types to Extract">
        <BoolField label="Body pages" checked={val(formData, 'extractBodyPages', true)} onChange={(v) => s('extractBodyPages', v)} dirty={d('extractBodyPages')}
          onReset={r('extractBodyPages')} />
        <BoolField label="Hidden pages" checked={val(formData, 'extractHiddenPages', false)} onChange={(v) => s('extractHiddenPages', v)} dirty={d('extractHiddenPages')}
          onReset={r('extractHiddenPages')} />
        <BoolField label="Master pages" checked={val(formData, 'extractMasterPages', false)} onChange={(v) => s('extractMasterPages', v)} dirty={d('extractMasterPages')}
          onReset={r('extractMasterPages')} />
        <BoolField label="Reference pages" checked={val(formData, 'extractReferencePages', false)} onChange={(v) => s('extractReferencePages', v)} dirty={d('extractReferencePages')}
          onReset={r('extractReferencePages')} />
      </FieldGroup>

      <FieldGroup label="Content to Extract">
        <BoolField label="Extract variables" checked={val(formData, 'extractVariables', false)} onChange={(v) => s('extractVariables', v)} dirty={d('extractVariables')}
          onReset={r('extractVariables')} />
        <BoolField label="Extract index markers" checked={val(formData, 'extractIndexMarkers', true)} onChange={(v) => s('extractIndexMarkers', v)} dirty={d('extractIndexMarkers')}
          onReset={r('extractIndexMarkers')} />
        <BoolField label="Extract links" checked={val(formData, 'extractLinks', false)} onChange={(v) => s('extractLinks', v)} dirty={d('extractLinks')}
          onReset={r('extractLinks')} />
        <BoolField label="Extract PgfNumFormat strings" checked={val(formData, 'extractPgfNumFormats', false)} onChange={(v) => s('extractPgfNumFormats', v)} dirty={d('extractPgfNumFormats')}
          onReset={r('extractPgfNumFormats')} />
        <BoolField label="Extract reference format strings" checked={val(formData, 'extractReferenceFormats', false)} onChange={(v) => s('extractReferenceFormats', v)} dirty={d('extractReferenceFormats')}
          onReset={r('extractReferenceFormats')} />
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
            defaults={defaults}
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
