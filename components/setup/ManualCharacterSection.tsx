
import React from 'react';
import { Target, Skull, Wand2, Users, UserCheck, StickyNote, Fingerprint, Loader2, UserPlus } from 'lucide-react';
import { useSetupStore } from './store';
import { generateCalibrationField, generateCharacterProfile } from '../../services/geminiService';

interface Props {
  loadingFields: Record<string, boolean>;
  setLoadingFields: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export const ManualCharacterSection: React.FC<Props> = ({ loadingFields, setLoadingFields }) => {
  const store = useSetupStore();
  const { 
    mode, selectedClusters, intensity, 
    villainName, villainAppearance, villainMethods, victimDescription, primaryGoal, victimCount,
    survivorName, survivorBackground, survivorTraits,
    setVillainName, setVillainAppearance, setVillainMethods, setVictimDescription, setPrimaryGoal, setVictimCount,
    setSurvivorName, setSurvivorBackground, setSurvivorTraits
  } = store;

  const isVillain = mode.includes('Antagonist') || mode.includes('Predator');

  const handleGenerate = async (field: string, useNotes = false) => {
      setLoadingFields(prev => ({ ...prev, [field]: true }));
      try {
          const val = await generateCalibrationField(field, selectedClusters.join(', '), intensity, undefined, useNotes ? (
              field === 'Entity Name' ? villainName :
              field === 'Form & Appearance' ? villainAppearance :
              field === 'Modus Operandi' ? villainMethods :
              field === 'Specimen Targets' ? victimDescription :
              field === 'Primary Objective' ? primaryGoal :
              field === 'Identity Name' ? survivorName :
              field === 'Backstory' ? survivorBackground :
              field === 'Traits & Flaws' ? survivorTraits : ''
          ) : undefined);

          if (field === 'Entity Name') setVillainName(val);
          else if (field === 'Form & Appearance') setVillainAppearance(val);
          else if (field === 'Modus Operandi') setVillainMethods(val);
          else if (field === 'Specimen Targets') setVictimDescription(val);
          else if (field === 'Primary Objective') setPrimaryGoal(val);
          else if (field === 'Identity Name') setSurvivorName(val);
          else if (field === 'Backstory') setSurvivorBackground(val);
          else if (field === 'Traits & Flaws') setSurvivorTraits(val);
      } finally {
          setLoadingFields(prev => ({ ...prev, [field]: false }));
      }
  };

  const handleFullProfile = async () => {
      setLoadingFields(prev => ({ ...prev, 'char_build': true }));
      try {
          const profile = await generateCharacterProfile(selectedClusters.join(', '), intensity, isVillain ? 'Villain' : 'Survivor');
          if (isVillain) {
              setVillainName(profile.name);
              setVillainAppearance(`${profile.traits}\n\n${profile.background}`);
          } else {
              setSurvivorName(profile.name);
              setSurvivorBackground(profile.background);
              setSurvivorTraits(profile.traits);
          }
      } finally {
          setLoadingFields(prev => ({ ...prev, 'char_build': false }));
      }
  };

  const Field = ({ label, icon: Icon, value, onChange, fieldKey, isTextarea = false }: any) => (
      <div className="space-y-4 group relative">
          <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-gray-500 uppercase flex items-center gap-3 tracking-[0.2em]">
                  <Icon className="w-5 h-5" /> {label}
              </label>
              <div className="flex gap-2">
                  <button onClick={() => handleGenerate(fieldKey)} disabled={loadingFields[fieldKey]} className="p-1 hover:text-white transition-colors text-gray-500">
                      {loadingFields[fieldKey] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                  </button>
              </div>
          </div>
          {isTextarea ? (
              <textarea value={value} onChange={e => onChange(e.target.value)} className="w-full h-32 bg-black border-2 border-gray-800 text-gray-200 p-4 font-mono text-sm focus:border-red-600 outline-none resize-none" />
          ) : (
              <input type="text" value={value} onChange={e => onChange(e.target.value)} className="w-full bg-black border-2 border-gray-800 text-gray-200 p-4 font-mono text-sm focus:border-red-600 outline-none" />
          )}
      </div>
  );

  if (isVillain) {
      return (
        <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-12 border-y-2 border-fresh-blood/20 py-16 animate-fadeIn bg-red-950/5 px-8">
            <div className="text-red-500 font-mono text-2xl font-bold uppercase tracking-[0.5em] flex items-center gap-6">
                <Target className="w-10 h-10 animate-pulse" /> Antagonist Specifications
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                <Field label="Entity Name" icon={Skull} value={villainName} onChange={setVillainName} fieldKey="Entity Name" />
                <Field label="Form & Appearance" icon={Skull} value={villainAppearance} onChange={setVillainAppearance} fieldKey="Form & Appearance" isTextarea />
                <Field label="Modus Operandi" icon={Wand2} value={villainMethods} onChange={setVillainMethods} fieldKey="Modus Operandi" isTextarea />
                <Field label="Specimen Targets" icon={Users} value={victimDescription} onChange={setVictimDescription} fieldKey="Specimen Targets" isTextarea />
                <Field label="Primary Objective" icon={Target} value={primaryGoal} onChange={setPrimaryGoal} fieldKey="Primary Objective" />
                <div className="space-y-4 group relative">
                  <label className="text-xs font-mono text-gray-500 uppercase flex items-center gap-3 tracking-[0.2em]">Population Count</label>
                  <div className="flex items-center gap-6 bg-black border-2 border-gray-800 p-6 rounded-sm">
                    <input type="range" min="1" max="10" value={victimCount} onChange={(e) => setVictimCount(parseInt(e.target.value))} className="flex-1 accent-fresh-blood h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer" />
                    <span className="text-fresh-blood font-mono text-xl w-8 font-bold">{victimCount}</span>
                  </div>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-12 border-y-2 border-system-green/20 py-16 animate-fadeIn bg-green-950/5 px-8">
        <div className="flex justify-between items-center border-b border-system-green/20 pb-6 mb-6">
            <div className="text-system-green font-mono text-2xl font-bold uppercase tracking-[0.5em] flex items-center gap-6">
                <UserCheck className="w-10 h-10 animate-pulse" /> Protagonist Identity
            </div>
            <button onClick={handleFullProfile} disabled={loadingFields['char_build']} className="flex items-center gap-3 px-6 py-3 border border-system-green/50 hover:bg-system-green/10 text-system-green transition-all rounded-sm uppercase font-mono text-xs tracking-widest disabled:opacity-50">
                {loadingFields['char_build'] ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Help Me Build Them
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Field label="Identity Name" icon={Users} value={survivorName} onChange={setSurvivorName} fieldKey="Identity Name" />
            <div className="md:col-span-2"><Field label="Backstory" icon={StickyNote} value={survivorBackground} onChange={setSurvivorBackground} fieldKey="Backstory" isTextarea /></div>
            <div className="md:col-span-2"><Field label="Traits & Flaws" icon={Fingerprint} value={survivorTraits} onChange={setSurvivorTraits} fieldKey="Traits & Flaws" isTextarea /></div>
        </div>
    </div>
  );
};
