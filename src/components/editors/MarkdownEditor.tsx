import { type EditorProps, FieldGroup, BoolField, TextField, CodeFinderSection, val, set, isDirty } from './EditorShell';
import { Card, CardContent } from '@/components/ui/card';

export function MarkdownEditor({ formData, onChange, defaults }: EditorProps) {
  const s = (k: string, v: unknown) => set(formData, onChange, k, v);
  const d = (key: string) => isDirty(formData, defaults, key);
  const r = (key: string) => () => { if (defaults && key in defaults) set(formData, onChange, key, defaults[key]); };

  return (
    <Card>
      <CardContent className="pt-4 space-y-2">
        <FieldGroup label="Extraction">
          <BoolField label="Translate URLs" checked={val(formData, 'translateUrls', false)} onChange={(v) => s('translateUrls', v)} dirty={d('translateUrls')}
          onReset={r('translateUrls')} />
          <BoolField label="Translate fenced code blocks" checked={val(formData, 'translateFencedCodeBlocks', false)} onChange={(v) => s('translateFencedCodeBlocks', v)} dirty={d('translateFencedCodeBlocks')}
          onReset={r('translateFencedCodeBlocks')} />
          <BoolField label="Translate indented code blocks" checked={val(formData, 'translateIndentedCodeBlocks', false)} onChange={(v) => s('translateIndentedCodeBlocks', v)} dirty={d('translateIndentedCodeBlocks')}
          onReset={r('translateIndentedCodeBlocks')} />
          <BoolField label="Translate inline code blocks" checked={val(formData, 'translateInlineCodeBlocks', false)} onChange={(v) => s('translateInlineCodeBlocks', v)} dirty={d('translateInlineCodeBlocks')}
          onReset={r('translateInlineCodeBlocks')} />
          <BoolField label="Translate header metadata" checked={val(formData, 'translateHeaderMetadata', false)} onChange={(v) => s('translateHeaderMetadata', v)} dirty={d('translateHeaderMetadata')}
          onReset={r('translateHeaderMetadata')} />
          <BoolField label="Translate image alt text" checked={val(formData, 'translateImageAltText', true)} onChange={(v) => s('translateImageAltText', v)} dirty={d('translateImageAltText')}
          onReset={r('translateImageAltText')} />
          <BoolField label="Translate MDX" checked={val(formData, 'translateMdx', false)} onChange={(v) => s('translateMdx', v)} dirty={d('translateMdx')}
          onReset={r('translateMdx')} />
          <BoolField label="Generate header anchors" checked={val(formData, 'generateHeaderAnchors', false)} onChange={(v) => s('generateHeaderAnchors', v)} dirty={d('generateHeaderAnchors')}
          onReset={r('generateHeaderAnchors')} />
        </FieldGroup>

        <FieldGroup label="Escaping">
          <BoolField label="HTML entities" checked={val(formData, 'htmlEntities', true)} onChange={(v) => s('htmlEntities', v)} dirty={d('htmlEntities')}
          onReset={r('htmlEntities')} />
          <BoolField label="Unescape backslash" checked={val(formData, 'unescapeBackslash', false)} onChange={(v) => s('unescapeBackslash', v)} dirty={d('unescapeBackslash')}
          onReset={r('unescapeBackslash')} />
          <TextField label="Characters to escape" value={val(formData, 'charactersToEscape', '')} onChange={(v) => s('charactersToEscape', v)} mono dirty={d('charactersToEscape')}
          onReset={r('charactersToEscape')} />
        </FieldGroup>

        <FieldGroup label="Subfilters">
          <TextField label="HTML subfilter ID" value={val(formData, 'htmlSubfilter', '')} onChange={(v) => s('htmlSubfilter', v)} dirty={d('htmlSubfilter')}
          onReset={r('htmlSubfilter')} />
          <TextField label="YAML subfilter ID" value={val(formData, 'yamlSubfilter', '')} onChange={(v) => s('yamlSubfilter', v)} dirty={d('yamlSubfilter')}
          onReset={r('yamlSubfilter')} />
          <TextField label="Non-translatable blocks" value={val(formData, 'nonTranslatableBlocks', '')} onChange={(v) => s('nonTranslatableBlocks', v)} mono dirty={d('nonTranslatableBlocks')}
          onReset={r('nonTranslatableBlocks')} />
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
      </CardContent>
    </Card>
  );
}
