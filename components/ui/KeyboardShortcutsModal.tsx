'use client';

import { X, Keyboard } from 'lucide-react';
import { colors, borderRadius, spacing, shadows } from '@/lib/design-tokens';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { category: 'Navigation', items: [
      { keys: ['1'], description: 'Gå till Dagens Plan' },
      { keys: ['2'], description: 'Gå till Progression' },
      { keys: ['3'], description: 'Gå till Analytics' },
      { keys: ['4'], description: 'Gå till AI-Handledare' },
      { keys: ['5'], description: 'Gå till Fallstudier' },
      { keys: ['6'], description: 'Gå till Frågebank' },
      { keys: ['7'], description: 'Gå till Steg-för-Steg' },
      { keys: ['8'], description: 'Gå till Provexamen' },
      { keys: ['9'], description: 'Gå till Kvalitetskontroll' },
    ]},
    { category: 'Frågor & Svar', items: [
      { keys: ['h'], description: 'Visa hint' },
      { keys: ['n'], description: 'Nästa fråga' },
      { keys: ['p'], description: 'Föregående fråga' },
      { keys: ['Enter'], description: 'Skicka svar' },
      { keys: ['a', 'b', 'c', 'd'], description: 'Välj svarsalternativ A-D' },
    ]},
    { category: 'Allmänt', items: [
      { keys: ['f'], description: 'Öppna Fokustimer (Pomodoro)' },
      { keys: ['?'], description: 'Visa denna hjälp' },
      { keys: ['Ctrl', 'k'], description: 'Snabbsök (kommande)' },
      { keys: ['Esc'], description: 'Stäng modal/dialog' },
    ]},
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-scaleIn"
        style={{
          boxShadow: shadows.xl,
          padding: spacing[6],
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: colors.border.light }}>
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-lg"
              style={{ background: colors.primary[100] }}
            >
              <Keyboard className="w-6 h-6" style={{ color: colors.primary[600] }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
                Kortkommandon
              </h2>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                Navigera snabbare med tangentbordet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" style={{ color: colors.text.secondary }} />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-6">
          {shortcuts.map((section, idx) => (
            <div key={idx}>
              <h3
                className="text-sm font-semibold uppercase tracking-wide mb-3"
                style={{ color: colors.text.secondary }}
              >
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span style={{ color: colors.text.primary }}>
                      {shortcut.description}
                    </span>
                    <div className="flex gap-2">
                      {shortcut.keys.map((key, keyIdx) => (
                        <kbd
                          key={keyIdx}
                          className="px-3 py-1.5 text-sm font-semibold rounded shadow-sm"
                          style={{
                            background: colors.background.primary,
                            border: `2px solid ${colors.border.medium}`,
                            color: colors.text.primary,
                          }}
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="mt-6 pt-4 border-t text-center text-sm"
          style={{
            borderColor: colors.border.light,
            color: colors.text.secondary,
          }}
        >
          Tryck <kbd className="px-2 py-1 rounded bg-gray-100 border border-gray-300">?</kbd> när som helst för att visa denna hjälp
        </div>
      </div>
    </div>
  );
}
