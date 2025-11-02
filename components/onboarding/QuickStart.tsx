'use client';

import { useState } from 'react';
import { OnboardingData, Domain, Goal, GOAL_LABELS, DOMAIN_LABELS } from '@/types/onboarding';
import { EducationLevel } from '@/types/education';
import { educationLevels } from '@/data/levels';
import { initializeOnboarding, createUserProfile, generate7DayPlan, trackEvent } from '@/lib/onboarding-utils';
import { ChevronRight, ChevronLeft, Check, Shield, Bell, Target, Zap } from 'lucide-react';
import RotationSetup from './RotationSetup';
import PlacementSetup from './PlacementSetup';

interface QuickStartProps {
  onComplete: (profile: any, plan: any) => void;
}

export default function QuickStart({ onComplete }: QuickStartProps) {
  const [data, setData] = useState<OnboardingData>(initializeOnboarding());

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (data.step < 6) {
      updateData({ step: data.step + 1 });
      trackEvent(`onboard_step_${data.step + 1}`);
    }
  };

  const prevStep = () => {
    if (data.step > 1) {
      updateData({ step: data.step - 1 });
    }
  };

  const handleComplete = () => {
    trackEvent('onboard_quickstart_complete');
    const profile = createUserProfile(data);
    const plan = generate7DayPlan(profile);

    // Spara i localStorage
    localStorage.setItem('ortokompanion_profile', JSON.stringify(profile));
    localStorage.setItem('ortokompanion_plan', JSON.stringify(plan));

    trackEvent('plan_created', { level: profile.role, domains: profile.domains });
    onComplete(profile, plan);
  };

  const canProceed = () => {
    switch (data.step) {
      case 1:
        return !!data.level;
      case 2:
        // Different validation based on user type
        const level = data.level;

        // For ST-Ortopedi: Need at least one rotation
        if (level && level.match(/^st[1-5]$/)) {
          return data.rotations && data.rotations.length > 0;
        }

        // For ST-other, Student, AT: Need placement timing
        if (level === 'st-allmänmedicin' || level === 'st-akutsjukvård' ||
            level === 'student' || level === 'at') {
          return !!data.placementTiming;
        }

        // For Specialists: Need at least one domain
        if (level && level.startsWith('specialist')) {
          return data.domains && data.domains.length > 0;
        }

        return true;
      case 3:
        // AI Adaptation - optional, always allow proceed
        return true;
      case 4:
        return data.goals.length > 0;
      case 5:
        return true; // Samtycke är valfritt
      case 6:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Välkommen! Låt oss skräddarsy din OrtoKompanion
          </h1>
          <p className="text-gray-600">
            Snabbstart • 90 sekunder • Du kan ändra allt senare
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
                    ${data.step >= step ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}
                  `}
                >
                  {data.step > step ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 6 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      data.step > step ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center">
            Steg {data.step} av 6
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {data.step === 1 && <Step1Level data={data} updateData={updateData} />}
          {data.step === 2 && <Step2RotationPlacement data={data} updateData={updateData} />}
          {data.step === 3 && <Step3AIAdaptation data={data} updateData={updateData} />}
          {data.step === 4 && <Step4Goal data={data} updateData={updateData} />}
          {data.step === 5 && <Step5Privacy data={data} updateData={updateData} />}
          {data.step === 6 && <Step6TieBreaker data={data} updateData={updateData} />}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={data.step === 1}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Tillbaka
            </button>

            {data.step < 6 ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              >
                Nästa
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!canProceed()}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              >
                <Zap className="w-4 h-4" />
                Skapa min plan!
              </button>
            )}
          </div>
        </div>

        {/* Trust */}
        <p className="text-center text-sm text-gray-500 mt-4">
          🔒 Vi sparar minsta möjliga data. Allt kan ändras senare.
        </p>
      </div>
    </div>
  );
}

// Step 1: Nivå & Specialitet
function Step1Level({ data, updateData }: any) {
  const levels = educationLevels;

  // Gruppera nivåer
  const studentAT = levels.filter(l => l.id === 'student' || l.id === 'at');
  const stOrtho = levels.filter(l => l.id.match(/^st[1-5]$/));
  const stOther = levels.filter(l => l.id === 'st-allmänmedicin' || l.id === 'st-akutsjukvård');
  const specialists = levels.filter(l => l.id.startsWith('specialist'));

  const handleSelectLevel = (level: EducationLevel) => {
    updateData({ level });

    // Set primary specialty based on selection
    if (level.match(/^st[1-5]$/)) {
      const stYear = parseInt(level.replace('st', ''));
      updateData({ level, stYear, primarySpecialty: 'ortopedi' });
    } else if (level === 'st-allmänmedicin') {
      updateData({ level, primarySpecialty: 'allmänmedicin', hasOrthoPlacement: true });
    } else if (level === 'st-akutsjukvård') {
      updateData({ level, primarySpecialty: 'akutsjukvård', hasOrthoPlacement: true });
    } else if (level === 'specialist-ortopedi') {
      updateData({ level, primarySpecialty: 'ortopedi', fortbildningMode: true });
    } else if (level === 'specialist-allmänmedicin') {
      updateData({ level, primarySpecialty: 'allmänmedicin', fortbildningMode: true });
    } else if (level === 'specialist-akutsjukvård') {
      updateData({ level, primarySpecialty: 'akutsjukvård', fortbildningMode: true });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Vem är du?</h2>
        <p className="text-gray-600">Välj den nivå som bäst beskriver dig</p>
      </div>

      <div className="space-y-6">
        {/* Student & AT */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Under utbildning</h3>
          <div className="grid grid-cols-2 gap-3">
            {studentAT.map((level) => (
              <button
                key={level.id}
                onClick={() => handleSelectLevel(level.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  data.level === level.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className={`w-3 h-3 rounded-full mb-2 ${level.color}`} />
                <p className="font-semibold text-gray-900">{level.name}</p>
                <p className="text-xs text-gray-600 mt-1">{level.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ST-Ortopedi */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">ST-läkare Ortopedi</h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {stOrtho.map((level) => (
              <button
                key={level.id}
                onClick={() => handleSelectLevel(level.id)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  data.level === level.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${level.color}`} />
                <p className="font-semibold text-gray-900 text-sm">{level.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ST från andra specialiteter */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">ST-läkare från andra specialiteter</h3>
          <div className="grid grid-cols-2 gap-3">
            {stOther.map((level) => (
              <button
                key={level.id}
                onClick={() => handleSelectLevel(level.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  data.level === level.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className={`w-3 h-3 rounded-full mb-2 ${level.color}`} />
                <p className="font-semibold text-gray-900">{level.name}</p>
                <p className="text-xs text-gray-600 mt-1">{level.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Specialister */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Specialist - Fortbildning</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {specialists.map((level) => (
              <button
                key={level.id}
                onClick={() => handleSelectLevel(level.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  data.level === level.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className={`w-3 h-3 rounded-full mb-2 ${level.color}`} />
                <p className="font-semibold text-gray-900">{level.name}</p>
                <p className="text-xs text-gray-600 mt-1">{level.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 2: Rotationer/Placering (Conditional based on user type)
function Step2RotationPlacement({ data, updateData }: any) {
  const level = data.level as EducationLevel;

  // For ST-Ortopedi (ST1-ST5): Show rotation timeline builder
  if (level && level.match(/^st[1-5]$/)) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Dina rotationer</h2>
          <p className="text-gray-600">
            Lägg till dina rotationer för att få anpassat innehåll och mål för varje period
          </p>
        </div>

        <RotationSetup
          rotations={data.rotations || []}
          onChange={(rotations) => {
            updateData({ rotations });
            // Auto-set domains from rotations
            const domains = rotations.map((r: any) => r.domain);
            updateData({ rotations, domains });
          }}
        />
      </div>
    );
  }

  // For ST-Allmänmedicin or ST-Akutsjukvård: Show placement setup
  if (level === 'st-allmänmedicin' || level === 'st-akutsjukvård') {
    return (
      <div>
        <PlacementSetup
          userType="st-other"
          placementTiming={data.placementTiming}
          startDate={data.placementStartDate}
          endDate={data.placementEndDate}
          focusDomain={data.orthoPlacement?.focusDomain}
          hospital={data.orthoPlacement?.hospital}
          onTimingChange={(timing) => updateData({ placementTiming: timing })}
          onDatesChange={(start, end) => updateData({
            placementStartDate: start,
            placementEndDate: end
          })}
          onFocusDomainChange={(domain) => updateData({
            orthoPlacement: {
              ...(data.orthoPlacement || {}),
              focusDomain: domain,
            }
          })}
          onHospitalChange={(hospital) => updateData({
            orthoPlacement: {
              ...(data.orthoPlacement || {}),
              hospital,
            }
          })}
        />
      </div>
    );
  }

  // For Student or AT: Show placement setup
  if (level === 'student' || level === 'at') {
    return (
      <div>
        <PlacementSetup
          userType={level}
          placementTiming={data.placementTiming}
          startDate={data.placementStartDate}
          endDate={data.placementEndDate}
          hospital={data.orthoPlacement?.hospital}
          onTimingChange={(timing) => updateData({ placementTiming: timing })}
          onDatesChange={(start, end) => updateData({
            placementStartDate: start,
            placementEndDate: end
          })}
          onFocusDomainChange={() => {}} // Not used for student/AT
          onHospitalChange={(hospital) => updateData({
            orthoPlacement: {
              ...(data.orthoPlacement || {}),
              hospital,
            }
          })}
        />
      </div>
    );
  }

  // For Specialists: Simple domain selector for fortbildning interests
  const domains: Domain[] = ['trauma', 'axel-armbåge', 'hand-handled', 'rygg', 'höft', 'knä', 'fot-fotled', 'sport', 'tumör'];

  const toggleDomain = (domain: Domain) => {
    const current = data.domains || [];
    if (current.includes(domain)) {
      updateData({ domains: current.filter((d: Domain) => d !== domain) });
    } else {
      updateData({ domains: [...current, domain] });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Fokusområden för fortbildning</h2>
        <p className="text-gray-600">Välj områden du vill uppdatera dina kunskaper inom</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {domains.map((domain) => (
          <button
            key={domain}
            onClick={() => toggleDomain(domain)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              data.domains?.includes(domain)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">{DOMAIN_LABELS[domain]}</span>
              {data.domains?.includes(domain) && <Check className="w-5 h-5 text-blue-500" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 3: AI Adaptation
function Step3AIAdaptation({ data, updateData }: any) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">AI-anpassad inlärning</h2>
        <p className="text-gray-600">Personliga hints och förklaringar anpassade efter din inlärningsstil</p>
      </div>

      {/* AI Toggle */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6 mb-6">
        <label className="flex items-start gap-4 cursor-pointer">
          <input
            type="checkbox"
            checked={data.aiAdaptationEnabled !== false} // Default true
            onChange={(e) => updateData({ aiAdaptationEnabled: e.target.checked })}
            className="w-5 h-5 text-purple-600 rounded mt-1"
          />
          <div className="flex-1">
            <p className="font-semibold text-gray-900 mb-1">
              Aktivera AI-anpassad inlärning (Rekommenderas)
            </p>
            <p className="text-sm text-gray-600">
              Få personliga hints, anpassade förklaringar och intelligenta rekommendationer baserat på dina svar och inlärningsstil
            </p>
          </div>
        </label>
      </div>

      {/* Learning Style (only if AI enabled) */}
      {data.aiAdaptationEnabled !== false && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Hur lär du dig bäst?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 'visual', name: 'Visuellt', desc: 'Anatomiska landmärken, bilder, diagram' },
              { id: 'analytical', name: 'Analytiskt', desc: 'Systematisk uteslutning, differentialdiagnoser' },
              { id: 'clinical', name: 'Kliniskt', desc: 'Praktiska exempel, verkliga fall' },
              { id: 'mixed', name: 'Blandat', desc: 'Kombination av allt ovan (rekommenderas)' },
            ].map(style => (
              <button
                key={style.id}
                onClick={() => updateData({ learningStyle: style.id })}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  (data.learningStyle || 'mixed') === style.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <p className="font-semibold text-gray-900">{style.name}</p>
                <p className="text-xs text-gray-600 mt-1">{style.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Step 4: Mål
function Step4Goal({ data, updateData }: any) {
  const goals: Goal[] = ['trygg-jour', 'förbereda-op', 'förbättra-röntgen'];

  const toggleGoal = (goal: Goal) => {
    const current = data.goals || [];
    if (current.includes(goal)) {
      updateData({ goals: current.filter((g: Goal) => g !== goal) });
    } else {
      updateData({ goals: [...current, goal] });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Ditt mål (14 dagar)</h2>
        <p className="text-gray-600">Vad vill du uppnå de närmaste två veckorna?</p>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => (
          <button
            key={goal}
            onClick={() => toggleGoal(goal)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center justify-between ${
              data.goals?.includes(goal)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-gray-900">{GOAL_LABELS[goal]}</span>
            </div>
            {data.goals?.includes(goal) && <Check className="w-5 h-5 text-blue-500" />}
          </button>
        ))}

        <div className="pt-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Eller beskriv ditt eget mål:
          </label>
          <textarea
            value={data.customGoal || ''}
            onChange={(e) => {
              updateData({ customGoal: e.target.value });
              if (e.target.value && !data.goals?.includes('custom')) {
                updateData({ goals: [...(data.goals || []), 'custom'] });
              }
            }}
            placeholder="T.ex. 'Kunna handlägga höftfrakturer självständigt'"
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}

// Step 5: Integritet
function Step5Privacy({ data, updateData }: any) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-500" />
          Integritet & kontakt
        </h2>
        <p className="text-gray-600">Du bestämmer hur vi använder dina data</p>
      </div>

      <div className="space-y-4">
        <label className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={data.consent?.analytics || false}
            onChange={(e) =>
              updateData({
                consent: { ...data.consent, analytics: e.target.checked },
              })
            }
            className="mt-1"
          />
          <div>
            <p className="font-medium text-gray-800">Anonymiserad analys</p>
            <p className="text-sm text-gray-600">
              Hjälp oss förbättra systemet genom anonymiserad användningsdata
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={data.consent?.regionAdapt !== false}
            onChange={(e) =>
              updateData({
                consent: { ...data.consent, regionAdapt: e.target.checked },
              })
            }
            className="mt-1"
          />
          <div>
            <p className="font-medium text-gray-800">Regionanpassning</p>
            <p className="text-sm text-gray-600">
              Anpassa innehåll till svenska riktlinjer och ICD-10-SE/KVÅ
            </p>
          </div>
        </label>

        <div className="pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Påminnelser
          </label>
          <div className="space-y-2">
            {(['push', 'email', 'ingen'] as const).map((channel) => (
              <label key={channel} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="channel"
                  checked={data.channel === channel}
                  onChange={() => updateData({ channel })}
                />
                <span className="text-gray-700">
                  {channel === 'push' && 'Push-notiser'}
                  {channel === 'email' && 'E-post'}
                  {channel === 'ingen' && 'Inga påminnelser'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-blue-800">
            <strong>🔒 Din integritet:</strong> All data sparas lokalt i din webbläsare. Vi delar
            aldrig din information med tredje part.
          </p>
        </div>
      </div>
    </div>
  );
}

// Step 6: Finjustering
function Step6TieBreaker({ data, updateData }: any) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Sista finputsen!</h2>
        <p className="text-gray-600">3 snabba frågor för att skräddarsy din plan perfekt</p>
      </div>

      <div className="space-y-6">
        {/* Fråga 1 */}
        <div>
          <p className="font-medium text-gray-800 mb-3">
            1. Vill du starta med akuta beslutsträd eller operationsförberedelse?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() =>
                updateData({
                  tieBreaker: { ...data.tieBreaker, startMode: 'akut' },
                })
              }
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                data.tieBreaker?.startMode === 'akut'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <p className="font-semibold text-gray-900">Akuta beslutsträd</p>
              <p className="text-sm text-gray-700 mt-1">För jour och akutmottagning</p>
            </button>
            <button
              onClick={() =>
                updateData({
                  tieBreaker: { ...data.tieBreaker, startMode: 'operation' },
                })
              }
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                data.tieBreaker?.startMode === 'operation'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <p className="font-semibold text-gray-900">Operationsförberedelse</p>
              <p className="text-sm text-gray-700 mt-1">För planerad kirurgi</p>
            </button>
          </div>
        </div>

        {/* Fråga 2 */}
        <div>
          <p className="font-medium text-gray-800 mb-3">
            2. Föredrar du mikrofall eller korta quiz först?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() =>
                updateData({
                  tieBreaker: { ...data.tieBreaker, preferMicrocases: true },
                })
              }
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                data.tieBreaker?.preferMicrocases
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <p className="font-semibold text-gray-900">Mikrofall</p>
              <p className="text-sm text-gray-700 mt-1">Kliniska scenarios</p>
            </button>
            <button
              onClick={() =>
                updateData({
                  tieBreaker: { ...data.tieBreaker, preferMicrocases: false },
                })
              }
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                !data.tieBreaker?.preferMicrocases
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <p className="font-semibold text-gray-900">Korta quiz</p>
              <p className="text-sm text-gray-700 mt-1">Snabba kunskapstester</p>
            </button>
          </div>
        </div>

        {/* Fråga 3 */}
        <div>
          <p className="font-medium text-gray-800 mb-3">3. Daglig påminnelse?</p>
          <div className="flex gap-3">
            <button
              onClick={() =>
                updateData({
                  tieBreaker: { ...data.tieBreaker, dailyPush: true },
                })
              }
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                data.tieBreaker?.dailyPush
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <p className="font-semibold text-gray-900">Ja tack!</p>
              <p className="text-sm text-gray-700 mt-1">Påminn mig varje dag</p>
            </button>
            <button
              onClick={() =>
                updateData({
                  tieBreaker: { ...data.tieBreaker, dailyPush: false },
                })
              }
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                !data.tieBreaker?.dailyPush
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <p className="font-semibold text-gray-900">Nej tack</p>
              <p className="text-sm text-gray-700 mt-1">Jag kommer själv</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
