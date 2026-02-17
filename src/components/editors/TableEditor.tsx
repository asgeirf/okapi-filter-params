import { type EditorProps, TabPanel, FieldGroup, BoolField, TextField, NumberField, SelectField, val, set } from './EditorShell';

export function TableEditor({ formData, onChange }: EditorProps) {
  const s = (k: string, v: unknown) => set(formData, onChange, k, v);

  const tableTab = (
    <div className="space-y-2">
      <FieldGroup label="Delimiters">
        <TextField label="Field delimiter" value={val(formData, 'fieldDelimiter', ',')} onChange={(v) => s('fieldDelimiter', v)} mono />
        <TextField label="Text qualifier" value={val(formData, 'textQualifier', '"')} onChange={(v) => s('textQualifier', v)} mono />
        <BoolField label="Remove qualifiers" checked={val(formData, 'removeQualifiers', true)} onChange={(v) => s('removeQualifiers', v)} />
        <SelectField
          label="Escaping mode"
          value={val(formData, 'escapingMode', 0)}
          options={[
            { value: 0, label: 'None' },
            { value: 1, label: 'Double qualifier' },
            { value: 2, label: 'Backslash' },
          ]}
          onChange={(v) => s('escapingMode', Number(v))}
        />
        <SelectField
          label="Add qualifiers"
          value={val(formData, 'addQualifiers', 0)}
          options={[
            { value: 0, label: 'Never' },
            { value: 1, label: 'When needed' },
            { value: 2, label: 'Always' },
          ]}
          onChange={(v) => s('addQualifiers', Number(v))}
        />
      </FieldGroup>

      <FieldGroup label="Row Detection">
        <NumberField label="Column names on line" value={val(formData, 'columnNamesLineNum', 1)} onChange={(v) => s('columnNamesLineNum', v)} min={0} />
        <NumberField label="Values start on line" value={val(formData, 'valuesStartLineNum', 2)} onChange={(v) => s('valuesStartLineNum', v)} min={1} />
        <SelectField
          label="Detect columns mode"
          value={val(formData, 'detectColumnsMode', 0)}
          options={[
            { value: 0, label: 'Auto' },
            { value: 1, label: 'Fixed number' },
          ]}
          onChange={(v) => s('detectColumnsMode', Number(v))}
        />
        <NumberField
          label="Number of columns"
          value={val(formData, 'numColumns', 1)}
          onChange={(v) => s('numColumns', v)}
          min={1}
          disabled={val(formData, 'detectColumnsMode', 0) === 0}
        />
      </FieldGroup>
    </div>
  );

  const columnsTab = (
    <div className="space-y-2">
      <FieldGroup label="Column Handling">
        <SelectField
          label="Send header mode"
          value={val(formData, 'sendHeaderMode', 1)}
          options={[
            { value: 0, label: 'Do not send' },
            { value: 1, label: 'Send as text unit' },
            { value: 2, label: 'Send as skeleton' },
          ]}
          onChange={(v) => s('sendHeaderMode', Number(v))}
        />
        <SelectField
          label="Send columns mode"
          value={val(formData, 'sendColumnsMode', 2)}
          options={[
            { value: 0, label: 'All columns' },
            { value: 1, label: 'Selected columns only' },
            { value: 2, label: 'Source and target' },
          ]}
          onChange={(v) => s('sendColumnsMode', Number(v))}
        />
      </FieldGroup>

      <FieldGroup label="Column Assignments">
        <TextField label="Source columns" value={val(formData, 'sourceColumns', '')} onChange={(v) => s('sourceColumns', v)} placeholder="e.g. 1,2" />
        <TextField label="Target columns" value={val(formData, 'targetColumns', '')} onChange={(v) => s('targetColumns', v)} placeholder="e.g. 3" />
        <TextField label="Source ID columns" value={val(formData, 'sourceIdColumns', '')} onChange={(v) => s('sourceIdColumns', v)} />
        <TextField label="Comment columns" value={val(formData, 'commentColumns', '')} onChange={(v) => s('commentColumns', v)} />
        <NumberField label="Record ID column" value={val(formData, 'recordIdColumn', 0)} onChange={(v) => s('recordIdColumn', v)} min={0} />
      </FieldGroup>

      <FieldGroup label="Target Languages">
        <TextField label="Target languages" value={val(formData, 'targetLanguages', '')} onChange={(v) => s('targetLanguages', v)} placeholder="Comma-separated language codes" />
        <TextField label="Target source refs" value={val(formData, 'targetSourceRefs', '')} onChange={(v) => s('targetSourceRefs', v)} />
        <TextField label="Source ID suffixes" value={val(formData, 'sourceIdSuffixes', '')} onChange={(v) => s('sourceIdSuffixes', v)} />
        <TextField label="Source ID source refs" value={val(formData, 'sourceIdSourceRefs', '')} onChange={(v) => s('sourceIdSourceRefs', v)} />
        <TextField label="Comment source refs" value={val(formData, 'commentSourceRefs', '')} onChange={(v) => s('commentSourceRefs', v)} />
      </FieldGroup>
    </div>
  );

  const optionsTab = (
    <div className="space-y-2">
      <FieldGroup label="Trimming">
        <BoolField label="Trim leading whitespace" checked={val(formData, 'trimLeading', true)} onChange={(v) => s('trimLeading', v)} />
        <BoolField label="Trim trailing whitespace" checked={val(formData, 'trimTrailing', true)} onChange={(v) => s('trimTrailing', v)} />
        <SelectField
          label="Trim mode"
          value={val(formData, 'trimMode', 1)}
          options={[
            { value: 0, label: 'None' },
            { value: 1, label: 'Standard' },
            { value: 2, label: 'Aggressive' },
          ]}
          onChange={(v) => s('trimMode', Number(v))}
        />
      </FieldGroup>

      <FieldGroup label="Processing">
        <BoolField label="Unescape source" checked={val(formData, 'unescapeSource', true)} onChange={(v) => s('unescapeSource', v)} />
        <BoolField label="Preserve whitespace" checked={val(formData, 'preserveWS', false)} onChange={(v) => s('preserveWS', v)} />
        <SelectField
          label="Wrap mode"
          value={val(formData, 'wrapMode', 0)}
          options={[
            { value: 0, label: 'None' },
            { value: 1, label: 'Before' },
            { value: 2, label: 'After' },
          ]}
          onChange={(v) => s('wrapMode', Number(v))}
        />
      </FieldGroup>

      <FieldGroup label="Inline Codes">
        <BoolField label="Use code finder" checked={val(formData, 'useCodeFinder', false)} onChange={(v) => s('useCodeFinder', v)} />
      </FieldGroup>
    </div>
  );

  return (
    <TabPanel tabs={[
      { id: 'table', label: 'Table', content: tableTab },
      { id: 'columns', label: 'Columns', content: columnsTab },
      { id: 'options', label: 'Options', content: optionsTab },
    ]} />
  );
}
