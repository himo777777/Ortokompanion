'use client';

/**
 * RotationManager Component
 * Allows ST-läkare to add, edit, and delete rotations
 * Used in Settings page
 */

import { useState } from 'react';
import { Rotation, RotationTimeline, getRotationStatus } from '@/types/rotation';
import { Domain, DOMAIN_LABELS } from '@/types/onboarding';
import { Plus, Trash2, Edit2, Calendar, Save, X } from 'lucide-react';

interface RotationManagerProps {
  rotationTimeline: RotationTimeline;
  onUpdate: (timeline: RotationTimeline) => void;
}

interface RotationFormData {
  domain: Domain;
  startDate: string; // YYYY-MM
  endDate: string; // YYYY-MM
  hospital?: string;
  supervisor?: string;
  notes?: string;
}

export default function RotationManager({ rotationTimeline, onUpdate }: RotationManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddRotation = (formData: RotationFormData) => {
    const startDate = new Date(formData.startDate + '-01');
    const endDate = new Date(formData.endDate + '-01');
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0); // Last day of month

    const newRotation: Rotation = {
      id: `rot-${Date.now()}`,
      domain: formData.domain,
      startDate,
      endDate,
      status: getRotationStatus(startDate, endDate),
      goals: [], // Will be auto-assigned by system
      progress: 0,
      hospital: formData.hospital,
      supervisor: formData.supervisor,
      notes: formData.notes,
    };

    const updatedTimeline: RotationTimeline = {
      rotations: [...rotationTimeline.rotations, newRotation],
      currentRotationId: rotationTimeline.currentRotationId,
    };

    // Update current rotation if new one is current
    if (newRotation.status === 'current') {
      updatedTimeline.currentRotationId = newRotation.id;
    }

    onUpdate(updatedTimeline);
    setIsAdding(false);
  };

  const handleUpdateRotation = (id: string, formData: RotationFormData) => {
    const startDate = new Date(formData.startDate + '-01');
    const endDate = new Date(formData.endDate + '-01');
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);

    const updatedRotations = rotationTimeline.rotations.map(rotation => {
      if (rotation.id === id) {
        return {
          ...rotation,
          domain: formData.domain,
          startDate,
          endDate,
          status: getRotationStatus(startDate, endDate),
          hospital: formData.hospital,
          supervisor: formData.supervisor,
          notes: formData.notes,
        };
      }
      return rotation;
    });

    // Recalculate current rotation
    const currentRotation = updatedRotations.find(r => r.status === 'current');

    onUpdate({
      rotations: updatedRotations,
      currentRotationId: currentRotation?.id,
    });

    setEditingId(null);
  };

  const handleDeleteRotation = (id: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna rotation?')) return;

    const updatedRotations = rotationTimeline.rotations.filter(r => r.id !== id);
    const currentRotation = updatedRotations.find(r => r.status === 'current');

    onUpdate({
      rotations: updatedRotations,
      currentRotationId: currentRotation?.id,
    });
  };

  // Sort rotations: current first, then upcoming by date, then completed by date (newest first)
  const sortedRotations = [...rotationTimeline.rotations].sort((a, b) => {
    if (a.status === 'current' && b.status !== 'current') return -1;
    if (a.status !== 'current' && b.status === 'current') return 1;
    if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
    if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;
    if (a.status === 'upcoming' && b.status === 'upcoming') {
      return a.startDate.getTime() - b.startDate.getTime();
    }
    return b.endDate.getTime() - a.endDate.getTime();
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Mina rotationer</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Lägg till rotation</span>
        </button>
      </div>

      {/* Add New Rotation Form */}
      {isAdding && (
        <RotationForm
          onSave={handleAddRotation}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {/* Rotation List */}
      <div className="space-y-3">
        {sortedRotations.map(rotation => {
          if (editingId === rotation.id) {
            return (
              <RotationForm
                key={rotation.id}
                rotation={rotation}
                onSave={(formData) => handleUpdateRotation(rotation.id, formData)}
                onCancel={() => setEditingId(null)}
              />
            );
          }

          return (
            <RotationCard
              key={rotation.id}
              rotation={rotation}
              onEdit={() => setEditingId(rotation.id)}
              onDelete={() => handleDeleteRotation(rotation.id)}
            />
          );
        })}

        {sortedRotations.length === 0 && !isAdding && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 mb-4">Inga rotationer tillagda ännu</p>
            <button
              onClick={() => setIsAdding(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Lägg till din första rotation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Rotation Card (Display)
 */
function RotationCard({
  rotation,
  onEdit,
  onDelete
}: {
  rotation: Rotation;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const statusColors = {
    current: 'bg-green-100 text-green-800 border-green-300',
    upcoming: 'bg-blue-100 text-blue-800 border-blue-300',
    completed: 'bg-gray-100 text-gray-700 border-gray-300',
  };

  const statusLabels = {
    current: 'Pågående',
    upcoming: 'Kommande',
    completed: 'Slutförd',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-lg font-semibold text-gray-900">
              {DOMAIN_LABELS[rotation.domain]}
            </h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[rotation.status]}`}>
              {statusLabels[rotation.status]}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {rotation.startDate.toLocaleDateString('sv-SE', { month: 'short', year: 'numeric' })} - {rotation.endDate.toLocaleDateString('sv-SE', { month: 'short', year: 'numeric' })}
            </span>
          </div>
          {rotation.hospital && (
            <p className="text-sm text-gray-600 mt-1">📍 {rotation.hospital}</p>
          )}
          {rotation.supervisor && (
            <p className="text-sm text-gray-600 mt-1">👤 {rotation.supervisor}</p>
          )}
          {rotation.notes && (
            <p className="text-sm text-gray-500 mt-2 italic">{rotation.notes}</p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Redigera"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Ta bort"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {rotation.status === 'current' && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Framsteg</span>
            <span className="font-semibold text-gray-900">{Math.round(rotation.progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="h-2 rounded-full bg-green-500 transition-all"
              style={{ width: `${Math.min(rotation.progress, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Rotation Form (Add/Edit)
 */
function RotationForm({
  rotation,
  onSave,
  onCancel
}: {
  rotation?: Rotation;
  onSave: (formData: RotationFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<RotationFormData>({
    domain: rotation?.domain || 'trauma',
    startDate: rotation ? rotation.startDate.toISOString().slice(0, 7) : '',
    endDate: rotation ? rotation.endDate.toISOString().slice(0, 7) : '',
    hospital: rotation?.hospital || '',
    supervisor: rotation?.supervisor || '',
    notes: rotation?.notes || '',
  });

  const domains: Domain[] = [
    'trauma',
    'höft',
    'knä',
    'fot-fotled',
    'hand-handled',
    'axel-armbåge',
    'rygg',
    'sport',
    'tumör',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate) {
      alert('Vänligen fyll i start- och slutdatum');
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg border border-gray-300 p-4">
      <h4 className="font-semibold text-gray-900 mb-4">
        {rotation ? 'Redigera rotation' : 'Ny rotation'}
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Domain */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Område *
          </label>
          <select
            value={formData.domain}
            onChange={(e) => setFormData({ ...formData, domain: e.target.value as Domain })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
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
            Startdatum *
          </label>
          <input
            type="month"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slutdatum *
          </label>
          <input
            type="month"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Hospital */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sjukhus (valfritt)
          </label>
          <input
            type="text"
            value={formData.hospital}
            onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
            placeholder="t.ex. Karolinska"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Supervisor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Handledare (valfritt)
          </label>
          <input
            type="text"
            value={formData.supervisor}
            onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
            placeholder="t.ex. Dr. Andersson"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Anteckningar (valfritt)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="T.ex. fokusområden, särskilda mål..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-300">
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Spara</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Avbryt</span>
        </button>
      </div>
    </form>
  );
}
