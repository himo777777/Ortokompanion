'use client';

import { useState } from 'react';
import { Domain, DOMAIN_LABELS } from '@/types/onboarding';
import { Calendar, Info } from 'lucide-react';

interface PlacementSetupProps {
  userType: 'student' | 'at' | 'st-other'; // st-other = st-allmänmedicin or st-akutsjukvård
  placementTiming?: 'current' | 'soon' | 'later' | 'none';
  startDate?: string;
  endDate?: string;
  focusDomain?: Domain;
  hospital?: string;
  onTimingChange: (timing: 'current' | 'soon' | 'later' | 'none') => void;
  onDatesChange: (startDate: string, endDate: string) => void;
  onFocusDomainChange: (domain?: Domain) => void;
  onHospitalChange: (hospital: string) => void;
}

export default function PlacementSetup({
  userType,
  placementTiming,
  startDate,
  endDate,
  focusDomain,
  hospital,
  onTimingChange,
  onDatesChange,
  onFocusDomainChange,
  onHospitalChange,
}: PlacementSetupProps) {
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

  const getTitle = () => {
    if (userType === 'student') return 'När har du din ortopedi-placering?';
    if (userType === 'at') return 'När har du ortopedi i din AT?';
    return 'När har du din ortopedi-rotation?';
  };

  const getDescription = () => {
    if (userType === 'student') {
      return 'Detta hjälper oss anpassa innehållet för din läkarexamen och kliniska placering';
    }
    if (userType === 'at') {
      return 'Vi anpassar innehållet för AT-examen och jour-förberedelser';
    }
    return 'Vi anpassar innehållet för din placering och Socialstyrelsens krav';
  };

  return (
    <div className="space-y-6">
      {/* Timing Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{getTitle()}</h3>
        <p className="text-sm text-gray-600 mb-4">{getDescription()}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => onTimingChange('current')}
            className={`p-4 rounded-lg border-2 transition-all text-center ${
              placementTiming === 'current'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300'
            }`}
          >
            <p className="font-semibold text-gray-900">Pågående nu</p>
            <p className="text-xs text-gray-600 mt-1">Aktuell placering</p>
          </button>

          <button
            onClick={() => onTimingChange('soon')}
            className={`p-4 rounded-lg border-2 transition-all text-center ${
              placementTiming === 'soon'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <p className="font-semibold text-gray-900">Inom 3 mån</p>
            <p className="text-xs text-gray-600 mt-1">Förbereda</p>
          </button>

          <button
            onClick={() => onTimingChange('later')}
            className={`p-4 rounded-lg border-2 transition-all text-center ${
              placementTiming === 'later'
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-gray-200 hover:border-yellow-300'
            }`}
          >
            <p className="font-semibold text-gray-900">3-12 mån</p>
            <p className="text-xs text-gray-600 mt-1">Långsiktig plan</p>
          </button>

          <button
            onClick={() => onTimingChange('none')}
            className={`p-4 rounded-lg border-2 transition-all text-center ${
              placementTiming === 'none'
                ? 'border-gray-500 bg-gray-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className="font-semibold text-gray-900">Ingen ännu</p>
            <p className="text-xs text-gray-600 mt-1">Allmän kunskap</p>
          </button>
        </div>
      </div>

      {/* Date Details (if current or soon) */}
      {(placementTiming === 'current' || placementTiming === 'soon') && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Placeringsinformation</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Startdatum
              </label>
              <input
                type="month"
                value={startDate || ''}
                onChange={(e) => onDatesChange(e.target.value, endDate || '')}
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
                value={endDate || ''}
                onChange={(e) => onDatesChange(startDate || '', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Focus Domain (for ST-other) */}
            {userType === 'st-other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fokusområde (valfritt)
                </label>
                <select
                  value={focusDomain || ''}
                  onChange={(e) => onFocusDomainChange(e.target.value as Domain || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Alla områden</option>
                  {domains.map(domain => (
                    <option key={domain} value={domain}>
                      {DOMAIN_LABELS[domain]}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Hospital */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sjukhus (valfritt)
              </label>
              <input
                type="text"
                value={hospital || ''}
                onChange={(e) => onHospitalChange(e.target.value)}
                placeholder="t.ex. Karolinska"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Info box */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900 font-medium">
                Socialstyrelsen-mål automatiskt kopplade
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Baserat på din placering kommer vi automatiskt visa relevanta Socialstyrelsen-mål som du behöver uppnå.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info for "later" timing */}
      {placementTiming === 'later' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-900">
            <strong>Långsiktig förberedelse:</strong> Vi fokuserar på grundläggande ortopedi-kunskap och bygger en stabil kunskapsbas inför din kommande placering.
          </p>
        </div>
      )}

      {/* Info for "none" timing */}
      {placementTiming === 'none' && (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>Allmän ortopedi-kunskap:</strong> Du får tillgång till grundläggande ortopedi-innehåll som är relevant för din utbildningsnivå.
          </p>
        </div>
      )}
    </div>
  );
}
