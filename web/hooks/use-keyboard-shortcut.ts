import { useEffect } from 'react';

type Modifier = 'ctrl' | 'meta' | 'shift' | 'alt';

interface ShortcutOptions {
  key: string;
  modifiers?: Modifier[];
  onTrigger: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcut({
  key,
  modifiers = [],
  onTrigger,
  enabled = true,
}: ShortcutOptions) {
  useEffect(() => {
    if (!enabled) return;

    function handler(e: KeyboardEvent) {
      const modMatch =
        modifiers.every((mod) => {
          if (mod === 'ctrl') return e.ctrlKey;
          if (mod === 'meta') return e.metaKey;
          if (mod === 'shift') return e.shiftKey;
          if (mod === 'alt') return e.altKey;
          return false;
        }) &&
        (modifiers.length === 0 || true);

      const ctrlOrMeta =
        modifiers.includes('ctrl') || modifiers.includes('meta') ? e.ctrlKey || e.metaKey : true;

      if (e.key.toLowerCase() === key.toLowerCase() && ctrlOrMeta) {
        if (modifiers.includes('shift') && !e.shiftKey) return;
        e.preventDefault();
        onTrigger();
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, modifiers, onTrigger, enabled]);
}
