import { type EditorProps, TabPanel, FieldGroup, BoolField, TextField, RadioGroup, CodeFinderSection, val, set, isDirty } from './EditorShell';

export function JsonEditor({ formData, onChange, defaults }: EditorProps) {
  const s = (k: string, v: unknown) => set(formData, onChange, k, v);
  const d = (key: string) => isDirty(formData, defaults, key);

  const optionsTab = (
    <div className="space-y-2">
      <FieldGroup label="Standalone Strings">
        <BoolField
          label="Extract standalone strings"
          checked={val(formData, 'extractStandalone', true)}
          onChange={(v) => s('extractStandalone', v)}
          dirty={d('extractStandalone')}
        />
      </FieldGroup>

      <FieldGroup label="Key-Value Pairs">
        <RadioGroup
          value={val(formData, 'extractAllPairs', true) ? 'all' : 'none'}
          options={[
            { value: 'all', label: 'Extract all pairs' },
            { value: 'none', label: "Don't extract pairs" },
          ]}
          onChange={(v) => s('extractAllPairs', v === 'all')}
          dirty={d('extractAllPairs')}
        />
        <TextField
          label="Exceptions (regex)"
          value={val(formData, 'exceptions', '')}
          onChange={(v) => s('exceptions', v)}
          mono
          placeholder="Regular expression for exceptions"
          dirty={d('exceptions')}
        />
        <BoolField
          label="Use key as resource name"
          checked={val(formData, 'useKeyAsName', true)}
          onChange={(v) => s('useKeyAsName', v)}
          dirty={d('useKeyAsName')}
        />
        <BoolField
          label="Use full key path"
          checked={val(formData, 'useFullKeyPath', true)}
          onChange={(v) => s('useFullKeyPath', v)}
          dirty={d('useFullKeyPath')}
        />
        <BoolField
          label="Use leading slash on key path"
          checked={val(formData, 'useLeadingSlashOnKeyPath', false)}
          onChange={(v) => s('useLeadingSlashOnKeyPath', v)}
          disabled={!val(formData, 'useFullKeyPath', true)}
          indent
          dirty={d('useLeadingSlashOnKeyPath')}
        />
        <BoolField
          label="Use ID stack"
          checked={val(formData, 'useIdStack', false)}
          onChange={(v) => s('useIdStack', v)}
          dirty={d('useIdStack')}
        />
      </FieldGroup>

      <FieldGroup label="Metadata Rules">
        <TextField label="Note rules" value={val(formData, 'noteRules', '')} onChange={(v) => s('noteRules', v)} mono dirty={d('noteRules')} />
        <TextField label="Generic metadata rules" value={val(formData, 'genericMetadataRules', '')} onChange={(v) => s('genericMetadataRules', v)} mono dirty={d('genericMetadataRules')} />
        <TextField label="ID rules" value={val(formData, 'idRules', '')} onChange={(v) => s('idRules', v)} mono dirty={d('idRules')} />
        <TextField label="Extraction rules" value={val(formData, 'extractionRules', '')} onChange={(v) => s('extractionRules', v)} mono dirty={d('extractionRules')} />
        <TextField label="Max width rules" value={val(formData, 'maxwidthRules', '')} onChange={(v) => s('maxwidthRules', v)} mono dirty={d('maxwidthRules')} />
        <TextField label="Max width size unit" value={val(formData, 'maxwidthSizeUnit', '')} onChange={(v) => s('maxwidthSizeUnit', v)} dirty={d('maxwidthSizeUnit')} />
      </FieldGroup>
    </div>
  );

  const contentTab = (
    <div className="space-y-2">
      <FieldGroup label="Encoding Settings">
        <BoolField
          label="Escape forward slashes"
          checked={val(formData, 'escapeForwardSlashes', false)}
          onChange={(v) => s('escapeForwardSlashes', v)}
          dirty={d('escapeForwardSlashes')}
        />
      </FieldGroup>

      <FieldGroup label="Content Settings">
        <RadioGroup
          value={val(formData, 'useCodeFinder', false) ? 'codefinder' : 'subfilter'}
          options={[
            { value: 'subfilter', label: 'Use subfilter' },
            { value: 'codefinder', label: 'Use inline code finder' },
          ]}
          onChange={(v) => s('useCodeFinder', v === 'codefinder')}
          dirty={d('useCodeFinder')}
        />
        {!val(formData, 'useCodeFinder', false) && (
          <>
            <TextField label="Subfilter ID" value={val(formData, 'subfilter', '')} onChange={(v) => s('subfilter', v)} indent dirty={d('subfilter')} />
            <TextField label="Subfilter rules" value={val(formData, 'subfilterRules', '')} onChange={(v) => s('subfilterRules', v)} mono indent dirty={d('subfilterRules')} />
          </>
        )}
        {val(formData, 'useCodeFinder', false) && (
          <CodeFinderSection
            formData={formData}
            onChange={onChange}
            useCodeFinderKey="useCodeFinder"
            codeFinderKey="codeFinderRules"
            defaults={defaults}
          />
        )}
      </FieldGroup>
    </div>
  );

  return (
    <TabPanel tabs={[
      { id: 'options', label: 'Options', content: optionsTab },
      { id: 'content', label: 'Content Processing', content: contentTab },
    ]} />
  );
}
