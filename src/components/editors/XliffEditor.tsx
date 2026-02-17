import { type EditorProps, TabPanel, FieldGroup, BoolField, TextField, SelectField, CodeFinderSection, val, set } from './EditorShell';

export function XliffEditor({ formData, onChange }: EditorProps) {
  const s = (k: string, v: unknown) => set(formData, onChange, k, v);
  const useIws = val(formData, 'useIwsXliffWriter', false);

  const optionsTab = (
    <div className="space-y-2">
      <FieldGroup label="XLIFF Processing">
        <BoolField label="Fall back to ID" checked={val(formData, 'fallbackToID', true)} onChange={(v) => s('fallbackToID', v)} />
        <BoolField label="Ignore input segmentation" checked={val(formData, 'ignoreInputSegmentation', false)} onChange={(v) => s('ignoreInputSegmentation', v)} />
        <BoolField label="Always use seg-source" checked={val(formData, 'alwaysUseSegSource', false)} onChange={(v) => s('alwaysUseSegSource', v)} />
        <BoolField label="Use SDL XLIFF writer" checked={val(formData, 'useSdlXliffWriter', false)} onChange={(v) => s('useSdlXliffWriter', v)} />
        <BoolField label="Escape greater-than sign" checked={val(formData, 'escapeGt', false)} onChange={(v) => s('escapeGt', v)} />
      </FieldGroup>

      <FieldGroup label="Output Segmentation">
        <SelectField
          label="Output segmentation type"
          value={val(formData, 'outputSegmentationType', 'ORIGINAL')}
          options={[
            { value: 'ORIGINAL', label: 'Original' },
            { value: 'SEGMENTED', label: 'Segmented' },
            { value: 'NOTSEGMENTED', label: 'Not Segmented' },
            { value: 'ASNEEDED', label: 'As Needed' },
          ]}
          onChange={(v) => s('outputSegmentationType', v)}
        />
      </FieldGroup>

      <FieldGroup label="Target Handling">
        <BoolField label="Add target language" checked={val(formData, 'addTargetLanguage', true)} onChange={(v) => s('addTargetLanguage', v)} />
        <BoolField label="Override target language" checked={val(formData, 'overrideTargetLanguage', false)} onChange={(v) => s('overrideTargetLanguage', v)} />
        <BoolField label="Allow empty targets" checked={val(formData, 'allowEmptyTargets', false)} onChange={(v) => s('allowEmptyTargets', v)} />
        <BoolField label="Always add targets" checked={val(formData, 'alwaysAddTargets', false)} onChange={(v) => s('alwaysAddTargets', v)} />
      </FieldGroup>

      <FieldGroup label="Content Processing">
        <BoolField label="Inline CDATA" checked={val(formData, 'inlineCdata', false)} onChange={(v) => s('inlineCdata', v)} />
        <BoolField label="Skip no-mrk seg-source" checked={val(formData, 'skipNoMrkSegSource', false)} onChange={(v) => s('skipNoMrkSegSource', v)} />
        <BoolField label="Preserve space by default" checked={val(formData, 'preserveSpaceByDefault', false)} onChange={(v) => s('preserveSpaceByDefault', v)} />
        <BoolField label="Include ITS" checked={val(formData, 'includeITS', false)} onChange={(v) => s('includeITS', v)} />
        <BoolField label="Balance codes" checked={val(formData, 'balanceCodes', false)} onChange={(v) => s('balanceCodes', v)} />
        <BoolField label="Add alt-trans" checked={val(formData, 'addAltTrans', false)} onChange={(v) => s('addAltTrans', v)} />
        <BoolField label="Force unique IDs" checked={val(formData, 'forceUniqueIds', false)} onChange={(v) => s('forceUniqueIds', v)} />
      </FieldGroup>

      <FieldGroup label="Custom Parser">
        <BoolField label="Use custom parser" checked={val(formData, 'useCustomParser', false)} onChange={(v) => s('useCustomParser', v)} />
        <TextField
          label="Custom parser factory class"
          value={val(formData, 'factoryClass', '')}
          onChange={(v) => s('factoryClass', v)}
          disabled={!val(formData, 'useCustomParser', false)}
          indent
          mono
        />
      </FieldGroup>

      <FieldGroup label="IWS Options">
        <BoolField label="Use IWS XLIFF writer" checked={useIws} onChange={(v) => s('useIwsXliffWriter', v)} />
        <BoolField label="Block finished" checked={val(formData, 'iwsBlockFinished', false)} onChange={(v) => s('iwsBlockFinished', v)} disabled={!useIws} indent />
        <BoolField label="Remove TM origin" checked={val(formData, 'iwsRemoveTmOrigin', false)} onChange={(v) => s('iwsRemoveTmOrigin', v)} disabled={!useIws} indent />
        <BoolField label="Block lock status" checked={val(formData, 'iwsBlockLockStatus', false)} onChange={(v) => s('iwsBlockLockStatus', v)} disabled={!useIws} indent />
        <BoolField label="Block TM score" checked={val(formData, 'iwsBlockTmScore', false)} onChange={(v) => s('iwsBlockTmScore', v)} disabled={!useIws} indent />
        <TextField label="TM score threshold" value={val(formData, 'iwsBlockTmScoreValue', '')} onChange={(v) => s('iwsBlockTmScoreValue', v)} disabled={!useIws || !val(formData, 'iwsBlockTmScore', false)} indent />
        <BoolField label="Include multiple exact" checked={val(formData, 'iwsIncludeMultipleExact', false)} onChange={(v) => s('iwsIncludeMultipleExact', v)} disabled={!useIws} indent />
        <BoolField label="Block multiple exact" checked={val(formData, 'iwsBlockMultipleExact', false)} onChange={(v) => s('iwsBlockMultipleExact', v)} disabled={!useIws} indent />
        <TextField label="Translation status" value={val(formData, 'iwsTransStatusValue', '')} onChange={(v) => s('iwsTransStatusValue', v)} disabled={!useIws} indent />
        <TextField label="Translation type" value={val(formData, 'iwsTransTypeValue', '')} onChange={(v) => s('iwsTransTypeValue', v)} disabled={!useIws} indent />
      </FieldGroup>
    </div>
  );

  const embeddedTab = (
    <div className="space-y-2">
      <FieldGroup label="Subfilters">
        <TextField label="CDATA subfilter ID" value={val(formData, 'cdataSubfilter', '')} onChange={(v) => s('cdataSubfilter', v)} />
        <TextField label="PCDATA subfilter ID" value={val(formData, 'pcdataSubfilter', '')} onChange={(v) => s('pcdataSubfilter', v)} />
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

  return (
    <TabPanel tabs={[
      { id: 'options', label: 'Options', content: optionsTab },
      { id: 'embedded', label: 'Embedded Content', content: embeddedTab },
    ]} />
  );
}
