'use client';

import { useState } from 'react';
import { Domain, DOMAIN_LABELS } from '@/types/onboarding';
import { Plus, Trash2, Calendar } from 'lucide-react';

interface RotationEntry {
  id: string;
  domain: Domain;
  startDate: string; // YYYY-MM format
  endDate: string;   // YYYY-MM format
  hospital?: string;
}

interface RotationSetupProps {
  rotations: RotationEntry[];
  onChange: (rotations: RotationEntry[]) => void;
}

export default function RotationSetup({ rotations, onChange }: RotationSetupProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  const addRotation = () => {
    const newRotation: RotationEntry = {
      id: `rot-${Date.now()}`,
      domain: 'trauma',
      startDate: '',
      endDate: '',
    };
    onChange([...rotations, newRotation]);
    setShowAddForm(true);
  };

  const updateRotation = (id: string, updates: Partial<RotationEntry>) => {
    onChange(
      rotations.map(rot =>
        rot.id === id ? { ...rot, ...updates } : rot
      )
    );
  };

  const removeRotation = (id: string) => {
    onChange(rotations.filter(rot => rot.id !== id));
  };

  const domains: Domain[] = [
    'trauma',
    'axel-armbåge',
    'hand-handled',
    'rygg',
    'höft',
    'knä',
    'fot-fotled',
    'sport',
    'tumör'
  ];

  return (
    <div className="space-y-4">
      {/* Existing Rotations */}
      {rotations.map((rotation, index) => (
        <div key={rotation.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Rotation {index + 1}</h4>
            <button
              onClick={() => removeRotation(rotation.id)}
              className="text-red-600 hover:text-red-800 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Domain Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subspecialitet
              </label>
              <select
                value={rotation.domain}
                onChange={(e) => updateRotation(rotation.id, { domain: e.target.value as Domain })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {domains.map(domain => (
                  <option key={domain} value={domain}>
                    {DOMAIN_LABELS[domain]}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Startdatum
              </label>
              <input
                type="month"
                value={rotation.startDate}
                onChange={(e) => updateRotation(rotation.id, { startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slutdatum
              </label>
              <input
                type="month"
                value={rotation.endDate}
                onChange={(e) => updateRotation(rotation.id, { endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Hospital (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sjukhus (valfritt)
              </label>
              <input
                type="text"
                value={rotation.hospital || ''}
                onChange={(e) => updateRotation(rotation.id, { hospital: e.target.value })}
                placeholder="t.ex. Karolinska"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add Rotation Button */}
      <button
        onClick={addRotation}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        <span>Lägg till rotation</span>
      </button>

      {rotations.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          Lägg till dina rotationer för att få anpassat innehåll och mål för varje period
        </p>
      )}

      {rotations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Tips:</strong> Systemet kommer automatiskt att anpassa innehållet baserat på din nuvarande rotation och hur långt tid du har kvar.
          </p>
        </div>
      )}
    </div>
  );
}
