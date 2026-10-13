import React, { useState } from 'react';
import { 
  X, 
  Pill, 
  Calendar, 
  UserCheck, 
  FileText, 
  Clock, 
  RotateCw, 
  AlertCircle,
  PlusCircle,
  Check
} from 'lucide-react';
import { Patient, StaffUser } from '../types/patient';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  staffUser: StaffUser | null;
  onAddMedicine: (medicineData: {
    date: string;
    medicineName: string;
    dosage: string;
    frequency?: string;
    duration?: string;
    prescribingDoctor: string;
    notes: string;
    status: 'active' | 'completed' | 'discontinued';
  }) => Promise<void>;
}

// Common medicine suggestions for fast clinical entry
const COMMON_MEDICATIONS = [
  { name: 'Amoxicillin 500mg', dosage: '1 capsule three times daily', freq: 'Every 8 hours', dur: '7 days' },
  { name: 'Lisinopril 10mg', dosage: '1 tablet once daily in morning', freq: 'Once daily', dur: '90 days' },
  { name: 'Metformin 500mg ER', dosage: '1 tablet twice daily with meals', freq: 'Twice daily', dur: 'Ongoing' },
  { name: 'Atorvastatin 20mg', dosage: '1 tablet at bedtime', freq: 'Once daily', dur: '90 days' },
  { name: 'Omeprazole 20mg', dosage: '1 capsule before breakfast', freq: 'Once daily', dur: '30 days' },
  { name: 'Paracetamol 650mg', dosage: '1 tablet every 6 hours PRN', freq: 'PRN (As needed)', dur: '5 days' },
  { name: 'Azithromycin 250mg', dosage: '500mg day 1, 250mg days 2-5', freq: 'Once daily', dur: '5 days' },
  { name: 'Salbutamol Inhaler 100mcg', dosage: '1-2 puffs every 4-6h PRN', freq: 'PRN (As needed)', dur: 'Rescue inhaler' },
];

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  isOpen,
  onClose,
  patient,
  staffUser,
  onAddMedicine,
}) => {
  const today = new Date().toISOString().split('T')[0];

  const defaultDoctor = 'Dr. Wishmika Rajaguru';

  const [date, setDate] = useState(today);
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('1 tablet');
  const [mealTiming, setMealTiming] = useState('After meals');
  const [frequency, setFrequency] = useState('Twice daily');
  const [duration, setDuration] = useState('30 days');
  const [prescribingDoctor, setPrescribingDoctor] = useState(defaultDoctor);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'completed' | 'discontinued'>('active');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (item: typeof COMMON_MEDICATIONS[0]) => {
    setMedicineName(item.name);
    setDosage(item.dosage);
    setFrequency(item.freq);
    setDuration(item.dur);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!medicineName.trim()) {
      setErrorMessage('Please specify the medicine name and strength.');
      return;
    }
    if (!dosage.trim()) {
      setErrorMessage('Please specify dosage instructions.');
      return;
    }
    if (!prescribingDoctor.trim()) {
      setErrorMessage('Prescribing doctor name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddMedicine({
        date,
        medicineName: medicineName.trim(),
        dosage: `${dosage.trim()} (${mealTiming})`,
        frequency: frequency.trim(),
        duration: duration.trim(),
        prescribingDoctor: prescribingDoctor.trim(),
        notes: notes.trim() || 'Administer according to clinical dosage schedule.',
        status,
      });
      onClose();
    } catch (err: unknown) {
      console.error('Error adding medicine record:', err);
      setErrorMessage('Failed to save medicine record. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 to-sky-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Add Medicine Record</h3>
              <p className="text-xs text-blue-100">
                Patient: <span className="font-semibold">{patient.name}</span> ({patient.patientId})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="m-6 mb-0 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Fast Medication Suggestions */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-100">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
            Quick Clinical Formulary Suggestions
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {COMMON_MEDICATIONS.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => handleSelectPreset(item)}
                className="text-[11px] bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer"
              >
                + {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Prescription Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prescription Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-xl px-3 py-2 text-sm text-slate-900 outline-hidden font-medium"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prescription Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'completed' | 'discontinued')}
                className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-xl px-3 py-2 text-sm text-slate-900 outline-hidden font-medium"
              >
                <option value="active">Active Treatment</option>
                <option value="completed">Completed Course</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
          </div>

          {/* Medicine Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Medicine Name & Strength *
            </label>
            <input
              type="text"
              required
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              placeholder="e.g. Amoxicillin 500mg, Metformin 500mg ER, Lisinopril 10mg"
              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-hidden font-medium"
            />
          </div>

          {/* Dosage & Administration Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dosage & Administration *
              </label>
              <input
                type="text"
                required
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 1 capsule, 2 tablets, 5ml"
                className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meal Timing *
              </label>
              <select
                value={mealTiming}
                onChange={(e) => setMealTiming(e.target.value)}
                className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-xl px-3 py-2.5 text-sm text-slate-900 outline-hidden font-medium"
              >
                <option value="Before meals">Before meals</option>
                <option value="After meals">After meals</option>
                <option value="With meals">With meals</option>
                <option value="Empty stomach">Empty stomach</option>
                <option value="As directed">As directed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Frequency Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Frequency *
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-xl px-3 py-2.5 text-sm text-slate-900 outline-hidden font-medium"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 7 days, 30 days, 90 days, Ongoing"
                className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-xl px-3 py-2 text-sm text-slate-900 outline-hidden font-medium"
              />
            </div>
          </div>

          {/* Prescribing Doctor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Prescribing Doctor & Credentials *
            </label>
            <input
              type="text"
              required
              value={prescribingDoctor}
              onChange={(e) => setPrescribingDoctor(e.target.value)}
              placeholder="e.g. Dr. Sarah Chen, MD (Cardiology)"
              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-hidden font-medium"
            />
          </div>

          {/* Clinical Notes / Patient Precautions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Notes & Warnings for Patient
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Take with food. Complete the full 7-day course even if symptoms resolve. Monitor blood pressure weekly."
              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-xl px-4 py-2 text-sm text-slate-900 outline-hidden font-medium resize-none"
            />
          </div>

          {/* Safety Notice */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-blue-900 flex items-center justify-between">
            <span>
              ℹ️ <strong>Permanent Audit Trail:</strong> This new record will be safely appended. All previous medicine records will remain preserved in the patient's timeline history.
            </span>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Recording Medicine...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Save Medicine Record</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
