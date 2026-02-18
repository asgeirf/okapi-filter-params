import { type EditorProps, TabPanel, FieldGroup, BoolField, TextField, CodeFinderSection, val, set, isDirty } from './EditorShell';

export function OpenXmlEditor({ formData, onChange, defaults }: EditorProps) {
  const s = (k: string, v: unknown) => set(formData, onChange, k, v);
  const d = (key: string) => isDirty(formData, defaults, key);

  const generalTab = (
    <div className="space-y-2">
      <FieldGroup label="Document Properties">
        <BoolField label="Translate document properties" checked={val(formData, 'translateDocProperties', true)} onChange={(v) => s('translateDocProperties', v)} dirty={d('translateDocProperties')} />
        <BoolField label="Translate comments" checked={val(formData, 'translateComments', true)} onChange={(v) => s('translateComments', v)} dirty={d('translateComments')} />
      </FieldGroup>

      <FieldGroup label="Processing">
        <BoolField label="Aggressive cleanup" checked={val(formData, 'aggressiveCleanup', false)} onChange={(v) => s('aggressiveCleanup', v)} dirty={d('aggressiveCleanup')} />
        <BoolField label="Automatic tag discovery" checked={val(formData, 'automaticWS', true)} onChange={(v) => s('automaticWS', v)} dirty={d('automaticWS')} />
      </FieldGroup>
    </div>
  );

  const codeTab = (
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

  const wordTab = (
    <div className="space-y-2">
      <FieldGroup label="Content Extraction">
        <BoolField label="Translate headers and footers" checked={val(formData, 'translateWordHeadersFooters', true)} onChange={(v) => s('translateWordHeadersFooters', v)} dirty={d('translateWordHeadersFooters')} />
        <BoolField label="Translate hidden text" checked={val(formData, 'translateWordHidden', false)} onChange={(v) => s('translateWordHidden', v)} dirty={d('translateWordHidden')} />
        <BoolField label="Translate footnotes/endnotes" checked={val(formData, 'translateWordFootnoteEndnote', true)} onChange={(v) => s('translateWordFootnoteEndnote', v)} dirty={d('translateWordFootnoteEndnote')} />
      </FieldGroup>

      <FieldGroup label="Revision Handling">
        <BoolField label="Translate revisions" checked={val(formData, 'translateWordExcludeGraphicMetaData', false)} onChange={(v) => s('translateWordExcludeGraphicMetaData', v)} dirty={d('translateWordExcludeGraphicMetaData')} />
      </FieldGroup>

      <FieldGroup label="Style Filtering">
        <TextField
          label="Excluded styles (comma-separated)"
          value={val(formData, 'tsExcelExcludedStyles', '')}
          onChange={(v) => s('tsExcelExcludedStyles', v)}
          placeholder="Style1, Style2"
          dirty={d('tsExcelExcludedStyles')}
        />
      </FieldGroup>

      <FieldGroup label="Highlight Colors to Exclude">
        <TextField
          label="Highlight color values"
          value={val(formData, 'tsWordExcludedHighlightColors', '')}
          onChange={(v) => s('tsWordExcludedHighlightColors', v)}
          placeholder="yellow, green"
          dirty={d('tsWordExcludedHighlightColors')}
        />
      </FieldGroup>
    </div>
  );

  const powerpointTab = (
    <div className="space-y-2">
      <FieldGroup label="Content Extraction">
        <BoolField label="Translate diagram data" checked={val(formData, 'translatePowerpointDiagramData', false)} onChange={(v) => s('translatePowerpointDiagramData', v)} dirty={d('translatePowerpointDiagramData')} />
        <BoolField label="Translate charts" checked={val(formData, 'translatePowerpointCharts', false)} onChange={(v) => s('translatePowerpointCharts', v)} dirty={d('translatePowerpointCharts')} />
        <BoolField label="Translate notes" checked={val(formData, 'translatePowerpointNotes', true)} onChange={(v) => s('translatePowerpointNotes', v)} dirty={d('translatePowerpointNotes')} />
        <BoolField label="Translate slide masters" checked={val(formData, 'translatePowerpointMasters', false)} onChange={(v) => s('translatePowerpointMasters', v)} dirty={d('translatePowerpointMasters')} />
      </FieldGroup>
    </div>
  );

  const excelTab = (
    <div className="space-y-2">
      <FieldGroup label="Content Extraction">
        <BoolField label="Translate hidden cells" checked={val(formData, 'translateExcelHidden', false)} onChange={(v) => s('translateExcelHidden', v)} dirty={d('translateExcelHidden')} />
        <BoolField label="Translate sheet names" checked={val(formData, 'translateExcelSheetNames', false)} onChange={(v) => s('translateExcelSheetNames', v)} dirty={d('translateExcelSheetNames')} />
        <BoolField label="Translate diagram data" checked={val(formData, 'translateExcelDiagramData', false)} onChange={(v) => s('translateExcelDiagramData', v)} dirty={d('translateExcelDiagramData')} />
        <BoolField label="Translate drawing data" checked={val(formData, 'translateExcelDrawings', false)} onChange={(v) => s('translateExcelDrawings', v)} dirty={d('translateExcelDrawings')} />
      </FieldGroup>

      <FieldGroup label="Processing">
        <TextField
          label="Subfilter for cell content"
          value={val(formData, 'tsExcelSubfilter', '')}
          onChange={(v) => s('tsExcelSubfilter', v)}
          placeholder="Filter ID"
          dirty={d('tsExcelSubfilter')}
        />
        <TextField
          label="Excluded colors (comma-separated)"
          value={val(formData, 'tsExcelExcludedColors', '')}
          onChange={(v) => s('tsExcelExcludedColors', v)}
          dirty={d('tsExcelExcludedColors')}
        />
      </FieldGroup>
    </div>
  );

  return (
    <TabPanel tabs={[
      { id: 'general', label: 'General', content: generalTab },
      { id: 'code', label: 'Code Finding', content: codeTab },
      { id: 'word', label: 'Word', content: wordTab },
      { id: 'powerpoint', label: 'PowerPoint', content: powerpointTab },
      { id: 'excel', label: 'Excel', content: excelTab },
    ]} />
  );
}
