import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Pill, 
  Plus, 
  Printer, 
  Calendar, 
  Clock, 
  Phone, 
  MapPin, 
  User, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Paperclip, 
  History, 
  CheckCircle2, 
  Trash2, 
  Edit3,
  UserCheck, 
  Stethoscope,
  ChevronRight,
  Sparkles,
  CreditCard,
  Sun,
  Moon
} from 'lucide-react';
import { Patient, Prescription, MedicalReport, MedicineRecord, StaffUser, StoreMedicine } from '../types/patient';
import { CreatePrescriptionModal } from './CreatePrescriptionModal';
import { PrintPrescriptionModal } from './PrintPrescriptionModal';
import { DispensePrescriptionModal } from './DispensePrescriptionModal';
import { MedicalReportsSection } from './MedicalReportsSection';
import { EcgHeartbeatBackground } from './EcgHeartbeatBackground';

interface PatientDetailsProps {
  patient: Patient;
  prescriptions: Prescription[];
  medicalReports: MedicalReport[];
  medicineRecords: MedicineRecord[];
  staffUser: StaffUser | null;
  onBack: () => void;
  onCreatePrescription: (prescriptionData: {
    prescriptionNumber: string;
    prescriptionType: 'internal' | 'external';
    date: string;
    time: string;
    prescribingDoctor: string;
    visitReason?: string;
    medicines: any[];
    instructions?: string;
    status: 'active' | 'completed' | 'discontinued';
  }) => Promise<void>;
  onUpdatePrescription: (prescriptionId: string, updatedData: Partial<Prescription>) => Promise<void>;
  onDeletePrescription: (prescriptionId: string) => Promise<void>;
  onRefreshReports: () => Promise<void>;
  isLoading: boolean;
  storeMedicines?: StoreMedicine[];
  onRefreshStore?: () => Promise<void>;
}

export const PatientDetails: React.FC<PatientDetailsProps> = ({
  patient,
  prescriptions,
  medicalReports,
  medicineRecords,
  staffUser,
  onBack,
  onCreatePrescription,
  onUpdatePrescription,
  onDeletePrescription,
  onRefreshReports,
  isLoading,
  storeMedicines = [],
  onRefreshStore,
}) => {
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'reports' | 'allMeds'>('prescriptions');
  
  // Modals state
  const [isCreateRxModalOpen, setIsCreateRxModalOpen] = useState(false);
  const [editingRx, setEditingRx] = useState<Prescription | null>(null);
  const [selectedRxForPrint, setSelectedRxForPrint] = useState<Prescription | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedRxForDispense, setSelectedRxForDispense] = useState<Prescription | null>(null);
  const [isDispenseModalOpen, setIsDispenseModalOpen] = useState(false);

  const calculateAge = (dobString: string): string => {
    try {
      const birth = new Date(dobString);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--;
      }
      return `${age} years old`;
    } catch {
      return '';
    }
  };

  const handlePrintSpecificPrescription = (rx: Prescription) => {
    setSelectedRxForPrint(rx);
    setIsPrintModalOpen(true);
  };

  const handlePrintLatest = () => {
    if (prescriptions.length > 0) {
      setSelectedRxForPrint(prescriptions[0]);
    } else {
      setSelectedRxForPrint(null);
    }
    setIsPrintModalOpen(true);
  };

  const handleEditPrescription = (rx: Prescription) => {
    setEditingRx(rx);
    setIsCreateRxModalOpen(true);
  };

  const handleCloseRxModal = () => {
    setIsCreateRxModalOpen(false);
    setEditingRx(null);
  };

  const hasAllergies = patient.allergies && !patient.allergies.toLowerCase().includes('no known');

  return (
    <div className="space-y-6">
      {/* Top Back & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Directory</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Quick Print Button */}
          {prescriptions.length > 0 && (
            <button
              onClick={handlePrintLatest}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer"
              title="Print latest visit prescription in A5 sheet"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              <span>Print Latest Rx (A5)</span>
            </button>
          )}

          {/* New Visit Prescription Button */}
          <button
            onClick={() => {
              setEditingRx(null);
              setIsCreateRxModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Prescription</span>
          </button>
        </div>
      </div>

      {/* Patient Profile Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-teal-700 via-cyan-700 to-blue-700 p-6 sm:p-7 text-white relative overflow-hidden">
          {/* Subtle animated heartbeat line */}
          <EcgHeartbeatBackground className="absolute inset-0 pointer-events-none" opacity={0.16} strokeColor="#99f6e4" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-white border border-white/20 font-bold text-2xl shadow-inner">
                {patient.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-bold tracking-tight">{patient.name}</h2>
                  <span className="font-mono text-xs font-black bg-white/20 text-white px-3 py-1 rounded-full border border-white/30 backdrop-blur-xs">
                    {patient.patientId}
                  </span>
                  {patient.nic && (
                    <span className="font-mono text-xs font-bold bg-teal-500/30 text-teal-100 px-3 py-1 rounded-full border border-teal-300/40 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5" />
                      NIC: {patient.nic}
                    </span>
                  )}
                </div>
                <p className="text-xs text-blue-100 mt-1 font-medium">
                  {calculateAge(patient.dateOfBirth)} • DOB: {patient.dateOfBirth}
                  {patient.gender ? ` • ${patient.gender}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {patient.bloodType && (
                <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-3 py-1.5 rounded-xl text-center">
                  <span className="text-[10px] text-blue-200 block uppercase font-bold">Blood</span>
                  <span className="text-base font-extrabold text-white">{patient.bloodType}</span>
                </div>
              )}
              <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-3 py-1.5 rounded-xl text-center">
                <span className="text-[10px] text-blue-200 block uppercase font-bold">Prescriptions</span>
                <span className="text-base font-extrabold text-white">{prescriptions.length}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-3 py-1.5 rounded-xl text-center">
                <span className="text-[10px] text-blue-200 block uppercase font-bold">Reports</span>
                <span className="text-base font-extrabold text-white">{medicalReports.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Demographics Details */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 border-b border-slate-200">
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 text-xs">
              <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block font-semibold text-[11px]">Primary Phone</span>
                <span className="text-slate-900 font-bold">{patient.phoneNumber}</span>
              </div>
            </div>

            {patient.emergencyContact && (
              <div className="flex items-start gap-2.5 text-xs">
                <UserCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block font-semibold text-[11px]">Emergency Contact</span>
                  <span className="text-slate-800 font-medium">{patient.emergencyContact}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2.5 text-xs">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block font-semibold text-[11px]">Address</span>
                <span className="text-slate-800 font-medium leading-relaxed">{patient.address}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2.5 text-xs">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block font-semibold text-[11px]">Registered Date</span>
                <span className="text-slate-800 font-medium">
                  {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500">
              Physician: <strong className="text-slate-800">Dr. Wishmika Rajaguru</strong>
            </div>
          </div>
        </div>

        {/* Known Allergies Alert Strip */}
        <div className={`p-4 text-xs flex items-center gap-3 ${
          hasAllergies 
            ? 'bg-amber-50 text-amber-900 border-b border-amber-200' 
            : 'bg-emerald-50 text-emerald-900 border-b border-emerald-200'
        }`}>
          <AlertTriangle className={`w-4 h-4 shrink-0 ${hasAllergies ? 'text-amber-600' : 'text-emerald-600'}`} />
          <div>
            <strong>Known Allergies: </strong>
            <span>{patient.allergies || 'No known drug allergies (NKDA)'}</span>
          </div>
        </div>
      </div>

      {/* Main Clinical Sections Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'prescriptions'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Separate Visit Prescriptions ({prescriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Paperclip className="w-4 h-4" />
          <span>Medical Reports ({medicalReports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('allMeds')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'allMeds'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Cumulative Timeline</span>
        </button>
      </div>

      {/* TAB 1: SEPARATE PRESCRIPTIONS BY VISIT */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
            <div>
              <h3 className="text-sm font-bold text-blue-900">
                Separate Visit Prescriptions
              </h3>
              <p className="text-xs text-blue-800">
                Each visit generates an independent prescription record with its own prescription number, date, time, and medicine list. You can edit any prescription individually.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingRx(null);
                setIsCreateRxModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Prescription</span>
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading prescriptions from Firebase...
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 p-8 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center mb-3">
                <Pill className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">No Prescriptions Issued Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Create a new visit prescription for this patient. Each prescription is saved separately in Cloud Firestore and can be printed individually in A5 format.
              </p>
              <button
                onClick={() => {
                  setEditingRx(null);
                  setIsCreateRxModalOpen(true);
                }}
                className="mt-4 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Prescription</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((rx, rxIndex) => (
                <div
                  key={rx.id || rxIndex}
                  className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-4"
                >
                  {/* Top Header of This Prescription */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs font-extrabold bg-blue-100 text-blue-900 px-3 py-1 rounded-lg border border-blue-200">
                        {rx.prescriptionNumber}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <strong>{rx.date}</strong> at {rx.time}
                      </span>
                      <span className="text-xs text-slate-600 flex items-center gap-1">
                        <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                        <span>{rx.prescribingDoctor || 'Dr. Wishmika Rajaguru'}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Dispense from Drug Store Button / Status */}
                      {rx.prescriptionType === 'internal' && (
                        rx.isDispensed ? (
                          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Dispensed</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedRxForDispense(rx);
                              setIsDispenseModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                            title="Dispense medicines and deduct stock from Drug Store"
                          >
                            <Pill className="w-3.5 h-3.5" />
                            <span>Dispense Stock</span>
                          </button>
                        )
                      )}

                      {/* Edit button */}
                      <button
                        onClick={() => handleEditPrescription(rx)}
                        className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        title="Edit this prescription"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                        <span>Edit</span>
                      </button>

                      {/* Print button specific to THIS prescription */}
                      <button
                        onClick={() => handlePrintSpecificPrescription(rx)}
                        className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        title="Print only this prescription (A5 Sheet)"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print (A5)</span>
                      </button>

                      <button
                        onClick={() => rx.id && onDeletePrescription(rx.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete prescription"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Visit Reason / Diagnosis */}
                  {rx.visitReason && (
                    <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-700">
                      <strong className="text-slate-900">Reason for Visit / Diagnosis: </strong>
                      {rx.visitReason}
                    </div>
                  )}

                  {/* Itemized Medicines in This Prescription */}
                  <div>
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Medications Prescribed During This Encounter ({rx.medicines.length}):
                    </h5>

                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px]">
                            <th className="py-2.5 px-3">#</th>
                            <th className="py-2.5 px-3">Medicine Name</th>
                            <th className="py-2.5 px-3">Dosage</th>
                            <th className="py-2.5 px-3">Meal Timing</th>
                            <th className="py-2.5 px-3">Frequency & Timing</th>
                            <th className="py-2.5 px-3">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {rx.medicines.map((med, mIdx) => {
                            const isOnceDaily = med.frequency === 'Once daily';

                            return (
                              <tr key={mIdx} className="hover:bg-slate-50/50">
                                <td className="py-2.5 px-3 font-bold text-slate-400">{mIdx + 1}</td>
                                <td className="py-2.5 px-3 font-bold text-slate-900">
                                  {med.medicineName}
                                  {med.notes && (
                                    <span className="block text-[11px] font-normal text-slate-500 italic mt-0.5">
                                      {med.notes}
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-slate-800 font-semibold">{med.dosage}</td>
                                <td className="py-2.5 px-3">
                                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium text-[11px]">
                                    {med.mealTiming || 'After meals'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-slate-700 font-medium">
                                  {isOnceDaily && med.timingDetail ? (
                                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                                      {med.timingDetail === 'Morning Only' ? (
                                        <Sun className="w-3 h-3 text-amber-600" />
                                      ) : (
                                        <Moon className="w-3 h-3 text-indigo-600" />
                                      )}
                                      <span>Once daily ({med.timingDetail})</span>
                                    </span>
                                  ) : (
                                    <span>{med.frequency || 'Twice daily'}</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-slate-600">{med.duration || 'As directed'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* General Instructions */}
                  {rx.instructions && (
                    <p className="text-xs text-slate-600 italic">
                      Note: {rx.instructions}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MEDICAL REPORTS & PDFS */}
      {activeTab === 'reports' && (
        <MedicalReportsSection
          patient={patient}
          reports={medicalReports}
          staffUser={staffUser}
          onRefreshReports={onRefreshReports}
        />
      )}

      {/* TAB 3: CUMULATIVE TIMELINE */}
      {activeTab === 'allMeds' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="pb-3 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Cumulative Medication History
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive clinical log of all medications prescribed across visits.
            </p>
          </div>

          {medicineRecords.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No cumulative records found. Prescriptions created will appear here.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {medicineRecords.map((m, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{m.medicineName}</span>
                    <span className="text-slate-500 ml-2">({m.dosage})</span>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {m.mealTiming || 'After meals'} • {m.frequency || 'Twice daily'} {m.timingDetail ? `(${m.timingDetail})` : ''} • Prescribed: {m.date}
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {m.prescriptionNumber || 'Visit'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Prescription Modal */}
      <CreatePrescriptionModal
        isOpen={isCreateRxModalOpen}
        onClose={handleCloseRxModal}
        patient={patient}
        staffUser={staffUser}
        initialPrescription={editingRx}
        onCreatePrescription={onCreatePrescription}
        onUpdatePrescription={onUpdatePrescription}
      />

      {/* Print Prescription Modal (Configured for A5 Sheet) */}
      <PrintPrescriptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        patient={patient}
        prescription={selectedRxForPrint}
        fallbackMeds={medicineRecords}
      />

      {/* Dispense from Drug Store Modal */}
      {isDispenseModalOpen && selectedRxForDispense && (
        <DispensePrescriptionModal
          isOpen={isDispenseModalOpen}
          onClose={() => {
            setIsDispenseModalOpen(false);
            setSelectedRxForDispense(null);
          }}
          prescription={selectedRxForDispense}
          patient={patient}
          storeMedicines={storeMedicines}
          staffUser={staffUser}
          onSuccess={async () => {
            if (selectedRxForDispense?.id) {
              await onUpdatePrescription(selectedRxForDispense.id, { isDispensed: true });
            }
            if (onRefreshStore) {
              await onRefreshStore();
            }
          }}
        />
      )}
    </div>
  );
};
