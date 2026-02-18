import { useState, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';

interface HelpPopoverProps {
  children: ReactNode;
}

/**
 * A small help icon that shows a popover on click with rich content.
 * Uses a portal to avoid z-index / overflow clipping issues.
 */
export function HelpPopover({ children }: HelpPopoverProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left });
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="text-muted-foreground hover:text-foreground p-0.5 rounded-sm hover:bg-accent flex-shrink-0 inline-flex"
        title="Help"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
      {open && createPortal(
        <div
          ref={popoverRef}
          className="fixed z-[9999] w-72 bg-popover text-popover-foreground border rounded-md shadow-md p-3 text-xs space-y-2"
          style={{ top: pos.top, left: pos.left }}
        >
          {children}
        </div>,
        document.body
      )}
    </>
  );
}
