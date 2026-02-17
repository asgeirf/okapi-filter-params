import { type EditorProps, FieldGroup, BoolField, TextField, CodeFinderSection, val, set } from './EditorShell';
import { Card, CardContent } from '@/components/ui/card';

export function MarkdownEditor({ formData, onChange }: EditorProps) {
  const s = (k: string, v: unknown) => set(formData, onChange, k, v);

  return (
    <Card>
      <CardContent className="pt-4 space-y-2">
        <FieldGroup label="Extraction">
          <BoolField label="Translate URLs" checked={val(formData, 'translateUrls', false)} onChange={(v) => s('translateUrls', v)} />
          <BoolField label="Translate fenced code blocks" checked={val(formData, 'translateFencedCodeBlocks', false)} onChange={(v) => s('translateFencedCodeBlocks', v)} />
          <BoolField label="Translate indented code blocks" checked={val(formData, 'translateIndentedCodeBlocks', false)} onChange={(v) => s('translateIndentedCodeBlocks', v)} />
          <BoolField label="Translate inline code blocks" checked={val(formData, 'translateInlineCodeBlocks', false)} onChange={(v) => s('translateInlineCodeBlocks', v)} />
          <BoolField label="Translate header metadata" checked={val(formData, 'translateHeaderMetadata', false)} onChange={(v) => s('translateHeaderMetadata', v)} />
          <BoolField label="Translate image alt text" checked={val(formData, 'translateImageAltText', true)} onChange={(v) => s('translateImageAltText', v)} />
          <BoolField label="Translate MDX" checked={val(formData, 'translateMdx', false)} onChange={(v) => s('translateMdx', v)} />
          <BoolField label="Generate header anchors" checked={val(formData, 'generateHeaderAnchors', false)} onChange={(v) => s('generateHeaderAnchors', v)} />
        </FieldGroup>

        <FieldGroup label="Escaping">
          <BoolField label="HTML entities" checked={val(formData, 'htmlEntities', true)} onChange={(v) => s('htmlEntities', v)} />
          <BoolField label="Unescape backslash" checked={val(formData, 'unescapeBackslash', false)} onChange={(v) => s('unescapeBackslash', v)} />
          <TextField label="Characters to escape" value={val(formData, 'charactersToEscape', '')} onChange={(v) => s('charactersToEscape', v)} mono />
        </FieldGroup>

        <FieldGroup label="Subfilters">
          <TextField label="HTML subfilter ID" value={val(formData, 'htmlSubfilter', '')} onChange={(v) => s('htmlSubfilter', v)} />
          <TextField label="YAML subfilter ID" value={val(formData, 'yamlSubfilter', '')} onChange={(v) => s('yamlSubfilter', v)} />
          <TextField label="Non-translatable blocks" value={val(formData, 'nonTranslatableBlocks', '')} onChange={(v) => s('nonTranslatableBlocks', v)} mono />
        </FieldGroup>

        <FieldGroup label="Inline Codes">
          <CodeFinderSection
            formData={formData}
            onChange={onChange}
            useCodeFinderKey="useCodeFinder"
            codeFinderKey="codeFinderRules"
          />
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
