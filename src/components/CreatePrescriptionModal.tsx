import React, { useState, useEffect } from 'react';
import { 
  X, 
  Pill, 
  Plus, 
  Trash2, 
  RotateCw, 
  CheckCircle2, 
  AlertCircle,
  Stethoscope,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { Patient, StaffUser, Prescription, PrescriptionItem, MealTiming, FrequencyOption } from '../types/patient';
import { generatePrescriptionNumber } from '../services/patientService';
import { MedicineAutocompleteInput } from './MedicineAutocompleteInput';
import { StandardMedicine } from '../lib/medicineDatabase';

interface CreatePrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  staffUser: StaffUser | null;
  initialPrescription?: Prescription | null; // Set when editing an existing prescription
  onCreatePrescription: (prescriptionData: {
    prescriptionNumber: string;
    prescriptionType: 'internal' | 'external';
    date: string;
    time: string;
    prescribingDoctor: string;
    visitReason?: string;
    medicines: PrescriptionItem[];
    instructions?: string;
    status: 'active' | 'completed' | 'discontinued';
  }) => Promise<void>;
  onUpdatePrescription?: (prescriptionId: string, updatedData: Partial<Prescription>) => Promise<void>;
}

export const CreatePrescriptionModal: React.FC<CreatePrescriptionModalProps> = ({
  isOpen,
  onClose,
  patient,
  staffUser,
  initialPrescription,
  onCreatePrescription,
  onUpdatePrescription,
}) => {
  const isEditMode = !!initialPrescription;
  const defaultDoctor = 'Dr. Wishmika Rajaguru';

  const [prescriptionNumber, setPrescriptionNumber] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [prescribingDoctor, setPrescribingDoctor] = useState(defaultDoctor);
  const [visitReason, setVisitReason] = useState('');
  const [instructions, setInstructions] = useState('');
  const [medicines, setMedicines] = useState<PrescriptionItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize form state when opening or when initialPrescription changes
  useEffect(() => {
    if (isOpen) {
      if (initialPrescription) {
        setPrescriptionNumber(initialPrescription.prescriptionNumber);
        setDate(initialPrescription.date);
        setTime(initialPrescription.time);
        setPrescribingDoctor(initialPrescription.prescribingDoctor || defaultDoctor);
        setVisitReason(initialPrescription.visitReason || '');
        setInstructions(initialPrescription.instructions || '');
        setMedicines(
          initialPrescription.medicines.map((m, i) => ({
            id: m.id || `med_${Date.now()}_${i}`,
            medicineName: m.medicineName,
            dosage: m.dosage,
            mealTiming: m.mealTiming || 'After meals',
            frequency: m.frequency || 'Twice daily',
            timingDetail: m.timingDetail || (m.frequency === 'Once daily' ? 'Morning Only' : undefined),
            duration: m.duration || '',
            notes: m.notes || '',
          }))
        );
      } else {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setPrescriptionNumber(generatePrescriptionNumber('internal'));
        setDate(today);
        setTime(currentTime);
        setPrescribingDoctor(defaultDoctor);
        setVisitReason('');
        setInstructions('');
        setMedicines([
          {
            id: 'med_0',
            medicineName: '',
            dosage: '1 tablet',
            mealTiming: 'After meals',
            frequency: 'Twice daily',
            duration: '5 days',
            notes: '',
          },
        ]);
      }
      setErrorMessage(null);
    }
  }, [isOpen, initialPrescription]);

  if (!isOpen) return null;

  const handleAddMedicineRow = () => {
    setMedicines((prev) => [
      ...prev,
      {
        id: `med_${Date.now()}_${prev.length}`,
        medicineName: '',
        dosage: '1 tablet',
        mealTiming: 'After meals',
        frequency: 'Twice daily',
        duration: '5 days',
        notes: '',
      },
    ]);
  };

  const handleRemoveMedicineRow = (index: number) => {
    if (medicines.length <= 1) return;
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateMedicine = (index: number, field: keyof PrescriptionItem, value: any) => {
    setMedicines((prev) => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: value };

      // If user switches frequency to 'Once daily' and timingDetail is not yet set, default to 'Morning Only'
      if (field === 'frequency') {
        if (value === 'Once daily' && !current.timingDetail) {
          current.timingDetail = 'Morning Only';
        } else if (value !== 'Once daily') {
          current.timingDetail = undefined;
        }
      }

      updated[index] = current;
      return updated;
    });
  };

  // When suggestion selected from autocomplete, populate sensible defaults
  const handleSelectMedicineSuggestion = (index: number, sug: StandardMedicine) => {
    setMedicines((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        medicineName: sug.name,
        dosage: sug.defaultDosage || updated[index].dosage,
        mealTiming: sug.defaultTiming || updated[index].mealTiming,
        frequency: sug.defaultFrequency || updated[index].frequency,
        timingDetail: sug.defaultTimingDetail || (sug.defaultFrequency === 'Once daily' ? 'Morning Only' : undefined),
      };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate and clean medicines
    const rawValid = medicines.filter((m) => m.medicineName.trim().length > 0);
    if (rawValid.length === 0) {
      setErrorMessage('Please add at least one medicine with a valid name.');
      return;
    }

    const validMeds = rawValid.map((m, idx) => {
      const item: any = {
        id: m.id || `med_${Date.now()}_${idx}`,
        medicineName: m.medicineName.trim(),
        dosage: m.dosage?.trim() || '1 tablet',
        mealTiming: m.mealTiming || 'After meals',
        frequency: m.frequency || 'Twice daily',
      };
      if (m.frequency === 'Once daily' && m.timingDetail) {
        item.timingDetail = m.timingDetail;
      }
      if (m.duration && m.duration.trim()) {
        item.duration = m.duration.trim();
      }
      if (m.notes && m.notes.trim()) {
        item.notes = m.notes.trim();
      }
      if (typeof m.dispenseQuantity === 'number' && !isNaN(m.dispenseQuantity)) {
        item.dispenseQuantity = m.dispenseQuantity;
      }
      return item;
    });

    if (!prescribingDoctor.trim()) {
      setErrorMessage('Prescribing doctor name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && initialPrescription?.id && onUpdatePrescription) {
        await onUpdatePrescription(initialPrescription.id, {
          prescriptionNumber: prescriptionNumber.trim(),
          date,
          time,
          prescribingDoctor: prescribingDoctor.trim(),
          visitReason: visitReason.trim(),
          medicines: validMeds,
          instructions: instructions.trim(),
        });
      } else {
        await onCreatePrescription({
          prescriptionNumber: prescriptionNumber.trim(),
          prescriptionType: 'internal',
          date,
          time,
          prescribingDoctor: prescribingDoctor.trim(),
          visitReason: visitReason.trim(),
          medicines: validMeds,
          instructions: instructions.trim(),
          status: 'active',
        });
      }
      onClose();
    } catch (err: unknown) {
      console.error('Error saving prescription:', err);
      setErrorMessage('Failed to save prescription. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {isEditMode ? 'Edit Visit Prescription' : 'New Visit Prescription'}
              </h3>
              <p className="text-xs text-blue-100">
                Patient: <span className="font-semibold">{patient.name}</span> ({patient.patientId}) • APEX Medical Center
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Prescription Metadata */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                Prescription Details
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {isEditMode ? 'Editing individual prescription record' : 'Saved as a separate, distinct prescription record'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Prescription Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prescription Number *
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    required
                    value={prescriptionNumber}
                    onChange={(e) => setPrescriptionNumber(e.target.value.toUpperCase())}
                    className="font-mono text-xs font-bold bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3 py-2 text-blue-900 w-full outline-hidden"
                  />
                  {!isEditMode && (
                    <button
                      type="button"
                      onClick={() => setPrescriptionNumber(generatePrescriptionNumber('internal'))}
                      className="p-2 bg-white hover:bg-blue-50 text-blue-700 border border-slate-300 rounded-xl cursor-pointer"
                      title="Generate new number"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Visit *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3 py-2 text-xs text-slate-900 outline-hidden font-medium"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Time of Visit *
                </label>
                <input
                  type="text"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 10:30 AM"
                  className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3 py-2 text-xs text-slate-900 outline-hidden font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Prescribing Doctor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prescribing Doctor *
                </label>
                <input
                  type="text"
                  required
                  value={prescribingDoctor}
                  onChange={(e) => setPrescribingDoctor(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3 py-2 text-xs text-slate-900 outline-hidden font-medium"
                />
              </div>

              {/* Reason / Diagnosis */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Visit Reason / Diagnosis (Optional)
                </label>
                <input
                  type="text"
                  value={visitReason}
                  onChange={(e) => setVisitReason(e.target.value)}
                  placeholder="e.g. Fever, URTI, Hypertension review"
                  className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3 py-2 text-xs text-slate-900 outline-hidden font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Itemized Medicines List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-blue-600" />
                  Prescribed Medicines ({medicines.length})
                </h4>
                <p className="text-[11px] text-slate-500">
                  Type medicine name for instant smart suggestions (like Helakuru keyboard).
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddMedicineRow}
                className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medicine</span>
              </button>
            </div>

            {/* Medicine Rows */}
            <div className="space-y-4">
              {medicines.map((med, index) => {
                const isOnceDaily = med.frequency === 'Once daily';

                return (
                  <div
                    key={med.id || index}
                    className="p-4 bg-white border border-slate-200 hover:border-blue-300 rounded-2xl shadow-xs space-y-3 transition-all relative"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        Medicine #{index + 1}
                      </span>

                      {medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicineRow(index)}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-1 text-xs"
                          title="Remove medicine item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    {/* Medicine Name with Smart Autocomplete */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Medicine Name & Strength *
                        </label>
                        <MedicineAutocompleteInput
                          value={med.medicineName}
                          onChange={(val) => handleUpdateMedicine(index, 'medicineName', val)}
                          onSelectSuggestion={(sug) => handleSelectMedicineSuggestion(index, sug)}
                          placeholder="Type 'para', 'amo', 'cet'..."
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Dosage *
                        </label>
                        <input
                          type="text"
                          required
                          value={med.dosage}
                          onChange={(e) => handleUpdateMedicine(index, 'dosage', e.target.value)}
                          placeholder="e.g. 1 tablet, 2 capsules, 5ml"
                          className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3 py-2 text-xs text-slate-900 outline-hidden font-medium"
                        />
                      </div>
                    </div>

                    {/* Meal Timing & Frequency & Duration */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Meal Timing Dropdown */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Meal Timing *
                        </label>
                        <select
                          value={med.mealTiming}
                          onChange={(e) => handleUpdateMedicine(index, 'mealTiming', e.target.value)}
                          className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-2.5 py-2 text-xs text-slate-900 outline-hidden font-medium cursor-pointer"
                        >
                          <option value="Before meals">Before meals</option>
                          <option value="After meals">After meals</option>
                          <option value="With meals">With meals</option>
                          <option value="Empty stomach">Empty stomach</option>
                          <option value="As directed">As directed</option>
                        </select>
                      </div>

                      {/* Frequency Dropdown */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Frequency *
                        </label>
                        <select
                          value={med.frequency}
                          onChange={(e) => handleUpdateMedicine(index, 'frequency', e.target.value)}
                          className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-2.5 py-2 text-xs text-slate-900 outline-hidden font-medium cursor-pointer"
                        >
                          <option value="Once daily">Once daily</option>
                          <option value="Twice daily">Twice daily</option>
                          <option value="Three times daily">Three times daily</option>
                          <option value="Every 8 hours">Every 8 hours</option>
                          <option value="Every 6 hours">Every 6 hours</option>
                          <option value="As needed">As needed</option>
                        </select>
                      </div>

                      {/* Duration */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={med.duration || ''}
                          onChange={(e) => handleUpdateMedicine(index, 'duration', e.target.value)}
                          placeholder="e.g. 3 days, 5 days, 1 month"
                          className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3 py-2 text-xs text-slate-900 outline-hidden font-medium"
                        />
                      </div>
                    </div>

                    {/* Requirement 4: When "Once daily" is selected, show ONLY these two options: Morning Only or Night Only! */}
                    {isOnceDaily && (
                      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 animate-in fade-in slide-in-from-top-1 duration-150">
                        <label className="block text-[11px] font-bold text-amber-900 mb-2">
                          Once Daily Timing (Select either option):
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleUpdateMedicine(index, 'timingDetail', 'Morning Only')}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              med.timingDetail === 'Morning Only'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-amber-300 hover:bg-amber-100/50'
                            }`}
                          >
                            <Sun className="w-3.5 h-3.5" />
                            <span>Morning Only</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateMedicine(index, 'timingDetail', 'Night Only')}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              med.timingDetail === 'Night Only'
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-amber-300 hover:bg-amber-100/50'
                            }`}
                          >
                            <Moon className="w-3.5 h-3.5" />
                            <span>Night Only</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Notes / Special Instructions for this Medicine */}
                    <div>
                      <input
                        type="text"
                        value={med.notes || ''}
                        onChange={(e) => handleUpdateMedicine(index, 'notes', e.target.value)}
                        placeholder="Special notes (e.g. Take with full glass of water, do not chew)"
                        className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl px-3 py-1.5 text-[11px] text-slate-700 outline-hidden"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleAddMedicineRow}
              className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl text-xs font-bold text-slate-600 hover:text-blue-700 bg-slate-50 hover:bg-blue-50/50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Medication to This Prescription</span>
            </button>
          </div>

          {/* Section 3: General Directions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              General Patient Instructions for This Prescription (Optional)
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Complete full 5-day course. Review if symptoms worsen."
              className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3 py-2 text-xs text-slate-900 outline-hidden font-medium resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Saving Prescription...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditMode ? 'Update Prescription' : 'Save This Prescription'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
