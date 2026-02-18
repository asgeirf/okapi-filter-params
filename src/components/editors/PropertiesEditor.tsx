import { type EditorProps, TabPanel, FieldGroup, BoolField, TextField, RadioGroup, CodeFinderSection, val, set, isDirty } from './EditorShell';

export function PropertiesEditor({ formData, onChange, defaults }: EditorProps) {
  const s = (k: string, v: unknown) => set(formData, onChange, k, v);
  const d = (key: string) => isDirty(formData, defaults, key);
  const useKeyFilter = val(formData, 'useKeyCondition', false);

  const optionsTab = (
    <div className="space-y-2">
      <FieldGroup label="Key Conditions">
        <BoolField
          label="Use key condition"
          checked={useKeyFilter}
          onChange={(v) => s('useKeyCondition', v)}
        />
        <RadioGroup
          value={val(formData, 'extractOnlyMatchingKey', true) ? 'extract' : 'exclude'}
          options={[
            { value: 'extract', label: 'Extract only matching keys' },
            { value: 'exclude', label: 'Exclude matching keys' },
          ]}
          onChange={(v) => s('extractOnlyMatchingKey', v === 'extract')}
          disabled={!useKeyFilter}
          dirty={d('extractOnlyMatchingKey')}
        />
        <TextField
          label="Key condition pattern"
          value={val(formData, 'keyCondition', '')}
          onChange={(v) => s('keyCondition', v)}
          disabled={!useKeyFilter}
          mono
          indent
          placeholder="Regular expression"
          dirty={d('keyCondition')}
        />
      </FieldGroup>

      <FieldGroup label="Comments">
        <BoolField label="Extract extra comments" checked={val(formData, 'extraComments', false)} onChange={(v) => s('extraComments', v)} dirty={d('extraComments')} />
        <BoolField label="Comments are notes" checked={val(formData, 'commentsAreNotes', false)} onChange={(v) => s('commentsAreNotes', v)} dirty={d('commentsAreNotes')} />
      </FieldGroup>

      <FieldGroup label="Processing">
        <BoolField label="Convert LF and tab characters" checked={val(formData, 'convertLFandTab', true)} onChange={(v) => s('convertLFandTab', v)} dirty={d('convertLFandTab')} />
        <BoolField label="Use resource name as ID" checked={val(formData, 'idLikeResname', false)} onChange={(v) => s('idLikeResname', v)} dirty={d('idLikeResname')} />
        <BoolField label="Use Java escapes" checked={val(formData, 'useJavaEscapes', true)} onChange={(v) => s('useJavaEscapes', v)} dirty={d('useJavaEscapes')} />
      </FieldGroup>

      <TextField
        label="Subfilter ID"
        value={val(formData, 'subfilter', '')}
        onChange={(v) => s('subfilter', v)}
        placeholder="Configuration identifier of the sub-filter (empty for none)"
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

  const outputTab = (
    <FieldGroup label="Extended Characters">
      <BoolField
        label="Escape extended characters"
        checked={val(formData, 'escapeExtendedChars', true)}
        onChange={(v) => s('escapeExtendedChars', v)}
        dirty={d('escapeExtendedChars')}
      />
    </FieldGroup>
  );

  return (
    <TabPanel tabs={[
      { id: 'options', label: 'Options', content: optionsTab },
      { id: 'inline', label: 'Inline Codes', content: inlineTab },
      { id: 'output', label: 'Output', content: outputTab },
    ]} />
  );
}
