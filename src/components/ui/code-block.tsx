import { useMemo } from 'react';

type Language = 'fprm' | 'json' | 'yaml';

interface CodeBlockProps {
  code: string;
  language?: Language;
  className?: string;
  /** Keys that are "dirty" (modified from baseline) — matching lines get highlighted */
  dirtyKeys?: Set<string>;
}

interface Token {
  text: string;
  type: 'comment' | 'key' | 'string' | 'number' | 'boolean' | 'punctuation' | 'plain' | 'type-suffix';
}

function tokenizeFprm(line: string): Token[] {
  // Comment line (#v1 etc)
  if (line.startsWith('#')) return [{ text: line, type: 'comment' }];
  const eq = line.indexOf('=');
  if (eq === -1) return [{ text: line, type: 'plain' }];

  const rawKey = line.slice(0, eq);
  const value = line.slice(eq + 1);
  // Split type suffix (.b, .i) from key
  const suffixMatch = rawKey.match(/^(.+?)(\.(?:b|i))$/);
  const tokens: Token[] = [];
  if (suffixMatch) {
    tokens.push({ text: suffixMatch[1], type: 'key' });
    tokens.push({ text: suffixMatch[2], type: 'type-suffix' });
  } else {
    tokens.push({ text: rawKey, type: 'key' });
  }
  tokens.push({ text: '=', type: 'punctuation' });

  if (value === 'true' || value === 'false') {
    tokens.push({ text: value, type: 'boolean' });
  } else if (/^-?\d+$/.test(value)) {
    tokens.push({ text: value, type: 'number' });
  } else {
    tokens.push({ text: value, type: 'string' });
  }
  return tokens;
}

function tokenizeJson(line: string): Token[] {
  const tokens: Token[] = [];
  const regex = /("(?:[^"\\]|\\.)*"\s*:)|("(?:[^"\\]|\\.)*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\btrue\b|\bfalse\b|\bnull\b)|([{}[\],:])/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(line)) !== null) {
    if (m.index > last) tokens.push({ text: line.slice(last, m.index), type: 'plain' });
    if (m[1]) {
      // key: value — split into key + colon
      const colon = m[1].lastIndexOf(':');
      tokens.push({ text: m[1].slice(0, colon), type: 'key' });
      tokens.push({ text: m[1].slice(colon), type: 'punctuation' });
    } else if (m[2]) tokens.push({ text: m[2], type: 'string' });
    else if (m[3]) tokens.push({ text: m[3], type: 'number' });
    else if (m[4]) tokens.push({ text: m[4], type: 'boolean' });
    else if (m[5]) tokens.push({ text: m[5], type: 'punctuation' });
    last = regex.lastIndex;
  }
  if (last < line.length) tokens.push({ text: line.slice(last), type: 'plain' });
  return tokens;
}

function tokenizeYaml(line: string): Token[] {
  // Comment
  if (line.trimStart().startsWith('#')) return [{ text: line, type: 'comment' }];
  const colon = line.indexOf(':');
  if (colon === -1) return [{ text: line, type: 'plain' }];

  const key = line.slice(0, colon);
  const rest = line.slice(colon + 1);
  const tokens: Token[] = [
    { text: key, type: 'key' },
    { text: ':', type: 'punctuation' },
  ];

  const val = rest.trim();
  if (!val) {
    tokens.push({ text: rest, type: 'plain' });
  } else if (val === 'true' || val === 'false') {
    tokens.push({ text: rest, type: 'boolean' });
  } else if (/^-?\d+(\.\d+)?$/.test(val)) {
    tokens.push({ text: rest, type: 'number' });
  } else if (val.startsWith("'") || val.startsWith('"')) {
    tokens.push({ text: rest, type: 'string' });
  } else {
    tokens.push({ text: rest, type: 'string' });
  }
  return tokens;
}

function tokenizeLine(line: string, language: Language): Token[] {
  switch (language) {
    case 'fprm': return tokenizeFprm(line);
    case 'json': return tokenizeJson(line);
    case 'yaml': return tokenizeYaml(line);
  }
}

const tokenColors: Record<Token['type'], string> = {
  comment: 'text-gray-400 italic',
  key: 'text-blue-600',
  string: 'text-green-700',
  number: 'text-amber-600',
  boolean: 'text-purple-600 font-semibold',
  punctuation: 'text-gray-500',
  plain: '',
  'type-suffix': 'text-gray-400',
};

/** Extract the property key from a line for dirty-matching */
function extractKey(line: string, language: Language): string | null {
  if (language === 'fprm') {
    if (line.startsWith('#')) return null;
    const eq = line.indexOf('=');
    if (eq === -1) return null;
    return line.slice(0, eq).replace(/\.(?:b|i)$/, '');
  }
  if (language === 'json') {
    const m = line.match(/^\s*"([^"]+)"\s*:/);
    return m ? m[1] : null;
  }
  // yaml
  if (line.trimStart().startsWith('#') || line.trimStart().startsWith('-')) return null;
  const colon = line.indexOf(':');
  if (colon === -1) return null;
  return line.slice(0, colon).trim();
}

export function CodeBlock({ code, language = 'fprm', className = '', dirtyKeys }: CodeBlockProps) {
  const rawLines = useMemo(() => code ? code.split('\n') : [], [code]);
  const lines = useMemo(() => {
    return rawLines.map(line => tokenizeLine(line, language));
  }, [rawLines, language]);

  const dirtyLineSet = useMemo(() => {
    if (!dirtyKeys || dirtyKeys.size === 0) return null;
    const set = new Set<number>();
    rawLines.forEach((line, i) => {
      const key = extractKey(line, language);
      if (key && dirtyKeys.has(key)) set.add(i);
    });
    return set.size > 0 ? set : null;
  }, [rawLines, language, dirtyKeys]);

  if (!code) {
    return (
      <div className={`bg-muted rounded-md p-4 text-sm text-muted-foreground font-mono ${className}`}>
        No configuration changes
      </div>
    );
  }

  const gutterWidth = String(lines.length).length;

  return (
    <div className={`bg-muted rounded-md text-sm overflow-auto max-h-96 font-mono ${className}`}>
      <table className="w-full border-collapse">
        <tbody>
          {lines.map((tokens, i) => {
            const isDirty = dirtyLineSet?.has(i);
            return (
            <tr key={i} className={`leading-relaxed ${isDirty ? 'bg-amber-50' : 'hover:bg-black/5'}`}>
              <td
                className={`select-none text-right pr-3 pl-3 border-r ${isDirty ? 'text-amber-600/70 border-amber-200' : 'text-muted-foreground/50 border-border/50'}`}
                style={{ minWidth: `${gutterWidth + 2}ch` }}
              >
                {i + 1}
              </td>
              <td className="pl-3 pr-4 whitespace-pre">
                {tokens.map((t, j) => (
                  <span key={j} className={tokenColors[t.type]}>{t.text}</span>
                ))}
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
