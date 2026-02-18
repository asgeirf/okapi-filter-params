import { type EditorProps, TabPanel, FieldGroup, BoolField, TextField, RadioGroup, CodeFinderSection, val, set, isDirty } from './EditorShell';

export function PoEditor({ formData, onChange, defaults }: EditorProps) {
  const s = (k: string, v: unknown) => set(formData, onChange, k, v);
  const d = (key: string) => isDirty(formData, defaults, key);
  const bilingualMode = val(formData, 'bilingualMode', true);

  const optionsTab = (
    <div className="space-y-2">
      <BoolField
        label="Protect approved entries"
        checked={val(formData, 'protectApproved', true)}
        onChange={(v) => s('protectApproved', v)}
        dirty={d('protectApproved')}
      />
      <BoolField
        label="Include message context in note"
        checked={val(formData, 'includeMsgContextInNote', false)}
        onChange={(v) => s('includeMsgContextInNote', v)}
        dirty={d('includeMsgContextInNote')}
      />

      <FieldGroup label="Mode">
        <RadioGroup
          value={bilingualMode ? 'bilingual' : 'monolingual'}
          options={[
            {
              value: 'bilingual',
              label: 'Bilingual mode',
              description: 'Source entries are extracted as the source text. Translation entries (if they exist) are extracted as the target text.',
            },
            {
              value: 'monolingual',
              label: 'Monolingual mode',
              description: 'Translation entries are extracted as the source text. Use this when a PO file is used as a monolingual resource.',
            },
          ]}
          onChange={(v) => s('bilingualMode', v === 'bilingual')}
        />
        {bilingualMode && (
          <BoolField
            label="Make IDs"
            checked={val(formData, 'makeID', false)}
            onChange={(v) => s('makeID', v)}
            indent
            dirty={d('makeID')}
          />
        )}
      </FieldGroup>

      <TextField
        label="Subfilter ID"
        value={val(formData, 'subfilter', '')}
        onChange={(v) => s('subfilter', v)}
        placeholder="Configuration identifier of the sub-filter"
        dirty={d('subfilter')}
      />
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
