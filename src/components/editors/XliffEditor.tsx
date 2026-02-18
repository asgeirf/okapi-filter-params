import { type EditorProps, TabPanel, FieldGroup, BoolField, TextField, SelectField, CodeFinderSection, val, set, isDirty } from './EditorShell';

export function XliffEditor({ formData, onChange, defaults }: EditorProps) {
  const s = (k: string, v: unknown) => set(formData, onChange, k, v);
  const d = (key: string) => isDirty(formData, defaults, key);
  const useIws = val(formData, 'useIwsXliffWriter', false);

  const optionsTab = (
    <div className="space-y-2">
      <FieldGroup label="XLIFF Processing">
        <BoolField label="Fall back to ID" checked={val(formData, 'fallbackToID', true)} onChange={(v) => s('fallbackToID', v)} dirty={d('fallbackToID')} />
        <BoolField label="Ignore input segmentation" checked={val(formData, 'ignoreInputSegmentation', false)} onChange={(v) => s('ignoreInputSegmentation', v)} dirty={d('ignoreInputSegmentation')} />
        <BoolField label="Always use seg-source" checked={val(formData, 'alwaysUseSegSource', false)} onChange={(v) => s('alwaysUseSegSource', v)} dirty={d('alwaysUseSegSource')} />
        <BoolField label="Use SDL XLIFF writer" checked={val(formData, 'useSdlXliffWriter', false)} onChange={(v) => s('useSdlXliffWriter', v)} dirty={d('useSdlXliffWriter')} />
        <BoolField label="Escape greater-than sign" checked={val(formData, 'escapeGt', false)} onChange={(v) => s('escapeGt', v)} dirty={d('escapeGt')} />
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
          dirty={d('outputSegmentationType')}
        />
      </FieldGroup>

      <FieldGroup label="Target Handling">
        <BoolField label="Add target language" checked={val(formData, 'addTargetLanguage', true)} onChange={(v) => s('addTargetLanguage', v)} dirty={d('addTargetLanguage')} />
        <BoolField label="Override target language" checked={val(formData, 'overrideTargetLanguage', false)} onChange={(v) => s('overrideTargetLanguage', v)} dirty={d('overrideTargetLanguage')} />
        <BoolField label="Allow empty targets" checked={val(formData, 'allowEmptyTargets', false)} onChange={(v) => s('allowEmptyTargets', v)} dirty={d('allowEmptyTargets')} />
        <BoolField label="Always add targets" checked={val(formData, 'alwaysAddTargets', false)} onChange={(v) => s('alwaysAddTargets', v)} dirty={d('alwaysAddTargets')} />
      </FieldGroup>

      <FieldGroup label="Content Processing">
        <BoolField label="Inline CDATA" checked={val(formData, 'inlineCdata', false)} onChange={(v) => s('inlineCdata', v)} dirty={d('inlineCdata')} />
        <BoolField label="Skip no-mrk seg-source" checked={val(formData, 'skipNoMrkSegSource', false)} onChange={(v) => s('skipNoMrkSegSource', v)} dirty={d('skipNoMrkSegSource')} />
        <BoolField label="Preserve space by default" checked={val(formData, 'preserveSpaceByDefault', false)} onChange={(v) => s('preserveSpaceByDefault', v)} dirty={d('preserveSpaceByDefault')} />
        <BoolField label="Include ITS" checked={val(formData, 'includeITS', false)} onChange={(v) => s('includeITS', v)} dirty={d('includeITS')} />
        <BoolField label="Balance codes" checked={val(formData, 'balanceCodes', false)} onChange={(v) => s('balanceCodes', v)} dirty={d('balanceCodes')} />
        <BoolField label="Add alt-trans" checked={val(formData, 'addAltTrans', false)} onChange={(v) => s('addAltTrans', v)} dirty={d('addAltTrans')} />
        <BoolField label="Force unique IDs" checked={val(formData, 'forceUniqueIds', false)} onChange={(v) => s('forceUniqueIds', v)} dirty={d('forceUniqueIds')} />
      </FieldGroup>

      <FieldGroup label="Custom Parser">
        <BoolField label="Use custom parser" checked={val(formData, 'useCustomParser', false)} onChange={(v) => s('useCustomParser', v)} dirty={d('useCustomParser')} />
        <TextField
          label="Custom parser factory class"
          value={val(formData, 'factoryClass', '')}
          onChange={(v) => s('factoryClass', v)}
          disabled={!val(formData, 'useCustomParser', false)}
          indent
          mono
          dirty={d('factoryClass')}
        />
      </FieldGroup>

      <FieldGroup label="IWS Options">
        <BoolField label="Use IWS XLIFF writer" checked={useIws} onChange={(v) => s('useIwsXliffWriter', v)} />
        <BoolField label="Block finished" checked={val(formData, 'iwsBlockFinished', false)} onChange={(v) => s('iwsBlockFinished', v)} disabled={!useIws} indent dirty={d('iwsBlockFinished')} />
        <BoolField label="Remove TM origin" checked={val(formData, 'iwsRemoveTmOrigin', false)} onChange={(v) => s('iwsRemoveTmOrigin', v)} disabled={!useIws} indent dirty={d('iwsRemoveTmOrigin')} />
        <BoolField label="Block lock status" checked={val(formData, 'iwsBlockLockStatus', false)} onChange={(v) => s('iwsBlockLockStatus', v)} disabled={!useIws} indent dirty={d('iwsBlockLockStatus')} />
        <BoolField label="Block TM score" checked={val(formData, 'iwsBlockTmScore', false)} onChange={(v) => s('iwsBlockTmScore', v)} disabled={!useIws} indent dirty={d('iwsBlockTmScore')} />
        <TextField label="TM score threshold" value={val(formData, 'iwsBlockTmScoreValue', '')} onChange={(v) => s('iwsBlockTmScoreValue', v)} disabled={!useIws || !val(formData, 'iwsBlockTmScore', false)} indent dirty={d('iwsBlockTmScoreValue')} />
        <BoolField label="Include multiple exact" checked={val(formData, 'iwsIncludeMultipleExact', false)} onChange={(v) => s('iwsIncludeMultipleExact', v)} disabled={!useIws} indent dirty={d('iwsIncludeMultipleExact')} />
        <BoolField label="Block multiple exact" checked={val(formData, 'iwsBlockMultipleExact', false)} onChange={(v) => s('iwsBlockMultipleExact', v)} disabled={!useIws} indent dirty={d('iwsBlockMultipleExact')} />
        <TextField label="Translation status" value={val(formData, 'iwsTransStatusValue', '')} onChange={(v) => s('iwsTransStatusValue', v)} disabled={!useIws} indent dirty={d('iwsTransStatusValue')} />
        <TextField label="Translation type" value={val(formData, 'iwsTransTypeValue', '')} onChange={(v) => s('iwsTransTypeValue', v)} disabled={!useIws} indent dirty={d('iwsTransTypeValue')} />
      </FieldGroup>
    </div>
  );

  const embeddedTab = (
    <div className="space-y-2">
      <FieldGroup label="Subfilters">
        <TextField label="CDATA subfilter ID" value={val(formData, 'cdataSubfilter', '')} onChange={(v) => s('cdataSubfilter', v)} dirty={d('cdataSubfilter')} />
        <TextField label="PCDATA subfilter ID" value={val(formData, 'pcdataSubfilter', '')} onChange={(v) => s('pcdataSubfilter', v)} dirty={d('pcdataSubfilter')} />
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

  return (
    <TabPanel tabs={[
      { id: 'options', label: 'Options', content: optionsTab },
      { id: 'embedded', label: 'Embedded Content', content: embeddedTab },
    ]} />
  );
}
