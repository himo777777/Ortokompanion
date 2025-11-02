import { useEffect } from 'react';

export type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
};

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

// Global keyboard shortcuts help modal
export const GLOBAL_SHORTCUTS = [
  { key: '1', description: 'Gå till Dagens Plan' },
  { key: '2', description: 'Gå till Progression' },
  { key: '3', description: 'Gå till Analytics' },
  { key: '4', description: 'Gå till AI-Handledare' },
  { key: '5', description: 'Gå till Fallstudier' },
  { key: '6', description: 'Gå till Frågebank' },
  { key: '7', description: 'Gå till Provexamen' },
  { key: '?', shift: true, description: 'Visa kortkommandon' },
  { key: 'k', ctrl: true, description: 'Snabbsök' },
];
