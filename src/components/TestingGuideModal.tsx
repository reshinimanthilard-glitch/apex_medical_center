import React from 'react';
import { 
  X, 
  HelpCircle, 
  Search, 
  History, 
  Printer, 
  UserPlus, 
  WifiOff, 
  CheckCircle2, 
  Sparkles,
  Paperclip,
  Pill,
  Phone
} from 'lucide-react';

interface TestingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSeedSampleData: () => void;
  isSeeding: boolean;
  onSelectTestPatientId: (patientId: string) => void;
}

export const TestingGuideModal: React.FC<TestingGuideModalProps> = ({
  isOpen,
  onClose,
  onSeedSampleData,
  isSeeding,
  onSelectTestPatientId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-sky-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">APEX System Testing Guide</h3>
              <p className="text-xs text-blue-100">
                Dr. Wishmika Rajaguru • Medical Center Phone: 0775621300
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

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs sm:text-sm text-slate-700">
          {/* Quick Setup Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-blue-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Step 0: Load Clinical Sample Data
              </h4>
              <p className="text-xs text-blue-800 mt-1">
                Populates the database with sample patients (Eleanor Vance, Arthur Pendelton) with separate visit prescriptions and medical test reports.
              </p>
            </div>
            <button
              onClick={() => {
                onSeedSampleData();
              }}
              disabled={isSeeding}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isSeeding ? 'Loading...' : 'Load Sample Data'}
            </button>
          </div>

          {/* Test 1: Patient Search by Patient ID */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-mono text-xs">
                1
              </span>
              <Search className="w-4 h-4 text-blue-600" />
              <span>How to Test Patient Search by Patient ID</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-2 leading-relaxed">
              <li>Click on the <strong>Search & Directory</strong> tab.</li>
              <li>In the search box, enter a unique Patient ID such as <code className="bg-slate-100 font-mono text-blue-700 px-1 py-0.5 rounded font-bold">APX-2026-1</code> or NIC <code className="bg-slate-100 font-mono text-blue-700 px-1 py-0.5 rounded font-bold">846672314V</code>.</li>
              <li>Notice the directory instantly filters to <strong>Eleanor Vance</strong>.</li>
              <li>Click on the patient card to open their profile.</li>
            </ol>
            <div className="pt-2 flex flex-wrap gap-2">
              <span className="text-[11px] text-slate-400 font-medium">Test now:</span>
              <button
                onClick={() => {
                  onSelectTestPatientId('APX-2026-1');
                  onClose();
                }}
                className="bg-slate-100 hover:bg-blue-50 text-blue-700 font-mono text-xs font-bold px-2 py-0.5 rounded border border-slate-200 cursor-pointer"
              >
                Open Eleanor Vance (APX-2026-1)
              </button>
              <button
                onClick={() => {
                  onSelectTestPatientId('APX-2026-2');
                  onClose();
                }}
                className="bg-slate-100 hover:bg-blue-50 text-blue-700 font-mono text-xs font-bold px-2 py-0.5 rounded border border-slate-200 cursor-pointer"
              >
                Open Arthur Pendelton (APX-2026-2)
              </button>
            </div>
          </div>

          {/* Test 2: Separate Visit Prescriptions & Dropdowns */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-mono text-xs">
                2
              </span>
              <Pill className="w-4 h-4 text-blue-600" />
              <span>Testing Separate Visit Prescriptions & Meal/Frequency Dropdowns</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-2 leading-relaxed">
              <li>Open any patient profile and view the <strong>"Prescriptions by Visit"</strong> tab.</li>
              <li>Notice that previous visits (e.g. Visit 1 on Sept 10 vs Visit 2 on Oct 5) are listed as <strong>separate prescription records</strong>, each with its own prescription number, date, time, and medicine list.</li>
              <li>Click <strong>"Create New Prescription"</strong>.</li>
              <li>Notice the new <strong>Meal Timing</strong> dropdown (<strong>"Before meals"</strong>, <strong>"After meals"</strong>) and <strong>Frequency</strong> dropdown (<strong>"Once daily", "Twice daily", "Three times daily", "Every 8 hours", "Every 6 hours", "As needed"</strong>).</li>
              <li>Prescribing Doctor is automatically set to <strong>Dr. Wishmika Rajaguru</strong>.</li>
              <li>Save the prescription and observe that it creates a new independent prescription record in Firebase without combining with earlier visits!</li>
            </ol>
          </div>

          {/* Test 3: Prescription Printing */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-mono text-xs">
                3
              </span>
              <Printer className="w-4 h-4 text-blue-600" />
              <span>Testing Individual Prescription Printing</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-2 leading-relaxed">
              <li>On any prescription card, click <strong>"Print This Prescription"</strong>.</li>
              <li>Notice the clinical letterhead includes:
                <ul className="list-disc list-inside pl-4 text-slate-500 space-y-0.5">
                  <li>Clinic Name: <strong>APEX Medical Center</strong></li>
                  <li>Medical Center Phone: <strong>0775621300</strong></li>
                  <li>Doctor: <strong>Dr. Wishmika Rajaguru</strong></li>
                  <li>Unique Prescription Number (e.g. <code>RX-2026-001-A</code>)</li>
                  <li>Date and Time of that specific encounter</li>
                  <li>Only the medicines prescribed during that specific visit!</li>
                </ul>
              </li>
              <li>Click <strong>"Print This Prescription"</strong> to trigger clean browser printing.</li>
            </ol>
          </div>

          {/* Test 4: Medical Reports (Photos & PDFs in Firebase Space) */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-mono text-xs">
                4
              </span>
              <Paperclip className="w-4 h-4 text-blue-600" />
              <span>Testing Medical Reports (Photos & PDFs in Firebase)</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-2 leading-relaxed">
              <li>In the patient's profile, click the <strong>"Medical Reports (Photos / PDFs)"</strong> tab.</li>
              <li>View existing attached lab reports (e.g. Full Blood Count, Chest X-Ray).</li>
              <li>Click <strong>"Upload Medical Report / PDF"</strong>.</li>
              <li>Enter a report title, choose category (Lab Report, Radiology, etc.), and select an image file or PDF.</li>
              <li>Click <strong>"Upload & Save in Firebase"</strong>.</li>
              <li>The report is stored persistently in Cloud Firestore. Click on the thumbnail or "Inspect" to open the full-screen photo/document viewer!</li>
            </ol>
          </div>

          {/* Test 5: Drug Store & Automatic Stock Management */}
          <div className="border border-teal-200 bg-teal-50/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-teal-950 font-bold">
              <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-mono text-xs">
                5
              </span>
              <Pill className="w-4 h-4 text-teal-600" />
              <span>Testing Drug Store & Automatic Stock Management</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-2 leading-relaxed text-xs">
              <li>In the header navigation bar, click on <strong>"Drug Store & Stock"</strong> to open the pharmacy inventory module.</li>
              <li>Review the <strong>5 Dashboard Cards</strong>: Total Items, Total Stock Quantity, Low-Stock Medicines, Out-of-Stock, and Expiring Batches.</li>
              <li>Click <strong>"Add Stock"</strong>, select Paracetamol, and add 500 tablets. Notice available stock automatically increases from 1,000 to 1,500 without duplicate records.</li>
              <li>Switch back to <strong>"Patient Management"</strong>, open a patient, and on their prescription click <strong>"Dispense Stock"</strong>.</li>
              <li>Confirm the dispense transaction: the required quantity is deducted automatically from the Drug Store and logged in the <strong>"Stock History"</strong> audit trail!</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Close Guide & Start Testing
          </button>
        </div>
      </div>
    </div>
  );
};
