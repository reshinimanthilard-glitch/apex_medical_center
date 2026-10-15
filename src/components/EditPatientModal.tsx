import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  CreditCard, 
  Calendar, 
  Phone, 
  MapPin, 
  Heart, 
  AlertTriangle, 
  Save, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Patient } from '../types/patient';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSave: (updatedData: Partial<Patient>) => Promise<void>;
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSave,
}) => {
  const [name, setName] = useState(patient.name || '');
  const [nic, setNic] = useState(patient.nic || '');
  const [dateOfBirth, setDateOfBirth] = useState(patient.dateOfBirth || '');
  const [phoneNumber, setPhoneNumber] = useState(patient.phoneNumber || '');
  const [address, setAddress] = useState(patient.address || '');
  const [gender, setGender] = useState(patient.gender || 'Female');
  const [bloodType, setBloodType] = useState(patient.bloodType || 'O+');
  const [allergies, setAllergies] = useState(patient.allergies || '');
  const [emergencyContact, setEmergencyContact] = useState(patient.emergencyContact || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state whenever patient prop changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setName(patient.name || '');
      setNic(patient.nic || '');
      setDateOfBirth(patient.dateOfBirth || '');
      setPhoneNumber(patient.phoneNumber || '');
      setAddress(patient.address || '');
      setGender(patient.gender || 'Female');
      setBloodType(patient.bloodType || 'O+');
      setAllergies(patient.allergies || '');
      setEmergencyContact(patient.emergencyContact || '');
      setErrorMessage(null);
    }
  }, [isOpen, patient]);

  if (!isOpen) return null;

  // Calculate age dynamically
  const calculatedAge = () => {
    if (!dateOfBirth) return '';
    try {
      const birth = new Date(dateOfBirth);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--;
      }
      return isNaN(age) || age < 0 ? '' : `${age} yrs`;
    } catch {
      return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter the patient’s full legal name.');
      return;
    }

    if (!dateOfBirth) {
      setErrorMessage('Please enter the date of birth.');
      return;
    }

    if (!phoneNumber.trim()) {
      setErrorMessage('Please enter a contact phone number.');
      return;
    }

    if (!address.trim()) {
      setErrorMessage('Please enter the patient’s address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        nic: nic.trim().toUpperCase(),
        dateOfBirth: dateOfBirth.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
        gender,
        bloodType,
        allergies: allergies.trim(),
        emergencyContact: emergencyContact.trim(),
      });
      onClose();
    } catch (err) {
      console.error('Failed to update patient profile:', err);
      setErrorMessage('Failed to save changes. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-700 via-cyan-700 to-blue-700 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 text-white shadow-inner">
              <User className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">
                Edit Personal Profile
              </h2>
              <p className="text-xs text-teal-100 font-medium">
                Patient Medical ID: <strong className="font-mono text-white">{patient.patientId}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Identification */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 border-b border-slate-100 pb-1.5">
              <CreditCard className="w-3.5 h-3.5 text-teal-600" />
              <span>Personal Identification</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kumari Wickramasinghe"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 rounded-xl text-sm font-medium text-slate-900 transition-all outline-hidden"
                />
              </div>

              {/* NIC Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  National ID (NIC) Number
                </label>
                <input
                  type="text"
                  value={nic}
                  onChange={(e) => setNic(e.target.value)}
                  placeholder="e.g. 199458200123 / 945820123V"
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 rounded-xl text-sm font-mono font-medium text-slate-900 uppercase transition-all outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Demographics & Clinical Attributes */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 border-b border-slate-100 pb-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>Demographics & Clinical Data</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date of Birth * {calculatedAge() && <span className="text-teal-700 font-semibold font-mono text-[11px]">({calculatedAge()})</span>}
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-xl text-sm font-medium text-slate-900 outline-hidden"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gender *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-xl text-sm font-medium text-slate-900 outline-hidden"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Blood Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Blood Group
                </label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-xl text-sm font-bold text-slate-900 outline-hidden"
                >
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Contact & Address */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 border-b border-slate-100 pb-1.5">
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span>Contact & Residence</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Phone Number *
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 0771234567"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 rounded-xl text-sm font-medium text-slate-900 outline-hidden"
                />
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Emergency Contact (Name / Phone)
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="e.g. Nimal (Spouse) - 0719876543"
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-xl text-sm font-medium text-slate-900 outline-hidden"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Residential Address *
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                placeholder="e.g. 45/2, Pilikada Road, Kurunegala"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-xl text-sm font-medium text-slate-900 outline-hidden resize-none"
              />
            </div>
          </div>

          {/* Section 4: Allergies Alert */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Known Drug & Medical Allergies</span>
            </label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g. Penicillin, Sulfa drugs (or leave as 'No known allergies')"
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 rounded-xl text-sm font-medium text-slate-900 outline-hidden"
            />
            <p className="text-[11px] text-slate-400">
              This information will be prominently displayed on prescription headers to prevent adverse interactions.
            </p>
          </div>

          {/* Modal Actions Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
