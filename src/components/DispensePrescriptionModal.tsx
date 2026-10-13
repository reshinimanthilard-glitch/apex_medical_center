import React, { useState } from 'react';
import { 
  Pill, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  X, 
  RotateCw, 
  User, 
  Calendar, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';
import { Patient, Prescription, StoreMedicine, StaffUser } from '../types/patient';
import { dispensePrescriptionMedicines } from '../services/patientService';

interface DispensePrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: Prescription;
  patient: Patient;
  storeMedicines: StoreMedicine[];
  staffUser: StaffUser | null;
  onSuccess: (message: string) => void;
}

export const DispensePrescriptionModal: React.FC<DispensePrescriptionModalProps> = ({
  isOpen,
  onClose,
  prescription,
  patient,
  storeMedicines,
  staffUser,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Evaluate stock status for each medicine in this prescription
  const itemsWithStockStatus = prescription.medicines.map((item) => {
    const qtyToDeduct = item.dispenseQuantity && item.dispenseQuantity > 0 ? item.dispenseQuantity : 10;
    const match = storeMedicines.find((m) =>
      m.medicineName.toLowerCase() === item.medicineName.toLowerCase() ||
      item.medicineName.toLowerCase().startsWith(m.medicineName.toLowerCase())
    );

    const isAvailableInStore = !!match;
    const currentStock = match ? match.currentStockQuantity : 0;
    const isSufficient = currentStock >= qtyToDeduct;
    const isExpired = match?.expiryDate ? new Date(match.expiryDate) < new Date() : false;

    return {
      item,
      qtyToDeduct,
      matchedMedicine: match,
      isAvailableInStore,
      currentStock,
      isSufficient,
      isExpired,
      unit: match?.unitOfMeasurement || 'units',
    };
  });

  const hasInsufficientStock = itemsWithStockStatus.some((i) => !i.isSufficient || !i.isAvailableInStore);
  const hasExpiredMedicine = itemsWithStockStatus.some((i) => i.isExpired);

  const handleConfirmDispense = async () => {
    setErrorMessage(null);

    if (prescription.isDispensed) {
      setErrorMessage('This prescription has already been dispensed from the Drug Store. Stock cannot be deducted twice.');
      return;
    }

    if (hasExpiredMedicine) {
      setErrorMessage('One or more medicines in this prescription have expired stock. Cannot dispense expired stock.');
      return;
    }

    if (hasInsufficientStock) {
      setErrorMessage('Cannot dispense: one or more medicines have insufficient stock in the Drug Store. Please add stock first.');
      return;
    }

    setLoading(true);
    try {
      const result = await dispensePrescriptionMedicines(
        prescription,
        patient,
        staffUser?.displayName || 'Dr. Wishmika Rajaguru'
      );

      if (result.success) {
        onSuccess(result.message);
        onClose();
      } else {
        setErrorMessage(result.message);
      }
    } catch (err: unknown) {
      console.error('Error dispensing medicines:', err);
      setErrorMessage('An unexpected error occurred while dispensing stock.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Dispense from Internal Drug Store</h3>
              <p className="text-xs text-teal-100">
                Prescription: <strong className="font-mono text-white">{prescription.prescriptionNumber}</strong> • {patient.name} ({patient.patientId})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {prescription.isDispensed ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block text-sm">Already Dispensed</span>
                <span>The medicines for this prescription have already been dispensed and deducted from store inventory.</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-600">
              Review stock availability below. Once confirmed, quantities will be automatically deducted from the Drug Store and logged in the stock audit trail.
            </p>
          )}

          {/* Medicines List with Stock Status */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Prescribed Medicines to Deduct:
            </span>

            {itemsWithStockStatus.map((info, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                  info.isExpired
                    ? 'bg-purple-50/70 border-purple-200 text-purple-900'
                    : !info.isAvailableInStore || !info.isSufficient
                    ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                    : 'bg-teal-50/40 border-teal-200/70 text-slate-900'
                }`}
              >
                <div>
                  <div className="font-bold text-sm">
                    {info.item.medicineName}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {info.item.dosage} • {info.item.mealTiming} • {info.item.frequency}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-800">
                    Deduct: <span className="text-teal-700 font-extrabold">{info.qtyToDeduct}</span> {info.unit}
                  </div>
                  <div className="text-[11px] mt-0.5">
                    {!info.isAvailableInStore ? (
                      <span className="text-rose-600 font-bold">Not in Drug Store</span>
                    ) : info.isExpired ? (
                      <span className="text-purple-700 font-bold">Stock Expired!</span>
                    ) : !info.isSufficient ? (
                      <span className="text-rose-600 font-bold">
                        Only {info.currentStock} {info.unit} available
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold">
                        Available: {info.currentStock} {info.unit}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Safety Warning */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              Stock deduction is verified and irreversible. Each prescription record is tagged with its own transaction ID.
            </span>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            {!prescription.isDispensed && (
              <button
                type="button"
                onClick={handleConfirmDispense}
                disabled={loading || hasInsufficientStock || hasExpiredMedicine}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Processing Dispense...' : 'Confirm Stock Deduction & Dispense'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
