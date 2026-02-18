import { HelpPopover } from '@/components/ui/help-popover';
import type { ParamDoc } from '@/data/filterDocs';

interface ParamHelpProps {
  doc: ParamDoc;
}

/**
 * Renders a help popover for a parameter, showing wiki-sourced description,
 * notes/warnings, and dependency information.
 */
export function ParamHelp({ doc }: ParamHelpProps) {
  return (
    <HelpPopover>
      <p>{doc.description}</p>
      {doc.notes && doc.notes.length > 0 && (
        <div className="border-l-2 border-amber-400 pl-2 space-y-1">
          {doc.notes.map((note, i) => (
            <p key={i} className="text-amber-700">⚠ {note}</p>
          ))}
        </div>
      )}
      {doc.dependsOn && doc.dependsOn.length > 0 && (
        <div className="text-muted-foreground">
          {doc.dependsOn.map((dep, i) => (
            <p key={i}>
              Requires <code className="bg-muted px-1 rounded text-[10px]">{dep.property}</code> — {dep.condition}
            </p>
          ))}
        </div>
      )}
      {doc.introducedIn && (
        <p className="text-muted-foreground">Introduced in Okapi {doc.introducedIn}</p>
      )}
    </HelpPopover>
  );
}
