import { type EditorProps, TabPanel, FieldGroup, BoolField, TextField, CodeFinderSection, val, set } from './EditorShell';

export function OpenXmlEditor({ formData, onChange }: EditorProps) {
  const s = (k: string, v: unknown) => set(formData, onChange, k, v);

  const generalTab = (
    <div className="space-y-2">
      <FieldGroup label="Document Properties">
        <BoolField label="Translate document properties" checked={val(formData, 'translateDocProperties', true)} onChange={(v) => s('translateDocProperties', v)} />
        <BoolField label="Translate comments" checked={val(formData, 'translateComments', true)} onChange={(v) => s('translateComments', v)} />
      </FieldGroup>

      <FieldGroup label="Processing">
        <BoolField label="Aggressive cleanup" checked={val(formData, 'aggressiveCleanup', false)} onChange={(v) => s('aggressiveCleanup', v)} />
        <BoolField label="Automatic tag discovery" checked={val(formData, 'automaticWS', true)} onChange={(v) => s('automaticWS', v)} />
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
      />
    </FieldGroup>
  );

  const wordTab = (
    <div className="space-y-2">
      <FieldGroup label="Content Extraction">
        <BoolField label="Translate headers and footers" checked={val(formData, 'translateWordHeadersFooters', true)} onChange={(v) => s('translateWordHeadersFooters', v)} />
        <BoolField label="Translate hidden text" checked={val(formData, 'translateWordHidden', false)} onChange={(v) => s('translateWordHidden', v)} />
        <BoolField label="Translate footnotes/endnotes" checked={val(formData, 'translateWordFootnoteEndnote', true)} onChange={(v) => s('translateWordFootnoteEndnote', v)} />
      </FieldGroup>

      <FieldGroup label="Revision Handling">
        <BoolField label="Translate revisions" checked={val(formData, 'translateWordExcludeGraphicMetaData', false)} onChange={(v) => s('translateWordExcludeGraphicMetaData', v)} />
      </FieldGroup>

      <FieldGroup label="Style Filtering">
        <TextField
          label="Excluded styles (comma-separated)"
          value={val(formData, 'tsExcelExcludedStyles', '')}
          onChange={(v) => s('tsExcelExcludedStyles', v)}
          placeholder="Style1, Style2"
        />
      </FieldGroup>

      <FieldGroup label="Highlight Colors to Exclude">
        <TextField
          label="Highlight color values"
          value={val(formData, 'tsWordExcludedHighlightColors', '')}
          onChange={(v) => s('tsWordExcludedHighlightColors', v)}
          placeholder="yellow, green"
        />
      </FieldGroup>
    </div>
  );

  const powerpointTab = (
    <div className="space-y-2">
      <FieldGroup label="Content Extraction">
        <BoolField label="Translate diagram data" checked={val(formData, 'translatePowerpointDiagramData', false)} onChange={(v) => s('translatePowerpointDiagramData', v)} />
        <BoolField label="Translate charts" checked={val(formData, 'translatePowerpointCharts', false)} onChange={(v) => s('translatePowerpointCharts', v)} />
        <BoolField label="Translate notes" checked={val(formData, 'translatePowerpointNotes', true)} onChange={(v) => s('translatePowerpointNotes', v)} />
        <BoolField label="Translate slide masters" checked={val(formData, 'translatePowerpointMasters', false)} onChange={(v) => s('translatePowerpointMasters', v)} />
      </FieldGroup>
    </div>
  );

  const excelTab = (
    <div className="space-y-2">
      <FieldGroup label="Content Extraction">
        <BoolField label="Translate hidden cells" checked={val(formData, 'translateExcelHidden', false)} onChange={(v) => s('translateExcelHidden', v)} />
        <BoolField label="Translate sheet names" checked={val(formData, 'translateExcelSheetNames', false)} onChange={(v) => s('translateExcelSheetNames', v)} />
        <BoolField label="Translate diagram data" checked={val(formData, 'translateExcelDiagramData', false)} onChange={(v) => s('translateExcelDiagramData', v)} />
        <BoolField label="Translate drawing data" checked={val(formData, 'translateExcelDrawings', false)} onChange={(v) => s('translateExcelDrawings', v)} />
      </FieldGroup>

      <FieldGroup label="Processing">
        <TextField
          label="Subfilter for cell content"
          value={val(formData, 'tsExcelSubfilter', '')}
          onChange={(v) => s('tsExcelSubfilter', v)}
          placeholder="Filter ID"
        />
        <TextField
          label="Excluded colors (comma-separated)"
          value={val(formData, 'tsExcelExcludedColors', '')}
          onChange={(v) => s('tsExcelExcludedColors', v)}
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
