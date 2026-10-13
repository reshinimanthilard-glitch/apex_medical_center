import React from 'react';
import { 
  X, 
  Printer, 
  Stethoscope, 
  AlertTriangle, 
  Calendar, 
  Clock,
  Phone,
  MapPin
} from 'lucide-react';
import { Patient, Prescription, MedicineRecord } from '../types/patient';

interface PrintPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  prescription: Prescription | null;
  fallbackMeds?: MedicineRecord[];
}

export const PrintPrescriptionModal: React.FC<PrintPrescriptionModalProps> = ({
  isOpen,
  onClose,
  patient,
  prescription,
  fallbackMeds = [],
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const calculateAge = (dobString: string): string => {
    try {
      const birth = new Date(dobString);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--;
      }
      return `${age} Yrs`;
    } catch {
      return '';
    }
  };

  const rxDoctor = prescription?.prescribingDoctor || 'Dr. Wishmika Rajaguru';
  const rxNumber = prescription?.prescriptionNumber || 'RX-2026-001';
  const rxDate = prescription?.date || new Date().toISOString().split('T')[0];
  const rxTime = prescription?.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const rxReason = prescription?.visitReason || '';

  // Get items to print
  const items = prescription?.medicines && prescription.medicines.length > 0
    ? prescription.medicines
    : fallbackMeds.map(m => ({
        medicineName: m.medicineName,
        dosage: m.dosage,
        mealTiming: m.mealTiming || 'After meals',
        frequency: m.frequency || 'Twice daily',
        timingDetail: m.timingDetail || '',
        duration: m.duration || '',
        notes: m.notes || '',
      }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Container configured for A5 Sheet (148mm x 210mm) */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 print:m-0 print:shadow-none print:border-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Screen Controls Header (Hidden in Print) */}
        <div className="bg-slate-900 px-5 py-3 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-blue-400" />
            <span className="text-xs sm:text-sm font-bold">
              Print Prescription (A5 Sheet): <span className="font-mono text-blue-300">{rxNumber}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print (A5 Paper)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prescription Paper Body - Compact space-managed for A5 Sheet */}
        <div className="p-6 sm:p-8 font-sans text-slate-900 bg-white print:p-5 print:text-[11px]">
          
          {/* Clinic Header Letterhead (Compact) */}
          <div className="border-b-2 border-blue-600 pb-3 mb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0 print:w-8 print:h-8">
                <Stethoscope className="w-6 h-6 print:w-5 print:h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none uppercase print:text-lg">
                  APEX <span className="text-blue-600">Medical Center</span>
                </h1>
                <p className="text-[11px] font-semibold text-slate-700 mt-0.5 print:text-[10px]">
                  Dr. Wishmika Rajaguru
                </p>
                <p className="text-[10px] text-slate-500 print:text-[9px]">
                  Pilikada, Kurunegala • Tel: 0775621300
                </p>
              </div>
            </div>

            <div className="text-right text-[11px] text-slate-600 shrink-0 print:text-[10px]">
              <div className="font-bold text-slate-900 flex items-center justify-end gap-1">
                <Phone className="w-3 h-3 text-blue-600" />
                <span>0775621300</span>
              </div>
              <p className="text-[10px] text-slate-600 font-medium">Pilikada, Kurunegala</p>
              <p className="text-[9px] text-slate-400 font-mono">Reg: APX-MC-LK</p>
            </div>
          </div>

          {/* Rx Meta & Patient Information Row (Space Optimized) */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 mb-3 text-xs print:text-[10.5px] print:p-2 print:mb-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2 pb-2 border-b border-slate-200/80">
              <div>
                <span className="text-slate-400 block text-[9.5px] uppercase font-semibold">Patient Name</span>
                <span className="font-bold text-slate-900 text-sm print:text-xs">{patient.name}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[9.5px] uppercase font-semibold">Medical ID / NIC</span>
                <span className="font-mono font-bold text-blue-800">
                  {patient.patientId} {patient.nic ? `• ${patient.nic}` : ''}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[9.5px] uppercase font-semibold">Age / Gender</span>
                <span className="font-medium text-slate-800">
                  {calculateAge(patient.dateOfBirth)} {patient.gender ? `• ${patient.gender}` : ''}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[9.5px] uppercase font-semibold">Prescription No</span>
                <span className="font-mono font-bold text-blue-800">{rxNumber}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 print:text-[10px]">
              <div className="flex items-center gap-3">
                <span><strong>Date:</strong> {rxDate}</span>
                <span><strong>Time:</strong> {rxTime}</span>
                {patient.phoneNumber && <span><strong>Tel:</strong> {patient.phoneNumber}</span>}
              </div>

              {rxReason && (
                <div className="text-blue-900 font-medium truncate">
                  <strong>Complaint/Dx:</strong> {rxReason}
                </div>
              )}
            </div>

            {/* Allergy Warning if any */}
            {patient.allergies && !patient.allergies.toLowerCase().includes('no known') && (
              <div className="mt-1.5 pt-1.5 border-t border-slate-200 flex items-center gap-1.5 text-[10px] text-amber-900 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                <span>Allergy: {patient.allergies}</span>
              </div>
            )}
          </div>

          {/* Rx Symbol */}
          <div className="mb-2 flex items-center justify-between">
            <span className="font-serif italic text-2xl font-black text-blue-700 tracking-wider print:text-xl">
              ℞
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
              Outpatient Prescription
            </span>
          </div>

          {/* Medicines Table (Clean & Compact for A5 Sheet) */}
          {items.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
              No medications recorded in this prescription.
            </div>
          ) : (
            <div className="border border-slate-300 rounded-lg overflow-hidden mb-3">
              <table className="w-full text-left border-collapse text-[11px] print:text-[10px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold uppercase text-[9.5px] tracking-wider">
                    <th className="py-1.5 px-2.5 w-6 text-center">#</th>
                    <th className="py-1.5 px-2.5">Medicine Name & Strength</th>
                    <th className="py-1.5 px-2.5">Dosage</th>
                    <th className="py-1.5 px-2.5">Instructions & Frequency</th>
                    <th className="py-1.5 px-2.5 w-20 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((med, index) => {
                    // Check if frequency is Once daily and has timing detail (Morning Only / Night Only)
                    const frequencyDisplay = med.frequency === 'Once daily' && med.timingDetail
                      ? `Once daily (${med.timingDetail})`
                      : med.frequency || 'Twice daily';

                    return (
                      <tr key={index} className="hover:bg-slate-50/50">
                        <td className="py-2 px-2.5 text-center font-bold text-slate-400">
                          {index + 1}
                        </td>
                        <td className="py-2 px-2.5 font-bold text-slate-900">
                          <div>{med.medicineName}</div>
                          {med.notes && (
                            <div className="text-[10px] font-normal text-slate-500 italic mt-0.5">
                              {med.notes}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-2.5 text-slate-800 font-semibold">
                          {med.dosage}
                        </td>
                        <td className="py-2 px-2.5 text-slate-700">
                          <span className="font-semibold text-blue-900 mr-1.5">
                            {med.mealTiming || 'After meals'}
                          </span>
                          <span>• {frequencyDisplay}</span>
                        </td>
                        <td className="py-2 px-2.5 text-slate-700 text-right font-medium">
                          {med.duration || 'As directed'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Special Instructions (Compact) */}
          {prescription?.instructions && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 mb-3 text-[10.5px] text-slate-700 print:text-[9.5px]">
              <strong className="text-slate-900">Instructions: </strong>
              {prescription.instructions}
            </div>
          )}

          {/* Patient Advice */}
          <div className="text-[9.5px] text-slate-500 mb-4 print:text-[8.5px] leading-tight">
            Take medicines strictly as prescribed. For queries or adverse reactions, contact APEX Medical Center at <strong>0775621300</strong>.
          </div>

          {/* Signature Block (Exact requirement):
              "in the prescription below side in photo remove the names and under the line only keep Dr.Wishmika Rajaguru. remove consultand physician and remove name in above line. because need to put signature."
          */}
          <div className="pt-3 border-t border-slate-200 flex items-end justify-between gap-4">
            <div className="text-[9px] text-slate-400">
              <p className="font-medium text-slate-600">APEX Medical Center • Pilikada, Kurunegala</p>
              <p>Prescription No: {rxNumber}</p>
            </div>

            {/* Signature Area */}
            <div className="w-52 text-center">
              {/* Blank area above the line for doctor's physical signature */}
              <div className="h-10"></div>
              {/* Clean solid horizontal line */}
              <div className="border-b-2 border-slate-800 w-full mb-1"></div>
              {/* Under the line: ONLY "Dr. Wishmika Rajaguru", nothing else */}
              <p className="text-xs font-bold text-slate-900 tracking-wide print:text-[11px]">
                Dr. Wishmika Rajaguru
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Print Button (Hidden in Print) */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500">
            A5 Small Sheet Format • Total Items: <strong>{items.length}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Prescription</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
