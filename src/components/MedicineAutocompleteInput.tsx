import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Pill, Sparkles, Check } from 'lucide-react';
import { getSmartMedicineSuggestions, StandardMedicine } from '../lib/medicineDatabase';

interface MedicineAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectSuggestion?: (medicine: StandardMedicine) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const MedicineAutocompleteInput: React.FC<MedicineAutocompleteInputProps> = ({
  value,
  onChange,
  onSelectSuggestion,
  placeholder = 'Type medicine name (e.g. para, amo, cet)...',
  autoFocus = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute suggestions dynamically on every typed letter
  const suggestions = useMemo(() => {
    if (!value || value.trim().length === 0) return [];
    return getSmartMedicineSuggestions(value, 6);
  }, [value]);

  const handlePickSuggestion = (med: StandardMedicine) => {
    onChange(med.name);
    if (onSelectSuggestion) {
      onSelectSuggestion(med);
    }
  };

  return (
    <div ref={containerRef} className="space-y-1.5 w-full">
      <div className="relative">
        <input
          type="text"
          required
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 rounded-xl px-3 py-2 text-xs text-slate-900 outline-hidden font-medium placeholder-slate-400 transition-all"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
            title="Clear text"
          >
            ×
          </button>
        )}
      </div>

      {/* Helakuru-style Predictive Word Suggestion Bar */}
      {suggestions.length > 0 && (
        <div className="bg-sky-50/90 border border-sky-200 rounded-xl p-1.5 shadow-xs transition-all animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-sky-800 font-semibold">
            <Sparkles className="w-3 h-3 text-sky-600" />
            <span>Suggested Medicines (Tap to select):</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {suggestions.map((sug) => {
              const isSelected = value.toLowerCase() === sug.name.toLowerCase();
              return (
                <button
                  key={sug.name}
                  type="button"
                  onClick={() => handlePickSuggestion(sug)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-200 hover:border-blue-300 active:scale-95'
                  }`}
                >
                  <Pill className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
                  <span>{sug.name}</span>
                  {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
