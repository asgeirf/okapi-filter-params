import type { ComponentType } from 'react';
import type { EditorProps } from './EditorShell';
import { JsonEditor } from './JsonEditor';
import { XliffEditor } from './XliffEditor';
import { MarkdownEditor } from './MarkdownEditor';
import { MifEditor } from './MifEditor';
import { OpenOfficeEditor } from './OpenOfficeEditor';
import { OpenXmlEditor } from './OpenXmlEditor';
import { PoEditor } from './PoEditor';
import { PropertiesEditor } from './PropertiesEditor';
import { RegexEditor } from './RegexEditor';
import { TableEditor } from './TableEditor';
import { TsEditor } from './TsEditor';
import { IdmlEditor } from './IdmlEditor';
import { PlaintextEditor } from './PlaintextEditor';

export type { EditorProps };

/**
 * Map of filter IDs to their dedicated React editor components.
 * These mirror the SWT-based editors from okapi-java.
 */
const editorRegistry: Record<string, ComponentType<EditorProps>> = {
  okf_json: JsonEditor,
  okf_xliff: XliffEditor,
  okf_markdown: MarkdownEditor,
  okf_mif: MifEditor,
  okf_openoffice: OpenOfficeEditor,
  okf_openxml: OpenXmlEditor,
  okf_po: PoEditor,
  okf_properties: PropertiesEditor,
  okf_regex: RegexEditor,
  okf_table: TableEditor,
  okf_table_csv: TableEditor,
  okf_table_tsv: TableEditor,
  okf_table_fwc: TableEditor,
  okf_ts: TsEditor,
  okf_idml: IdmlEditor,
  okf_plaintext: PlaintextEditor,
  // Table sub-filters also use the table editor
  okf_commaseparatedvalues: TableEditor,
  okf_tabseparatedvalues: TableEditor,
  okf_fixedwidthcolumns: TableEditor,
};

/**
 * Get the dedicated editor component for a filter, if one exists.
 */
export function getEditor(filterId: string): ComponentType<EditorProps> | undefined {
  return editorRegistry[filterId];
}

/**
 * Check if a dedicated editor exists for the given filter ID.
 */
export function hasEditor(filterId: string): boolean {
  return filterId in editorRegistry;
}
